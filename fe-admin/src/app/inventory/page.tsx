'use client';

import React, { useState, useEffect } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxesStacked,
  faCircleCheck,
  faTriangleExclamation,
  faMagnifyingGlass,
  faFilter,
  faSpinner,
  faCheck,
  faCheckDouble,
  faXmark,
  faDownload,
  faFileExcel,
  faBarcode,
  faCircleInfo,
  faShieldHalved,
  faClock,
  faRotateRight,
  faUserCheck,
  faBan,
  faCloudArrowUp,
} from '@fortawesome/free-solid-svg-icons';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { hasPermission } from '@/utils/permissions';
import apiClient from '@/lib/axios';

interface SerialItem {
  id: number;
  variantId: number;
  serialNumber: string;
  status:
  | 'pending_approval'
  | 'pending_warehouse_check'
  | 'available'
  | 'missing_on_import'
  | 'reserved'
  | 'sold'
  | 'defective'
  | 'in_repair'
  | 'returned_to_warehouse';
  itemCondition: 'new' | 'like_new' | 'pre_owned';
  location: 'warehouse' | 'showroom';
  importedByAdminId?: number | null;
  adminApprovedAt?: string | null;
  warehouseConfirmedById?: number | null;
  warehouseConfirmedAt?: string | null;
  note?: string | null;
  variant?: {
    id: number;
    sku: string;
    price: number | string;
    mauMatSo?: string | null;
    mauDayDeo?: string | null;
    mauNieng?: string | null;
    product?: {
      id: number;
      name: string;
      slug: string;
      imageUrl?: string | null;
      chatLieuDayDeo?: string | null;
      chatLieuNieng?: string | null;
    };
  };
  importedBy?: {
    id: number;
    name: string;
    staffCode?: string;
    email?: string;
  };
  warehouseStaff?: {
    id: number;
    name: string;
    staffCode?: string;
    email?: string;
  };
}

