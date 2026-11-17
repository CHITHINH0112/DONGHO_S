"use client";

import React, { useState, useEffect, useMemo } from "react";
import { apiClient } from "@/lib/axios";
import { mapDbProductToWatchItem } from "@/utils/productMapper";
import Image from "next/image";
import Link from "next/link";
import { WatchItem, WATCHES } from "@/data/watches";
import { useCart } from "@/context/CartContext";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFire,
  faStar,
  faEye,
  faBagShopping,
  faCalendarCheck,
  faArrowRight,
  faCrown,
  faShieldHalved,
  faGem,
  faAward,
  faBolt,
  faClock,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";

interface BrandTabItem {
  id: string;
  name: string;
  icon: any;
  quote?: string;
  country?: string;
}

const BRAND_METAS: Record<string, { icon: any; quote: string; country: string }> = {
  "rolex": {
    icon: faCrown,
    quote: "Biểu tượng vị thế đỉnh cao & độ bền bỉ cơ học vĩnh cửu",
    country: "Genève, Thụy Sĩ",
  },
  "rolex genève": {
    icon: faCrown,
    quote: "Biểu tượng vị thế đỉnh cao & độ bền bỉ cơ học vĩnh cửu",
    country: "Genève, Thụy Sĩ",
  },
  "patek philippe": {
    icon: faAward,
    quote: "Đế vương Haute Horlogerie - Gìn giữ di sản cho thế hệ mai sau",
    country: "Genève, Thụy Sĩ",
  },
  "audemars piguet": {
    icon: faBolt,
    quote: "Kỷ nguyên thể thao xa xỉ & vành bát giác Royal Oak huyền thoại",
    country: "Le Brassus, Thụy Sĩ",
  },
  "omega": {
    icon: faShieldHalved,
    quote: "Chinh phục không gian vũ trụ & đại dương với bộ thoát Co-Axial",
    country: "Biel / Bienne, Thụy Sĩ",
  },
  "cartier": {
    icon: faGem,
    quote: "Nhà kim hoàn của các bậc đế vương & hình khối Santos kinh điển",
    country: "Paris, Pháp",
  },
  "casio": {
    icon: faClock,
    quote: "Kỹ nghệ chế tác điện tử & cơ khí đa năng bền bỉ Nhật Bản",
    country: "Tokyo, Nhật Bản",
  },
};

