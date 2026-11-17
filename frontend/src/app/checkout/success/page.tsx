"use client";

import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { apiClient } from "@/lib/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
  faTruck,
  faShieldHalved,
  faQrcode,
  faCertificate,
  faBoxArchive,
  faArrowRight,
  faCopy,
  faHouse,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const orderCode = searchParams.get("orderCode");
  const method = searchParams.get("method");
  const total = searchParams.get("total");

  // VNPay callback query params
  const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
  const vnp_TransactionNo = searchParams.get("vnp_TransactionNo");
  const vnp_BankCode = searchParams.get("vnp_BankCode");
  const vnp_TxnRef = searchParams.get("vnp_TxnRef");
  const vnp_Amount = searchParams.get("vnp_Amount");

  const isVNPayCallback = !!vnp_ResponseCode;
  const isVNPaySuccess = vnp_ResponseCode === "00";

  const { formatPrice, showToast } = useCart();
  const displayOrderId = orderCode || vnp_TxnRef || (orderId ? `ORD-${orderId}` : "ORD-2026-VIP");
  const displayTotalVND = total
    ? Number(total)
    : vnp_Amount
    ? Number(vnp_Amount) / 100
    : 50000000;
  const displayTotalUSD = Math.round(displayTotalVND / 25000);

  // VietQR URL
  const vietQrUrl = `https://img.vietqr.io/image/970436-0908889999-compact2.png?amount=${displayTotalVND}&addInfo=${encodeURIComponent(
    displayOrderId
  )}&accountName=BRU_WATCH%20VIETNAM`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Đã sao chép ${label}.`);
  };

  return (
    <div className="min-h-screen bg-[#050b07] text-white pt-28 pb-24 px-4 sm:px-8 max-w-4xl mx-auto selection:bg-[#006039] selection:text-white">
      {/* Header Status */}
      <div className="text-center space-y-3 mb-10">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto text-3xl shadow-2xl animate-scaleUp ${
            isVNPayCallback && !isVNPaySuccess
              ? "bg-rose-500/20 border-2 border-rose-500/50 text-rose-400"
              : "bg-[#006039]/20 border-2 border-emerald-500/50 text-emerald-400"
          }`}
        >
          <FontAwesomeIcon icon={isVNPayCallback && !isVNPaySuccess ? faCircleXmark : faCircleCheck} />
        </div>

        <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-[#d4af37] block font-semibold">
          {isVNPayCallback && !isVNPaySuccess
            ? "THÔNG BÁO GIAO DỊCH VNPAY"
            : "BIÊN NHẬN ĐIỆN TỬ BẢO MẬT BRU_WATCH"}
        </span>

        <h1 className="font-serif text-2xl sm:text-4xl font-light text-stone-100">
          {isVNPayCallback
            ? isVNPaySuccess
              ? "Thanh Toán VNPay Thành Công!"
              : "Thanh Toán VNPay Chưa Hoàn Tất"
            : "Đơn Đặt Hàng Đã Được Tiếp Nhận"}
        </h1>

        <p className="text-xs sm:text-sm text-stone-400 font-light max-w-lg mx-auto leading-relaxed">
          {isVNPayCallback
            ? isVNPaySuccess
              ? `Giao dịch đơn hàng #${displayOrderId} đã được ngân hàng xác nhận thành công qua cổng thanh toán VNPay.`
              : "Giao dịch thanh toán trực tuyến bị hủy hoặc chưa hoàn tất. Quý khách có thể kiểm tra lại trong Sổ Đơn Hàng."
            : `Kính gửi Quý khách, đơn hàng #${displayOrderId} đã được lưu vào hệ thống và chuyển giao cho bộ phận vận chuyển GHTK niêm phong kẹp chì.`}
        </p>
      </div>

      <div className="space-y-6">
        {/* VNPay Success Details Box */}
        {isVNPayCallback && isVNPaySuccess && (
          <div className="rounded-3xl bg-[#08120d]/90 border border-emerald-500/40 p-6 sm:p-7 shadow-2xl text-xs font-mono space-y-3 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold uppercase tracking-wider text-xs pb-2 border-b border-white/[0.08]">
              <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4" />
              <span>Xác Thực Giao Dịch Cổng VNPay Thành Công</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-300">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex justify-between">
                <span className="text-stone-500">Mã đơn hàng:</span>
                <strong className="text-[#d4af37]">{displayOrderId}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex justify-between">
                <span className="text-stone-500">Mã giao dịch VNPay:</span>
                <strong className="text-stone-200">{vnp_TransactionNo || "VNP-2026-SUCCESS"}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex justify-between">
                <span className="text-stone-500">Ngân hàng thanh toán:</span>
                <strong className="text-stone-200">{vnp_BankCode || "VNPay QR"}</strong>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex justify-between">
                <span className="text-stone-500">Số tiền thanh toán:</span>
                <strong className="text-emerald-400">{formatPrice(displayTotalUSD, displayTotalVND)}</strong>
              </div>
            </div>
          </div>
        )}

        {/* VietQR Transfer Box (Nếu chọn thanh toán VietQR) */}
        {method === "bank_transfer_qr" && (
          <div className="rounded-3xl bg-[#08120d]/95 border border-[#d4af37]/35 p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
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
                  <span>Quét Mã VietQR Hoặc Chuyển Khoản Tự Động 24/7</span>
                </div>

                <div className="space-y-2 pt-1 text-stone-300">
                  <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-stone-500">Ngân Hàng:</span>
                    <strong className="text-stone-100">Vietcombank (Sở Giao Dịch)</strong>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-stone-500">Số Tài Khoản:</span>
                    <div className="flex items-center gap-2">
                      <strong className="text-[#d4af37] text-sm">0908 889 999 88</strong>
                      <button
                        type="button"
                        onClick={() => handleCopy("090888999988", "số tài khoản")}
                        className="text-stone-400 hover:text-white cursor-pointer"
                        title="Sao chép"
                      >
                        <FontAwesomeIcon icon={faCopy} className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-stone-500">Chủ Tài Khoản:</span>
                    <strong className="text-stone-100">BRU_WATCH VIETNAM</strong>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-stone-500">Số Tiền:</span>
                    <strong className="text-emerald-400 text-sm font-serif">
                      {formatPrice(displayTotalUSD, displayTotalVND)}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-stone-500">Nội Dung:</span>
                    <div className="flex items-center gap-2">
                      <strong className="text-[#d4af37]">{displayOrderId}</strong>
                      <button
                        type="button"
                        onClick={() => handleCopy(displayOrderId, "nội dung chuyển khoản")}
                        className="text-stone-400 hover:text-white cursor-pointer"
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

        {/* Security Dispatch & GHTK Note */}
        <div className="rounded-3xl bg-[#08120d]/90 border border-white/[0.08] p-6 sm:p-7 space-y-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#006039]/20 text-emerald-400 border border-[#006039]/40 flex items-center justify-center">
              <FontAwesomeIcon icon={faTruck} className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-normal text-stone-100">
                Lộ Trình Bàn Giao Cỗ Máy
              </h3>
              <p className="text-xs font-mono text-stone-400">
                Đơn vị đảm nhiệm: <strong className="text-[#d4af37]">Giao Hàng Tiết Kiệm (GHTK)</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">
                Bước 1 • Thẩm Định
              </span>
              <strong className="text-stone-200 block font-serif">Niêm Phong Kẹp Chì</strong>
              <p className="text-stone-400 text-[11px] font-light leading-relaxed">
                Đồng hồ được đối soát số serial máy và đặt trong hộp nhung bảo an.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">
                Bước 2 • Vận Chuyển GHTK
              </span>
              <strong className="text-stone-200 block font-serif">Đường Bay Hỏa Tốc</strong>
              <p className="text-stone-400 text-[11px] font-light leading-relaxed">
                Luân chuyển chuyên trách với bảo hiểm 100% giá trị cỗ máy.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-stone-500 block">
                Bước 3 • Bàn Giao Tận Tay
              </span>
              <strong className="text-stone-200 block font-serif">Kiểm Tra & Ký Nhận</strong>
              <p className="text-stone-400 text-[11px] font-light leading-relaxed">
                Quý khách kiểm tra chứng thư, thử cổ tay và hoàn tất đơn hàng.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/account/orders"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#c69f2e] to-[#b38f28] hover:from-[#e5c158] hover:to-[#c49f32] text-black font-semibold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#d4af37]/25 transition-all hover:scale-102"
          >
            <FontAwesomeIcon icon={faBoxArchive} className="w-3.5 h-3.5" />
            <span>Xem Chi Tiết & Timeline Vận Đơn</span>
          </Link>

          <Link
            href="/warranty"
            className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-white/[0.12] hover:border-[#d4af37] text-stone-300 hover:text-white text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Tra Cứu Bảo Hành Toàn Cầu</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-white/[0.08] hover:bg-white/[0.05] text-stone-400 hover:text-white text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
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
        <div className="min-h-screen bg-[#050b07] flex items-center justify-center text-[#d4af37] font-mono text-xs">
          <span>Đang tạo biên lai bảo mật điện tử...</span>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
