"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  faLocationDot,
  faCircleCheck,
  faCircleXmark,
  faClock,
  faArrowLeft,
  faWrench,
  faQrcode,
  faSpinner,
  faPrint,
  faCopy,
  faCreditCard,
  faArrowRight,
  faPhone,
  faEnvelope,
  faUser,
  faReceipt,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

export interface OrderItemType {
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
      loaiBoMay?: string;
      chatLieuKinh?: string;
      chatLieuNieng?: string;
      chatLieuDayDeo?: string;
      duongKinhMatSo?: string;
      khaNangChongNuoc?: string;
    };
    images?: Array<{ id: number; imageUrl: string }>;
  };
  serials?: Array<{ id: number; serialNumber: string; status: string; location?: string }>;
}

export interface OrderDetailType {
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
  items: OrderItemType[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const { user } = useAuth();
  const { formatPrice, showToast } = useCart();

  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [trackingTimeline, setTrackingTimeline] = useState<any[]>([]);
  const [isRepaying, setIsRepaying] = useState<boolean>(false);
  const [repayMethod, setRepayMethod] = useState<"vnpay" | "bank_transfer" | "cod">("vnpay");
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Fetch Chi tiết Đơn hàng
  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/orders/${orderId}`);
      if (res.data?.success && res.data?.data) {
        const orderData: OrderDetailType = res.data.data;
        setOrder(orderData);
        setRepayMethod(
          orderData.paymentMethod === "bank_transfer"
            ? "bank_transfer"
            : orderData.paymentMethod === "cod"
            ? "cod"
            : "vnpay"
        );

        // Fetch Timeline hành trình GHN
        const trackingCode = orderData.shipment?.trackingCode || `GHN-LUX-${orderData.id}-8899`;
        try {
          const trackRes = await apiClient.get(`/shipments/tracking/${trackingCode}?orderStatus=${orderData.orderStatus}`);
          if (trackRes.data?.success && trackRes.data?.data?.timeline) {
            setTrackingTimeline(trackRes.data.data.timeline);
          }
        } catch {
          // timeline fallback
        }
      } else {
        showToast("Không tìm thấy thông tin đơn hàng này.");
      }
    } catch (err: any) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", err);
      showToast(err.response?.data?.message || "Không thể tải chi tiết đơn hàng lúc này.");
    } finally {
      setLoading(false);
    }
  }, [orderId, showToast]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // Xử lý Thanh Toán Lại
  const handleRepay = async () => {
    if (!order) return;
    try {
      setIsRepaying(true);
      watchAudio.click();

      const res = await apiClient.post(`/orders/${order.id}/repay`, {
        paymentMethod: repayMethod,
      });

      if (res.data?.success) {
        const paymentUrl = res.data?.meta?.paymentUrl;
        if (repayMethod === "vnpay" && paymentUrl) {
          showToast("Đang chuyển hướng tới Cổng Thanh Toán VNPay Sandbox...");
          watchAudio.chime();
          window.location.href = paymentUrl;
          return;
        }

        if (repayMethod === "bank_transfer") {
          setShowQrModal(true);
          showToast("Vui lòng quét mã QR VietQR để hoàn tất giao dịch.");
          return;
        }

        if (repayMethod === "cod") {
          showToast("Đã chuyển phương thức thanh toán sang Bàn Giao & Thanh Toán Tận Tay (COD).");
          fetchOrderDetail();
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể khởi tạo lại thanh toán lúc này.";
      showToast(msg);
    } finally {
      setIsRepaying(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    watchAudio.tick();
    showToast(`Đã sao chép ${label}: ${text}`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      setIsCancelling(true);
      watchAudio.chime();
      const res = await apiClient.post(`/orders/${order.id}/cancel`, {
        reason: cancelReason || "Khách hàng yêu cầu hủy đơn hàng",
      });
      if (res.data?.success) {
        showToast("Đã hủy đơn hàng thành công.");
        setShowCancelModal(false);
        setCancelReason("");
        fetchOrderDetail();
      } else {
        showToast(res.data?.message || "Không thể hủy đơn hàng lúc này.");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Không thể hủy đơn hàng.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b07] text-white pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center space-y-4">
        <FontAwesomeIcon icon={faSpinner} className="text-3xl text-[#d4af37] animate-spin" />
        <span className="text-xs font-mono text-stone-400">Đang truy xuất hồ sơ đơn hàng từ hệ thống...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#050b07] text-white pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-6">
        <AccountNav />
        <div className="text-center py-20 bg-[#08120d] border border-white/[0.08] rounded-3xl p-8">
          <FontAwesomeIcon icon={faBoxArchive} className="text-4xl text-stone-600 mb-4" />
          <h3 className="font-serif text-xl text-stone-200">Không tìm thấy đơn hàng</h3>
          <p className="text-xs text-stone-400 font-mono mt-1 mb-6">Mã đơn hàng không tồn tại hoặc Quý khách không có quyền truy cập.</p>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#006039] hover:bg-[#007a48] text-white text-xs font-mono transition-all"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Quay lại sổ đơn hàng</span>
          </Link>
        </div>
      </div>
    );
  }

  const isUnpaid = order.paymentStatus === "unpaid";
  const trackingCode = order.shipment?.trackingCode || `GHN-LUX-${order.id}-8899`;
  const shippingFee = Number(order.shipment?.shippingFee || (order.tongTienDonHang - order.tongTienBanDau) || 0);

  return (
    <div className="min-h-screen bg-[#050b07] text-white pt-28 pb-24 px-4 sm:px-8 max-w-7xl mx-auto selection:bg-[#006039] selection:text-white">
      <AccountNav />

      {/* Top Back Action & Title */}
      <div className="space-y-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#d4af37]/20">
          <div className="flex items-center gap-3">
            <Link
              href="/account/orders"
              className="w-10 h-10 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-stone-300 hover:text-white transition-all"
              title="Quay lại danh sách"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-sm" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37] font-semibold">
                  HỒ SƠ ĐƠN HÀNG VIP #{order.orderCode}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-stone-400 font-mono">
                  {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-light text-stone-100 mt-0.5">
                Chi Tiết Bàn Giao & Vận Đơn GHN
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Payment Status Badge */}
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 border ${
                order.paymentStatus === "paid"
                  ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-950/60 text-amber-400 border-amber-500/40"
              }`}
            >
              <FontAwesomeIcon icon={order.paymentStatus === "paid" ? faCircleCheck : faClock} className="text-[11px]" />
              <span>{order.paymentStatus === "paid" ? "Đã Thanh Toán Thành Công" : "Chưa Hoàn Tất Thanh Toán"}</span>
            </span>

