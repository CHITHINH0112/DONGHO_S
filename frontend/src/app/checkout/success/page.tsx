"use client";

import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faTruck,
  faShieldHalved,
  faQrcode,
  faCertificate,
  faBoxArchive,
  faArrowRight,
  faCopy,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { orders } = useAuth();
  const { formatPrice, showToast } = useCart();

  const currentOrder = orders.find((o) => o.id === orderId) || orders[0];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Đã sao chép ${label}.`);
  };

  if (!currentOrder) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 text-center">
        <h2 className="font-serif text-2xl text-foreground">Không tìm thấy thông tin đơn hàng</h2>
        <Link href="/" className="mt-4 inline-block text-xs font-mono text-[#d4af37] underline">
          Về trang chủ
        </Link>
      </div>
    );
  }

  // VietQR parameters
  const vietQrUrl = `https://img.vietqr.io/image/970436-0908889999-compact2.png?amount=${currentOrder.totalVND}&addInfo=${currentOrder.id}&accountName=MAISON%20DES%20MONTRES`;

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-4xl mx-auto">
      {/* Success Badge & Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="w-18 h-18 rounded-full bg-[#006039]/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto text-3xl shadow-xl shadow-emerald-950/30 animate-scaleUp">
          <FontAwesomeIcon icon={faCircleCheck} />
        </div>
        <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-[#d4af37] block">
          BIÊN NHẬN ĐIỆN TỬ BẢO MẬT BRU_WATCH
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-normal text-foreground">
          Đơn Đặt Mua Đã Được Tiếp Nhận
        </h1>
        <p className="text-xs text-muted-foreground font-light max-w-lg mx-auto leading-relaxed">
          Kính gửi Quý khách, đơn hàng <strong className="text-[#d4af37]">#{currentOrder.id}</strong> đã được chuyển giao cho Ban Giám Đốc An Ninh và Thợ Đồng Hồ Thụy Sĩ để tiến hành niêm phong kẹp chì.
        </p>
      </div>

      <div className="space-y-8">
        {/* If Bank Transfer: Show QR Code & Account Info */}
        {currentOrder.paymentMethod === "bank_transfer_qr" && (
          <div className="rounded-3xl bg-card border border-[#d4af37]/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* QR Image Box */}
              <div className="relative w-56 aspect-square rounded-2xl bg-white p-3 shadow-xl shrink-0 border border-[#d4af37]/30 flex flex-col items-center justify-center">
                <Image
                  src={vietQrUrl}
                  alt="Mã QR Chuyển Khoản VietQR"
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
              </div>

              {/* Bank Details */}
              <div className="flex-1 space-y-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold uppercase tracking-wider text-xs">
                  <FontAwesomeIcon icon={faQrcode} className="w-3.5 h-3.5" />
                  <span>Quét Mã VietQR Hoặc Chuyển Khoản Nhanh 24/7</span>
                </div>

                <div className="space-y-2 pt-1 text-foreground/80">
                  <div className="flex justify-between p-2.5 rounded-xl bg-muted/40 border border-border">
                    <span className="text-muted-foreground">Ngân Hàng:</span>
                    <strong className="text-foreground">Vietcombank (Sở Giao Dịch)</strong>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-muted/40 border border-border">
                    <span className="text-muted-foreground">Số Tài Khoản:</span>
                    <div className="flex items-center gap-2">
                      <strong className="text-[#d4af37] text-sm">0908 889 999 88</strong>
                      <button
                        type="button"
                        onClick={() => handleCopy("090888999988", "số tài khoản")}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Sao chép"
                      >
                        <FontAwesomeIcon icon={faCopy} className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between p-2.5 rounded-xl bg-muted/40 border border-border">
                    <span className="text-muted-foreground">Chủ Tài Khoản:</span>
                    <strong className="text-foreground">BRU_WATCH VIETNAM</strong>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-muted/40 border border-border">
                    <span className="text-muted-foreground">Số Tiền:</span>
                    <strong className="text-emerald-400 text-sm font-serif">
                      {formatPrice(currentOrder.totalUSD, currentOrder.totalVND)}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-muted/40 border border-border">
                    <span className="text-muted-foreground">Nội Dung:</span>
                    <div className="flex items-center gap-2">
                      <strong className="text-[#d4af37]">{currentOrder.id}</strong>
                      <button
                        type="button"
                        onClick={() => handleCopy(currentOrder.id, "nội dung chuyển khoản")}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Sao chép"
                      >
                        <FontAwesomeIcon icon={faCopy} className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Dispatch Route & Armored Vehicle Details */}
        <div className="rounded-3xl bg-card border border-border p-6 sm:p-7 space-y-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006039]/20 text-emerald-400 border border-[#006039]/40 flex items-center justify-center">
              <FontAwesomeIcon icon={faTruck} className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-normal text-foreground">
                Tiến Trình Bàn Giao Xe Bọc Thép
              </h3>
              <p className="text-xs font-mono text-muted-foreground">
                Mã vận đơn bảo an: <strong className="text-[#d4af37]">{currentOrder.armoredTrackingCode}</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-muted/30 border border-border text-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                Bước 1 • Niêm Phong
              </span>
              <strong className="text-foreground block font-serif">Kẹp Chì Điện Tử</strong>
              <p className="text-muted-foreground text-[11px] font-light">
                Đồng hồ được đặt trong hộp chống đạn bọc nhung và niêm phong GPS.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/30 border border-border text-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                Bước 2 • Vệ Sĩ Hộ Tống
              </span>
              <strong className="text-foreground block font-serif">Xe Bọc Thép Khởi Hành</strong>
              <p className="text-muted-foreground text-[11px] font-light">
                Di chuyển theo tuyến đường bí mật được mã hóa thời gian thực.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-muted/30 border border-border text-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                Bước 3 • Bàn Giao Tận Tay
              </span>
              <strong className="text-foreground block font-serif">Kiểm Tra Trên Cổ Tay</strong>
              <p className="text-muted-foreground text-[11px] font-light">
                Quý khách ký nhận và kích hoạt thẻ bảo hành điện tử chính hãng.
              </p>
            </div>
          </div>
        </div>

        {/* Assigned Timepieces & Allocated Serials */}
        <div className="rounded-3xl bg-card border border-border p-6 sm:p-7 space-y-4 shadow-lg">
          <h4 className="font-serif text-base font-normal text-foreground flex items-center justify-between">
            <span>Danh Sách Kiệt Tác & Số Serial Cấp Tạm</span>
            <span className="text-xs font-mono text-emerald-400">
              Đã Chứng Nhận Thụy Sĩ
            </span>
          </h4>

          <div className="divide-y divide-border/60">
            {currentOrder.items.map((item, idx) => (
              <div
                key={idx}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative w-14 h-14 rounded-xl bg-black/40 border border-border overflow-hidden shrink-0">
                    <Image
                      src={item.watch.image}
                      alt={item.watch.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#d4af37]">
                      {item.watch.brand}
                    </span>
                    <h5 className="font-serif text-sm font-medium text-foreground">
                      {item.watch.name}
                    </h5>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#d4af37]/10 border border-[#d4af37]/25 text-[10px] font-mono text-[#d4af37] mt-1">
                      <FontAwesomeIcon icon={faCertificate} className="w-2.5 h-2.5" />
                      <span>Số Serial: <strong>{item.serialNumber}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className="text-muted-foreground">x{item.quantity}</span>
                  <div className="font-semibold text-foreground font-serif text-sm mt-0.5">
                    {formatPrice(item.watch.priceUSD * item.quantity, item.watch.priceVND * item.quantity)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/account/orders"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#d4af37] hover:bg-[#b8952b] text-black font-semibold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-102"
          >
            <FontAwesomeIcon icon={faBoxArchive} className="w-3.5 h-3.5" />
            <span>Theo Dõi Vận Đơn Tại Hồ Sơ</span>
          </Link>

          <Link
            href="/warranty"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-border hover:border-[#d4af37] text-foreground text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Tra Cứu Bảo Hành Toàn Cầu</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <FontAwesomeIcon icon={faHouse} className="w-3 h-3" />
            <span>Về Trang Chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-[#d4af37] font-mono text-xs">
          <span>Đang tạo biên lai bảo mật điện tử...</span>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