export default function BestSellersSection() {
  const { addToCart, setIsVipModalOpen, formatPrice } = useCart();
  const [allWatches, setAllWatches] = useState<WatchItem[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get("/products?limit=20&status=active")
      .then((res) => {
        let dbList: WatchItem[] = [];
        if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          dbList = res.data.data.map(mapDbProductToWatchItem);
        }
        // Kết hợp sản phẩm DB với bộ sưu tập Flagship
        const combined = [
          ...dbList,
          ...WATCHES.filter((w) => !dbList.some((d) => d.name.toLowerCase() === w.name.toLowerCase())),
        ];
        if (isMounted) setAllWatches(combined);
      })
      .catch(() => {
        if (isMounted) setAllWatches(WATCHES);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Danh sách các thương hiệu có mặt trong kho
  const brandTabs = useMemo(() => {
    const brandMap = new Map<string, number>();
    allWatches.forEach((w) => {
      const b = w.brand || "Khác";
      brandMap.set(b, (brandMap.get(b) || 0) + 1);
    });

    const tabs: BrandTabItem[] = [
      { id: "all", name: "Tất Cả Tuyệt Tác", icon: faCrown },
    ];

    brandMap.forEach((count, name) => {
      const key = name.toLowerCase();
      const meta = BRAND_METAS[key] || {
        icon: faAward,
        quote: "Kiệt tác cơ khí đỉnh cao",
        country: "Thụy Sĩ",
      };
      tabs.push({
        id: name,
        name: `${name} (${count})`,
        icon: meta.icon,
        quote: meta.quote,
        country: meta.country,
      });
    });

    return tabs;
  }, [allWatches]);

  // Lọc sản phẩm theo thương hiệu đang chọn
  const displayedWatches = useMemo(() => {
    if (selectedBrand === "all") {
      return allWatches.slice(0, 8);
    }
    const cleanSelected = selectedBrand.toLowerCase();
    const filtered = allWatches.filter((w) => {
      const wb = (w.brand || "").toLowerCase();
      return wb.includes(cleanSelected) || cleanSelected.includes(wb);
    });
    return filtered.length > 0 ? filtered : allWatches.slice(0, 4);
  }, [selectedBrand, allWatches]);

  const activeMeta = selectedBrand !== "all" ? BRAND_METAS[selectedBrand.toLowerCase()] : null;

  return (
    <section id="best-sellers" className="py-20 sm:py-28 bg-[#050b07] relative overflow-hidden text-white selection:bg-[#006039] selection:text-white border-t border-b border-[#d4af37]/15">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#006039]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d4af37]/10 text-[#d4af37] text-xs font-mono tracking-[0.25em] uppercase font-semibold border border-[#d4af37]/30 shadow-sm">
              <FontAwesomeIcon icon={faCrown} className="w-3 h-3 text-[#d4af37]" />
              <span>Kiệt Tác Tuyển Chọn • Curated Masterpieces</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-stone-100 tracking-tight leading-tight">
              Những Tuyệt Tác <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f5d77f] to-[#b8952b]">Được Săn Đón Nhất</span>
            </h2>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-light font-sans max-w-xl">
              Tuyển tập những cỗ máy thời gian biểu tượng được phân loại theo từng thương hiệu danh tiếng. Mỗi cỗ máy đều đi kèm thẻ chứng thực quốc tế và hồ sơ xuất xưởng độc bản.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/#luxury-catalog"
              onClick={() => watchAudio.click()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-[#d4af37]/30 hover:border-[#d4af37] text-xs font-mono uppercase tracking-wider text-stone-200 hover:text-white transition-all cursor-pointer shadow-lg"
            >
              <span>Xem Toàn Bộ Danh Mục</span>
              <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 text-[#d4af37]" />
            </Link>
          </div>
        </div>

        {/* 1. BRAND NAVIGATION TABS (THEO DANH SÁCH HÃNG) */}
        <div className="relative border-b border-[#d4af37]/20 pb-4">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x">
            {brandTabs.map((tab) => {
              const isSelected =
                tab.id === "all"
                  ? selectedBrand === "all"
                  : selectedBrand.toLowerCase() === tab.id.toLowerCase();

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    watchAudio.tick();
                    setSelectedBrand(tab.id);
                  }}
                  className={`group relative shrink-0 snap-start px-4 sm:px-5 py-2.5 rounded-2xl border text-xs font-mono transition-all duration-300 flex items-center gap-2.5 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-[#006039]/40 via-[#0a2014] to-[#006039]/30 border-[#d4af37] text-[#d4af37] font-semibold shadow-md shadow-[#006039]/20 ring-1 ring-[#d4af37]/40"
                      : "bg-[#08120d] hover:bg-[#0c1a12] border-white/[0.08] hover:border-[#d4af37]/40 text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={tab.icon || faCrown}
                    className={`text-xs ${isSelected ? "text-[#d4af37]" : "text-stone-500 group-hover:text-[#d4af37]"}`}
                  />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Brand Quote Banner */}
          {activeMeta && (
            <div className="mt-3 text-xs font-mono text-stone-400 flex flex-wrap items-center gap-2 animate-fadeIn">
              <span className="text-[#d4af37] uppercase font-semibold tracking-wider">
                {selectedBrand}:
              </span>
              <span className="italic font-light text-stone-300">&ldquo;{activeMeta.quote}&rdquo;</span>
              <span className="text-stone-500">•</span>
              <span className="text-emerald-400 font-light">{activeMeta.country}</span>
            </div>
          )}
        </div>

        {/* 2. PRODUCT CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {displayedWatches.map((watch, index) => {
            const firstVariant = watch.variants?.[0];
            const watchImg = firstVariant?.images?.[0] || watch.image;
            const watchPriceVND = firstVariant?.priceVND || watch.priceVND;
            const watchPriceUSD = firstVariant?.priceUSD || watch.priceUSD;

            return (
              <div
                key={watch.id}
                className="group rounded-3xl bg-[#08120d]/90 border border-[#d4af37]/20 hover:border-[#d4af37]/60 transition-all duration-500 hover:shadow-2xl hover:shadow-[#d4af37]/15 flex flex-col justify-between overflow-hidden relative backdrop-blur-xl"
              >
                {/* Image Stage */}
                <div className="relative aspect-square w-full bg-gradient-to-b from-black/60 to-black/30 overflow-hidden p-6 flex items-center justify-center border-b border-white/[0.04]">
                  {/* Subtle radial light sweep */}
                  <div className="absolute inset-0 bg-radial-[circle_at_center,_rgba(212,175,55,0.08)_0%,_transparent_70%] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  {/* Top Left: Rank Badge */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006039]/80 backdrop-blur-md text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-lg border border-emerald-500/40">
                    <FontAwesomeIcon icon={faFire} className="w-2.5 h-2.5 text-amber-300" />
                    <span>Top #{index + 1} Bán Chạy</span>
                  </div>

                  {/* Top Right: Brand Tag */}
                  <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full bg-black/70 border border-[#d4af37]/30 backdrop-blur-md text-[10px] font-mono text-[#d4af37] uppercase tracking-widest font-semibold">
                    {watch.brand}
                  </div>

                  {/* Watch Image */}
                  <Image
                    src={watchImg}
                    alt={watch.name}
                    fill
                    unoptimized
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.src.includes("submariner-emerald.jpg")) {
                        target.src = "/images/submariner-emerald.jpg";
                      }
                    }}
                    className="object-contain p-6 group-hover:scale-108 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />

                  {/* Hover Quick Overlay */}
                  <Link
                    href={`/products/${watch.id}`}
                    onClick={() => watchAudio.click()}
                    className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 text-white text-xs font-mono uppercase tracking-wider backdrop-blur-xs cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Chiêm Ngưỡng Chi Tiết</span>
                  </Link>
                </div>

                {/* Watch Specs & Description */}
                <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
                      <span>{watch.specs.diameter} • {watch.specs.movement}</span>
                      <div className="flex items-center gap-1 text-amber-400">
                        <FontAwesomeIcon icon={faStar} className="w-2.5 h-2.5" />
                        <span className="font-semibold">{watch.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <Link href={`/products/${watch.id}`} onClick={() => watchAudio.click()}>
                      <h3 className="font-serif text-base sm:text-lg font-normal text-stone-100 group-hover:text-[#d4af37] transition-colors cursor-pointer line-clamp-1">
                        {watch.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed font-sans font-light">
                      {watch.description}
                    </p>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="pt-4 border-t border-white/[0.06] space-y-3.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500">
                        Giá Niêm Yết
                      </span>
                      <span className="font-serif text-lg sm:text-xl font-normal text-[#d4af37]">
                        {formatPrice(watchPriceUSD, watchPriceVND)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          watchAudio.click();
                          addToCart(watch, 1, firstVariant);
                        }}
                        className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c69f2e] to-[#b38f28] hover:from-[#e5c158] hover:to-[#c49f32] text-black text-xs font-mono uppercase tracking-wider font-bold transition-all shadow-lg shadow-[#d4af37]/20 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faBagShopping} className="w-3 h-3" />
                        <span>Thêm Giỏ</span>
                      </button>

                      <button
                        onClick={() => {
                          watchAudio.click();
                          setIsVipModalOpen(true);
                        }}
                        className="px-3 py-2.5 rounded-xl border border-white/[0.12] hover:border-[#d4af37] text-stone-200 hover:text-white text-xs font-mono uppercase tracking-wider font-medium transition-all hover:bg-white/[0.04] flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FontAwesomeIcon icon={faCalendarCheck} className="w-3 h-3 text-[#d4af37]" />
                        <span>Hẹn Thử Tay</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
