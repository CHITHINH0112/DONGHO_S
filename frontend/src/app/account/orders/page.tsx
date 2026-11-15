"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AccountNav from "@/components/AccountNav";
import { useAuth, UserOrder } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxArchive,
  faTruck,
  faShieldHalved,
  faCertificate,
  faRotateRight,
  faLocationDot,
  faCircleCheck,
  faClock,
  faArrowRight,
  faWrench,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

export default function AccountOrdersPage() {
  const { user, orders } = useAuth();
  const { formatPrice, showToast } = useCart();

  const [selectedReturnOrder, setSelectedReturnOrder] = useState<UserOrder | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnSerial, setReturnSerial] = useState("");
  const [returnSubmitted, setReturnSubmitted] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <AccountNav />
      </div>
    );
  }

  const getStatusBadge = (status: UserOrder["status"]) => {
    switch (status) {
      case "delivered":
        return {
          label: "Đã Bàn Giao An Toàn",
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
          icon: faCircleCheck,
        };
      case "armored_transit":
        return {
          label: "Đang Vận Chuyển",
          color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
          icon: faTruck,
        };
      case "confirmed":
        return {
          label: "Đã Thẩm Định Cỗ Máy",
          color: "text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/30",
          icon: faCertificate,
        };
      case "pending":
      default:
        return {
          label: "Chờ Điều Phối An Ninh",
          color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
          icon: faClock,
        };
    }
  };

  const handleOpenReturnModal = (order: UserOrder, serial: string) => {
    watchAudio.click();
    setSelectedReturnOrder(order);
    setReturnSerial(serial);
    setReturnReason("");
    setReturnSubmitted(false);
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    watchAudio.chime();
    setReturnSubmitted(true);
    setTimeout(() => {
      setSelectedReturnOrder(null);
      showToast("Yêu cầu hỗ trợ kỹ thuật theo Serial đã được tiếp nhận.");
    }, 1800);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
      <AccountNav />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-foreground">
              Lịch Sử Đơn Hàng
            </h3>
            <p className="text-xs text-muted-foreground font-light mt-0.5">
              Toàn bộ kiệt tác được bàn giao đều gắn liền với số Serial máy lưu trữ bảo mật vĩnh viễn.
            </p>
          </div>
          <span className="text-xs font-mono text-[#d4af37] bg-[#d4af37]/10 px-3 py-1.5 rounded-full border border-[#d4af37]/25">
            {orders.length} Đơn Hàng
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="py-24 text-center luxury-card p-8 flex flex-col items-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] mb-4 shadow-inner">
              <FontAwesomeIcon icon={faBoxArchive} className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg font-normal text-foreground">
              Chưa có đơn hàng nào
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mt-1.5 font-light">
              Quý khách chưa thực hiện đơn đặt mua nào. Hãy chiêm ngưỡng các cỗ máy thời gian độc bản trong bộ sưu tập.
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
            {orders.map((order) => {
              const statusInfo = getStatusBadge(order.status);
              return (
                <div
                  key={order.id}
                  className="luxury-card rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#d4af37]/10 group"
                >
                  {/* Order Top Bar */}
                  <div className="p-5 sm:p-6 bg-black/5 dark:bg-black/30 border-b border-[#d4af37]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm font-bold text-[#d4af37] tracking-wider">
                          #{order.id}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-3 py-1 rounded-full border uppercase tracking-wider font-semibold flex items-center gap-1.5 shadow-xs ${statusInfo.color}`}
                        >
                          <FontAwesomeIcon icon={statusInfo.icon} className="w-2.5 h-2.5" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </div>
                      <div className="text-xs font-mono text-muted-foreground mt-1">
                        Ngày đặt: {order.createdAt}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:text-right">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                          Tổng Giá Trị Đơn Hàng
                        </span>
                        <span className="font-serif text-base sm:text-lg font-bold text-[#d4af37] tracking-tight">
                          {formatPrice(order.totalUSD, order.totalVND)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Armored Tracking & Security Dispatch Bar */}
                  <div className="px-6 py-3.5 bg-gradient-to-r from-[#006039]/15 via-[#006039]/5 to-transparent border-b border-[#d4af37]/15 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2 text-foreground/90">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                        <FontAwesomeIcon icon={faTruck} className="w-3 h-3" />
                      </div>
                      <span>Mã vận đơn: </span>
                      <strong className="text-[#d4af37] tracking-wider font-semibold">
                        {order.armoredTrackingCode}
                      </strong>
                    </div>
                    {order.securityGuardNotes && (
                      <div className="text-[11px] text-muted-foreground truncate max-w-md flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{order.securityGuardNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* Order Items List */}
                  <div className="p-6 divide-y divide-[#d4af37]/10">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-2xl bg-black/20 dark:bg-black/40 border border-[#d4af37]/20 overflow-hidden shrink-0 shadow-inner">
                            <Image
                              src={item.watch.image}
                              alt={item.watch.name}
                              fill
                              className="object-contain p-1.5"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-wider font-semibold">
                              {item.watch.brand}
                            </span>
                            <h5 className="font-serif text-sm font-medium text-foreground">
                              {item.watch.name}
                            </h5>
                            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mt-0.5">
                              <span>Số lượng: {item.quantity}</span>
                              <span>•</span>
                              <span className="text-foreground font-semibold">
                                {formatPrice(item.watch.priceUSD, item.watch.priceVND)}
                              </span>
                            </div>

                            {/* Serial Number Pill */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[10px] font-mono text-[#d4af37] mt-1.5 shadow-xs">
                              <FontAwesomeIcon icon={faCertificate} className="w-2.5 h-2.5" />
                              <span>Serial Máy: <strong>{item.serialNumber}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Actions for this Watch */}
                        <div className="flex items-center gap-2 sm:self-center shrink-0">
                          <Link
                            href={`/warranty?serial=${encodeURIComponent(item.serialNumber)}`}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37]/10 to-[#d4af37]/5 hover:from-[#d4af37]/20 hover:to-[#d4af37]/10 border border-[#d4af37]/30 hover:border-[#d4af37]/60 text-xs font-mono transition-all flex items-center gap-1.5 text-foreground shadow-xs"
                          >
                            <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3 text-[#d4af37]" />
                            <span>Tra Cứu Bảo Hành</span>
                          </Link>

                          <button
                            onClick={() => handleOpenReturnModal(order, item.serialNumber)}
                            className="px-3.5 py-2 rounded-xl border border-border hover:border-amber-500/50 text-xs font-mono transition-all text-muted-foreground hover:text-foreground hover:bg-amber-500/10 flex items-center gap-1.5 cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faWrench} className="w-3 h-3 text-amber-400" />
                            <span>Bảo Dưỡng / Đổi Trả</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address Footer */}
                  <div className="p-4 sm:px-6 bg-black/5 dark:bg-black/20 border-t border-[#d4af37]/15 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-muted-foreground gap-2">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3 text-[#d4af37]" />
                      <span>Địa chỉ bàn giao: </span>
                      <strong className="text-foreground">
                        {order.shippingAddress.address}, {order.shippingAddress.city} ({order.shippingAddress.receiverName} - {order.shippingAddress.phone})
                      </strong>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3 text-emerald-400" />
                      <span>Bảo hiểm vận chuyển: 100% Giá trị cỗ máy</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Return & Service Request Modal */}
      {selectedReturnOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-lg w-full bg-[#09130e] rounded-3xl p-7 border border-[#d4af37]/30 text-white shadow-2xl relative">
            <button
              onClick={() => setSelectedReturnOrder(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#006039]/30 text-emerald-400 border border-[#006039]/50 flex items-center justify-center">
                <FontAwesomeIcon icon={faWrench} className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-normal text-white">
                  Yêu Cầu Hỗ Trợ Kỹ Thuật / Đổi Trả
                </h4>
                <p className="text-[11px] font-mono text-[#d4af37]">
                  Đơn hàng #{selectedReturnOrder.id}
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
                <p className="text-xs text-white/60 font-light max-w-xs mx-auto">
                  Trưởng bộ phận Thợ Đồng Hồ Thụy Sĩ sẽ gọi trực tiếp qua số điện thoại của Quý khách trong vòng 30 phút.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReturn} className="space-y-4">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono space-y-1">
                  <div className="text-white/50">Số Serial cỗ máy được yêu cầu:</div>
                  <div className="text-[#d4af37] font-bold text-sm tracking-wider">
                    {returnSerial}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-white/70">
                    Nhu Cầu Của Quý Khách
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="warranty" className="bg-[#09130e]">Bảo dưỡng máy định kỳ (Lau dầu, cân chỉnh)</option>
                    <option value="sizing" className="bg-[#09130e]">Cắt/Nối mắt dây đeo kim loại hoặc thay dây da</option>
                    <option value="exchange" className="bg-[#09130e]">Yêu cầu đổi sang phiên bản mặt số khác</option>
                    <option value="inspection" className="bg-[#09130e]">Kiểm định lại sai số Chronometer tại phòng thí nghiệm</option>
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
                    onClick={() => setSelectedReturnOrder(null)}
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
    </div>
  );
}