            {/* Order Status Badge */}
            <span className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-[#006039]/20 text-[#d4af37] border border-[#d4af37]/30">
              {order.orderStatus === "completed"
                ? "Bàn Giao Hoàn Tất"
                : order.orderStatus === "shipping"
                ? "Đang Vận Chuyển GHN"
                : order.orderStatus === "packing"
                ? "Đang Đóng Hộp Chuyên Dụng"
                : order.orderStatus === "confirmed"
                ? "Đã Xác Nhận Đơn"
                : order.orderStatus === "cancelled"
                ? "Đã Hủy Đơn"
                : "Chờ Tiếp Nhận"}
            </span>

            {order.orderStatus === "pending" && (
              <button
                onClick={() => {
                  watchAudio.click();
                  setShowCancelModal(true);
                }}
                className="px-3.5 py-1.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-xs font-mono text-rose-300 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faCircleXmark} className="text-[11px]" />
                <span>Hủy Đơn Hàng</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-stone-300 flex items-center gap-1.5 transition-all"
            >
              <FontAwesomeIcon icon={faPrint} className="text-[11px]" />
              <span>In Phiếu</span>
            </button>
          </div>
        </div>

        {/* CẢNH BÁO & KHU VỰC THANH TOÁN LẠI (NẾU CHƯA THANH TOÁN) */}
        {isUnpaid && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-[#0a180f] to-amber-950/30 border border-amber-500/40 relative overflow-hidden shadow-xl animate-pulse-glow">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400">
                  <FontAwesomeIcon icon={faClock} className="text-lg" />
                  <span className="font-mono text-xs uppercase tracking-wider font-semibold">
                    CẦN HOÀN TẤT THANH TOÁN
                  </span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl text-stone-100 font-light">
                  Đơn hàng của Quý khách đang chờ thanh toán để xác nhận lịch xuất kho GHN Express
                </h3>
                <p className="text-xs text-stone-400 font-light max-w-2xl">
                  Để đảm bảo cỗ máy thời gian được niêm phong đúng cam kết và vận chuyển hỏa tốc, Quý khách vui lòng chọn phương thức thanh toán và bấm &ldquo;Thanh Toán Lại Ngay&rdquo;.
                </p>
              </div>

              {/* Action Form */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <select
                  value={repayMethod}
                  onChange={(e) => setRepayMethod(e.target.value as any)}
                  className="bg-black/70 border border-[#d4af37]/30 text-stone-200 text-xs font-mono rounded-2xl px-4 py-3 focus:outline-none focus:border-[#d4af37] transition-all cursor-pointer"
                >
                  <option value="vnpay">Cổng VNPay (Thẻ ATM, QR, Visa/Master)</option>
                  <option value="bank_transfer">Chuyển khoản Ngân hàng (VietQR)</option>
                  <option value="cod">Thanh toán khi nhận hàng (COD GHN)</option>
                </select>

                <button
                  onClick={handleRepay}
                  disabled={isRepaying}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#b38f2a] hover:from-[#e5c158] hover:to-[#c49e35] text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-[#d4af37]/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isRepaying ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm" />
                      <span>Đang Khởi Tạo...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCreditCard} className="text-sm" />
                      <span>Thanh Toán Lại Ngay</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2 Cột Nội Dung Chính */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI (2/3): Danh sách sản phẩm & Timeline GHN */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Danh sách sản phẩm */}
            <div className="bg-[#08120d] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <h3 className="font-serif text-lg font-light text-stone-100 flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faBoxArchive} className="text-[#d4af37] text-sm" />
                  <span>Danh Sách Cỗ Máy Thời Gian ({order.items?.length || 0})</span>
                </h3>
                <span className="text-xs font-mono text-stone-400">Niêm phong chứng thư Thụy Sĩ</span>
              </div>

              <div className="divide-y divide-white/[0.05]">
                {order.items?.map((item, idx) => {
                  const v = item.variant;
                  const prod = v?.product;
                  const rawImg = v?.images?.[0]?.imageUrl || prod?.imageUrl || "/images/submariner-emerald.jpg";
                  const itemImg = normalizeImageUrl(rawImg);
                  const itemPrice = Number(item.giaSanPhamTaiLucDo || v?.price || 0);
                  const serial = item.serials?.[0]?.serialNumber || `SN-${order.id}-${idx + 1}-GENEVE`;

                  return (
                    <div key={idx} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 rounded-2xl bg-black/60 border border-[#d4af37]/25 overflow-hidden shrink-0 shadow-inner">
                          <Image
                            src={itemImg}
                            alt={prod?.name || "Watch"}
                            fill
                            unoptimized
                            className="object-contain p-2"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-wider font-semibold">
                            CHẾ TÁC CAO CẤP • GENÈVE
                          </span>
                          <h4 className="font-serif text-base font-normal text-stone-100">
                            {prod?.name || "Đồng Hồ Cơ Khí Chế Tác"}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-400">
                            <span>Mặt số: <strong className="text-stone-200">{v?.mauMatSo || "Cổ điển"}</strong></span>
                            {v?.mauDayDeo && <span>• Dây: <strong className="text-stone-200">{v.mauDayDeo}</strong></span>}
                            {v?.mauNieng && <span>• Niềng: <strong className="text-stone-200">{v.mauNieng}</strong></span>}
                            <span>• SL: <strong className="text-white">{item.quantity}</strong></span>
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/25 text-[11px] font-mono text-[#d4af37] mt-1">
                            <FontAwesomeIcon icon={faCertificate} className="text-xs" />
                            <span>Serial Máy: <strong>{serial}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2">
                        <span className="font-serif text-base text-[#d4af37] font-medium">
                          {formatPrice(Math.round(itemPrice * item.quantity / 25000), itemPrice * item.quantity)}
                        </span>
                        <Link
                          href={`/warranty?serial=${encodeURIComponent(serial)}`}
                          className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-mono text-stone-300 hover:text-white flex items-center gap-1.5 transition-all"
                        >
                          <FontAwesomeIcon icon={faShieldHalved} className="text-[#d4af37] text-[10px]" />
                          <span>Tra Cứu Bảo Hành</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Timeline Hành Trình Vận Chuyển GHN Express */}
            <div className="bg-[#08120d] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.06]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d4af37] font-semibold">
                    HÀNH TRÌNH BƯU KIỆN
                  </span>
                  <h3 className="font-serif text-lg font-light text-stone-100 flex items-center gap-2 mt-0.5">
                    <FontAwesomeIcon icon={faTruck} className="text-emerald-400 text-sm" />
                    <span>Lộ Trình Giao Hàng Nhanh (GHN Express)</span>
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-xs font-mono text-stone-300 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/[0.08]">
                    Vận đơn: <strong className="text-[#d4af37] font-bold">{trackingCode}</strong>
                  </div>
                  <a
                    href="https://5sao.ghn.dev/ops-live"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
                    title="Mở cổng điều phối bưu tá GHN"
                  >
                    <FontAwesomeIcon icon={faTruck} className="text-[10px]" />
                    <span>Tra Cứu Bưu Cục GHN</span>
                  </a>
                </div>
              </div>

              {/* Interactive Timeline 5 Mốc */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-[2px] before:bg-white/[0.08]">
                {trackingTimeline.map((item, index) => {
                  const isDone = item.status === "completed";
                  const isCurrent = item.status === "in_progress";
                  return (
                    <div key={index} className="relative flex items-start gap-4">
                      {/* Status Dot */}
                      <div
                        className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] border transition-all ${
                          isDone
                            ? "bg-emerald-500 border-emerald-400 text-black shadow-md shadow-emerald-500/30"
                            : isCurrent
                            ? "bg-[#d4af37] border-amber-300 text-black animate-pulse"
                            : "bg-[#0b1b13] border-white/20 text-stone-500"
                        }`}
                      >
                        {isDone ? <FontAwesomeIcon icon={faCheck} className="text-[9px]" /> : index + 1}
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            className={`font-serif text-sm font-medium ${
                              isDone ? "text-stone-100" : isCurrent ? "text-[#d4af37]" : "text-stone-400"
                            }`}
                          >
                            {item.title}
                          </h4>
                          <span className="text-[10px] font-mono text-stone-500 bg-white/[0.03] px-2 py-0.5 rounded">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 font-light leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs font-mono text-stone-400">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-400" />
                  <span>Dịch vụ niêm phong & đồng kiểm bưu kiện lúc nhận hàng</span>
                </div>
                <span className="text-emerald-400">Miễn Phí Bảo Hiểm</span>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (1/3): Thông tin khách, Địa chỉ, và Tổng tiền */}
          <div className="space-y-8">
            {/* 1. Thông tin Người Nhận & Địa Chỉ */}
            <div className="bg-[#08120d] border border-white/[0.08] rounded-3xl p-6 sm:p-7 space-y-5">
              <div className="pb-3 border-b border-white/[0.06]">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d4af37] font-semibold">
                  THÔNG TIN GIAO NHẬN
                </span>
                <h3 className="font-serif text-base font-light text-stone-100 mt-0.5">
                  Địa Chỉ & Người Nhận
                </h3>
              </div>

              <div className="space-y-3.5 text-xs font-mono">
                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faUser} className="text-[#d4af37] w-3.5 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px]">Người nhận hàng:</span>
                    <strong className="text-stone-100 text-sm">{order.address?.receiverName || order.user?.name || "Quý khách"}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faPhone} className="text-[#d4af37] w-3.5 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px]">Số điện thoại:</span>
                    <strong className="text-stone-100">{order.address?.phone || order.user?.phone || "Chưa cập nhật"}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faLocationDot} className="text-[#d4af37] w-3.5 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px]">Địa chỉ bàn giao:</span>
                    <p className="text-stone-200 leading-relaxed font-sans text-xs">
                      {order.address?.address || "Nhận tại Flagship Salon"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faEnvelope} className="text-[#d4af37] w-3.5 mt-0.5" />
                  <div>
                    <span className="text-stone-400 block text-[11px]">Email liên hệ:</span>
                    <strong className="text-stone-200">{order.user?.email || "Chưa cập nhật"}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Chi Tiết Thanh Toán & Chi Phí */}
            <div className="bg-[#08120d] border border-[#d4af37]/25 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
              <div className="pb-3 border-b border-[#d4af37]/15">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d4af37] font-semibold">
                  TỔNG HỢP CHI PHÍ
                </span>
                <h3 className="font-serif text-base font-light text-stone-100 mt-0.5">
                  Thanh Toán & Hóa Đơn
                </h3>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between text-stone-400">
                  <span>Phương thức:</span>
                  <span className="text-stone-200 font-semibold uppercase">
                    {order.paymentMethod === "vnpay"
                      ? "Cổng VNPay"
                      : order.paymentMethod === "bank_transfer"
                      ? "Chuyển khoản VietQR"
                      : order.paymentMethod === "cash"
                      ? "Tiền mặt tại Salon"
                      : "Bàn giao thu tiền (COD)"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-stone-400">
                  <span>Giá trị cỗ máy:</span>
                  <span className="text-stone-200">
                    {formatPrice(Math.round(order.tongTienBanDau / 25000), order.tongTienBanDau)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-stone-400">
                  <span>Cước GHN Express:</span>
                  <span className="text-emerald-400">
                    {shippingFee === 0 ? "Miễn Phí" : formatPrice(Math.round(shippingFee / 25000), shippingFee)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-stone-400">
                  <span>Bảo hiểm vận chuyển:</span>
                  <span className="text-emerald-400">0 VNĐ (Tài trợ 100%)</span>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-baseline justify-between">
                  <span className="text-sm font-serif text-stone-200">Tổng thanh toán:</span>
                  <div className="text-right">
                    <span className="font-serif text-xl sm:text-2xl text-[#d4af37] font-normal block">
                      {formatPrice(Math.round(order.tongTienDonHang / 25000), order.tongTienDonHang)}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">Đã bao gồm VAT & niêm phong</span>
                  </div>
                </div>
              </div>

              {/* Nút hành động nhanh */}
              {isUnpaid ? (
                <button
                  onClick={handleRepay}
                  disabled={isRepaying}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#b38f2a] hover:from-[#e5c158] hover:to-[#c49e35] text-black font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <FontAwesomeIcon icon={faCreditCard} />
                  <span>Thanh Toán Lại Đơn Hàng</span>
                </button>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center justify-center gap-2">
                  <FontAwesomeIcon icon={faCircleCheck} />
                  <span>Đã ghi nhận thanh toán hoàn tất</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL VIETQR THANH TOÁN LẠI */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full bg-[#08120d] rounded-3xl p-6 sm:p-8 border border-[#d4af37]/40 text-white shadow-2xl relative space-y-5">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faCircleXmark} className="text-sm" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37] font-semibold">
                VIETQR CHUYỂN KHOẢN HỎA TỐC
              </span>
              <h3 className="font-serif text-xl text-stone-100">Quét Mã Thanh Toán</h3>
              <p className="text-xs text-stone-400 font-mono">Đơn hàng #{order.orderCode}</p>
            </div>

            {/* QR Image */}
            <div className="relative w-64 h-64 mx-auto bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center">
              <Image
                src={`https://api.vietqr.io/image/970422-0987654321-print.jpg?amount=${order.tongTienDonHang}&addInfo=${encodeURIComponent(
                  `PAY ${order.orderCode}`
                )}&accountName=BRU%20WATCH%20LUXURY`}
                alt="VietQR"
                fill
                unoptimized
                className="object-contain"
              />
            </div>

            {/* Bank details & Copy */}
            <div className="space-y-2.5 bg-black/50 p-4 rounded-2xl border border-white/[0.06] text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Ngân hàng:</span>
                <span className="text-stone-200 font-semibold">MBBank (Quân Đội)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Số tài khoản:</span>
                <button
                  onClick={() => copyToClipboard("0987654321", "Số tài khoản")}
                  className="text-[#d4af37] font-bold flex items-center gap-1.5 hover:underline"
                >
                  <span>0987654321</span>
                  <FontAwesomeIcon icon={faCopy} className="text-[10px]" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Số tiền:</span>
                <span className="text-emerald-400 font-bold">{order.tongTienDonHang.toLocaleString("vi-VN")} VNĐ</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Nội dung CK:</span>
                <button
                  onClick={() => copyToClipboard(`PAY ${order.orderCode}`, "Nội dung chuyển khoản")}
                  className="text-[#d4af37] font-bold flex items-center gap-1.5 hover:underline"
                >
                  <span>PAY {order.orderCode}</span>
                  <FontAwesomeIcon icon={faCopy} className="text-[10px]" />
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setShowQrModal(false);
                fetchOrderDetail();
              }}
              className="w-full py-3 rounded-2xl bg-[#006039] hover:bg-[#007a48] text-white font-mono text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer"
            >
              Tôi Đã Hoàn Tất Chuyển Khoản
            </button>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Hủy Đơn Hàng */}
      {showCancelModal && (
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
                  Đơn hàng #{order.orderCode}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-300 font-light leading-relaxed">
              Quý khách có chắc chắn muốn hủy đơn hàng này không? Cỗ máy thời gian sẽ được trả lại kho niêm phong.
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
                disabled={isCancelling}
                onClick={() => setShowCancelModal(false)}
                className="py-2.5 rounded-xl border border-white/[0.1] hover:border-white/[0.2] text-xs font-mono text-stone-300 transition-colors cursor-pointer"
              >
                Giữ Lại Đơn
              </button>

              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelOrder}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-900/30 disabled:opacity-50"
              >
                {isCancelling ? (
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

