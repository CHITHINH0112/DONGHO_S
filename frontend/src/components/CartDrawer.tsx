"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faTrashCan,
  faPlus,
  faMinus,
  faBagShopping,
  faShieldHalved,
  faTruck,
  faTag,
  faCircleCheck,
  faArrowRight,
  faGem,
} from "@fortawesome/free-solid-svg-icons";

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    formatPrice,
    promoCode,
    discountRate,
    applyPromoCode,
    subtotalVND,
    subtotalUSD,
  } = useCart();

  const [inputCode, setInputCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  if (!isCartOpen) return null;

  const handleClose = () => {
    watchAudio.click();
    setIsCartOpen(false);
  };

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode) return;
    applyPromoCode(inputCode);
  };

  const finalSubtotalVND = subtotalVND * (1 - discountRate);
  const finalSubtotalUSD = subtotalUSD * (1 - discountRate);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    watchAudio.chime();
    setIsSuccessModalOpen(true);
  };

  const handleFinishOrder = () => {
    clearCart();
    setIsSuccessModalOpen(false);
    setIsCartOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#09130e]/95 border-l border-[#d4af37]/25 shadow-2xl flex flex-col justify-between text-white backdrop-blur-2xl">
          {/* Header */}
          <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#006039]/40 border border-[#006039]/60 text-[#d4af37] flex items-center justify-center">
                <FontAwesomeIcon icon={faBagShopping} className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-normal text-white">
                  Giỏ Hàng Bảo Mật VIP
                </h3>
                <span className="text-xs font-mono text-white/50 font-light">
                  {cart.length} tuyệt tác được chọn
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#006039]/20 border border-[#006039]/40 flex items-center justify-center text-[#d4af37] mb-4">
                  <FontAwesomeIcon icon={faBagShopping} className="w-7 h-7" />
                </div>
                <p className="font-serif text-lg font-normal text-white">
                  Giỏ hàng của bạn đang trống
                </p>
                <p className="text-xs text-white/50 max-w-xs mt-1.5 font-light">
                  Hãy khám phá kiệt tác đồng hồ cơ khí và thêm vào bộ sưu tập cá nhân của bạn.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-6 px-6 py-2.5 rounded-full bg-[#d4af37] hover:bg-[#b8952b] text-black font-semibold text-xs shadow-md uppercase tracking-wider"
                >
                  Khám Phá Bộ Sưu Tập
                </button>
              </div>
            ) : (
              cart.map((entry) => {
                const { watch, quantity, selectedVariant } = entry;
                const entryId = entry.id || (selectedVariant ? `${watch.id}-var-${selectedVariant.id}` : watch.id);
                const itemImage = selectedVariant?.images?.[0] || watch.image;
                const itemPriceUSD = selectedVariant ? selectedVariant.priceUSD : watch.priceUSD;
                const itemPriceVND = selectedVariant ? selectedVariant.priceVND : watch.priceVND;

                return (
                <div
                  key={entryId}
                  className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] relative group"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 bg-black/40 border border-white/[0.04] rounded-xl overflow-hidden shrink-0">
                    <Image
                      src={itemImage}
                      alt={watch.name}
                      fill
                      unoptimized
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (!target.src.includes('submariner-emerald.jpg')) {
                          target.src = '/images/submariner-emerald.jpg';
                        }
                      }}
                      className="object-contain p-1"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-[#d4af37]">
                          {watch.brand}
                        </span>
                        <button
                          onClick={() => removeFromCart(entryId)}
                          className="text-white/40 hover:text-rose-400 transition-colors"
                          title="Xóa khỏi giỏ"
                        >
                          <FontAwesomeIcon icon={faTrashCan} className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="font-serif text-sm font-normal text-white line-clamp-1 mt-0.5">
                        {watch.name}
                      </h4>
                      <div className="text-xs font-mono font-semibold text-[#d4af37] mt-1">
                        {selectedVariant && (
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#d4af37] mb-1">
                            <span>{selectedVariant.mauMatSo}</span>
                            <span>•</span>
                            <span className="truncate max-w-[120px]">{selectedVariant.sku}</span>
                          </div>
                        )}
                        {formatPrice(itemPriceUSD, itemPriceVND)}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-white/[0.1] rounded-lg bg-black/40 p-0.5">
                        <button
                          onClick={() => updateQuantity(entryId, -1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-white/[0.1] rounded text-white/70"
                        >
                          <FontAwesomeIcon icon={faMinus} className="w-2.5 h-2.5" />
                        </button>
                        <span className="w-8 text-center font-mono text-xs font-bold text-white">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(entryId, 1)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-white/[0.1] rounded text-white/70"
                        >
                          <FontAwesomeIcon icon={faPlus} className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <span className="text-xs font-mono text-white/50">
                        {selectedVariant?.sku || watch.specs.diameter}
                      </span>
                    </div>
                  </div>
                </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Panel */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-white/[0.06] bg-black/30 space-y-4">
              {/* Promo code form */}
              <form onSubmit={handleApplyVoucher} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Mã VIP: EMERALD10"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs font-mono uppercase text-white placeholder:text-white/40 focus:outline-none focus:border-[#d4af37]"
                  />
                  <FontAwesomeIcon icon={faTag} className="w-3 h-3 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-[#d4af37] hover:text-black text-xs font-mono font-semibold transition-colors text-white"
                >
                  Áp Dụng
                </button>
              </form>

              {discountRate > 0 && (
                <div className="flex items-center justify-between text-xs font-mono text-emerald-300 bg-[#006039]/20 p-2.5 rounded-lg border border-[#006039]/40">
                  <span className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faGem} className="w-3 h-3 text-[#d4af37]" /> Mã {promoCode} đã kích hoạt:
                  </span>
                  <span>-10%</span>
                </div>
              )}

              {/* Price summary */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-white/60">
                  <span>Tạm tính</span>
                  <span>{formatPrice(subtotalUSD, subtotalVND)}</span>
                </div>
                {discountRate > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Ưu đãi VIP (10%)</span>
                    <span>
                      -{formatPrice(subtotalUSD * 0.1, subtotalVND * 0.1)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-white/60">
                  <span>Vận chuyển xe bọc thép</span>
                  <span className="text-emerald-400 font-semibold">MIỄN PHÍ</span>
                </div>
                <div className="flex justify-between text-base font-serif font-normal text-white pt-2 border-t border-white/[0.06]">
                  <span>Tổng thanh toán</span>
                  <span className="text-[#d4af37] font-semibold">
                    {formatPrice(finalSubtotalUSD, finalSubtotalVND)}
                  </span>
                </div>
              </div>

              {/* Checkout Security Note */}
              <div className="flex items-center gap-2 text-[11px] font-mono text-white/60 bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06]">
                <FontAwesomeIcon icon={faTruck} className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                <span>Giao hàng tận nơi bởi vệ sĩ chuyên trách bảo mật cao cấp.</span>
              </div>

              {/* Primary VIP Checkout CTA */}
              <Link
                href="/checkout"
                onClick={() => {
                  watchAudio.click();
                  setIsCartOpen(false);
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c69f2e] to-[#b38f28] text-black font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-[#d4af37]/25 hover:scale-102 active:scale-98 transition-all cursor-pointer text-center"
              >
                <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5 text-black" />
                <span>Tiến Hành Thanh Toán Bảo Mật VIP</span>
                <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 text-black" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-md w-full bg-[#0a1510] rounded-3xl p-8 border border-[#d4af37]/30 text-center shadow-2xl animate-scaleUp text-white">
            <div className="w-16 h-16 rounded-full bg-[#006039]/30 border-2 border-[#00844e] flex items-center justify-center text-[#00844e] mx-auto mb-4">
              <FontAwesomeIcon icon={faCircleCheck} className="w-8 h-8" />
            </div>

            <div className="text-xs font-mono uppercase tracking-widest text-[#d4af37] mb-1">
              Hóa Đơn Bảo Mật #CHRONO-2026-9812
            </div>
            <h3 className="font-serif text-2xl font-normal text-white">
              Đơn Hàng Đã Được Tiếp Nhận
            </h3>
            <p className="mt-2 text-xs text-white/70 leading-relaxed font-light">
              Kính gửi Quý khách <strong className="text-[#d4af37] font-semibold">{customerName || "VIP"}</strong>, chuyên viên bảo an cao cấp của BRU_WATCH sẽ liên hệ qua số điện thoại <strong className="text-white font-semibold">{customerPhone || "của bạn"}</strong> trong vòng 15 phút để sắp xếp lịch giao đồng hồ bằng xe chuyên dụng bọc thép.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-left text-xs font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-white/50">Tổng thanh toán:</span>
                <span className="font-bold text-[#d4af37]">
                  {formatPrice(finalSubtotalUSD, finalSubtotalVND)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Địa chỉ giao:</span>
                <span className="font-semibold text-white truncate max-w-[180px]">
                  {customerAddress || "Tư gia của Quý khách"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Bảo hiểm hàng hải:</span>
                <span className="text-emerald-400 font-semibold">100% Giá trị</span>
              </div>
            </div>

            <button
              onClick={handleFinishOrder}
              className="mt-6 w-full py-3 rounded-xl bg-[#d4af37] text-black font-semibold text-xs hover:bg-[#b8952b] transition-colors shadow-lg cursor-pointer"
            >
              Hoàn Tất & Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
