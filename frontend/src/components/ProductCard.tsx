"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WatchItem } from "@/data/watches";
import { useCart } from "@/context/CartContext";
import { watchAudio } from "@/utils/audio";
import RolexCrown from "./RolexCrown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faBagShopping,
  faEye,
  faArrowRight,
  faScaleBalanced,
  faCheck,
  faCrown,
  faShieldHalved,
  faStar,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";

interface ProductCardProps {
  watch: WatchItem;
  viewMode?: "grid" | "horizontal";
}

export default function ProductCard({

  // Hook router
 watch, viewMode = "grid" }: ProductCardProps) {
  const {
    formatPrice,
    addToCart,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    compareList,
    setSelectedWatchModal,
    setIsVipModalOpen,
  } = useCart();

  const isFavorited = isInWishlist(watch.id);
  const isCompared = compareList.some((w) => w.id === watch.id);

  const router = useRouter();
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    watchAudio.click();
    router.push(`/products/${watch.id}`);
  };

  /* =========================================================================
     1. HORIZONTAL DETAILED VIEW (1 DÒNG 1 SẢN PHẨM NHƯNG CHI TIẾT HƠN)
     ========================================================================= */
  if (viewMode === "horizontal") {
    return (
      <div className="luxury-card group rounded-3xl overflow-hidden flex flex-col lg:flex-row items-stretch w-full transition-all duration-400">
        {/* Left Column: Watch Media Showcase (~35% width) */}
        <div className="relative w-full lg:w-80 xl:w-96 min-h-[300px] lg:min-h-full bg-black/[0.03] dark:bg-black/40 flex items-center justify-center p-6 shrink-0 overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 bg-radial-[circle_at_center,_rgba(0,96,57,0.12)_0%,_transparent_70%] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* Watch Image */}
          <Link
            href={`/products/${watch.id}`}
            className="relative w-full h-64 lg:h-72 cursor-pointer transform group-hover:scale-108 transition-transform duration-700 ease-out block"
          >
            <Image
              src={watch.image}
              alt={watch.name}
              fill
              unoptimized
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.src.includes('submariner-emerald.jpg')) {
                  target.src = '/images/submariner-emerald.jpg';
                }
              }}
              sizes="(max-width: 1024px) 100vw, 380px"
              className="object-contain p-2"
            />
          </Link>

          {/* Top Left: Brand Coronet & Tag */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-black/70 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.1] shadow-xs">
            {watch.brand.toLowerCase().includes("rolex") ? (
              <RolexCrown className="w-3.5 h-3 text-[#9a741e] dark:text-[#d4af37]" />
            ) : (
              <FontAwesomeIcon icon={faCrown} className="w-3 h-3 text-[#9a741e] dark:text-[#d4af37]" />
            )}
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#006039] dark:text-[#a7f3d0]">
              {watch.tag}
            </span>
          </div>

          {/* Top Right: Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(watch.id);
            }}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 dark:bg-black/60 hover:scale-110 active:scale-95 border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center transition-all shadow-sm cursor-pointer"
            title="Thêm vào danh sách yêu thích"
            aria-label="Thêm vào yêu thích"
          >
            <FontAwesomeIcon
              icon={faHeart}
              className={`w-3.5 h-3.5 transition-colors ${
                isFavorited ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
              }`}
            />
          </button>

          {/* Bottom Center: Quick View Button */}
          <button
            onClick={handleQuickView}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-black/75 hover:bg-black text-white text-[11px] font-mono font-medium flex items-center gap-1.5 backdrop-blur-md opacity-90 group-hover:opacity-100 transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            <FontAwesomeIcon icon={faEye} className="w-3 h-3 text-[#d4af37]" />
            <span>Xem Nhanh 360°</span>
          </button>
        </div>

        {/* Center Column: Comprehensive Specs & Description (flex-1) */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between border-t lg:border-t-0 lg:border-r border-black/[0.06] dark:border-white/[0.06]">
          <div>
            {/* Brand, Series & Rating */}
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9a741e] dark:text-[#d4af37] font-semibold">
                {watch.brand} • {watch.series}
              </span>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-mono">
                <FontAwesomeIcon icon={faStar} className="w-3 h-3" />
                <span className="font-bold">{watch.rating.toFixed(1)}</span>
                <span className="text-muted-foreground dark:text-white/40 text-[10px]">({watch.reviewsCount} đánh giá)</span>
              </div>
            </div>

            {/* Model Name */}
            <Link href={`/products/${watch.id}`}>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-foreground dark:text-white hover:text-[#006039] dark:hover:text-[#a7f3d0] transition-colors cursor-pointer leading-snug">
                {watch.name}
              </h3>
            </Link>

            {/* Editorial Description */}
            <p className="text-xs text-muted-foreground dark:text-white/65 mt-2 line-clamp-2 leading-relaxed font-sans font-light">
              {watch.description}
            </p>

            {/* Extensive Horology Technical Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
              <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
                <span className="text-[9px] font-mono uppercase text-muted-foreground dark:text-white/40 block">Đường kính mặt</span>
                <span className="text-xs font-mono font-semibold text-foreground dark:text-white mt-0.5 block">{watch.specs.diameter}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
                <span className="text-[9px] font-mono uppercase text-muted-foreground dark:text-white/40 block">Bộ máy Calibre</span>
                <span className="text-xs font-mono font-semibold text-foreground dark:text-white mt-0.5 block truncate">{watch.specs.calibre}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
                <span className="text-[9px] font-mono uppercase text-muted-foreground dark:text-white/40 block">Dự trữ năng lượng</span>
                <span className="text-xs font-mono font-semibold text-foreground dark:text-white mt-0.5 block">{watch.specs.powerReserve}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
                <span className="text-[9px] font-mono uppercase text-muted-foreground dark:text-white/40 block">Chất liệu vỏ</span>
                <span className="text-xs font-mono font-semibold text-foreground dark:text-white mt-0.5 block truncate">{watch.specs.caseMaterial}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
                <span className="text-[9px] font-mono uppercase text-muted-foreground dark:text-white/40 block">Vành Bezel</span>
                <span className="text-xs font-mono font-semibold text-foreground dark:text-white mt-0.5 block truncate">{watch.specs.bezel.split(".")[0]}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.05]">
                <span className="text-[9px] font-mono uppercase text-muted-foreground dark:text-white/40 block">Chống nước</span>
                <span className="text-xs font-mono font-semibold text-foreground dark:text-white mt-0.5 block">{watch.specs.waterResistance.split("(")[0]}</span>
              </div>
            </div>
          </div>

          {/* Geneva Certification Badges */}
          <div className="mt-5 pt-3 border-t border-black/[0.04] dark:border-white/[0.04] flex flex-wrap items-center gap-4 text-[11px] font-mono text-muted-foreground dark:text-white/50">
            <span className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3 text-[#006039] dark:text-[#00844e]" />
              Bảo hành 5 năm toàn cầu
            </span>
            <span className="flex items-center gap-1.5">
              <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#9a741e] dark:text-[#d4af37]" />
              100% Nguyên bản Thụy Sĩ
            </span>
          </div>
        </div>

        {/* Right Column: Pricing & Purchase Call to Actions (shrink-0) */}
        <div className="p-6 sm:p-8 w-full lg:w-72 xl:w-80 flex flex-col justify-between bg-black/[0.01] dark:bg-white/[0.01] shrink-0">
          <div>
            {/* Availability Status */}
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#00844e] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#006039] dark:text-[#a7f3d0] font-semibold">
                Sẵn sàng tại Showroom
              </span>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] mb-5">
              <span className="text-[9px] font-mono uppercase text-muted-foreground dark:text-white/40 tracking-wider block">
                GIÁ NIÊM YẾT CHÍNH HÃNG
              </span>
              <div className="font-serif text-2xl font-normal text-[#9a741e] dark:text-[#d4af37] mt-1">
                {formatPrice(watch.priceUSD, watch.priceVND)}
              </div>
              <span className="text-[10px] font-mono text-muted-foreground dark:text-white/40 block mt-0.5">
                ${watch.priceUSD.toLocaleString()} USD (Đã gồm VAT)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {/* Primary Add to Cart */}
            <button
              onClick={() => addToCart(watch)}
              className="w-full py-3 rounded-xl bg-[#006039] hover:bg-[#007847] text-white font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faBagShopping} className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Mua Ngay</span>
            </button>

            {/* Secondary Buttons Row */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => toggleCompare(watch)}
                className={`py-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-mono transition-all cursor-pointer ${
                  isCompared
                    ? "bg-[#d4af37] text-black border-[#d4af37] font-semibold"
                    : "border-black/[0.1] dark:border-white/[0.1] text-foreground dark:text-white hover:border-[#d4af37]"
                }`}
              >
                <FontAwesomeIcon icon={isCompared ? faCheck : faScaleBalanced} className="w-3 h-3" />
                <span>{isCompared ? "Đã So Sánh" : "So Sánh"}</span>
              </button>

              <button
                onClick={() => {
                  watchAudio.click();
                  setIsVipModalOpen(true);
                }}
                className="py-2.5 rounded-xl border border-black/[0.1] dark:border-white/[0.1] hover:border-[#d4af37] text-foreground dark:text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
              >
                <FontAwesomeIcon icon={faCalendarCheck} className="w-3 h-3 text-[#9a741e] dark:text-[#d4af37]" />
                <span>Thử Tay VIP</span>
              </button>
            </div>

            {/* View Full Product Link */}
            <Link
              href={`/products/${watch.id}`}
              className="w-full py-2 flex items-center justify-center gap-1.5 text-[11px] font-mono text-muted-foreground dark:text-white/60 hover:text-[#006039] dark:hover:text-[#d4af37] transition-colors"
            >
              <span>Xem trang thông số đầy đủ</span>
              <FontAwesomeIcon icon={faArrowRight} className="w-2.5 h-2.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     2. GRID VIEW (1 DÒNG 3 SẢN PHẨM) - REWORKED CHỐNG VỠ & ĐẨY LAYOUT
     ========================================================================= */
  return (
    <div className="luxury-card group rounded-3xl overflow-hidden flex flex-col justify-between h-full transition-all duration-400">
      {/* Top Media Showcase */}
      <div className="relative w-full aspect-square bg-black/[0.03] dark:bg-black/40 overflow-hidden flex items-center justify-center p-6 shrink-0">
        {/* Subtle Ambient Hover Glow */}
        <div className="absolute inset-0 bg-radial-[circle_at_center,_rgba(0,96,57,0.12)_0%,_transparent_70%] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Watch Image with Link */}
        <Link
          href={`/products/${watch.id}`}
          className="relative w-full h-full cursor-pointer transform group-hover:scale-108 transition-transform duration-700 ease-out block"
        >
          <Image
            src={watch.image}
            alt={watch.name}
            fill
            unoptimized
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (!target.src.includes('submariner-emerald.jpg')) {
                target.src = '/images/submariner-emerald.jpg';
              }
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-2"
          />
        </Link>

        {/* Brand Coronet & Tag */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-black/70 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.1] shadow-xs">
          {watch.brand.toLowerCase().includes("rolex") ? (
            <RolexCrown className="w-3.5 h-3 text-[#9a741e] dark:text-[#d4af37]" />
          ) : (
            <FontAwesomeIcon icon={faCrown} className="w-3 h-3 text-[#9a741e] dark:text-[#d4af37]" />
          )}
          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#006039] dark:text-[#a7f3d0]">
            {watch.tag}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(watch.id);
          }}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 dark:bg-black/60 hover:scale-110 active:scale-95 border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center transition-all shadow-sm cursor-pointer"
          title="Thêm vào danh sách yêu thích"
          aria-label="Thêm vào yêu thích"
        >
          <FontAwesomeIcon
            icon={faHeart}
            className={`w-3.5 h-3.5 transition-colors ${
              isFavorited ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
            }`}
          />
        </button>

        {/* Action Buttons on Hover */}
        <div className="absolute bottom-4 inset-x-4 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10 pointer-events-auto">
          <Link
            href={`/products/${watch.id}`}
            className="px-3.5 py-2 rounded-full bg-[#006039] hover:bg-[#007a48] text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-xl border border-emerald-500/30 transition-colors cursor-pointer"
          >
            <span>Trang Chi Tiết</span>
            <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 text-[#d4af37]" />
          </Link>

          <button
            onClick={handleQuickView}
            className="px-3 py-2 rounded-full bg-black/80 hover:bg-black text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-xl border border-white/[0.1] transition-colors cursor-pointer"
            title="Xem nhanh thông số"
          >
            <FontAwesomeIcon icon={faEye} className="w-3 h-3 text-[#d4af37]" />
          </button>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          {/* Series & Brand */}
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9a741e] dark:text-[#d4af37] font-semibold mb-1">
            {watch.brand} • {watch.series}
          </div>

          {/* Model Name */}
          <Link href={`/products/${watch.id}`}>
            <h3 className="font-serif text-lg font-normal text-foreground dark:text-white hover:text-[#006039] dark:hover:text-[#a7f3d0] transition-colors cursor-pointer line-clamp-1 leading-snug">
              {watch.name}
            </h3>
          </Link>

          {/* Short Specs Material */}
          <p className="text-xs text-muted-foreground dark:text-white/55 mt-1.5 line-clamp-2 leading-relaxed font-sans font-light">
            {watch.specs.caseMaterial}. {watch.specs.bezel.split(".")[0]}.
          </p>

          {/* Specs Highlights Pills */}
          <div className="flex flex-wrap gap-1.5 mt-3.5 pt-3 border-t border-black/[0.05] dark:border-white/[0.05] text-[10px] font-mono text-muted-foreground dark:text-white/60">
            <span className="px-2 py-0.5 rounded-md bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06]">
              {watch.specs.diameter}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06]">
              {watch.specs.powerReserve}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06]">
              {watch.specs.waterResistance.split("(")[0]}
            </span>
          </div>
        </div>

        {/* Bottom Price & Purchase Block - CHỐNG ĐẨY/VỠ BỐ CỤC */}
        <div className="mt-5 pt-4 border-t border-black/[0.06] dark:border-white/[0.05] space-y-3">
          {/* Price Row: Luôn hiển thị đầy đủ, không bị chèn ép */}
          <div className="flex items-baseline justify-between">
            <span className="text-[9px] font-mono uppercase text-muted-foreground dark:text-white/40 tracking-wider">
              GIÁ NIÊM YẾT
            </span>
            <span className="font-serif text-lg sm:text-xl font-normal text-[#9a741e] dark:text-[#d4af37]">
              {formatPrice(watch.priceUSD, watch.priceVND)}
            </span>
          </div>

          {/* Actions Row: Cân đối và cố định kích thước, không bị rớt dòng */}
          <div className="flex items-center gap-2">
            {/* Compare Button */}
            <button
              onClick={() => toggleCompare(watch)}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                isCompared
                  ? "bg-[#d4af37] text-black border-[#d4af37]"
                  : "bg-black/[0.03] dark:bg-white/[0.04] border-black/[0.08] dark:border-white/[0.08] text-muted-foreground dark:text-white/60 hover:text-foreground dark:hover:text-white"
              }`}
              title={isCompared ? "Đã thêm vào so sánh" : "So sánh với mẫu khác"}
              aria-label="So sánh"
            >
              <FontAwesomeIcon icon={isCompared ? faCheck : faScaleBalanced} className="w-3.5 h-3.5" />
            </button>

            {/* Add to Cart / Purchase Button */}
            <button
              onClick={() => addToCart(watch)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#006039] hover:bg-[#007345] text-white font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <FontAwesomeIcon icon={faBagShopping} className="w-3 h-3 text-[#d4af37]" />
              <span>Mua Ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
