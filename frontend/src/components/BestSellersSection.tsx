"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/axios";
import { mapDbProductToWatchItem } from "@/utils/productMapper";
import Image from "next/image";
import Link from "next/link";
import { WATCHES, WatchItem } from "@/data/watches";
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
} from "@fortawesome/free-solid-svg-icons";

export default function BestSellersSection() {
  const { setSelectedWatchModal, addToCart, setIsVipModalOpen, formatPrice } = useCart();

  const bestSellerIds = [
    "chrono-submariner-emerald",
    "chrono-royal-oak-emerald",
    "vacheron-overseas-dual-time-blue",
    "chrono-diamond-emerald-haute",
  ];

  const [dbWatches, setDbWatches] = useState<WatchItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get("/products?limit=4&status=active")
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          if (isMounted) setDbWatches(res.data.data.map(mapDbProductToWatchItem));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const bestSellers =
    dbWatches.length > 0
      ? dbWatches.slice(0, 4)
      : bestSellerIds
    .map((id) => WATCHES.find((w) => w.id === id))
    .filter((w): w is WatchItem => Boolean(w));

  return (
    <section id="best-sellers" className="py-28 bg-[#fbf9f5] dark:bg-[#050a07] relative overflow-hidden transition-colors duration-400">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-[#006039]/5 dark:bg-[#006039]/10 rounded-full blur-[200px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d4af37]/15 text-[#9a741e] dark:text-[#d4af37] text-xs font-mono tracking-[0.25em] uppercase font-semibold mb-3 border border-[#d4af37]/30">
              <FontAwesomeIcon icon={faFire} className="w-3 h-3 text-amber-500" />
              <span>Sản Phẩm Bán Chạy Nhất Tại Showroom</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground dark:text-white tracking-tight leading-tight">
              Những Cỗ Máy Được <span className="italic text-[#9a741e] dark:text-[#f3e3be]">Săn Đón Nhiều Nhất</span>
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground dark:text-white/60 leading-relaxed font-sans font-light">
              Được tuyển chọn từ danh mục của các nhà sưu tầm thượng lưu. Từng chiếc đồng hồ đều có sẵn giấy tờ chứng thực xuất xưởng và bảo hành chính hãng.
            </p>
          </div>

          <Link
            href="/products"
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-foreground/80 dark:text-white/80 hover:text-[#006039] dark:hover:text-[#d4af37] transition-colors cursor-pointer shrink-0 pb-1 border-b border-black/[0.15] dark:border-white/[0.15] hover:border-[#d4af37] font-semibold"
          >
            <span>Khám Phá Toàn Bộ Bộ Sưu Tập</span>
            <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5 text-[#9a741e] dark:text-[#d4af37]" />
          </Link>
        </div>

        {/* 4 Best Sellers Grid (Luxury Card Shadow, No Harsh White Border) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {bestSellers.map((watch, index) => (
            <div
              key={watch.id}
              className="luxury-card group rounded-3xl flex flex-col justify-between overflow-hidden"
            >
              {/* Image & Badges */}
              <div className="relative aspect-square w-full bg-black/[0.03] dark:bg-black/40 overflow-hidden p-6 flex items-center justify-center">
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
                  className="object-contain p-6 group-hover:scale-108 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />

                {/* Top Left: Bestseller Rank Badge */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#006039] text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-lg border border-emerald-500/40">
                  <FontAwesomeIcon icon={faFire} className="w-2.5 h-2.5 text-amber-300" />
                  <span>Top #{index + 1} Bán Chạy</span>
                </div>

                {/* Top Right: Brand Tag */}
                <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full bg-black/70 border border-white/[0.1] backdrop-blur-md text-[10px] font-mono text-[#d4af37] uppercase tracking-widest font-semibold">
                  {watch.brand}
                </div>

                {/* Link trực tiếp sang trang chi tiết sản phẩm */}
                <Link
                  href={`/products/${watch.id}`}
                  className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-mono uppercase tracking-wider backdrop-blur-xs cursor-pointer"
                >
                  <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Xem Chi Tiết Máy</span>
                </Link>
              </div>

              {/* Watch Details */}
              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground dark:text-white/40 mb-1.5">
                    <span>{watch.specs.diameter} • {watch.specs.movement}</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      <FontAwesomeIcon icon={faStar} className="w-3 h-3" />
                      <span className="font-bold">{watch.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <Link href={`/products/${watch.id}`}>
                    <h3 className="font-serif text-lg font-normal text-foreground dark:text-white group-hover:text-[#006039] dark:group-hover:text-[#a7f3d0] transition-colors cursor-pointer line-clamp-1">
                      {watch.name}
                    </h3>
                  </Link>

                  <p className="mt-2 text-xs text-muted-foreground dark:text-white/55 line-clamp-2 leading-relaxed font-sans font-light">
                    {watch.description}
                  </p>
                </div>

                {/* Price & Actions */}
                <div className="mt-6 pt-5 border-t border-black/[0.06] dark:border-white/[0.05]">
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground dark:text-white/40">
                      Giá Niêm Yết
                    </span>
                    <span className="font-serif text-xl font-normal text-[#9a741e] dark:text-[#d4af37]">
                      {formatPrice(watch.priceUSD, watch.priceVND)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        watchAudio.click();
                        addToCart(watch);
                      }}
                      className="px-3 py-2.5 rounded-full bg-[#006039] hover:bg-[#007847] text-white text-xs font-mono uppercase tracking-wider font-semibold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faBagShopping} className="w-3 h-3" />
                      <span>Thêm Giỏ</span>
                    </button>

                    <button
                      onClick={() => {
                        watchAudio.click();
                        setIsVipModalOpen(true);
                      }}
                      className="px-3 py-2.5 rounded-full border border-black/[0.12] dark:border-white/[0.12] hover:border-[#d4af37] text-foreground dark:text-white text-xs font-mono uppercase tracking-wider font-medium transition-all hover:bg-black/[0.03] dark:hover:bg-white/[0.04] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faCalendarCheck} className="w-3 h-3 text-[#9a741e] dark:text-[#d4af37]" />
                      <span>Thử Tay</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
