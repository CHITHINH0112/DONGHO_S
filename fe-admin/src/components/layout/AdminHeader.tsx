'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  faBars,
  faMagnifyingGlass,
  faPlus,
  faBell,
  faRotate,
  faBuildingColumns,
  faClock,
  faBoxesStacked,
  faTriangleExclamation,
  faBan,
  faCircleCheck,
  faArrowRight,
  faBarcode,
} from '@fortawesome/free-solid-svg-icons';
import apiClient from '@/lib/axios';

// Dành cho Admin: Cảnh báo sự cố (Lỗi / Thiếu)
interface SerialAlert {
  id: number;
  serialNumber: string;
  status: 'defective' | 'missing_on_import' | string;
  note: string | null;
  warehouseConfirmedById: number | null;
  warehouseConfirmedAt: string | null;
  variant?: {
    id: number;
    sku: string;
    product?: {
      id: number;
      name: string;
      slug: string;
      imageUrl?: string;
    };
  };
  warehouseStaff?: {
    id: number;
    name: string;
    staffCode: string;
    email: string;
  };
}

// Dành cho Nhân viên kho: Lô hàng mới chờ kiểm tra
interface PendingSerialCheck {
  id: number;
  serialNumber: string;
  status: string;
  itemCondition?: string;
  location?: string;
  note: string | null;
  adminApprovedAt: string | null;
  variant?: {
    id: number;
    sku: string;
    product?: {
      id: number;
      name: string;
      slug: string;
      imageUrl?: string;
    };
  };
  importedBy?: {
    id: number;
    name: string;
    staffCode?: string;
  };
}

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  title?: string;
  subtitle?: string;
}

