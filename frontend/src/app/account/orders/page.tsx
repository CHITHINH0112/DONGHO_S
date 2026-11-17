"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import AccountNav from "@/components/AccountNav";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { apiClient } from "@/lib/axios";
import { watchAudio } from "@/utils/audio";
import { normalizeImageUrl } from "@/utils/productMapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxArchive,
  faTruck,
  faShieldHalved,
  faCertificate,
  faRotateRight,
  faLocationDot,
  faCircleCheck,
  faCircleXmark,
  faClock,
  faArrowRight,
  faWrench,
  faXmark,
  faEye,
  faCreditCard,
  faQrcode,
  faSpinner,
  faPrint,
  faHouse,
  faCheck,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

export interface BackendOrder {
  id: number;
  orderCode: string;
  banOnlineHoacOffline: "online" | "offline";
  userId: number;
  userAddressId: number | null;
  tongTienBanDau: number;
  tongTienDonHang: number;
  paymentMethod: "cod" | "cash" | "card" | "bank_transfer" | "vnpay";
  paymentStatus: "unpaid" | "paid" | "refunded";
  orderStatus: "pending" | "confirmed" | "packing" | "shipping" | "completed" | "cancelled" | "returned";
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
  items: Array<{
    id: number;
    giaSanPhamTaiLucDo: number;
    quantity: number;
    variant?: {
      id: number;
      sku: string;
      mauMatSo: string;
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
  }>;
}

export default function AccountOrdersPage() {
  const { user } = useAuth();
  const { formatPrice, showToast } = useCart();

  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<BackendOrder | null>(null);
  const [trackingTimeline, setTrackingTimeline] = useState<any[]>([]);
  const [loadingTracking, setLoadingTracking] = useState<boolean>(false);

  // Filter tabs & Search
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Cancel order modal state
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("Đổi ý, muốn chọn cỗ máy khác");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);

