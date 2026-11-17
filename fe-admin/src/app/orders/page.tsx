'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import AdminShell from '@/components/layout/AdminShell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faReceipt,
  faMagnifyingGlass,
  faFilter,
  faRotateRight,
  faEye,
  faXmark,
  faClock,
  faCircleCheck,
  faCircleXmark,
  faTruckFast,
  faUser,
  faPhone,
  faLocationDot,
  faShieldHalved,
  faCertificate,
  faPrint,
  faSpinner,
  faBoxesStacked,
  faCreditCard,
  faBagShopping,
  faBuilding,
} from '@fortawesome/free-solid-svg-icons';
import apiClient from '@/lib/axios';

interface OrderItemDetail {
  id: number;
  giaSanPhamTaiLucDo: number;
  quantity: number;
  variant?: {
    id: number;
    sku: string;
    mauMatSo?: string;
    mauDayDeo?: string;
    mauNieng?: string;
    price: number;
    product?: {
      id: number;
      name: string;
      slug: string;
      imageUrl?: string;
    };
    images?: Array<{ id: number; imageUrl: string }>;
  };
  serials?: Array<{ id: number; serialNumber: string; status: string }>;
}

interface AdminOrder {
  id: number;
  orderCode: string;
  banOnlineHoacOffline: 'online' | 'offline';
  userId: number;
  userAddressId: number | null;
  tongTienBanDau: number;
  tongTienDonHang: number;
  paymentMethod: 'cod' | 'cash' | 'card' | 'bank_transfer' | 'vnpay';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'packing' | 'shipping' | 'completed' | 'cancelled' | 'returned';
  createdAt: string;
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
  shipment?: {
    id: number;
    tenHangGiao: string;
    trackingCode: string;
    shippingFee: number;
    status: string;
    note?: string;
  };
  items: OrderItemDetail[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Fetch Danh sách Đơn Hàng thực tế từ API
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { page, limit: 30 };
      if (orderStatusFilter !== 'all') params.orderStatus = orderStatusFilter;
      if (paymentStatusFilter !== 'all') params.paymentStatus = paymentStatusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await apiClient.get('/orders', { params });
      if (res.data?.success && res.data?.data) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  }, [page, orderStatusFilter, paymentStatusFilter, searchTerm]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Thống kê nhanh
  const stats = React.useMemo(() => {
    const total = orders.length;
    const paidCount = orders.filter((o) => o.paymentStatus === 'paid').length;
    const pendingCount = orders.filter((o) => o.orderStatus === 'pending').length;
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + Number(o.tongTienDonHang || 0), 0);
    return { total, paidCount, pendingCount, totalRevenue };
  }, [orders]);

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <FontAwesomeIcon icon={faCircleCheck} className="text-[10px]" />
            <span>Đã Hoàn Tất</span>
          </span>
        );
      case 'shipping':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <FontAwesomeIcon icon={faTruckFast} className="text-[10px]" />
            <span>Đang Giao GHN</span>
          </span>
        );
      case 'packing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <FontAwesomeIcon icon={faBoxesStacked} className="text-[10px]" />
            <span>Đang Đóng Hộp</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <FontAwesomeIcon icon={faClock} className="text-[10px]" />
            <span>Đã Xác Nhận</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-red-500/10 text-red-400 border border-red-500/30">
            <FontAwesomeIcon icon={faCircleXmark} className="text-[10px]" />
            <span>Đã Hủy</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-stone-500/15 text-stone-300 border border-stone-500/30">
            <FontAwesomeIcon icon={faClock} className="text-[10px]" />
            <span>Chờ Tiếp Nhận</span>
          </span>
        );
    }
  };

  const getPaymentBadge = (status: string, method: string) => {
    const isPaid = status === 'paid';
    return (
      <div className="space-y-0.5">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
            isPaid
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-950/60 text-amber-400 border-amber-500/40'
          }`}
        >
          <span>{isPaid ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}</span>
        </span>
        <span className="text-[10px] text-stone-400 block uppercase font-mono">
          {method === 'vnpay'
            ? 'Cổng VNPay'
            : method === 'bank_transfer'
            ? 'VietQR'
            : method === 'cash'
            ? 'Tiền mặt Boutique'
            : 'Thu hộ COD'}
        </span>
      </div>
    );
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#d4af37]/15">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37] font-semibold">
                SALES & ORDER MANAGEMENT
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] font-mono text-stone-300">
                Chế Độ Chỉ Xem & Kiểm Tra Hồ Sơ
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-stone-100 font-light mt-1">
              Quản Lý Đơn Hàng & Doanh Thu VIP
            </h1>
            <p className="text-xs text-stone-400 font-light mt-0.5">
              Theo dõi toàn bộ đơn hàng khách đặt, hồ sơ giao nhận, cỗ máy chế tác và tiến trình thực tế.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchOrders()}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-stone-300 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <FontAwesomeIcon icon={faRotateRight} className={`text-xs ${loading ? 'animate-spin' : ''}`} />
              <span>Làm Mới</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#08120d] border border-white/[0.08] rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">Tổng Đơn Hàng</span>
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-2xl text-stone-100 font-normal">{stats.total}</span>
              <FontAwesomeIcon icon={faReceipt} className="text-stone-500 text-sm" />
            </div>
          </div>

          <div className="bg-[#08120d] border border-emerald-500/20 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">Đã Thanh Toán</span>
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-2xl text-emerald-300 font-normal">{stats.paidCount}</span>
              <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-400 text-sm" />
            </div>
          </div>

          <div className="bg-[#08120d] border border-blue-500/20 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">Chờ Tiếp Nhận</span>
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-2xl text-blue-300 font-normal">{stats.pendingCount}</span>
              <FontAwesomeIcon icon={faClock} className="text-blue-400 text-sm" />
            </div>
          </div>

          <div className="bg-[#08120d] border border-[#d4af37]/20 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-wider block">Doanh Thu Thu Được</span>
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-xl sm:text-2xl text-[#d4af37] font-normal truncate">
                {stats.totalRevenue.toLocaleString('vi-VN')} đ
              </span>
              <FontAwesomeIcon icon={faCreditCard} className="text-[#d4af37] text-sm" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#08120d] border border-white/[0.08] rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Tất Cả' },
              { id: 'pending', label: 'Chờ Tiếp Nhận' },
              { id: 'confirmed', label: 'Đã Xác Nhận' },
              { id: 'shipping', label: 'Đang Giao GHN' },
              { id: 'completed', label: 'Hoàn Tất' },
              { id: 'cancelled', label: 'Đã Hủy' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setOrderStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  orderStatusFilter === tab.id
                    ? 'bg-[#006039] text-white font-semibold shadow-md'
                    : 'bg-white/[0.03] text-stone-400 hover:text-stone-200 border border-white/[0.06]'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="bg-black/60 border border-white/[0.08] text-xs font-mono text-stone-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#d4af37]"
            >
              <option value="all">Tất cả thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="unpaid">Chưa thanh toán</option>
            </select>
          </div>

          <div className="relative min-w-[280px]">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 text-xs" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã đơn, tên khách, SĐT..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/[0.08] text-xs font-mono text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        {/* Table List (Chỉ Hiển Thị & Xem Chi Tiết) */}
        <div className="bg-[#08120d] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-black/40 text-[11px] font-mono uppercase text-stone-400 tracking-wider">
                  <th className="py-4 px-5">Mã Đơn Hàng</th>
                  <th className="py-4 px-5">Thời Gian</th>
                  <th className="py-4 px-5">Khách Hàng</th>
                  <th className="py-4 px-5">Thanh Toán</th>
                  <th className="py-4 px-5 text-center">Trạng Thái Đơn</th>
                  <th className="py-4 px-5 text-right">Tổng Tiền</th>
                  <th className="py-4 px-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-xs font-mono">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-stone-400">
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-[#d4af37] mb-2 block mx-auto" />
                      <span>Đang nạp hồ sơ đơn hàng từ hệ thống...</span>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-stone-400">
                      <FontAwesomeIcon icon={faReceipt} className="text-3xl text-stone-600 mb-2 block mx-auto" />
                      <span>Không có đơn hàng nào khớp với điều kiện lọc.</span>
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Mã đơn */}
                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <span className="text-[#d4af37] font-bold font-mono text-sm block">
                            {o.orderCode}
                          </span>
                          <span className="text-[10px] text-stone-400 flex items-center gap-1">
                            <FontAwesomeIcon icon={o.banOnlineHoacOffline === 'online' ? faBagShopping : faBuilding} className="text-xs" />
                            <span>{o.banOnlineHoacOffline === 'online' ? 'Đặt Trực Tuyến' : 'Showroom Boutique'}</span>
                          </span>
                        </div>
                      </td>

                      {/* Thời gian */}
                      <td className="py-4 px-5 text-stone-400 text-[11px]">
                        {new Date(o.createdAt).toLocaleDateString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Khách hàng */}
                      <td className="py-4 px-5">
                        <div className="space-y-0.5">
                          <span className="text-stone-200 font-medium font-sans block">
                            {o.address?.receiverName || o.user?.name || 'Quý khách VIP'}
                          </span>
                          <span className="text-[11px] text-stone-400 block font-mono">
                            {o.address?.phone || o.user?.phone || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Thanh toán */}
                      <td className="py-4 px-5">
                        {getPaymentBadge(o.paymentStatus, o.paymentMethod)}
                      </td>

                      {/* Trạng thái đơn */}
                      <td className="py-4 px-5 text-center">
                        {getOrderStatusBadge(o.orderStatus)}
                      </td>

                      {/* Tổng tiền */}
                      <td className="py-4 px-5 text-right font-serif text-sm text-[#d4af37] font-medium">
                        {Number(o.tongTienDonHang || 0).toLocaleString('vi-VN')} đ
                      </td>

                      {/* Thao tác (Chỉ Xem Chi Tiết) */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-[#d4af37]/50 text-stone-300 hover:text-white text-xs flex items-center gap-1.5 transition-all cursor-pointer ml-auto shadow-xs"
                          title="Xem hồ sơ chi tiết đơn hàng"
                        >
                          <FontAwesomeIcon icon={faEye} className="text-[#d4af37] text-[11px]" />
                          <span>Chi Tiết</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL XEM CHI TIẾT ĐƠN HÀNG (READ-ONLY) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="max-w-3xl w-full bg-[#08120d] rounded-3xl p-6 sm:p-8 border border-[#d4af37]/35 text-white shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="text-sm" />
            </button>

            {/* Header Modal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#006039]/30 border border-[#006039]/50 text-emerald-400 flex items-center justify-center text-xl">
                  <FontAwesomeIcon icon={faReceipt} className="text-[#d4af37]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d4af37] font-semibold">
                    HỒ SƠ ĐƠN HÀNG CHI TIẾT
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-light text-stone-100">
                    Đơn Hàng #{selectedOrder.orderCode}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getOrderStatusBadge(selectedOrder.orderStatus)}
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-mono text-stone-300 flex items-center gap-1.5 transition-all"
                >
                  <FontAwesomeIcon icon={faPrint} className="text-[11px]" />
                  <span>In Phiếu</span>
                </button>
              </div>
            </div>

            {/* Grid 2 Cột: Khách hàng & Vận đơn GHN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cột 1: Thông tin người nhận */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2 text-xs font-mono">
                <span className="text-[10px] uppercase tracking-wider text-[#d4af37] font-semibold block">
                  Người Nhận & Địa Chỉ Bàn Giao
                </span>
                <div className="space-y-1">
                  <p className="text-stone-100 font-medium font-sans text-sm">
                    {selectedOrder.address?.receiverName || selectedOrder.user?.name || 'Quý khách VIP'}
                  </p>
                  <p className="text-stone-300 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faPhone} className="text-stone-500 text-[10px]" />
                    <span>{selectedOrder.address?.phone || selectedOrder.user?.phone || 'Chưa cập nhật'}</span>
                  </p>
                  <p className="text-stone-400 font-sans text-xs pt-1 leading-relaxed">
                    {selectedOrder.address?.address || 'Nhận trực tiếp tại Flagship Salon'}
                  </p>
                </div>
              </div>

              {/* Cột 2: Thông tin vận đơn GHN & Thanh toán */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2 text-xs font-mono">
                <span className="text-[10px] uppercase tracking-wider text-[#d4af37] font-semibold block">
                  Vận Đơn GHN & Thanh Toán
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Vận đơn GHN:</span>
                    <strong className="text-emerald-400">
                      {selectedOrder.shipment?.trackingCode || 'Chờ tạo vận đơn'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Phương thức:</span>
                    <span className="text-stone-200 uppercase font-semibold">
                      {selectedOrder.paymentMethod}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Trạng thái TT:</span>
                    <span className={selectedOrder.paymentStatus === 'paid' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {selectedOrder.paymentStatus === 'paid' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Danh Sách Cỗ Máy Trong Đơn Hàng */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d4af37] font-semibold block">
                Danh Sách Cỗ Máy Thời Gian ({selectedOrder.items?.length || 0})
              </span>

              <div className="divide-y divide-white/[0.06] bg-black/30 rounded-2xl border border-white/[0.06] p-4">
                {selectedOrder.items?.map((item, idx) => {
                  const v = item.variant;
                  const prod = v?.product;
                  const itemPrice = Number(item.giaSanPhamTaiLucDo || v?.price || 0);
                  const serial = item.serials?.[0]?.serialNumber || `SN-${selectedOrder.id}-${idx + 1}-GENEVE`;

                  return (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="font-serif text-sm font-normal text-stone-100">
                          {prod?.name || 'Đồng Hồ Cơ Khí Chế Tác'}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-400">
                          {v?.mauMatSo && <span>Mặt: <strong className="text-stone-200">{v.mauMatSo}</strong></span>}
                          {v?.mauDayDeo && <span>• Dây: <strong className="text-stone-200">{v.mauDayDeo}</strong></span>}
                          {v?.mauNieng && <span>• Niềng: <strong className="text-stone-200">{v.mauNieng}</strong></span>}
                          <span>• SL: <strong className="text-white">{item.quantity}</strong></span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#d4af37]/10 text-[10px] font-mono text-[#d4af37]">
                          <FontAwesomeIcon icon={faCertificate} className="text-[9px]" />
                          <span>Serial: {serial}</span>
                        </div>
                      </div>

                      <div className="text-right font-serif text-stone-200 text-sm">
                        {Number(itemPrice * item.quantity).toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chi Phí Tổng Kết */}
            <div className="p-4 rounded-2xl bg-[#0b1710] border border-[#d4af37]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
              <div className="space-y-1 text-stone-400 text-center sm:text-left">
                <div>Giá trị sản phẩm: {Number(selectedOrder.tongTienBanDau || 0).toLocaleString('vi-VN')} đ</div>
                <div>Phí vận chuyển GHN: {Number(selectedOrder.shipment?.shippingFee || 0).toLocaleString('vi-VN')} đ</div>
              </div>
              <div className="text-center sm:text-right">
                <span className="text-[10px] uppercase text-stone-400 block">Tổng Thanh Toán:</span>
                <span className="font-serif text-xl sm:text-2xl text-[#d4af37] font-normal">
                  {Number(selectedOrder.tongTienDonHang || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
