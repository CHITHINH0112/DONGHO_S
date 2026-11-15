"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashCan,
  faPlus,
  faMinus,
  faBagShopping,
  faShieldHalved,
  faTruck,
  faArrowRight,
  faArrowLeft,
  faCrown,
  faRotateLeft,
  faLock,
} from "@fortawesome/free-solid-svg-icons";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    setCartItemQuantity,
    clearCart,
    formatPrice,
    subtotalVND,
    subtotalUSD,
    showToast,
  } = useCart();

  const [isClearing, setIsClearing] = useState(false);

  const handleConfirmClear = () => {
    watchAudio.ratchet();
    clearCart();
    setIsClearing(false);
    showToast("Đã dọn sạch toàn bộ giỏ hàng.");
  };

  return (
    <div className="min-h-screen bg-[#070e0a] text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-[#006039] selection:text-white">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-white/50 mb-6">
          <Link href="/" className="hover:text-[#d4af37] transition-colors">
            Trang Chủ
          </Link>
          <span>/</span>
          <span className="text-[#d4af37]">Giỏ Hàng</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08] mb-8">
          <div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-light text-stone-100">
              Quản Lý Giỏ Hàng
            </h1>
          </div>
          <div className="text-xs font-mono text-stone-400">
            Tổng cộng: <span className="text-[#d4af37] font-semibold">{cart.length}</span> mẫu đồng hồ được chọn
          </div>
        </div>

        {/* Main Content */}
        {cart.length === 0 ? (
          /* Empty State */
          <div className="py-24 px-4 text-center rounded-3xl bg-[#09130e]/80 border border-[#d4af37]/15 backdrop-blur-md max-w-2xl mx-auto flex flex-col items-center shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-[#006039]/20 border border-[#006039]/40 flex items-center justify-center text-[#d4af37] mb-6 shadow-inner">
              <FontAwesomeIcon icon={faBagShopping} className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-serif font-normal text-white mb-2">
              Giỏ Hàng Của Quý Khách Đang Trống
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 max-w-md font-light leading-relaxed mb-8">
              Chưa có mẫu đồng hồ cơ khí nào trong giỏ hàng. Hãy khám phá bộ sưu tập kiệt tác Haute Horlogerie và lưu giữ kiệt tác cho riêng bạn.
            </p>
            <Link
              href="/products"
              onClick={() => watchAudio.click()}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#c69f2e] to-[#b38f28] hover:from-[#e5c158] hover:to-[#c49f32] text-black font-mono text-xs font-bold uppercase tracking-wider shadow-xl shadow-[#d4af37]/20 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <FontAwesomeIcon icon={faBagShopping} className="text-sm" />
              <span>Khám Phá Bộ Sưu Tập</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-2xl bg-[#09130e]/90 border border-white/[0.08] overflow-hidden backdrop-blur-xl">
                {/* Header Row (Desktop) */}
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3.5 bg-black/40 border-b border-white/[0.06] text-[11px] font-mono text-stone-400 uppercase tracking-wider">
                  <div className="col-span-6">Kiệt Tác Đồng Hồ</div>
                  <div className="col-span-2 text-right">Đơn Giá</div>
                  <div className="col-span-2 text-center">Số Lượng</div>
                  <div className="col-span-2 text-right">Thành Tiền</div>
                </div>

                {/* Items */}
                <div className="divide-y divide-white/[0.06]">
                  {cart.map((entry) => {
                    const { watch, quantity, selectedVariant } = entry;
                    const entryId = entry.id || (selectedVariant ? `${watch.id}-var-${selectedVariant.id}` : watch.id);
                    const itemImage = selectedVariant?.images?.[0] || watch.image;
                    const itemPriceUSD = selectedVariant ? selectedVariant.priceUSD : watch.priceUSD;
                    const itemPriceVND = selectedVariant ? selectedVariant.priceVND : watch.priceVND;
                    const lineTotalVND = itemPriceVND * quantity;
                    const lineTotalUSD = itemPriceUSD * quantity;
                    const maxStock = selectedVariant?.stockCount ?? 99;

                    return (
                      <div
                        key={entryId}
                        className="p-4 sm:p-6 transition-colors hover:bg-white/[0.015] flex flex-col sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center relative group"
                      >
                        {/* Product Info (Col 6) */}
                        <div className="col-span-6 flex gap-4 items-center">
                          {/* Thumbnail */}
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-black/50 border border-white/[0.08] overflow-hidden shrink-0">
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
                              className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>

                          {/* Text info */}
                          <div className="min-w-0 flex-1 space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37]">
                              {watch.brand}
                            </span>
                            <h3 className="font-serif text-sm sm:text-base font-normal text-stone-100 line-clamp-1">
                              {watch.name}
                            </h3>

                            {selectedVariant && (
                              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-stone-400">
                                <span className="text-[#d4af37]/90">{selectedVariant.mauMatSo}</span>
                                {selectedVariant.sku && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate max-w-[120px]">{selectedVariant.sku}</span>
                                  </>
                                )}
                              </div>
                            )}

                            {/* Stock Indicator */}
                            {maxStock <= 5 && (
                              <div className="text-[10px] font-mono text-amber-400/90 pt-0.5">
                                Chỉ còn {maxStock} chiếc khả dụng
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Unit Price (Col 2 - Desktop) */}
                        <div className="col-span-2 hidden sm:block text-right font-mono text-xs text-stone-300">
                          {formatPrice(itemPriceUSD, itemPriceVND)}
                        </div>

                        {/* Quantity Controls (Col 2) */}
                        <div className="col-span-2 flex items-center justify-between sm:justify-center mt-3 sm:mt-0">
                          <span className="sm:hidden text-xs text-stone-400 font-mono">Số lượng:</span>
                          <div className="flex items-center border border-white/[0.1] rounded-lg bg-black/50 p-0.5">
                            <button
                              onClick={() => updateQuantity(entryId, -1)}
                              disabled={quantity <= 1}
                              className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${quantity <= 1
                                ? 'text-stone-600 cursor-not-allowed'
                                : 'text-stone-300 hover:bg-white/[0.1] hover:text-white cursor-pointer'
                                }`}
                              title="Giảm số lượng"
                            >
                              <FontAwesomeIcon icon={faMinus} className="text-[10px]" />
                            </button>

                            <input
                              type="number"
                              min={1}
                              max={maxStock}
                              value={quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) {
                                  setCartItemQuantity(entryId, val);
                                }
                              }}
                              className="w-10 text-center font-mono text-xs font-semibold text-white bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />

                            <button
                              onClick={() => updateQuantity(entryId, 1)}
                              disabled={quantity >= maxStock}
                              className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${quantity >= maxStock
                                ? 'text-stone-600 cursor-not-allowed'
                                : 'text-stone-300 hover:bg-white/[0.1] hover:text-white cursor-pointer'
                                }`}
                              title={quantity >= maxStock ? "Đã đạt giới hạn tồn kho" : "Tăng số lượng"}
                            >
                              <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                            </button>
                          </div>
                        </div>

                        {/* Line Total & Remove (Col 2) */}
                        <div className="col-span-2 flex items-center justify-between sm:justify-end gap-3 mt-3 sm:mt-0 pt-2 sm:pt-0 border-t border-white/[0.04] sm:border-0">
                          <div className="sm:text-right">
                            <span className="sm:hidden text-xs text-stone-400 font-mono mr-2">Tổng:</span>
                            <span className="font-mono text-sm font-semibold text-[#d4af37]">
                              {formatPrice(lineTotalUSD, lineTotalVND)}
                            </span>
                          </div>

                          <button
                            onClick={() => removeFromCart(entryId)}
                            className="p-2 text-stone-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10 cursor-pointer"
                            title="Xóa tuyệt tác này khỏi giỏ"
                          >
                            <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Bar: Action buttons */}
                <div className="p-4 sm:p-5 bg-black/30 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <Link
                    href="/products"
                    onClick={() => watchAudio.click()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-stone-300 hover:text-white text-xs font-mono transition-all cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />
                    <span>Tiếp Tục Chiêm Ngưỡng Bộ Sưu Tập</span>
                  </Link>

                  <button
                    onClick={() => setIsClearing(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-mono transition-all cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faRotateLeft} className="text-[10px]" />
                    <span>Dọn Sạch Giỏ Hàng</span>
                  </button>
                </div>
              </div>

              {/* Security & Warranty Note */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#09130e]/80 border border-white/[0.06] flex items-center gap-3">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-[#d4af37] text-lg" />
                  <div>
                    <div className="text-xs font-medium text-stone-200">100% Chính Hãng</div>
                    <div className="text-[10px] text-stone-400">Kiểm định chuẩn quốc tế</div>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#09130e]/80 border border-white/[0.06] flex items-center gap-3">
                  <FontAwesomeIcon icon={faTruck} className="text-[#00844e] text-lg" />
                  <div>
                    <div className="text-xs font-medium text-stone-200">Vận Chuyển An Toàn</div>
                    <div className="text-[10px] text-stone-400">Giao hàng toàn quốc</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Order Summary & Checkout (4 cols) */}
            <div className="lg:col-span-4 sticky top-28 space-y-4">
              <div className="rounded-2xl bg-[#09130e]/95 border border-[#d4af37]/25 p-6 backdrop-blur-xl shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <h2 className="font-serif text-lg font-normal text-stone-100 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCrown} className="text-[#d4af37] text-sm" />
                    <span>Tóm Tắt Đơn Hàng</span>
                  </h2>
                  <span className="text-[11px] font-mono text-stone-400">
                    {cart.reduce((s, i) => s + i.quantity, 0)} sản phẩm
                  </span>
                </div>

                {/* Calculation Breakdown */}
                <div className="space-y-2.5 pt-2 text-xs font-mono border-t border-white/[0.06]">
                  <div className="flex justify-between text-stone-400">
                    <span>Tạm tính giá trị:</span>
                    <span className="text-stone-200">{formatPrice(subtotalUSD, subtotalVND)}</span>
                  </div>

                  <div className="flex justify-between text-stone-400">
                    <span>Vận chuyển:</span>
                    <span className="text-emerald-400 font-semibold">MIỄN PHÍ</span>
                  </div>

                  <div className="flex justify-between text-stone-400">
                    <span>Bảo hiểm vận chuyển:</span>
                    <span className="text-emerald-400 font-semibold">100% GIÁ TRỊ</span>
                  </div>

                  <div className="flex justify-between items-baseline pt-3 border-t border-white/[0.08] text-base font-serif">
                    <span className="text-stone-100">Tổng Thanh Toán:</span>
                    <span className="text-xl font-mono font-bold text-[#d4af37]">
                      {formatPrice(subtotalUSD, subtotalVND)}
                    </span>
                  </div>
                </div>

                {/* Primary Checkout CTA */}
                <Link
                  href="/checkout"
                  onClick={() => watchAudio.click()}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c69f2e] to-[#b38f28] hover:from-[#e5c158] hover:to-[#c49f32] text-black font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-[#d4af37]/25 transition-all hover:scale-102 active:scale-98 cursor-pointer text-center"
                >
                  <FontAwesomeIcon icon={faShieldHalved} className="text-sm" />
                  <span>Tiến Hành Đặt Hàng</span>
                  <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </Link>

                <p className="text-[10px] text-center text-stone-500 font-mono leading-relaxed">
                  Đơn hàng được đóng gói niêm phong cẩn thận và giao tận tay Quý khách an toàn.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal: Clear Cart */}
      {isClearing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-sm w-full bg-[#0a1510] rounded-2xl p-6 border border-[#d4af37]/30 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <FontAwesomeIcon icon={faTrashCan} className="text-lg" />
            </div>
            <h3 className="font-serif text-lg text-white mb-1.5">
              Dọn Sạch Giỏ Hàng?
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed mb-6 font-light">
              Tất cả tuyệt tác đồng hồ hiện có trong giỏ hàng sẽ bị gỡ bỏ. Quý khách có chắc chắn muốn thực hiện?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsClearing(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-stone-300 transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmClear}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-mono font-semibold text-white transition-colors cursor-pointer"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