  // Return modal state
  const [selectedReturnItem, setSelectedReturnItem] = useState<{
    orderId: number;
    serial: string;
  } | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnSubmitted, setReturnSubmitted] = useState(false);

  // Tải danh sách đơn hàng thực tế từ MySQL CSDL
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/orders?limit=50");
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.warn("Chưa thể tải đơn hàng từ máy chủ:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  // Khi mở xem chi tiết đơn hàng, tự động tải hành trình GHN
  const handleOpenOrderDetail = async (order: BackendOrder) => {
    watchAudio.click();
    setSelectedOrder(order);

    const trackingCode = order.shipment?.trackingCode || `GHN-LUX-${order.id}-8899`;
    try {
      setLoadingTracking(true);
      const res = await apiClient.get(`/shipments/tracking/${trackingCode}?orderStatus=${order.orderStatus}`);
      if (res.data?.success && res.data?.data?.timeline) {
        setTrackingTimeline(res.data.data.timeline);
      }
    } catch {
      setTrackingTimeline([]);
    } finally {
      setLoadingTracking(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <AccountNav />
      </div>
    );
  }

  const getOrderStatusBadge = (status: BackendOrder["orderStatus"]) => {
    switch (status) {
      case "completed":
        return {
          label: "Bàn Giao Hoàn Tất",
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
          icon: faCircleCheck,
        };
      case "shipping":
        return {
          label: "Đang Vận Chuyển GHN",
          color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
          icon: faTruck,
        };
      case "packing":
        return {
          label: "Đang Đóng Gói Niêm Phong",
          color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
          icon: faBoxArchive,
        };
      case "confirmed":
        return {
          label: "Đã Thẩm Định Cỗ Máy",
          color: "text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/30",
          icon: faCertificate,
        };
      case "cancelled":
        return {
          label: "Đã Hủy Đơn",
          color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
          icon: faCircleXmark,
        };
      case "pending":
      default:
        return {
          label: "Chờ Tiếp Nhận & Xác Thực",
          color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
          icon: faClock,
        };
    }
  };

  const getPaymentBadge = (method: string, status: string) => {
    let methodText = "Thanh toán khi nhận hàng (COD)";
    if (method === "vnpay") methodText = "Cổng VNPay";
    if (method === "bank_transfer") methodText = "Chuyển khoản VietQR";

    return (
      <div className="flex items-center gap-1.5 text-[11px] font-mono">
        <span className="text-stone-400">{methodText}</span>
        <span>•</span>
        <span
          className={`px-2 py-0.5 rounded font-semibold ${
            status === "paid"
              ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
              : "text-amber-400 bg-amber-500/10 border border-amber-500/30"
          }`}
        >
          {status === "paid" ? "Đã Thanh Toán" : "Chưa Thanh Toán"}
        </span>
      </div>
    );
  };

  // Lọc theo tabs & Từ khóa tìm kiếm
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "all") {
      if (statusFilter === "pending" && o.orderStatus !== "pending") return false;
      if (statusFilter === "shipping" && o.orderStatus !== "shipping" && o.orderStatus !== "packing") return false;
      if (statusFilter === "completed" && o.orderStatus !== "completed") return false;
      if (statusFilter === "cancelled" && o.orderStatus !== "cancelled") return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const codeMatch = o.orderCode?.toLowerCase().includes(q);
      const trackingMatch = o.shipment?.trackingCode?.toLowerCase().includes(q);
      const itemMatch = o.items?.some((i) => i.variant?.product?.name?.toLowerCase().includes(q));
      if (!codeMatch && !trackingMatch && !itemMatch) return false;
    }
    return true;
  });

  const handleConfirmCancelOrder = async () => {
    if (!cancellingOrderId) return;
    try {
      setIsSubmittingCancel(true);
      watchAudio.chime();
      const res = await apiClient.post(`/orders/${cancellingOrderId}/cancel`, {
        reason: cancelReason || "Khách hàng yêu cầu hủy đơn hàng",
      });
      if (res.data?.success) {
        showToast("Đã hủy đơn hàng thành công.");
        setCancellingOrderId(null);
        setCancelReason("Đổi ý, muốn chọn cỗ máy khác");
        fetchOrders();
      } else {
        showToast(res.data?.message || "Không thể hủy đơn hàng lúc này.");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Không thể hủy đơn hàng.");
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleOpenReturnModal = (orderId: number, serial: string) => {
    watchAudio.click();
    setSelectedReturnItem({ orderId, serial });
    setReturnReason("");
    setReturnSubmitted(false);
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    watchAudio.chime();
    setReturnSubmitted(true);
    setTimeout(() => {
      setSelectedReturnItem(null);
      showToast("Yêu cầu hỗ trợ kỹ thuật theo Serial đã được tiếp nhận.");
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#050b07] text-white pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto selection:bg-[#006039] selection:text-white">
      <AccountNav />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#d4af37]/15">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37] font-semibold block mb-1">
              SỔ QUẢN LÝ ĐƠN HÀNG VIP
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-light text-stone-100">
              Lịch Sử Giao Dịch & Vận Đơn GHN Express
            </h3>
            <p className="text-xs text-stone-400 font-light mt-0.5">
              Toàn bộ kiệt tác bàn giao đều được niêm phong và bảo hiểm 100% giá trị cỗ máy.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                watchAudio.tick();
                fetchOrders();
              }}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-stone-300 flex items-center gap-2 cursor-pointer transition-colors"
              title="Đồng bộ lại"
            >
              <FontAwesomeIcon icon={faRotateRight} className="text-[10px]" />
              <span>Đồng Bộ</span>
            </button>
            <span className="text-xs font-mono text-[#d4af37] bg-[#d4af37]/10 px-3.5 py-1.5 rounded-full border border-[#d4af37]/25 font-semibold">
              {orders.length} Đơn Hàng
            </span>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
            {[
              { id: "all", label: "Tất Cả" },
              { id: "pending", label: "Chờ Tiếp Nhận" },
              { id: "shipping", label: "Đang Vận Chuyển GHN" },
              { id: "completed", label: "Đã Bàn Giao" },
              { id: "cancelled", label: "Đã Hủy" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  watchAudio.tick();
                  setStatusFilter(tab.id);
                }}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                  statusFilter === tab.id
                    ? "bg-[#d4af37] text-black font-bold shadow-md"
                    : "bg-white/[0.03] text-stone-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 text-xs"
            />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, mã GHN, tên cỗ máy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#d4af37] text-xs font-mono text-stone-200 placeholder:text-stone-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
            <FontAwesomeIcon icon={faSpinner} className="fa-spin text-3xl text-[#d4af37]" />
            <span className="text-xs font-mono text-stone-400">
              Đang đồng bộ đơn hàng từ máy chủ bảo mật...
            </span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-24 text-center rounded-3xl bg-[#08120d]/80 border border-[#d4af37]/20 p-8 flex flex-col items-center shadow-xl backdrop-blur-xl">
            <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] mb-4">
              <FontAwesomeIcon icon={faBoxArchive} className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg font-normal text-stone-100">
              Chưa có đơn hàng nào phù hợp
            </h4>
            <p className="text-xs text-stone-400 max-w-sm mt-1.5 font-light">
              Quý khách chưa có đơn hàng nào trong mục này. Hãy chiêm ngưỡng các cỗ máy độc bản trong bộ sưu tập.
            </p>
            <Link
              href="/products"
              className="mt-6 px-7 py-3 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8952b] hover:from-[#e5c66b] hover:to-[#997926] text-black font-semibold text-xs font-mono uppercase tracking-wider transition-all shadow-lg shadow-[#d4af37]/20"
            >
              Khám Phá Kiệt Tác
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusInfo = getOrderStatusBadge(order.orderStatus);
              const trackingCode = order.shipment?.trackingCode || `GHN-LUX-${order.id}-8899`;
              const carrier = order.shipment?.tenHangGiao || "Giao Hàng Nhanh (GHN Express)";

              return (
                <div
                  key={order.id}
                  className="rounded-3xl bg-[#08120d]/90 border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-all duration-300 shadow-xl overflow-hidden backdrop-blur-xl group"
                >
                  {/* Order Top Bar */}
                  <div className="p-5 sm:p-6 bg-black/40 border-b border-[#d4af37]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm font-bold text-[#d4af37] tracking-wider">
                          #{order.orderCode || `ORD-${order.id}`}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-3 py-1 rounded-full border uppercase tracking-wider font-semibold flex items-center gap-1.5 ${statusInfo.color}`}
                        >
                          <FontAwesomeIcon icon={statusInfo.icon} className="w-2.5 h-2.5" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </div>
                      <div className="text-xs font-mono text-stone-400 mt-1 flex items-center gap-2">
                        <span>Ngày đặt: {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }) : "Vừa xong"}</span>
                        <span>•</span>
                        {getPaymentBadge(order.paymentMethod, order.paymentStatus)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:text-right">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block">
                          Tổng Giá Trị Đơn Hàng
                        </span>
                        <span className="font-serif text-lg sm:text-xl font-normal text-[#d4af37]">
                          {formatPrice(Math.round(Number(order.tongTienDonHang) / 25000), Number(order.tongTienDonHang))}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {order.orderStatus === "pending" && (
                          <button
                            onClick={() => {
                              watchAudio.click();
                              setCancellingOrderId(order.id);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-mono text-rose-300 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                            title="Hủy đơn hàng này"
                          >
                            <FontAwesomeIcon icon={faCircleXmark} className="text-xs" />
                            <span>Hủy Đơn</span>
                          </button>
                        )}

                        {order.paymentStatus === "unpaid" && (
                          <Link
                            href={`/account/orders/${order.id}`}
                            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-xs font-mono text-amber-300 font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <FontAwesomeIcon icon={faCreditCard} className="text-xs" />
                            <span>Thanh Toán Lại</span>
                          </Link>
                        )}

                        <Link
                          href={`/account/orders/${order.id}`}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37]/20 to-[#d4af37]/10 hover:from-[#d4af37]/35 hover:to-[#d4af37]/20 border border-[#d4af37]/40 hover:border-[#d4af37]/70 text-xs font-mono text-[#d4af37] font-semibold flex items-center gap-2 transition-all shadow-sm"
                        >
                          <FontAwesomeIcon icon={faEye} className="text-xs" />
                          <span>Chi Tiết Đơn Hàng</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Shipment Tracking Code Bar */}
                  <div className="px-6 py-3.5 bg-gradient-to-r from-[#006039]/15 via-[#006039]/5 to-transparent border-b border-[#d4af37]/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex flex-wrap items-center gap-2 text-stone-200">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faTruck} className="w-3 h-3 text-[#d4af37]" />
                      </div>
                      <span>Hãng giao: <strong className="text-stone-300">{carrier}</strong></span>
                      <span>•</span>
                      <span>Mã vận đơn: </span>
                      <strong className="text-[#d4af37] tracking-wider font-semibold">
                        {trackingCode}
                      </strong>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href="https://5sao.ghn.dev/ops-live"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono flex items-center gap-1.5 transition-all shadow-sm"
                        title="Tra cứu vận đơn thực tế trên hệ thống GHN"
                      >
                        <FontAwesomeIcon icon={faTruck} className="text-[10px]" />
                        <span>Tra Cứu Bưu Cục GHN</span>
                      </a>
                      <div className="text-[11px] text-emerald-400 hidden sm:flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
                        <span>Bảo hiểm 100%</span>
                      </div>
                    </div>
                  </div>

                  {/* Items List Preview */}
                  <div className="p-6 divide-y divide-white/[0.05]">
                    {order.items?.map((item, idx) => {
                      const v = item.variant;
                      const prod = v?.product;
                      const rawImg = v?.images?.[0]?.imageUrl || prod?.imageUrl || "/images/submariner-emerald.jpg";
                      const itemImg = normalizeImageUrl(rawImg);
                      const itemPrice = Number(item.giaSanPhamTaiLucDo || v?.price || 0);
                      const serial = item.serials?.[0]?.serialNumber || `SN-${order.id}-${idx + 1}-GENEVE`;

                      return (
                        <div
                          key={idx}
                          className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-2xl bg-black/50 border border-[#d4af37]/20 overflow-hidden shrink-0 shadow-inner">
                              <Image
                                src={itemImg}
                                alt={prod?.name || "Watch"}
                                fill
                                unoptimized
                                className="object-contain p-1.5"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-wider font-semibold">
                                THỤY SĨ CHÍNH HÃNG
                              </span>
                              <h5 className="font-serif text-sm font-normal text-stone-100">
                                {prod?.name || "Đồng Hồ Cơ Khí Chế Tác"}
                              </h5>
                              <div className="flex items-center gap-2 text-xs font-mono text-stone-400 mt-0.5">
                                <span className="text-[#d4af37]">{v?.mauMatSo || "Mặt số cổ điển"}</span>
                                <span>•</span>
                                <span>Số lượng: {item.quantity}</span>
                                <span>•</span>
                                <span className="text-stone-200 font-semibold">
                                  {formatPrice(Math.round(itemPrice / 25000), itemPrice)}
                                </span>
                              </div>

                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/25 text-[10px] font-mono text-[#d4af37] mt-1.5">
                                <FontAwesomeIcon icon={faCertificate} className="w-2.5 h-2.5" />
                                <span>Serial Máy: <strong>{serial}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:self-center shrink-0">
                            <Link
                              href={`/warranty?serial=${encodeURIComponent(serial)}`}
                              className="px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono transition-all flex items-center gap-1.5 text-stone-300 hover:text-white"
                            >
                              <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3 text-[#d4af37]" />
                              <span>Tra Cứu Bảo Hành</span>
                            </Link>

                            <button
                              onClick={() => handleOpenReturnModal(order.id, serial)}
                              className="px-3.5 py-2 rounded-xl border border-white/[0.08] hover:border-amber-500/50 text-xs font-mono transition-all text-stone-400 hover:text-amber-400 hover:bg-amber-500/10 flex items-center gap-1.5 cursor-pointer"
                            >
                              <FontAwesomeIcon icon={faWrench} className="w-3 h-3 text-amber-400" />
                              <span>Bảo Dưỡng / Đổi Trả</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Shipping Address Footer */}
                  {order.address && (
                    <div className="p-4 sm:px-6 bg-black/30 border-t border-[#d4af37]/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-stone-400 gap-2">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3 text-[#d4af37]" />
                        <span>Địa chỉ bàn giao: </span>
                        <strong className="text-stone-200">
                          {order.address.address} ({order.address.receiverName} - {order.address.phone})
                        </strong>
                      </div>
                      <div className="text-[11px] text-[#d4af37]">
                        Bàn giao tận tay • Kiểm tra niêm phong
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL CHI TIẾT ĐƠN HÀNG & TIMELINE GHN */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="max-w-2xl w-full bg-[#08120d] rounded-3xl p-6 sm:p-8 border border-[#d4af37]/35 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
              <div className="w-11 h-11 rounded-2xl bg-[#006039]/30 text-emerald-400 border border-[#006039]/50 flex items-center justify-center text-lg">
                <FontAwesomeIcon icon={faBoxArchive} className="text-[#d4af37]" />
              </div>
              <div>
                <h4 className="font-serif text-xl font-normal text-stone-100">
                  Chi Tiết Đơn Hàng #{selectedOrder.orderCode || selectedOrder.id}
                </h4>
                <p className="text-xs font-mono text-[#d4af37]">
                  Vận đơn GHN: {selectedOrder.shipment?.trackingCode || `GHN-LUX-${selectedOrder.id}-8899`}
                </p>
              </div>
            </div>

            {/* TIMELINE HÀNH TRÌNH GIAO HÀNG NHANH (GHN) THỜI GIAN THỰC */}
            <div className="p-5 rounded-2xl bg-black/40 border border-[#d4af37]/20 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#d4af37] font-semibold">
                  <FontAwesomeIcon icon={faTruck} className="text-emerald-400" />
                  <span>Timeline Hành Trình Giao Hàng Nhanh (GHN Express)</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Theo Dõi Trực Tiếp
                </span>
              </div>

              {loadingTracking ? (
                <div className="py-6 text-center text-xs font-mono text-stone-400 flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faSpinner} className="fa-spin text-[#d4af37]" />
                  <span>Đang truy xuất dữ liệu vận đơn từ máy chủ GHN...</span>
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/[0.1]">
                  {trackingTimeline.map((step, sIdx) => {
                    const isCompleted = step.status === "completed";
                    const isCurrent = step.status === "in_progress";

                    return (
                      <div key={sIdx} className="relative group">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-6 top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] border transition-all ${
                            isCompleted
                              ? "bg-emerald-500 border-emerald-400 text-black shadow-md shadow-emerald-500/30"
                              : isCurrent
                              ? "bg-[#d4af37] border-[#f5d77f] text-black animate-pulse"
                              : "bg-black border-white/20 text-stone-500"
                          }`}
                        >
                          {isCompleted ? <FontAwesomeIcon icon={faCheck} /> : sIdx + 1}
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <h5
                              className={`text-xs font-mono font-semibold ${
                                isCompleted
                                  ? "text-emerald-400"
                                  : isCurrent
                                  ? "text-[#d4af37]"
                                  : "text-stone-400"
                              }`}
                            >
                              {step.title}
                            </h5>
                            <span className="text-[10px] font-mono text-stone-500">
                              {step.time}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 font-light mt-0.5 leading-relaxed font-sans">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Thông tin cỗ máy trong đơn */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-stone-300 font-semibold block">
                Danh Sách Cỗ Máy Trong Đơn
              </span>

              <div className="divide-y divide-white/[0.06] rounded-2xl bg-black/40 border border-white/[0.08] p-4">
                {selectedOrder.items?.map((it, iIdx) => {
                  const v = it.variant;
                  const prod = v?.product;
                  const rawImg = v?.images?.[0]?.imageUrl || prod?.imageUrl || "/images/submariner-emerald.jpg";
                  const itemImg = normalizeImageUrl(rawImg);
                  const itemPrice = Number(it.giaSanPhamTaiLucDo || v?.price || 0);

                  return (
                    <div key={iIdx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl bg-black/60 border border-white/[0.08] overflow-hidden shrink-0">
                          <Image src={itemImg} alt={prod?.name || "Watch"} fill unoptimized className="object-contain p-1" />
                        </div>
                        <div>
                          <h6 className="font-serif text-xs font-normal text-stone-100">
                            {prod?.name || "Đồng Hồ Cơ Khí Chế Tác"}
                          </h6>
                          <div className="text-[10px] font-mono text-stone-400">
                            {v?.mauMatSo} • SKU: {v?.sku} • SL: {it.quantity}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-semibold text-[#d4af37]">
                        {formatPrice(Math.round(itemPrice / 25000), itemPrice * it.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tóm tắt thanh toán & địa chỉ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-1.5">
                <span className="text-stone-500 uppercase text-[10px] block">Địa Chỉ Tiếp Nhận</span>
                <strong className="text-stone-200 block">{selectedOrder.address?.receiverName} - {selectedOrder.address?.phone}</strong>
                <p className="text-stone-400 text-[11px] leading-relaxed font-sans">{selectedOrder.address?.address}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-1.5">
                <span className="text-stone-500 uppercase text-[10px] block">Thanh Toán</span>
                <div className="flex justify-between">
                  <span className="text-stone-400">Hình thức:</span>
                  <span className="text-stone-200">{selectedOrder.paymentMethod.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Tổng thanh toán:</span>
                  <span className="text-[#d4af37] font-bold text-sm">
                    {formatPrice(Math.round(Number(selectedOrder.tongTienDonHang) / 25000), Number(selectedOrder.tongTienDonHang))}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl border border-white/[0.1] text-xs font-mono hover:bg-white/[0.05] cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return & Service Request Modal */}
      {selectedReturnItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-lg w-full bg-[#08120d] rounded-3xl p-7 border border-[#d4af37]/30 text-white shadow-2xl relative">
            <button
              onClick={() => setSelectedReturnItem(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#006039]/30 text-emerald-400 border border-[#006039]/50 flex items-center justify-center">
                <FontAwesomeIcon icon={faWrench} className="w-4 h-4 text-[#d4af37]" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-normal text-white">
                  Yêu Cầu Hỗ Trợ Kỹ Thuật / Đổi Trả
                </h4>
                <p className="text-[11px] font-mono text-[#d4af37]">
                  Đơn hàng #{selectedReturnItem.orderId}
                </p>
              </div>
            </div>

            {returnSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                  <FontAwesomeIcon icon={faCircleCheck} />
                </div>
                <h5 className="font-serif text-lg text-white">
                  Đã Tiếp Nhận Yêu Cầu Hỗ Trợ
                </h5>
                <p className="text-xs text-white/60 font-light max-w-xs mx-auto font-sans leading-relaxed">
                  Trưởng bộ phận Kỹ thuật Thụy Sĩ sẽ liên hệ trực tiếp với Quý khách trong vòng 30 phút.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReturn} className="space-y-4">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono space-y-1">
                  <div className="text-white/50">Số Serial cỗ máy được yêu cầu:</div>
                  <div className="text-[#d4af37] font-bold text-sm tracking-wider">
                    {selectedReturnItem.serial}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-white/70">
                    Nhu Cầu Của Quý Khách
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#09130e] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="warranty">Bảo dưỡng máy định kỳ (Lau dầu, cân chỉnh Chronometer)</option>
                    <option value="sizing">Cắt/Nối mắt dây đeo kim loại hoặc thay dây da</option>
                    <option value="exchange">Yêu cầu đổi sang phiên bản mặt số khác</option>
                    <option value="inspection">Kiểm định lại sai số chuẩn COSC</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-white/70">
                    Mô Tả Chi Tiết Hoặc Yêu Cầu Riêng
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Quý khách vui lòng chia sẻ tình trạng của cỗ máy hoặc thời gian thuận tiện nhất để chuyên viên bảo an đến tận tư gia tiếp nhận..."
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedReturnItem(null)}
                    className="px-4 py-2.5 rounded-xl border border-white/[0.1] text-xs font-mono cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-black text-xs font-semibold font-mono uppercase tracking-wider cursor-pointer shadow-lg"
                  >
                    Gửi Yêu Cầu Bảo Mật
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Hủy Đơn Hàng */}
      {cancellingOrderId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0c1811] border border-rose-500/30 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center text-lg">
                <FontAwesomeIcon icon={faCircleXmark} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-normal text-stone-100">
                  Xác Nhận Hủy Đơn Hàng
                </h3>
                <p className="text-xs text-stone-400 font-mono">
                  Mã đơn hàng #{orders.find((o) => o.id === cancellingOrderId)?.orderCode || cancellingOrderId}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-300 font-light leading-relaxed">
              Quý khách có chắc chắn muốn hủy đơn hàng này không? Cỗ máy thời gian sẽ được trả lại kho niêm phong Thụy Sĩ.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-400 block">
                Lý Do Hủy Đơn Hàng
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/[0.1] text-xs text-stone-200 focus:outline-none focus:border-[#d4af37] font-mono cursor-pointer"
              >
                <option value="Đổi ý, muốn chọn cỗ máy khác">Đổi ý, muốn chọn cỗ máy khác</option>
                <option value="Thay đổi địa chỉ / người nhận">Thay đổi địa chỉ / người nhận</option>
                <option value="Đổi phương thức thanh toán">Đổi phương thức thanh toán</option>
                <option value="Chưa sắp xếp được lịch nhận hàng">Chưa sắp xếp được lịch nhận hàng</option>
                <option value="Lý do khác">Lý do khác</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={() => setCancellingOrderId(null)}
                className="py-2.5 rounded-xl border border-white/[0.1] hover:border-white/[0.2] text-xs font-mono text-stone-300 transition-colors cursor-pointer"
              >
                Giữ Lại Đơn
              </button>

              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={handleConfirmCancelOrder}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-900/30 disabled:opacity-50"
              >
                {isSubmittingCancel ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                    <span>Đang Hủy...</span>
                  </>
                ) : (
                  <span>Xác Nhận Hủy</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
