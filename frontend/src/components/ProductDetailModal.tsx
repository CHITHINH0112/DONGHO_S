"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { watchAudio } from "@/utils/audio";
import { WatchVariant } from "@/data/watches";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faBagShopping,
  faCalendarCheck,
  faShieldHalved,
  faTruck,
  faAward,
  faGem,
  faHeart,
  faMinus,
  faPlus,
  faCheck,
  faSliders,
  faLayerGroup,
  faWandMagicSparkles,
  faCircleCheck,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";

export default function ProductDetailModal() {
  const {
    selectedWatchModal,
    setSelectedWatchModal,
    addToCart,
    formatPrice,
    toggleWishlist,
    isInWishlist,
    setIsVipModalOpen,
  } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<WatchVariant | null>(null);
  const [modalImage, setModalImage] = useState<string>("/images/submariner-emerald.jpg");

  useEffect(() => {
    if (selectedWatchModal) {
      if (selectedWatchModal.variants && selectedWatchModal.variants.length > 0) {
        setSelectedVariant(selectedWatchModal.variants[0]);
        setModalImage(selectedWatchModal.variants[0].images?.[0] || selectedWatchModal.image);
      } else {
        setSelectedVariant(null);
        setModalImage(selectedWatchModal.image);
      }
      setQuantity(1);
    }
  }, [selectedWatchModal]);

  if (!selectedWatchModal) return null;

  const watch = selectedWatchModal;
  const isFavorited = isInWishlist(watch.id);
  const variants = watch.variants || [];

  const currentPriceVND = selectedVariant ? selectedVariant.priceVND : watch.priceVND;
  const currentPriceUSD = selectedVariant ? selectedVariant.priceUSD : watch.priceUSD;
  const currentSku = selectedVariant ? selectedVariant.sku : `BRU-${watch.id}`;
  const currentStrap = watch.specs.strap;
  const currentStock = selectedVariant ? selectedVariant.stockCount : 5;

  const handleClose = () => {
    watchAudio.click();
    setSelectedWatchModal(null);
    setQuantity(1);
  };

  const handleSelectVariant = (v: WatchVariant) => {
    watchAudio.tick();
    setSelectedVariant(v);
    if (v.images && v.images.length > 0) {
      setModalImage(v.images[0]);
    }
  };

  const handleAddToCart = () => {
    addToCart(watch, quantity, selectedVariant);
    handleClose();
  };

  const handleVipBooking = () => {
    watchAudio.click();
    setSelectedWatchModal(null);
    setIsVipModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0d1217] rounded-3xl border border-[#d4af37]/25 shadow-2xl overflow-hidden my-8">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-[#d4af37]/20 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] transition-all hover:scale-105 cursor-pointer"
          aria-label="Đóng chi tiết"
        >
          <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Imagery */}
          <div className="relative aspect-square md:aspect-auto md:h-full bg-gradient-to-b from-white/[0.02] to-transparent p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-[#d4af37]/15">
            <div className="relative w-full h-80 md:h-[420px]">
              <Image
                src={modalImage}
                alt={watch.name}
                fill
                unoptimized
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.src.includes("submariner-emerald.jpg")) {
                    target.src = "/images/submariner-emerald.jpg";
                  }
                }}
                className="object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
                priority
              />
            </div>

            {/* Badges */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-[#1b3d2f] text-emerald-300 border border-emerald-500/30 shadow-md">
                {watch.tag}
              </span>
              {watch.isLimited && (
                <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-[#d4af37] text-black shadow-md flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faGem} className="w-3 h-3" /> Giới Hạn Toàn Cầu
                </span>
              )}
            </div>
          </div>

          {/* Right: Specifications & Purchasing Controls */}
          <div className="p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Brand and Series */}
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-[#d4af37]">
                <span>{watch.brand}</span>
                <span>{watch.series}</span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                {watch.name}
              </h2>

              {/* Features Tags */}
              {watch.features && watch.features.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {watch.features.map((feat) => (
                    <span
                      key={feat.id}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/25 text-[11px] font-mono"
                    >
                      <FontAwesomeIcon icon={faWandMagicSparkles} className="w-2.5 h-2.5 text-[#d4af37]" />
                      <span>{feat.name}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Price & SKU */}
              <div className="mt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 p-3.5 rounded-2xl bg-white/[0.02] border border-[#d4af37]/20">
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#d4af37]">
                    {formatPrice(currentPriceUSD, currentPriceVND)}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                    Đã bao gồm thuế hải quan & bảo hiểm chuyên dụng
                  </span>
                </div>
                <div className="text-right font-mono text-xs">
                  {currentStock > 0 ? (
                    <span className="text-emerald-400 font-semibold flex items-center sm:justify-end gap-1">
                      <FontAwesomeIcon icon={faCircleCheck} className="w-3 h-3" /> Sẵn sàng bàn giao ({currentStock} chiếc)
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold flex items-center sm:justify-end gap-1">
                      <FontAwesomeIcon icon={faClock} className="w-3 h-3" /> Nhận Chế Tác Riêng
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    Mã SKU: <span className="text-white font-semibold">{currentSku}</span>
                  </span>
                </div>
              </div>

              {/* Variant Selector (Nếu có) */}
              {variants.length > 0 && (
                <div className="mt-4 space-y-2 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#d4af37] flex items-center gap-1.5 font-semibold">
                    <FontAwesomeIcon icon={faLayerGroup} className="w-3 h-3" />
                    <span>Phiên Bản Chế Tác ({variants.length})</span>
                  </span>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleSelectVariant(v)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${isSelected
                              ? "bg-[#d4af37]/20 border-[#d4af37] ring-1 ring-[#d4af37]/50"
                              : "bg-black/30 border-white/[0.08] hover:border-[#d4af37]/40"
                            }`}
                        >
                          <div className="relative w-8 h-8 rounded-lg bg-black/40 overflow-hidden shrink-0 border border-white/10">
                            <Image
                              src={v.images?.[0] || watch.image}
                              alt={v.mauMatSo || watch.name}
                              fill
                              unoptimized
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                if (!target.src.includes("submariner-emerald.jpg")) {
                                  target.src = "/images/submariner-emerald.jpg";
                                }
                              }}
                              className="object-contain p-0.5"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-serif font-medium text-white truncate">
                                {v.mauMatSo}
                              </span>
                              {isSelected && (
                                <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#d4af37]" />
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-[#d4af37] block font-semibold">
                              {formatPrice(v.priceUSD, v.priceVND)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description */}
              <p className="mt-4 text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
                {watch.description}
              </p>

              {/* Highlights */}
              <div className="mt-4 space-y-1.5">
                {watch.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-200">
                    <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#d4af37] shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              {/* Bảng Thông Số Kỹ Thuật Gọn Gàng */}
              <div className="mt-5 border-t border-[#d4af37]/20 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-[#d4af37] font-semibold flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faSliders} className="w-3.5 h-3.5" />
                    <span>Bảng Quy Chuẩn Kỹ Thuật</span>
                  </h4>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Chuẩn Thụy Sĩ COSC
                  </span>
                </div>
                <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-white/[0.02]">
                  <table className="w-full text-left text-xs font-mono">
                    <tbody className="divide-y divide-white/[0.05]">
                      <tr className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2 px-3 text-zinc-400 w-2/5 font-sans">Kích Thước Thân Vỏ</td>
                        <td className="py-2 px-3 text-white font-bold">{watch.specs.diameter} (Dày {watch.specs.thickness})</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2 px-3 text-zinc-400 font-sans">Chất Liệu Mặt Kính</td>
                        <td className="py-2 px-3 text-white font-semibold truncate max-w-[200px]">{watch.specs.crystal}</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2 px-3 text-zinc-400 font-sans">Chất Liệu Niềng (Bezel)</td>
                        <td className="py-2 px-3 text-white font-semibold truncate max-w-[200px]">{watch.specs.bezel}</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2 px-3 text-zinc-400 font-sans">Chất Liệu Dây Đeo</td>
                        <td className="py-2 px-3 text-[#d4af37] font-bold truncate max-w-[200px]">{currentStrap}</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2 px-3 text-zinc-400 font-sans">Trái Tim Calibre</td>
                        <td className="py-2 px-3 text-white font-semibold">{watch.specs.calibre}</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2 px-3 text-zinc-400 font-sans">Độ Chịu Nước</td>
                        <td className="py-2 px-3 text-white font-bold">{watch.specs.waterResistance}</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2 px-3 text-zinc-400 font-sans">Thời Hạn Bảo Hành</td>
                        <td className="py-2 px-3 text-emerald-400 font-bold">{watch.warrantyMonths ? watch.warrantyMonths + ' Tháng' : "24 Tháng"} Chính Hãng</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-4 border-t border-[#d4af37]/15 flex flex-col gap-3">
              {/* Quantity and Actions */}
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-[#d4af37]/20 rounded-xl p-1 bg-white/[0.03]">
                  <button
                    onClick={() => {
                      watchAudio.tick();
                      setQuantity(Math.max(1, quantity - 1));
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-white cursor-pointer"
                    aria-label="Giảm số lượng"
                  >
                    <FontAwesomeIcon icon={faMinus} className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-sm text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => {
                      watchAudio.tick();
                      setQuantity(quantity + 1);
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-white cursor-pointer"
                    aria-label="Tăng số lượng"
                  >
                    <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38f28] hover:from-[#e5c158] hover:to-[#c49f32] text-black font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 active:scale-98 transition-all cursor-pointer"
                >
                  <FontAwesomeIcon icon={faBagShopping} className="w-4 h-4" />
                  <span>Thêm Vào Giỏ Hàng</span>
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => toggleWishlist(watch.id)}
                  className="w-12 h-12 rounded-xl border border-[#d4af37]/20 flex items-center justify-center hover:bg-rose-500/10 text-white transition-all cursor-pointer"
                  title="Yêu thích"
                  aria-label="Thêm vào yêu thích"
                >
                  <FontAwesomeIcon
                    icon={isFavorited ? faHeart : faHeartRegular}
                    className={`w-4 h-4 ${isFavorited ? "text-rose-500" : "text-zinc-400"
                      }`}
                  />
                </button>
              </div>

              {/* VIP Salon appointment */}
              <button
                onClick={handleVipBooking}
                className="w-full py-2.5 rounded-xl border border-[#d4af37]/30 hover:bg-[#d4af37]/10 text-[#d4af37] font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faCalendarCheck} className="w-3.5 h-3.5" />
                <span>Đặt Lịch Thử Đồng Hồ Trực Tiếp Tại VIP Salon</span>
              </button>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-zinc-400 pt-2">
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4 text-emerald-400 mb-1" />
                  <span>Bảo hành {watch.warrantyMonths ? `${watch.warrantyMonths} tháng` : "5 năm"}</span>
                </div>
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon icon={faTruck} className="w-4 h-4 text-[#d4af37] mb-1" />
                  <span>Xe bọc thép miễn phí</span>
                </div>
                <div className="flex flex-col items-center">
                  <FontAwesomeIcon icon={faAward} className="w-4 h-4 text-emerald-400 mb-1" />
                  <span>Chứng nhận Thụy Sĩ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