export default function AdminHeader({
  onToggleSidebar,
  title = 'Bảng Điều Khiển Tổng Quan',
  subtitle = 'Trung tâm vận hành & quản trị chuỗi đồng hồ xa xỉ',
}: AdminHeaderProps) {
  const { admin } = useAdminAuth();
  const isWarehouse = admin?.position === 'warehouse';
  const [currentTime, setCurrentTime] = useState<string>('');

  // Thông báo theo vai trò
  const [alerts, setAlerts] = useState<SerialAlert[]>([]);
  const [pendingChecks, setPendingChecks] = useState<PendingSerialCheck[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [loadingNotif, setLoadingNotif] = useState<boolean>(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Đồng hồ hệ thống thời gian thực
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Tải danh sách thông báo tương ứng với vai trò
  const fetchNotifications = async () => {
    if (!admin) return;
    try {
      setLoadingNotif(true);
      if (isWarehouse) {
        // Phía Kho: Lấy danh sách serial đang chờ kiểm tra thực tế
        const res = await apiClient.get('/serials/pending-check');
        if (res.data?.success) {
          setPendingChecks(res.data.data || []);
        }
      } else {
        // Phía Admin: Lấy danh sách sự cố kho (Hàng lỗi / Thiếu hàng do kho báo cáo)
        const res = await apiClient.get('/serials/alerts');
        if (res.data?.success) {
          setAlerts(res.data.data || []);
        }
      }
    } catch {
      // Bỏ qua lỗi gián đoạn mạng
    } finally {
      setLoadingNotif(false);
    }
  };

  useEffect(() => {
    if (admin) {
      fetchNotifications();
      // Polling định kỳ mỗi 30 giây
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [admin, isWarehouse]);

  // Đóng popover thông báo khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  };

  const notifCount = isWarehouse ? pendingChecks.length : alerts.length;

  return (
    <header className="sticky top-0 z-30 h-20 bg-[#070e0a]/85 backdrop-blur-md border-b border-[#d4af37]/15 px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-stone-300 hover:text-white hover:bg-white/[0.05] lg:hidden"
          title="Mở menu điều hướng"
        >
          <FontAwesomeIcon icon={faBars} className="text-lg" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base lg:text-lg font-medium text-stone-100 tracking-wide">
              {title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-medium tracking-wider bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/25">
              Live Portal
            </span>
          </div>
          <p className="text-[11px] text-stone-300 hidden sm:block font-light">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: Search + Quick Action + Time + Notifications */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-300">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-xs" />
          </div>
          <input
            type="text"
            placeholder="Tìm mã đơn, số serial,..."
            className="w-64 lg:w-80 pl-9 pr-14 py-2 bg-[#0c1611] text-xs text-stone-200 placeholder-stone-400 rounded-lg border border-white/[0.08] focus:border-[#d4af37]/50 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/30 transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono text-stone-300 bg-white/[0.06] rounded border border-white/[0.1]">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Live Clock & Boutique Location */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0c1611]/70 border border-white/[0.06] text-xs text-stone-300">
          <FontAwesomeIcon icon={faBuildingColumns} className="text-[#d4af37] text-[11px]" />
          <span>Showroom Sài Gòn</span>
          <span className="text-stone-400">•</span>
          <FontAwesomeIcon icon={faClock} className="text-emerald-400 text-[11px]" />
          <span className="font-mono text-stone-200 font-medium">
            {currentTime || '15:30:00'}
          </span>
        </div>

        {/* Quick Refresh */}
        <button
          onClick={fetchNotifications}
          title="Làm mới thông báo & dữ liệu"
          className="p-2 rounded-lg text-stone-300 hover:text-[#d4af37] hover:bg-white/[0.05] transition-colors"
        >
          <FontAwesomeIcon
            icon={faRotate}
            className={`text-sm ${loadingNotif ? 'animate-spin text-[#d4af37]' : ''}`}
          />
        </button>

        {/* Notifications: Tách biệt hoàn toàn theo vai trò */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            title={
              isWarehouse
                ? 'Nhiệm vụ kiểm kho (Lô hàng mới chờ kiểm tra)'
                : 'Cảnh báo sự cố kho (Hàng lỗi / Thiếu hàng)'
            }
            className={`relative p-2 rounded-lg transition-all ${
              notifCount > 0
                ? isWarehouse
                  ? 'text-amber-300 bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'text-rose-400 bg-rose-500/15 border border-rose-500/40 hover:bg-rose-500/25 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'text-stone-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <FontAwesomeIcon
              icon={faBell}
              className={`text-sm ${
                notifCount > 0
                  ? isWarehouse
                    ? 'text-amber-300'
                    : 'text-rose-400'
                  : ''
              }`}
            />
            {notifCount > 0 && (
              <span
                className={`absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[9px] font-bold shadow-md animate-pulse ${
                  isWarehouse
                    ? 'bg-amber-500 text-stone-900'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </button>

          {/* Dropdown Popover */}
          {isNotifOpen && (
            <div
              className={`absolute right-0 mt-3 w-80 sm:w-96 bg-[#0c1611] rounded-xl shadow-[0_20px_45px_rgba(0,0,0,0.85)] z-50 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 border ${
                isWarehouse ? 'border-amber-500/35' : 'border-rose-500/30'
              }`}
            >
              {/* Header */}
              <div
                className={`p-3.5 border-b border-white/[0.08] flex items-center justify-between ${
                  isWarehouse
                    ? 'bg-gradient-to-r from-amber-950/40 via-[#0c1611] to-[#070e0a]'
                    : 'bg-gradient-to-r from-rose-950/40 via-[#0c1611] to-[#070e0a]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs border ${
                      isWarehouse
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={isWarehouse ? faBoxesStacked : faTriangleExclamation}
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-stone-100 tracking-wide uppercase">
                      {isWarehouse ? 'Nhiệm Vụ Kiểm Định Kho' : 'Cảnh Báo Sự Cố Kho'}
                    </h3>
                    <p className="text-[10px] text-stone-300">
                      {isWarehouse
                        ? 'Đồng hồ mới nạp chờ đối soát Serial'
                        : 'Ghi nhận hàng lỗi & sai lệch kiểm kê'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isWarehouse
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {isWarehouse
                      ? `${pendingChecks.length} cần kiểm`
                      : `${alerts.length} sự cố`}
                  </span>
                  <button
                    onClick={fetchNotifications}
                    title="Cập nhật danh sách"
                    className="p-1.5 rounded text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <FontAwesomeIcon
                      icon={faRotate}
                      className={`text-xs ${
                        loadingNotif
                          ? `animate-spin ${isWarehouse ? 'text-amber-400' : 'text-rose-400'}`
                          : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Danh sách thông báo */}
              <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.05]">
                {isWarehouse ? (
                  /* ================= GIAO DIỆN CHUÔNG CỦA NHÂN VIÊN KHO ================= */
                  pendingChecks.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-base mb-2">
                        <FontAwesomeIcon icon={faCircleCheck} />
                      </div>
                      <p className="text-xs font-medium text-stone-200">
                        Kho Hàng Đã Đối Soát 100%
                      </p>
                      <p className="text-[11px] text-stone-400 mt-1">
                        Hiện không có lô hàng nào đang chờ kiểm tra thực tế.
                      </p>
                    </div>
                  ) : (
                    pendingChecks.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 hover:bg-white/[0.03] transition-colors flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <FontAwesomeIcon icon={faClock} className="text-[9px]" />
                            Chờ Kiểm Định Vật Lý
                          </span>
                          <span className="font-mono text-[10px] text-stone-400">
                            {formatDateTime(item.adminApprovedAt)}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-stone-100 line-clamp-1">
                            {item.variant?.product?.name || 'Sản phẩm đồng hồ'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-300">
                            <FontAwesomeIcon icon={faBarcode} className="text-stone-400 text-[10px]" />
                            <span>Mã Serial:</span>
                            <span className="font-mono font-medium text-amber-200 bg-white/[0.06] px-1.5 py-0.2 rounded border border-white/10">
                              {item.serialNumber}
                            </span>
                            {item.variant?.sku && (
                              <span className="text-stone-400 font-mono text-[10px]">
                                ({item.variant.sku})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-2 rounded bg-black/40 border border-white/[0.06] text-[11px] text-stone-300">
                          <p className="italic text-stone-300">
                            "{item.note || 'Admin nạp lô hàng mới'}"
                          </p>
                          <div className="mt-1 flex items-center justify-between text-[10px] text-stone-400">
                            <span>
                              Người nạp:{' '}
                              <strong className="text-stone-200 font-normal">
                                {item.importedBy?.name || item.importedBy?.staffCode || 'Admin'}
                              </strong>
                            </span>
                            <span className="text-emerald-400 font-medium">Mở hộp kiểm tra</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  /* ================= GIAO DIỆN CHUÔNG CỦA ADMIN / QUẢN LÝ ================= */
                  alerts.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-base mb-2">
                        <FontAwesomeIcon icon={faCircleCheck} />
                      </div>
                      <p className="text-xs font-medium text-stone-200">
                        Kho Hàng Đang Ổn Định
                      </p>
                      <p className="text-[11px] text-stone-300 mt-1">
                        Không có báo cáo hàng lỗi hoặc thiếu hàng từ nhân viên kho.
                      </p>
                    </div>
                  ) : (
                    alerts.map((alert) => {
                      const isDefective = alert.status === 'defective';
                      return (
                        <div
                          key={alert.id}
                          className="p-3 hover:bg-white/[0.03] transition-colors flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                isDefective
                                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              }`}
                            >
                              <FontAwesomeIcon
                                icon={isDefective ? faTriangleExclamation : faBan}
                                className="text-[9px]"
                              />
                              {isDefective ? 'Hàng Lỗi Kỹ Thuật' : 'Thiếu Khi Nhập Hàng'}
                            </span>
                            <span className="font-mono text-[10px] text-stone-300">
                              {formatDateTime(alert.warehouseConfirmedAt)}
                            </span>
                          </div>

                          {/* Product info & Serial */}
                          <div>
                            <p className="text-xs font-medium text-stone-100 line-clamp-1">
                              {alert.variant?.product?.name || 'Sản phẩm đồng hồ'}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-300">
                              <span>Mã Serial:</span>
                              <span className="font-mono font-medium text-amber-200 bg-white/[0.06] px-1.5 py-0.2 rounded border border-white/10">
                                {alert.serialNumber}
                              </span>
                              {alert.variant?.sku && (
                                <span className="text-stone-400 font-mono text-[10px]">
                                  ({alert.variant.sku})
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Warehouse staff note */}
                          <div className="p-2 rounded bg-black/40 border border-white/[0.06] text-[11px] text-stone-300">
                            <p className="italic leading-relaxed text-rose-200/90">
                              "{alert.note || 'Không có ghi chú thêm từ nhân viên kho'}"
                            </p>
                            <div className="mt-1 flex items-center justify-between text-[10px] text-stone-400">
                              <span>
                                Nhân viên:{' '}
                                <strong className="text-stone-300 font-normal">
                                  {alert.warehouseStaff?.name ||
                                    alert.warehouseStaff?.staffCode ||
                                    'Kho'}
                                </strong>
                              </span>
                              {alert.warehouseStaff?.staffCode && (
                                <span className="font-mono">
                                  #{alert.warehouseStaff.staffCode}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )
                )}
              </div>

              {/* Footer link to Inventory */}
              <div className="p-2.5 bg-[#070e0a] border-t border-white/[0.08] text-center">
                <Link
                  href="/inventory"
                  onClick={() => setIsNotifOpen(false)}
                  className={`inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg text-xs font-medium transition-all border ${
                    isWarehouse
                      ? 'text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30'
                      : 'text-amber-300 hover:text-amber-200 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border-[#d4af37]/30'
                  }`}
                >
                  <span>
                    {isWarehouse
                      ? 'Mở Bảng Kiểm Kho & Xác Nhận Ngay'
                      : 'Mở Trang Quản Lý Kho & Xử Lý Sự Cố'}
                  </span>
                  <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Action Button based on position */}
        {admin?.role === 'admin' || admin?.position === 'manager' || admin?.position === 'sales' ? (
          <Link
            href="/products"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#00844e] to-[#006039] hover:from-[#009b5c] hover:to-[#007345] text-white text-xs font-medium tracking-wide shadow-[0_4px_15px_rgba(0,132,78,0.25)] border border-emerald-400/30 transition-all cursor-pointer"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
            <span className="hidden sm:inline">Kho Đồng Hồ & Mẫu</span>
          </Link>
        ) : admin?.position === 'warehouse' ? (
          <Link
            href="/inventory"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-medium tracking-wide shadow-[0_4px_15px_rgba(16,185,129,0.25)] border border-emerald-400/30 transition-all"
          >
            <FontAwesomeIcon icon={faBoxesStacked} className="text-xs" />
            <span className="hidden sm:inline">Kiểm Kho & Serial</span>
          </Link>
        ) : (
          <Link
            href="/products"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white text-xs font-medium tracking-wide shadow-[0_4px_15px_rgba(2,132,199,0.25)] border border-sky-400/30 transition-all"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
            <span className="hidden sm:inline">Tiếp Nhận Sửa Chữa</span>
          </Link>
        )}
      </div>
    </header>
  );
}