export default function InventoryWarehousePage() {
  const { admin } = useAdminAuth();
  const isAdmin = admin?.role === 'admin' || admin?.position === 'manager';
  const isWarehouse = admin?.position === 'warehouse';

  // Tab: 'pending' (Chờ kiểm kho) | 'all' (Tất cả serial)
  const [activeTab, setActiveTab] = useState<'pending' | 'available' | 'all'>('pending');

  // Dữ liệu
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingSerials, setPendingSerials] = useState<SerialItem[]>([]);
  const [allSerials, setAllSerials] = useState<SerialItem[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    available: 0,
    defective: 0,
    missing: 0,
    total: 0,
  });
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 20,
  });

  // Bộ lọc
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Đang chọn các serial để xác nhận hàng loạt
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  // Modal Nhập Serial Bằng Excel
  const [showSerialImportModal, setShowSerialImportModal] = useState<boolean>(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [importingExcel, setImportingExcel] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<any>(null);
  const excelInputRef = React.useRef<HTMLInputElement | null>(null);

  // Modal Báo cáo Sai Lệch (Hỏng / Thiếu)
  const [reportingSerial, setReportingSerial] = useState<SerialItem | null>(null);
  const [discrepancyForm, setDiscrepancyForm] = useState({
    status: 'missing_on_import' as 'missing_on_import' | 'defective',
    note: '',
  });

  // Thông báo Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Tải danh sách serial
  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingRes, allRes] = await Promise.allSettled([
        apiClient.get('/serials/pending-check'),
        apiClient.get(`/serials?status=${statusFilter}&search=${encodeURIComponent(search)}&page=1&limit=50`),
      ]);

      if (pendingRes.status === 'fulfilled' && pendingRes.value.data?.success) {
        setPendingSerials(pendingRes.value.data.data || []);
      }

      if (allRes.status === 'fulfilled' && allRes.value.data?.success) {
        const payload = allRes.value.data.data;
        const list = Array.isArray(payload) ? payload : (payload?.serials || []);
        setAllSerials(list);
        if (payload?.stats) {
          setStats(payload.stats);
        }
        const meta = allRes.value.data.meta || payload?.pagination;
        if (meta) {
          setPagination(meta);
        }
      }
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu kho:', err);
      showToast('error', 'Không thể kết nối đến máy chủ lấy dữ liệu kho.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  // Xử lý chọn/bỏ chọn tất cả ở tab Pending
  const handleSelectAllPending = () => {
    if (selectedIds.length === pendingSerials.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingSerials.map((s) => s.id));
    }
  };

  const handleToggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Nhân viên kho Xác nhận đối chiếu đúng & Nhập kho (Available)
  const handleConfirmWarehouse = async (idsToConfirm: number[]) => {
    if (idsToConfirm.length === 0) {
      showToast('error', 'Vui lòng chọn ít nhất 1 số Serial để xác nhận nhập kho.');
      return;
    }

    try {
      setSubmittingAction(true);
      const res = await apiClient.put('/serials/warehouse-confirm', {
        serialIds: idsToConfirm,
      });

      if (res.data?.success) {
        showToast(
          'success',
          res.data.message || `Đã đối chiếu & xác nhận nhập kho thành công ${idsToConfirm.length} chiếc!`
        );
        setSelectedIds([]);
        await fetchData();
      }
    } catch (err: any) {
      console.error('Lỗi xác nhận kho:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể xác nhận kiểm kho';
      showToast('error', msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Gửi báo cáo sai lệch
  const handleSubmitDiscrepancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingSerial) return;

    try {
      setSubmittingAction(true);
      const res = await apiClient.put('/serials/report-discrepancy', {
        serialId: reportingSerial.id,
        status: discrepancyForm.status,
        note: discrepancyForm.note.trim(),
      });

      if (res.data?.success) {
        showToast(
          'success',
          `Đã ghi nhận báo cáo sai lệch cho Seri ${reportingSerial.serialNumber}.`
        );
        setReportingSerial(null);
        setDiscrepancyForm({ status: 'missing_on_import', note: '' });
        await fetchData();
      }
    } catch (err: any) {
      console.error('Lỗi báo cáo sai lệch:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể lưu báo cáo';
      showToast('error', msg);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Upload file Excel serials
  const handleImportSerialsExcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelFile) {
      showToast('error', 'Vui lòng chọn file Excel (.xlsx / .xls / .csv) để nhập.');
      return;
    }

    try {
      setImportingExcel(true);
      setImportResult(null);
      const formData = new FormData();
      formData.append('file', excelFile);

      const res = await apiClient.post('/serials/import-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success) {
        setImportResult(res.data.data);
        showToast('success', res.data.message || 'Đã nhập danh sách số Serial thành công!');
        await fetchData();
      }
    } catch (err: any) {
      console.error('Lỗi upload Excel serials:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể xử lý file Excel';
      showToast('error', msg);
    } finally {
      setImportingExcel(false);
    }
  };

  // Tải file mẫu Excel
  const handleDownloadTemplate = async () => {
    try {
      const res = await apiClient.get('/serials/template', {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'BRU_WATCH_Serial_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('success', 'Đã tải xuống file Excel mẫu.');
    } catch (err: any) {
      console.error('Lỗi tải file mẫu:', err);
      showToast('error', 'Không thể tải file mẫu');
    }
  };

  // Helper render badge trạng thái
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_warehouse_check':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Chờ Kiểm Kho
          </span>
        );
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Sẵn Sàng Mở Bán
          </span>
        );
      case 'missing_on_import':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-[9px]" />
            Thiếu Hàng Khi Nhập
          </span>
        );
      case 'defective':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <FontAwesomeIcon icon={faBan} className="text-[9px]" />
            Hàng Lỗi / Hỏng
          </span>
        );
      case 'sold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
            Đã Xuất Bán
          </span>
        );
      case 'reserved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            Đang Giữ Chỗ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-500/15 text-stone-400 border border-stone-500/30">
            {status}
          </span>
        );
    }
  };

  return (
    <AdminShell
      title="Kiểm Định Kho & Đối Chiếu Serial"
      subtitle="Quy trình nghiêm ngặt: Kiểm tra số Seri vật lý thực tế, đối chiếu tình trạng lô hàng và xác nhận nhập kho trước khi mở bán"
    >
      <div className="space-y-6">
        {/* Toast thông báo */}
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md animate-slideDown ${toast.type === 'success'
              ? 'bg-emerald-950/90 text-white border-emerald-500/40'
              : 'bg-red-950/90 text-white border-red-500/40'
              }`}
          >
            <FontAwesomeIcon
              icon={toast.type === 'success' ? faCircleCheck : faTriangleExclamation}
              className="text-lg"
            />
            <span className="text-xs font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-stone-300 hover:text-white">
              <FontAwesomeIcon icon={faXmark} className="text-xs" />
            </button>
          </div>
        )}

        {/* Thống kê nhanh - Bấm vào thẻ để chuyển tab nhanh */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            onClick={() => {
              setActiveTab('pending');
            }}
            className="luxury-card rounded-xl p-3.5 border border-amber-500/30 bg-[#09100c] hover:border-amber-400 transition-all cursor-pointer group shadow-sm"
          >
            <span className="text-[11px] text-amber-300 flex items-center gap-1.5 font-medium group-hover:text-amber-200">
              <FontAwesomeIcon icon={faClock} className="text-xs" />
              Chờ Kiểm Kho Thực Tế
            </span>
            <p className="text-2xl font-bold text-amber-200 mt-1 font-mono">
              {stats.pending || pendingSerials.length}
            </p>
            <span className="text-[10px] text-stone-500 mt-1 block">Bấm để đối chiếu hàng</span>
          </div>

          <div
            onClick={() => {
              setActiveTab('available');
              setStatusFilter('available');
            }}
            className="luxury-card rounded-xl p-3.5 border border-emerald-500/30 bg-[#09100c] hover:border-emerald-400 transition-all cursor-pointer group shadow-sm"
          >
            <span className="text-[11px] text-emerald-300 flex items-center gap-1.5 font-medium group-hover:text-emerald-200">
              <FontAwesomeIcon icon={faCircleCheck} className="text-xs" />
              Sẵn Sàng Mở Bán
            </span>
            <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
              {stats.available || allSerials.filter((s) => s.status === 'available').length}
            </p>
            <span className="text-[10px] text-emerald-400/70 mt-1 block font-medium">Bấm để xem danh sách có sẵn</span>
          </div>

          <div
            onClick={() => {
              setActiveTab('all');
              setStatusFilter('defective');
            }}
            className="luxury-card rounded-xl p-3.5 border border-red-500/30 bg-[#09100c] hover:border-red-400 transition-all cursor-pointer group shadow-sm"
          >
            <span className="text-[11px] text-red-300 flex items-center gap-1.5 font-medium group-hover:text-red-200">
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-xs" />
              Sai Lệch / Hàng Lỗi
            </span>
            <p className="text-2xl font-bold text-red-400 mt-1 font-mono">
              {(stats.defective + stats.missing) || allSerials.filter((s) => ['missing_on_import', 'defective'].includes(s.status)).length}
            </p>
            <span className="text-[10px] text-stone-500 mt-1 block">Báo cáo thiếu hoặc hỏng</span>
          </div>

          <div
            onClick={() => {
              setActiveTab('all');
              setStatusFilter('all');
            }}
            className="luxury-card rounded-xl p-3.5 border border-sky-500/30 bg-[#09100c] hover:border-sky-400 transition-all cursor-pointer group shadow-sm"
          >
            <span className="text-[11px] text-sky-300 flex items-center gap-1.5 font-medium group-hover:text-sky-200">
              <FontAwesomeIcon icon={faBoxesStacked} className="text-xs" />
              Tổng Số Serial Đã Lưu
            </span>
            <p className="text-2xl font-bold text-white mt-1 font-mono">
              {stats.total || pagination.totalItems || allSerials.length}
            </p>
            <span className="text-[10px] text-stone-500 mt-1 block">Xem toàn bộ lịch sử</span>
          </div>
        </div>

        {/* Banner hướng dẫn luồng nghiệp vụ - Ẩn đối với Nhân viên kho theo yêu cầu */}
        {!isWarehouse && (
          <div className="luxury-card rounded-xl p-4 border border-[#d4af37]/20 bg-[#070e0a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] shrink-0">
                <FontAwesomeIcon icon={faShieldHalved} className="text-lg" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Quy Trình Kiểm Tra & Xác Nhận Nhập Kho
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                  {/* Khi Admin tải file Excel lên hệ thống, các số Serial sẽ ở trạng thái{' '}
                  <strong className="text-amber-300 font-mono">pending_warehouse_check</strong>.
                  Nhân viên kho cần mở hộp đồng hồ, đối chiếu số Serial khắc trên nắp lưng máy với bảng bên dưới, sau đó bấm{' '}
                  <strong className="text-emerald-400 font-medium">&quot;Xác Nhận Đã Kiểm Tra&quot;</strong> để đưa vào kho mở bán. */}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {isAdmin && (
                <button
                  onClick={() => {
                    setExcelFile(null);
                    setImportResult(null);
                    setShowSerialImportModal(true);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <FontAwesomeIcon icon={faFileExcel} className="text-xs text-emerald-400" />
                  Nhập Serial Excel
                </button>
              )}
              <button
                onClick={handleDownloadTemplate}
                className="px-3 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 hover:text-white border border-white/[0.08] text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faDownload} className="text-xs text-[#d4af37]" />
                File Mẫu
              </button>
              <button
                onClick={fetchData}
                className="px-3 py-2 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] border border-[#d4af37]/35 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FontAwesomeIcon icon={faRotateRight} className={`text-xs ${loading ? 'fa-spin' : ''}`} />
                Làm Mới
              </button>
            </div>
          </div>
        )}

        {/* Tab Selector & Control */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Tab 1: Chờ kiểm tra */}
            <button
              onClick={() => {
                setActiveTab('pending');
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'pending'
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-950/30'
                : 'bg-white/[0.03] text-stone-400 hover:text-white border border-white/[0.06]'
                }`}
            >
              <FontAwesomeIcon icon={faClock} />
              <span>1. Chờ Kiểm Tra</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-200 text-[10px] font-mono">
                {stats.pending || pendingSerials.length}
              </span>
            </button>

            {/* Tab 2: Sẵn sàng mở bán (Available) - Đáp ứng chính xác câu hỏi của người dùng */}
            <button
              onClick={() => {
                setActiveTab('available');
                setStatusFilter('available');
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'available'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-sm shadow-emerald-950/30'
                : 'bg-white/[0.03] text-stone-400 hover:text-white border border-white/[0.06]'
                }`}
            >
              <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-400" />
              <span>2. Đã Duyệt - Sẵn Sàng Bán</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-mono font-bold">
                {stats.available || allSerials.filter((s) => s.status === 'available').length}
              </span>
            </button>

            {/* Tab 3: Toàn bộ kho & Lịch sử */}
            <button
              onClick={() => {
                setActiveTab('all');
                setStatusFilter('all');
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'all'
                ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 shadow-sm shadow-amber-950/30'
                : 'bg-white/[0.03] text-stone-400 hover:text-white border border-white/[0.06]'
                }`}
            >
              <FontAwesomeIcon icon={faBoxesStacked} />
              <span>3. Toàn Bộ Serial & Lịch Sử</span>
            </button>
          </div>

          {/* Quick search input & Refresh */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                placeholder="Tìm theo Serial, SKU, mẫu..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#070e0a] rounded-lg border border-white/[0.08] text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <button
              onClick={fetchData}
              title="Làm mới dữ liệu kho"
              className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-stone-300 hover:text-[#d4af37] text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <FontAwesomeIcon icon={faRotateRight} className={`text-xs ${loading ? 'fa-spin' : ''}`} />
              <span className="hidden sm:inline">Làm Mới</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DANH SÁCH CHỜ NHÂN VIÊN KHO KIỂM TRA (PENDING) */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {/* Thanh tác vụ hàng loạt */}
            <div className="luxury-card rounded-xl p-3 border border-white/[0.08] bg-[#070e0a] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      pendingSerials.length > 0 && selectedIds.length === pendingSerials.length
                    }
                    onChange={handleSelectAllPending}
                    className="w-4 h-4 rounded border-stone-600 text-emerald-600 focus:ring-0 focus:ring-offset-0 bg-[#040806]"
                  />
                  <span>
                    Chọn tất cả (
                    <strong className="text-white">{selectedIds.length}</strong> / {pendingSerials.length})
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={selectedIds.length === 0 || submittingAction}
                  onClick={() => handleConfirmWarehouse(selectedIds)}
                  className="px-4 py-2 rounded-lg bg-[#00844e] hover:bg-[#009b5c] text-white text-xs font-semibold flex items-center gap-2 shadow-lg disabled:opacity-40 transition-all cursor-pointer"
                >
                  {submittingAction ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="fa-spin text-xs" />
                      Đang Xác Nhận...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheckDouble} className="text-xs" />
                      Xác Nhận Đã Kiểm Tra ({selectedIds.length} Chiếc)
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Bảng danh sách hàng chờ */}
            {loading ? (
              <div className="luxury-card rounded-xl p-12 text-center text-stone-400 flex flex-col items-center justify-center gap-3">
                <FontAwesomeIcon icon={faSpinner} className="fa-spin text-2xl text-[#d4af37]" />
                <p className="text-xs">Đang kiểm tra danh sách hàng chờ từ CSDL MySQL...</p>
              </div>
            ) : pendingSerials.length === 0 ? (
              <div className="luxury-card rounded-xl p-12 text-center text-stone-400 flex flex-col items-center justify-center gap-3 border border-dashed border-white/[0.1]">
                <FontAwesomeIcon icon={faCheck} className="text-3xl text-emerald-400" />
                <p className="text-sm font-semibold text-white">Kho Hiện Tại Không Có Hàng Chờ Kiểm Định!</p>
                <p className="text-xs text-stone-400">
                  Tất cả các số Serial đã được đối chiếu và đưa vào trạng thái sẵn sàng giao dịch.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#070e0a]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#040806] text-stone-400 border-b border-white/[0.06] text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={
                            pendingSerials.length > 0 && selectedIds.length === pendingSerials.length
                          }
                          onChange={handleSelectAllPending}
                          className="w-4 h-4 rounded border-stone-600 text-emerald-600 focus:ring-0 bg-[#040806]"
                        />
                      </th>
                      <th className="py-3 px-3">Số Serial (Khắc Nắp Lưng)</th>
                      <th className="py-3 px-3">Mã SKU</th>
                      <th className="py-3 px-3">Mẫu Đồng Hồ & Màu Sắc</th>
                      <th className="py-3 px-3">Admin Đẩy Lên</th>
                      <th className="py-3 px-3 text-center">Trạng Thái</th>
                      <th className="py-3 px-3 text-right">Thao Tác Thủ Kho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {pendingSerials.map((serial) => {
                      const isSelected = selectedIds.includes(serial.id);
                      return (
                        <tr
                          key={serial.id}
                          className={`transition-colors ${isSelected ? 'bg-[#d4af37]/5' : 'hover:bg-white/[0.02]'
                            }`}
                        >
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOne(serial.id)}
                              className="w-4 h-4 rounded border-stone-600 text-emerald-600 focus:ring-0 bg-[#040806]"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faBarcode} className="text-stone-500 text-xs" />
                              <span className="font-mono font-bold text-amber-200 text-sm tracking-wide">
                                {serial.serialNumber}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono font-semibold text-emerald-400">
                              {serial.variant?.sku || `VAR-${serial.variantId}`}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-[#040806] border border-white/[0.1] overflow-hidden shrink-0">
                                {serial.variant?.product?.imageUrl ? (
                                  <img
                                    src={serial.variant.product.imageUrl}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-stone-600">
                                    <FontAwesomeIcon icon={faClock} />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-white truncate max-w-[200px]">
                                  {serial.variant?.product?.name || 'Mẫu đồng hồ'}
                                </p>
                                <p className="text-[10px] text-stone-400 mt-0.5">
                                  Mặt: <span className="text-stone-300">{serial.variant?.mauMatSo || 'Tiêu chuẩn'}</span>
                                  {serial.variant?.mauNieng && (
                                    <> • Niềng: <span className="text-[#d4af37]">{serial.variant.mauNieng}</span></>
                                  )}
                                  {serial.variant?.mauDayDeo && (
                                    <> • Dây: <span className="text-stone-300">{serial.variant.mauDayDeo}</span></>
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-stone-300 font-medium block">
                              {serial.importedBy?.name || 'Admin'}
                            </span>
                            <span className="text-[10px] text-stone-500 font-mono">
                              {serial.adminApprovedAt
                                ? new Date(serial.adminApprovedAt).toLocaleString('vi-VN')
                                : 'Vừa cập nhật'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {renderStatusBadge(serial.status)}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleConfirmWarehouse([serial.id])}
                                title="Xác nhận đúng Seri & Hàng nguyên vẹn"
                                className="px-2.5 py-1.5 rounded-lg bg-[#00844e]/20 hover:bg-[#00844e]/40 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                Khớp Seri
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setReportingSerial(serial);
                                  setDiscrepancyForm({ status: 'missing_on_import', note: '' });
                                }}
                                title="Báo cáo sai lệch (Thiếu chiếc này / Hàng bị lỗi trầy xước)"
                                className="px-2.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <FontAwesomeIcon icon={faTriangleExclamation} className="text-[10px]" />
                                Báo Sai Lệch
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: DANH SÁCH SERIAL ĐÃ ĐƯỢC DUYỆT (AVAILABLE - SẴN SÀNG ĐỂ BÁN) */}
        {activeTab === 'available' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="luxury-card rounded-xl p-3.5 border border-emerald-500/30 bg-emerald-950/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <FontAwesomeIcon icon={faCircleCheck} className="text-sm" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Danh Sách Serial Đã Được Kiểm Tra & Sẵn Sàng Bán (Available)
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Các số Serial này đã được Thủ kho đối chiếu thực tế và kích hoạt trạng thái mở bán lên hệ thống CSDL.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 text-xs font-mono font-bold">
                {stats.available || allSerials.filter((s) => s.status === 'available').length} chiếc sẵn sàng
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#070e0a]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#040806] text-stone-400 border-b border-white/[0.06] text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Số Serial (Khắc Nắp Lưng)</th>
                    <th className="py-3 px-3">Mã SKU</th>
                    <th className="py-3 px-3">Mẫu Đồng Hồ & Màu Sắc</th>
                    <th className="py-3 px-3 text-center">Trạng Thái</th>
                    <th className="py-3 px-3">Thủ Kho Đã Duyệt</th>
                    <th className="py-3 px-3">Thời Gian Duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {allSerials.filter((s) => s.status === 'available').length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400">
                        <FontAwesomeIcon icon={faBoxesStacked} className="text-3xl text-stone-600 mb-2 block" />
                        <p className="text-sm font-semibold text-stone-300">Chưa có số Serial nào ở trạng thái &quot;Sẵn sàng mở bán&quot;!</p>
                        <p className="text-xs text-stone-500 mt-1">
                          Vui lòng vào tab <strong>&quot;1. Chờ Kiểm Tra&quot;</strong> để đối chiếu hàng và bấm <strong>&quot;Khớp Seri&quot;</strong> để duyệt.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    allSerials
                      .filter((s) => s.status === 'available')
                      .map((s) => (
                        <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <FontAwesomeIcon icon={faBarcode} className="text-emerald-400 text-xs" />
                              <span className="font-mono font-bold text-emerald-300 text-sm tracking-wide">
                                {s.serialNumber}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono font-semibold text-stone-200">
                              {s.variant?.sku || `VAR-${s.variantId}`}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#040806] border border-white/[0.1] overflow-hidden shrink-0">
                                {s.variant?.product?.imageUrl ? (
                                  <img
                                    src={s.variant.product.imageUrl}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-stone-600">
                                    <FontAwesomeIcon icon={faClock} />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-white truncate max-w-[200px]">
                                  {s.variant?.product?.name || 'Đồng hồ cao cấp'}
                                </p>
                                <p className="text-[10px] text-stone-400">
                                  Mặt: <span className="text-stone-300">{s.variant?.mauMatSo || 'Tiêu chuẩn'}</span>
                                  {s.variant?.mauNieng && <> • Niềng: <span className="text-[#d4af37]">{s.variant.mauNieng}</span></>}
                                  {s.variant?.mauDayDeo && <> • Dây: <span className="text-stone-300">{s.variant.mauDayDeo}</span></>}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {renderStatusBadge(s.status)}
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-stone-200 font-semibold block">
                              {s.warehouseStaff?.name || 'Thủ Kho'}
                            </span>
                            <span className="text-[10px] text-stone-500 font-mono">
                              Mã NV: {s.warehouseStaff?.staffCode || 'KHO'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-stone-300">
                            {s.warehouseConfirmedAt
                              ? new Date(s.warehouseConfirmedAt).toLocaleString('vi-VN')
                              : 'Vừa duyệt'}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: TOÀN BỘ SERIAL TRONG KHO (ALL SERIALS) */}
        {activeTab === 'all' && (
          <div className="space-y-4">
            {/* Bộ lọc trạng thái */}
            <div className="luxury-card rounded-xl p-3 border border-white/[0.08] bg-[#070e0a] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faFilter} className="text-stone-400 text-xs" />
                <span className="text-xs text-stone-300 font-medium">Lọc theo trạng thái:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#040806] text-stone-200 border border-white/[0.1] text-xs focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="available">Sẵn sàng mở bán (Available)</option>
                  <option value="pending_warehouse_check">Chờ kho kiểm tra (Pending)</option>
                  <option value="missing_on_import">Thiếu hàng khi nhập</option>
                  <option value="defective">Hàng lỗi / Hỏng hóc</option>
                  <option value="sold">Đã xuất bán (Sold)</option>
                  <option value="reserved">Đang giữ chỗ (Reserved)</option>
                </select>
              </div>

              <div className="text-xs text-stone-400">
                Hiển thị: <strong className="text-white">{allSerials.length}</strong> kết quả
              </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#070e0a]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#040806] text-stone-400 border-b border-white/[0.06] text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Số Serial</th>
                    <th className="py-3 px-3">Mã SKU</th>
                    <th className="py-3 px-3">Mẫu Đồng Hồ</th>
                    <th className="py-3 px-3 text-center">Trạng Thái</th>
                    <th className="py-3 px-3">Thủ Kho Đã Xác Nhận</th>
                    <th className="py-3 px-3">Ghi Chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-400">
                        <FontAwesomeIcon icon={faSpinner} className="fa-spin text-xl text-[#d4af37] mb-2" />
                        <p>Đang tải danh sách serial...</p>
                      </td>
                    </tr>
                  ) : allSerials.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-500 italic">
                        Không tìm thấy số Serial nào với bộ lọc này.
                      </td>
                    </tr>
                  ) : (
                    allSerials.map((s) => (
                      <tr key={s.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-stone-200">
                            {s.serialNumber}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono font-semibold text-emerald-400">
                            {s.variant?.sku || `VAR-${s.variantId}`}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-stone-300 font-medium">
                            {s.variant?.product?.name || 'Đồng hồ cao cấp'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {renderStatusBadge(s.status)}
                        </td>
                        <td className="py-3 px-3">
                          {s.warehouseStaff ? (
                            <div>
                              <span className="text-stone-200 font-medium block">
                                {s.warehouseStaff.name} ({s.warehouseStaff.staffCode || 'KHO'})
                              </span>
                              <span className="text-[10px] text-stone-500 font-mono">
                                {s.warehouseConfirmedAt
                                  ? new Date(s.warehouseConfirmedAt).toLocaleString('vi-VN')
                                  : ''}
                              </span>
                            </div>
                          ) : (
                            <span className="text-stone-500 italic">Chưa xác nhận</span>
                          )}
                        </td>
                        <td className="py-3 px-3 max-w-xs truncate text-stone-400">
                          {s.note || '---'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: Báo Cáo Sai Lệch / Hàng Hỏng (Discrepancy) */}
        {reportingSerial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="luxury-card rounded-2xl w-full max-w-md border border-red-500/40 bg-[#070e0a] shadow-2xl p-6 text-stone-200">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-base" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Báo Cáo Sai Lệch Hàng Hóa</h3>
                    <p className="text-xs text-stone-400">Ghi nhận tình trạng thực tế tại kho</p>
                  </div>
                </div>
                <button
                  onClick={() => setReportingSerial(null)}
                  className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-sm" />
                </button>
              </div>

              <form onSubmit={handleSubmitDiscrepancy} className="py-4 space-y-4">
                <div className="p-3 rounded-lg bg-[#030604] border border-white/[0.06] text-xs space-y-1">
                  <div>
                    Số Serial:{' '}
                    <strong className="font-mono text-amber-200">{reportingSerial.serialNumber}</strong>
                  </div>
                  <div>
                    Mã SKU:{' '}
                    <strong className="font-mono text-emerald-400">
                      {reportingSerial.variant?.sku}
                    </strong>
                  </div>
                  <div>
                    Mẫu đồng hồ:{' '}
                    <span className="text-white">{reportingSerial.variant?.product?.name}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Trạng Thái Sai Lệch Phát Hiện <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={discrepancyForm.status}
                    onChange={(e) =>
                      setDiscrepancyForm((prev) => ({
                        ...prev,
                        status: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-200 focus:outline-none focus:border-red-400"
                  >
                    <option value="missing_on_import">
                      Thiếu Hàng Khi Nhập (Trong file có nhưng thực tế không thấy chiếc này)
                    </option>
                    <option value="defective">
                      Hàng Lỗi / Hỏng Hóc (Trầy xước mặt kính, niềng móp méo, máy không chạy)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Ghi Chú Chi Tiết Lý Do / Tình Trạng Lô Hàng
                  </label>
                  <textarea
                    rows={3}
                    value={discrepancyForm.note}
                    onChange={(e) =>
                      setDiscrepancyForm((prev) => ({ ...prev, note: e.target.value }))
                    }
                    placeholder="VD: Mở kiện hàng thấy thiếu 1 hộp; hoặc phát hiện mặt kính sapphire bị xước dăm khi soi kính lúp..."
                    className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-200 focus:outline-none focus:border-red-400 resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setReportingSerial(null)}
                    className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 text-xs transition-colors cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {submittingAction ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="fa-spin text-xs" />
                        Đang Lưu Báo Cáo...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faTriangleExclamation} className="text-xs" />
                        Xác Nhận Báo Sai Lệch
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Nhập Serial Bằng File Excel (Dành Riêng Cho Quản Trị Viên) */}
        {isAdmin && showSerialImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="luxury-card rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-[#d4af37]/40 bg-[#070e0a] shadow-2xl p-6 text-stone-200">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <FontAwesomeIcon icon={faFileExcel} className="text-base" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Nhập Serial Bằng File Excel</h3>
                    <p className="text-xs text-stone-400">Luồng đồng bộ: Admin đẩy file -&gt; Chuyển giao kho kiểm tra</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSerialImportModal(false);
                    setExcelFile(null);
                    setImportResult(null);
                  }}
                  className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-sm" />
                </button>
              </div>

              {/* Hướng dẫn quy trình 3 bước */}
              <div className="mt-4 p-3.5 rounded-xl bg-[#030604] border border-white/[0.06] space-y-2">
                <span className="text-[11px] font-semibold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCircleInfo} className="text-xs" />
                  Quy Trình Quản Lý Serial Hàng Mới
                </span>
                <div className="grid grid-cols-3 gap-2 text-[10px] text-stone-400">
                  <div className="p-2 rounded bg-white/[0.03] border border-white/[0.04]">
                    <strong className="text-stone-300 block mb-0.5">1. Admin tạo SKU</strong>
                    Tạo mẫu và các mã biến thể SKU đồng hồ trước trên hệ thống.
                  </div>
                  <div className="p-2 rounded bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#d4af37]">
                    <strong className="text-amber-200 block mb-0.5">2. Tải File Excel</strong>
                    Admin upload file ghép SKU và số Serial. Trạng thái: Chờ kiểm kho.
                  </div>
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                    <strong className="text-emerald-200 block mb-0.5">3. Kho Xác Nhận</strong>
                    Nhân viên kho đối chiếu hàng thực tế &amp; xác nhận mở bán (Available).
                  </div>
                </div>
              </div>

              {/* Tải file mẫu */}
              <div className="mt-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white">Chưa có file mẫu Excel?</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Tải file mẫu chuẩn đã điền sẵn danh sách SKU đang có trong hệ thống
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3 py-2 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] border border-[#d4af37]/35 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <FontAwesomeIcon icon={faDownload} className="text-xs" />
                  Tải File Mẫu (.xlsx)
                </button>
              </div>

              {/* Form Upload */}
              <form onSubmit={handleImportSerialsExcel} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1.5">
                    Chọn File Excel Danh Sách Serial (.xlsx, .xls, .csv) <span className="text-red-400">*</span>
                  </label>
                  <div
                    onClick={() => excelInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${excelFile
                      ? 'border-emerald-500/60 bg-emerald-500/5 text-emerald-300'
                      : 'border-white/[0.12] hover:border-[#d4af37]/50 bg-[#040806] text-stone-400 hover:text-stone-200'
                      }`}
                  >
                    <input
                      ref={excelInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setExcelFile(file);
                        setImportResult(null);
                      }}
                      className="hidden"
                    />
                    <FontAwesomeIcon
                      icon={excelFile ? faCircleCheck : faCloudArrowUp}
                      className={`text-3xl mb-2 ${excelFile ? 'text-emerald-400' : 'text-[#d4af37]'}`}
                    />
                    {excelFile ? (
                      <div>
                        <p className="text-xs font-semibold text-emerald-300">{excelFile.name}</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          Kích thước: {(excelFile.size / 1024).toFixed(1)} KB • Bấm để chọn file khác
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-medium">Bấm vào đây để chọn file Excel từ máy tính</p>
                        <p className="text-[10px] text-stone-500 mt-1">Định dạng hỗ trợ: .xlsx, .xls, .csv</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kết quả sau khi upload */}
                {importResult && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <FontAwesomeIcon icon={faCheckDouble} className="text-sm" />
                      <span>Nhập Dữ Liệu Thành Công!</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded bg-black/30 border border-white/[0.04]">
                        <span className="text-stone-400 block text-[10px]">Tổng đọc được:</span>
                        <span className="font-mono font-bold text-white text-sm">{importResult.totalRows || 0}</span>
                      </div>
                      <div className="p-2 rounded bg-black/30 border border-white/[0.04]">
                        <span className="text-stone-400 block text-[10px]">Thành công (Chờ kho):</span>
                        <span className="font-mono font-bold text-emerald-400 text-sm">+{importResult.successCount || 0}</span>
                      </div>
                      <div className="p-2 rounded bg-black/30 border border-white/[0.04]">
                        <span className="text-stone-400 block text-[10px]">Bỏ qua / Lỗi:</span>
                        <span className="font-mono font-bold text-amber-300 text-sm">{importResult.failedCount || 0}</span>
                      </div>
                      <div className="p-2 rounded bg-black/30 border border-white/[0.04]">
                        <span className="text-stone-400 block text-[10px]">Trạng thái:</span>
                        <span className="font-mono font-bold text-sky-400 text-xs">Chờ kiểm tra</span>
                      </div>
                    </div>
                    {importResult.errors && importResult.errors.length > 0 && (
                      <div className="mt-2 p-2 rounded bg-red-950/40 border border-red-500/30 text-[11px] text-red-300 space-y-1 max-h-32 overflow-y-auto font-mono">
                        {importResult.errors.map((err: any, idx: number) => (
                          <div key={idx}>Dòng {err.line}: {err.error}</div>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] text-stone-300 pt-1 leading-relaxed">
                      Toàn bộ số Serial trên đã được chuyển sang trạng thái{' '}
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-semibold">
                        pending_warehouse_check (Chờ kiểm kho)
                      </span>
                      . Nhân viên kho tiến hành mở hộp đối chiếu tại tab <strong>1. Chờ Kiểm Tra</strong> để duyệt mở bán.
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSerialImportModal(false);
                      setExcelFile(null);
                      setImportResult(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 text-xs transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={!excelFile || importingExcel}
                    className="px-5 py-2 rounded-lg bg-[#00844e] hover:bg-[#009b5c] text-white text-xs font-medium flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {importingExcel ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="fa-spin text-xs" />
                        Đang Xử Lý File Excel...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCloudArrowUp} className="text-xs" />
                        Tải Lên Hệ Thống
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

