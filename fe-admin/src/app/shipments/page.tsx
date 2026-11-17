'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTruckFast,
  faBoxesStacked,
  faCircleCheck,
  faClock,
  faRotateRight,
  faMagnifyingGlass,
  faFilter,
  faEye,
  faXmark,
  faShieldHalved,
  faLocationDot,
  faUser,
  faPhone,
  faFileInvoiceDollar,
  faArrowsRotate,
  faCheck,
  faBan,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import apiClient from '@/lib/axios';

interface ShipmentItem {
  id: number;
  orderId: number;
  tenHangGiao: string;
  trackingCode: string;
  shippingFee: number | string;
  status: 'ready_to_pick' | 'picking' | 'storing' | 'delivering' | 'delivered' | 'cancelled' | string;
  note?: string | null;
  createdAt: string;
  updatedAt?: string;
  order?: {
    id: number;
    orderCode: string;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    tongTienDonHang: number | string;
    user?: {
      id: number;
      name: string;
      email: string;
      phone: string;
    };
    address?: {
      id: number;
      receiverName: string;
      phone: string;
      address: string;
    };
  };
}

interface ShipmentStats {
  total: number;
  readyToPick: number;
  delivering: number;
  delivered: number;
  cancelled: number;
}

export default function ShipmentsManagementPage() {
  const [shipments, setShipments] = useState<ShipmentItem[]>([]);
  const [stats, setStats] = useState<ShipmentStats>({
    total: 0,
    readyToPick: 0,
    delivering: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Modal State
  const [selectedShipment, setSelectedShipment] = useState<ShipmentItem | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // Fetch Danh sách vận đơn
  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page, limit: 25 };
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await apiClient.get('/shipments', { params });
      if (res.data?.success && res.data?.data) {
        setShipments(res.data.data);
        if (res.data.meta?.stats) {
          setStats(res.data.meta.stats);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách vận đơn GHN:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchTerm]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  // Đồng bộ trạng thái trực tiếp từ GHN API
  const handleSyncGHN = async (shipmentId: number) => {
    try {
      setActionLoadingId(shipmentId);
      const res = await apiClient.post(`/shipments/${shipmentId}/sync`);
      if (res.data?.success) {
        await fetchShipments();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể đồng bộ vận đơn lúc này.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Mở modal xem timeline hành trình
  const handleOpenTimeline = async (shipment: ShipmentItem) => {
    setSelectedShipment(shipment);
    setLoadingTimeline(true);
    try {
      const res = await apiClient.get(`/shipments/tracking/${shipment.trackingCode}`);
      if (res.data?.success && res.data?.data?.timeline) {
        setTimeline(res.data.data.timeline);
      } else {
        setTimeline([]);
      }
    } catch {
      setTimeline([]);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <FontAwesomeIcon icon={faCircleCheck} className="text-[10px]" />
            <span>Đã Giao Hàng</span>
          </span>
        );
      case 'delivering':
      case 'picking':
      case 'storing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <FontAwesomeIcon icon={faTruckFast} className="text-[10px]" />
            <span>Đang Giao GHN</span>
          </span>
        );
      case 'ready_to_pick':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <FontAwesomeIcon icon={faClock} className="text-[10px]" />
            <span>Chờ Lấy Hàng</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-red-500/10 text-red-400 border border-red-500/30">
            <FontAwesomeIcon icon={faBan} className="text-[10px]" />
            <span>Đã Hủy Đơn</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-stone-500/10 text-stone-300 border border-stone-500/30">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#d4af37]/15">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37] font-semibold">
                LOGISTICS & FULFILLMENT
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
                GHN Master API Connected
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-stone-100 font-light mt-1">
              Quản Lý Vận Đơn Giao Hàng Nhanh (GHN Express)
            </h1>
            <p className="text-xs text-stone-400 font-light mt-0.5">
              Theo dõi vận trình bưu kiện thời gian thực, điều phối xuất kho và đồng kiểm bảo hiểm 100% giá trị cỗ máy.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchShipments()}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-stone-300 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <FontAwesomeIcon icon={faRotateRight} className={`text-xs ${loading ? 'animate-spin' : ''}`} />
              <span>Đồng Bộ Danh Sách</span>
            </button>
          </div>
        </div>

        {/* KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-[#08120d] border border-white/[0.08] rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">Tổng Bưu Kiện</span>
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-2xl text-stone-100 font-normal">{stats.total}</span>
              <FontAwesomeIcon icon={faBoxesStacked} className="text-stone-500 text-sm" />
            </div>
          </div>

          <div className="bg-[#08120d] border border-blue-500/20 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">Chờ GHN Lấy Hàng</span>
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-2xl text-blue-300 font-normal">{stats.readyToPick}</span>
              <FontAwesomeIcon icon={faClock} className="text-blue-400 text-sm" />
            </div>
          </div>

          <div className="bg-[#08120d] border border-amber-500/20 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">Đang Giao Hỏa Tốc</span>
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-2xl text-amber-300 font-normal">{stats.delivering}</span>
              <FontAwesomeIcon icon={faTruckFast} className="text-amber-400 text-sm" />
            </div>
          </div>

          <div className="bg-[#08120d] border border-emerald-500/20 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Giao Thành Công</span>
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-2xl text-emerald-300 font-normal">{stats.delivered}</span>
              <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-400 text-sm" />
            </div>
          </div>

          <div className="bg-[#08120d] border border-red-500/20 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider block">Đã Hủy / Hoàn</span>
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-2xl text-red-300 font-normal">{stats.cancelled}</span>
              <FontAwesomeIcon icon={faBan} className="text-red-400 text-sm" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#08120d] border border-white/[0.08] rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Tất Cả' },
              { id: 'ready_to_pick', label: 'Chờ Lấy Hàng' },
              { id: 'delivering', label: 'Đang Giao' },
              { id: 'delivered', label: 'Đã Giao' },
              { id: 'cancelled', label: 'Đã Hủy' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#006039] text-white font-semibold shadow-md'
                    : 'bg-white/[0.03] text-stone-400 hover:text-stone-200 border border-white/[0.06]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[280px]">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 text-xs" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã vận đơn, ghi chú..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        {/* Table List */}
        <div className="bg-[#08120d] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-black/40 text-[11px] font-mono uppercase text-stone-400 tracking-wider">
                  <th className="py-4 px-5">Vận Đơn GHN</th>
                  <th className="py-4 px-5">Mã Đơn Hàng</th>
                  <th className="py-4 px-5">Người Nhận & Địa Chỉ</th>
                  <th className="py-4 px-5 text-right">Cước GHN</th>
                  <th className="py-4 px-5 text-center">Trạng Thái</th>
                  <th className="py-4 px-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-xs font-mono">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-stone-400">
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-[#d4af37] mb-2 block mx-auto" />
                      <span>Đang tải danh sách vận đơn GHN...</span>
                    </td>
                  </tr>
                ) : shipments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-stone-400">
                      <FontAwesomeIcon icon={faBoxesStacked} className="text-3xl text-stone-600 mb-2 block mx-auto" />
                      <span>Không có vận đơn nào phù hợp với bộ lọc hiện tại.</span>
                    </td>
                  </tr>
                ) : (
                  shipments.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Vận đơn GHN */}
                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <span className="text-[#d4af37] font-bold tracking-wider font-mono text-sm block">
                            {s.trackingCode}
                          </span>
                          <span className="text-[10px] text-stone-400 flex items-center gap-1">
                            <FontAwesomeIcon icon={faTruckFast} className="text-emerald-400" />
                            <span>{s.tenHangGiao || 'GHN Express'}</span>
                          </span>
                        </div>
                      </td>

                      {/* Mã đơn */}
                      <td className="py-4 px-5">
                        <div className="space-y-0.5">
                          <span className="text-stone-200 font-semibold">{s.order?.orderCode || `#ORD-${s.orderId}`}</span>
                          <span className="text-[10px] text-stone-400 block">
                            Tổng: {Number(s.order?.tongTienDonHang || 0).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      </td>

                      {/* Người nhận & Địa chỉ */}
                      <td className="py-4 px-5 max-w-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 text-stone-200 font-medium font-sans">
                            <FontAwesomeIcon icon={faUser} className="text-[#d4af37] text-[10px]" />
                            <span>{s.order?.address?.receiverName || s.order?.user?.name || 'Quý khách'}</span>
                            <span className="text-stone-400 text-xs">({s.order?.address?.phone || s.order?.user?.phone || 'N/A'})</span>
                          </div>
                          <p className="text-[11px] text-stone-400 truncate font-sans">
                            {s.order?.address?.address || 'Nhận tại Salon'}
                          </p>
                        </div>
                      </td>

                      {/* Cước GHN */}
                      <td className="py-4 px-5 text-right font-serif text-stone-200">
                        {Number(s.shippingFee || 0) === 0
                          ? '0 đ (VIP)'
                          : `${Number(s.shippingFee).toLocaleString('vi-VN')} đ`}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-4 px-5 text-center">
                        {getStatusBadge(s.status)}
                      </td>

                      {/* Thao tác (Chỉ Xem Chi Tiết & Đồng Bộ Từ GHN) */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenTimeline(s)}
                            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-stone-300 hover:text-white text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            title="Xem chi tiết & lộ trình GHN"
                          >
                            <FontAwesomeIcon icon={faEye} className="text-[#d4af37]" />
                            <span>Chi Tiết & Lộ Trình</span>
                          </button>

                          <button
                            onClick={() => handleSyncGHN(s.id)}
                            disabled={actionLoadingId === s.id}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                            title="Đồng bộ lộ trình mới nhất từ GHN API"
                          >
                            <FontAwesomeIcon
                              icon={faArrowsRotate}
                              className={actionLoadingId === s.id ? 'animate-spin' : ''}
                            />
                            <span>Đồng Bộ GHN</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL XEM HÀNH TRÌNH TIMELINE GHN */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="max-w-2xl w-full bg-[#08120d] rounded-3xl p-6 sm:p-8 border border-[#d4af37]/35 text-white shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedShipment(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="text-sm" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
              <div className="w-12 h-12 rounded-2xl bg-[#006039]/30 border border-[#006039]/50 text-emerald-400 flex items-center justify-center text-xl">
                <FontAwesomeIcon icon={faTruckFast} className="text-[#d4af37]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d4af37] font-semibold">
                  HỆ THỐNG GIÁM SÁT VẬN TRÌNH GHN
                </span>
                <h3 className="font-serif text-xl font-light text-stone-100">
                  Vận Đơn #{selectedShipment.trackingCode}
                </h3>
              </div>
            </div>

            {/* Recipient Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/40 p-4 rounded-2xl border border-white/[0.06] text-xs font-mono">
              <div>
                <span className="text-stone-400 block text-[11px]">Người nhận:</span>
                <strong className="text-stone-100 text-sm">
                  {selectedShipment.order?.address?.receiverName || selectedShipment.order?.user?.name}
                </strong>
                <span className="text-stone-400 block mt-0.5">
                  SĐT: {selectedShipment.order?.address?.phone || selectedShipment.order?.user?.phone}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[11px]">Địa chỉ giao hàng:</span>
                <p className="text-stone-300 font-sans text-xs mt-0.5 leading-relaxed">
                  {selectedShipment.order?.address?.address || 'Nhận tại Flagship Salon'}
                </p>
              </div>
            </div>

            {/* Timeline List */}
            <div className="space-y-4">
              <h4 className="font-serif text-base text-stone-200 flex items-center gap-2">
                <FontAwesomeIcon icon={faLocationDot} className="text-emerald-400 text-sm" />
                <span>Tiến Trình 5 Bước Vận Chuyển Hỏa Tốc</span>
              </h4>

              {loadingTimeline ? (
                <div className="py-10 text-center text-stone-400">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xl text-[#d4af37] mb-2 block mx-auto" />
                  <span>Đang tải lộ trình GHN...</span>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-[2px] before:bg-white/[0.08]">
                  {timeline.map((step, idx) => {
                    const isDone = step.status === 'completed';
                    const isCurrent = step.status === 'in_progress';
                    return (
                      <div key={idx} className="relative flex items-start gap-4">
                        <div
                          className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] border transition-all ${
                            isDone
                              ? 'bg-emerald-500 border-emerald-400 text-black shadow-md shadow-emerald-500/30'
                              : isCurrent
                              ? 'bg-[#d4af37] border-amber-300 text-black animate-pulse'
                              : 'bg-[#0b1b13] border-white/20 text-stone-500'
                          }`}
                        >
                          {isDone ? <FontAwesomeIcon icon={faCheck} className="text-[9px]" /> : idx + 1}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h5
                              className={`font-serif text-sm font-medium ${
                                isDone ? 'text-stone-100' : isCurrent ? 'text-[#d4af37]' : 'text-stone-400'
                              }`}
                            >
                              {step.title}
                            </h5>
                            <span className="text-[10px] font-mono text-stone-500 bg-white/[0.03] px-2 py-0.5 rounded">
                              {step.time}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 font-light leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs font-mono text-stone-400">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-400" />
                <span>Bảo hiểm rủi ro cỗ máy: 100% Giá trị hóa đơn</span>
              </div>
              <span className="text-emerald-400 font-semibold">GHN VIP AIR EXPRESS</span>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

