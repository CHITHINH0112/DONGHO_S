"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { WATCHES, WatchItem, WatchVariant } from "@/data/watches";
import { useCart } from "@/context/CartContext";
import { watchAudio } from "@/utils/audio";
import RolexCrown from "@/components/RolexCrown";
import ProductCard from "@/components/ProductCard";
import { mapDbProductToWatchItem } from "@/utils/productMapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faHeart,
  faScaleBalanced,
  faBagShopping,
  faCalendarCheck,
  faShieldHalved,
  faTruck,
  faAward,
  faGem,
  faRing,
  faMinus,
  faPlus,
  faCheck,
  faCrown,
  faClock,
  faCircleCheck,
  faShareNodes,
  faMagnifyingGlassPlus,
  faWandMagicSparkles,
  faBoxOpen,
  faFingerprint,
  faHandSparkles,
  faWineGlass,
  faCompass,
  faBolt,
  faLayerGroup,
  faCheckDouble,
  faCircleInfo,
  faListUl,
  faGear,
  faTag,
  faDroplet,
  faSliders,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";

interface ProductDetailViewProps {
  watch: WatchItem;
}

export default function ProductDetailView({ watch }: ProductDetailViewProps) {
  const {
    formatPrice,
    addToCart,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    compareList,
    setIsVipModalOpen,
  } = useCart();

  const [quantity, setQuantity] = useState(1);
  const variants = useMemo(() => watch.variants || [], [watch]);
  const [selectedVariant, setSelectedVariant] = useState<WatchVariant | null>(
    variants.length > 0 ? variants[0] : null
  );
  const [activeImage, setActiveImage] = useState<string>(() => {
    if (variants.length > 0 && variants[0].images && variants[0].images.length > 0) {
      return variants[0].images[0];
    }
    return watch.image;
  });
  const [isCopied, setIsCopied] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Gallery array
  // Đồng bộ phiên bản và ảnh khi thay đổi sản phẩm
  useEffect(() => {
    if (watch.variants && watch.variants.length > 0) {
      setSelectedVariant(watch.variants[0]);
      setActiveImage(watch.variants[0].images?.[0] || watch.image);
    } else {
      setSelectedVariant(null);
      setActiveImage(watch.image);
    }
  }, [watch?.id]);

  // Các giá trị đồng bộ theo biến thể đang chọn
  const currentPriceVND = selectedVariant ? selectedVariant.priceVND : watch.priceVND;
  const currentPriceUSD = selectedVariant ? selectedVariant.priceUSD : watch.priceUSD;
  const currentSku = selectedVariant ? selectedVariant.sku : `BRU-${watch.id}`;
  const currentStrap = watch.specs.strap;
  const currentDial = selectedVariant?.mauMatSo || 'Mặt Số Cổ Điển';
  const currentStock = selectedVariant ? selectedVariant.stockCount : 5;

  const handleSelectVariant = (v: WatchVariant) => {
    watchAudio.tick();
    setSelectedVariant(v);
    if (v.images && v.images.length > 0) {
      setActiveImage(v.images[0]);
    } else {
      setActiveImage(watch.image);
    }
  };

  const gallery = useMemo(() => {
    // Khi chọn biến thể: chỉ hiển thị hình biến thể đó thôi (không kèm ảnh đại diện product)
    if (selectedVariant && Array.isArray(selectedVariant.images) && selectedVariant.images.length > 0) {
      return Array.from(new Set(selectedVariant.images));
    }
    const combined = [
      watch.image,
      ...(watch.gallery || []),
    ].filter(Boolean);
    return Array.from(new Set(combined));
  }, [watch, selectedVariant]);

  const isFavorited = isInWishlist(watch.id);
  const isCompared = compareList.some((w) => w.id === watch.id);

  // Tải danh sách sản phẩm động từ API phục vụ gợi ý liên quan
  const [dbRelatedWatches, setDbRelatedWatches] = useState<WatchItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchRelated = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000';
        const res = await fetch(`${backendUrl}/api/v1/products?limit=24&status=active`);
        if (res.ok) {
          const json = await res.json();
          if (json?.success && Array.isArray(json?.data)) {
            const mapped = json.data
              .map(mapDbProductToWatchItem)
              .filter((w: WatchItem) => String(w.id) !== String(watch.id));
            if (isMounted && mapped.length > 0) {
              setDbRelatedWatches(mapped);
            }
          }
        }
      } catch (err) {
        // Fallback to static mock watches
      }
    };
    fetchRelated();
    return () => { isMounted = false; };
  }, [watch.id]);

  // Gợi ý các sản phẩm có sự liên quan về hãng hoặc mức giá ngang nhau
  const relatedWatches = useMemo(() => {
    // Chỉ gợi ý sản phẩm thực tế trong Database
    const pool = dbRelatedWatches;

    const targetPrice = currentPriceVND || watch.priceVND || 0;
    const targetBrand = (watch.brand || '').toLowerCase().trim();

    // Tính điểm ưu tiên: cùng hãng (-2 điểm), chênh lệch giá nhỏ nhất (+ tỉ lệ chênh lệch)
    const scored = pool.map((item) => {
      const isSameBrand = (item.brand || '').toLowerCase().trim() === targetBrand;
      const priceDiff = Math.abs((item.priceVND || 0) - targetPrice);
      const priceRatio = targetPrice > 0 ? priceDiff / targetPrice : 1;
      const score = (isSameBrand ? -2.0 : 0) + priceRatio;
      return { item, score };
    });

    scored.sort((a, b) => a.score - b.score);
    return scored.slice(0, 3).map((s) => s.item);
  }, [watch, dbRelatedWatches, currentPriceVND]);

  // Handle sticky action bar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 550);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = () => {
    addToCart(watch, quantity, selectedVariant);
  };

  const handleShare = () => {
    watchAudio.click();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="w-full bg-background text-foreground transition-colors duration-400 selection:bg-[#d4af37] selection:text-black">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-28 pb-4">
        <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Link href="/" className="hover:text-[#d4af37] transition-colors">
            Trang Chủ
          </Link>
          <FontAwesomeIcon icon={faChevronRight} className="w-2.5 h-2.5 text-muted-foreground/60" />
          <Link href="/products" className="hover:text-[#d4af37] transition-colors">
            Bộ Sưu Tập
          </Link>
          <FontAwesomeIcon icon={faChevronRight} className="w-2.5 h-2.5 text-muted-foreground/60" />
          <Link
            href={`/products?brand=${encodeURIComponent(watch.brand)}`}
            className="hover:text-[#d4af37] transition-colors"
          >
            {watch.brand}
          </Link>
          <FontAwesomeIcon icon={faChevronRight} className="w-2.5 h-2.5 text-muted-foreground/60" />
          <span className="text-[#d4af37] truncate max-w-xs">{watch.name}</span>
        </nav>
      </div>

      {/* Hero Showcase Section: Imagery & Purchase Controls */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 mt-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left: Product Imagery, Macro Inspection & Gallery (6 Cols) */}
          <div className="lg:col-span-6 space-y-5">
            {/* Main Stage with Interactive Macro Zoom */}
            <div
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
              className="relative aspect-square rounded-3xl bg-card border border-[#d4af37]/30 overflow-hidden flex items-center justify-center p-8 sm:p-12 shadow-2xl group cursor-crosshair"
            >
              {/* Luxury Ambient Halo Glow */}
              <div className="absolute inset-0 bg-radial-[circle_at_center,_rgba(0,96,57,0.15)_0%,_transparent_75%] pointer-events-none" />

              {/* Shimmer Light Reflection Sweep */}
              <div className="absolute inset-0 animate-shimmer pointer-events-none" />

              {/* Regular Image */}
              <div
                className={`relative w-full h-full transition-transform duration-300 ${isZooming ? "opacity-0" : "opacity-100"
                  }`}
              >
                <Image
                  src={activeImage}
                  alt={watch.name}
                  fill
                  priority
                  unoptimized
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.src.includes('submariner-emerald.jpg')) {
                      target.src = '/images/submariner-emerald.jpg';
                    }
                  }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)]"
                />
              </div>

              {/* Macro Zoom View (2x Magnification) */}
              {isZooming && (
                <div
                  className="absolute inset-0 bg-no-repeat transition-opacity duration-200 pointer-events-none"
                  style={{
                    backgroundImage: `url(${activeImage})`,
                    backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                    backgroundSize: "220%",
                  }}
                />
              )}

              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2 z-10 pointer-events-none">
                <span className="px-3.5 py-1 text-xs font-mono font-bold rounded-full bg-[#006039] text-white shadow-md border border-emerald-400/30">
                  {watch.tag}
                </span>
                {watch.isLimited && (
                  <span className="px-3.5 py-1 text-xs font-mono font-bold rounded-full bg-gradient-to-r from-[#d4af37] to-[#b38f28] text-black shadow-md flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faGem} className="w-3 h-3" /> Phiên Bản Giới Hạn Toàn Cầu
                  </span>
                )}
              </div>

              {/* Zoom Instruction Hint & Share Button */}
              <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between z-10 pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-[#d4af37] border border-[#d4af37]/30 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faMagnifyingGlassPlus} className="w-3 h-3" />
                  Rê chuột để soi kính lúp vi cơ khí 2x
                </span>

                <button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full bg-black/70 hover:bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-zinc-300 hover:text-[#d4af37] transition-all pointer-events-auto cursor-pointer"
                  title="Sao chép liên kết kiệt tác"
                  aria-label="Chia sẻ liên kết"
                >
                  <FontAwesomeIcon icon={isCopied ? faCheck : faShareNodes} className="w-4 h-4 text-[#d4af37]" />
                </button>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {gallery.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span className="uppercase tracking-wider text-[11px] text-[#d4af37] font-semibold flex items-center gap-1.5">
                    <span>Bộ Sưu Tập Góc Chụp</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] text-[10px]">
                      {gallery.length} ảnh
                    </span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-light">
                    Nhấp vào ảnh để soi chi tiết
                  </span>
                </div>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        watchAudio.tick();
                        setActiveImage(img);
                      }}
                      className={`relative w-22 h-22 rounded-2xl bg-card overflow-hidden border p-1 transition-all cursor-pointer shrink-0 ${activeImage === img
                        ? "border-[#d4af37] ring-2 ring-[#d4af37]/40 scale-105 shadow-md"
                        : "border-border hover:border-[#d4af37]/50 opacity-70 hover:opacity-100"
                        }`}
                    >
                      <Image
                        src={img}
                        alt={`${watch.name} góc ${idx + 1}`}
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
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Specifications & Purchasing Controls (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Brand and Series */}
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.25em] text-[#d4af37]">
              <span className="flex items-center gap-2">
                {watch.brand.toLowerCase().includes("rolex") ? (
                  <RolexCrown className="w-4 h-3.5 text-[#d4af37]" />
                ) : (
                  <FontAwesomeIcon icon={faCrown} className="w-3.5 h-3 text-[#d4af37]" />
                )}
                {watch.brand}
              </span>
              <span className="text-muted-foreground font-light">{watch.series}</span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground leading-tight">
              {watch.name}
            </h1>

            {/* Price Box */}
            <div className="p-6 rounded-3xl bg-card border border-[#d4af37]/30 shadow-xl flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground block tracking-wider mb-1">
                  GIÁ NIÊM YẾT CHÍNH THỨC TOÀN CẦU
                </span>
                <div className="font-serif text-3xl sm:text-4xl font-normal text-[#d4af37]">
                  {formatPrice(currentPriceUSD, currentPriceVND)}
                </div>
              </div>
              <div className="text-right text-xs font-mono text-muted-foreground">
                {currentStock > 0 ? (
                  <span className="text-emerald-500 dark:text-emerald-400 flex items-center sm:justify-end gap-1.5 font-semibold">
                    <FontAwesomeIcon icon={faCircleCheck} className="w-3.5 h-3.5" /> Sẵn Sàng Bàn Giao ({currentStock} chiếc)
                  </span>
                ) : (
                  <span className="text-amber-500 dark:text-amber-400 flex items-center sm:justify-end gap-1.5 font-semibold">
                    <FontAwesomeIcon icon={faClock} className="w-3.5 h-3.5" /> Chế Tác Theo Đơn Đặt Hàng
                  </span>
                )}
                <span className="text-[11px] block mt-0.5">
                  Mã SKU: <span className="text-foreground font-semibold">{currentSku}</span>
                </span>
              </div>
            </div>

            {/* Phiên Bản Chế Tác (Variants Selector) */}
            {variants.length > 0 && (
              <div className="space-y-3 p-5 rounded-3xl bg-black/[0.02] dark:bg-white/[0.02] border border-[#d4af37]/25 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#d4af37] font-semibold flex items-center gap-2">
                    <FontAwesomeIcon icon={faLayerGroup} className="w-3.5 h-3.5" />
                    <span>Phiên Bản Chế Tác ({variants.length} Tùy Chọn)</span>
                  </span>
                  {selectedVariant && (
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Đã chọn: <span className="text-[#d4af37] font-semibold">{selectedVariant.mauMatSo}</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectVariant(v)}
                        className={`relative p-3.5 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3.5 cursor-pointer ${isSelected
                          ? "bg-[#d4af37]/15 border-[#d4af37] ring-1 ring-[#d4af37]/40 shadow-md"
                          : "bg-card/70 border-border/80 hover:border-[#d4af37]/50 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                          }`}
                      >
                        <div className="relative w-12 h-12 rounded-xl bg-black/40 border border-white/[0.08] overflow-hidden shrink-0">
                          <Image
                            src={v.images?.[0] || watch.image}
                            alt={v.mauMatSo || watch.name}
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

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-serif text-xs font-semibold text-foreground truncate">
                              {v.mauMatSo || 'Mặt Số Cổ Điển'}
                            </h4>
                            {isSelected && (
                              <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate font-sans">
                            {v.sku}
                          </p>
                          <div className="text-xs font-mono font-bold text-[#d4af37] mt-0.5">
                            {formatPrice(v.priceUSD, v.priceVND)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}


            {/* Khung Riêng: Mô Tả Sản Phẩm */}
            {watch.description && (
              <div className="p-5 rounded-2xl bg-card border border-[#d4af37]/25 shadow-sm space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#d4af37] font-semibold pb-2 border-b border-border/40">
                  <FontAwesomeIcon icon={faCircleInfo} className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Mô Tả Sản Phẩm</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-light leading-relaxed font-sans whitespace-pre-line">
                  {watch.description}
                </p>
              </div>
            )}

            {/* Khung Riêng: Các Tính Năng Của Sản Phẩm */}
            {((watch.features && watch.features.length > 0) || (watch.highlights && watch.highlights.length > 0)) && (
              <div className="p-5 rounded-2xl bg-card border border-[#d4af37]/25 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#d4af37] font-semibold pb-2 border-b border-border/40">
                  <FontAwesomeIcon icon={faWandMagicSparkles} className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Các Tính Năng Của Sản Phẩm</span>
                </div>

                {/* Badges tính năng */}
                {watch.features && watch.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {watch.features.map((feat) => (
                      <span
                        key={feat.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400 font-medium"
                      >
                        <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-emerald-400" />
                        <span>{feat.name}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Điểm nhấn sản phẩm */}
                {watch.highlights && watch.highlights.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {watch.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-foreground/90">
                        <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-[#d4af37] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}


            {/* Bảng Tóm Tắt Thông Số Cốt Lõi (Quick Specs Table) */}
            <div className="rounded-2xl bg-black/[0.02] dark:bg-[#070e0a]/80 border border-[#d4af37]/25 overflow-hidden shadow-sm">
              <div className="px-4 py-2.5 bg-black/[0.04] dark:bg-white/[0.02] border-b border-[#d4af37]/20 flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#d4af37] font-semibold flex items-center gap-2">
                  <FontAwesomeIcon icon={faSliders} className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Bảng Thông Số Kỹ Thuật Nhanh</span>
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Chuẩn mực chế tác
                </span>
              </div>
              <div className="divide-y divide-white/[0.05] text-xs font-mono">
                <div className="flex items-center justify-between py-2 px-3.5 hover:bg-white/[0.02] transition-colors">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <FontAwesomeIcon icon={faTag} className="w-3 h-3 text-[#d4af37]/70" />
                    <span>Mã SKU / Phiên bản</span>
                  </span>
                  <span className="text-foreground font-semibold">{currentSku}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3.5 hover:bg-white/[0.02] transition-colors">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <FontAwesomeIcon icon={faCompass} className="w-3 h-3 text-[#d4af37]/70" />
                    <span>Đường kính & Bề dày</span>
                  </span>
                  <span className="text-foreground font-semibold">{watch.specs.diameter} • Dày {watch.specs.thickness}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3.5 hover:bg-white/[0.02] transition-colors">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <FontAwesomeIcon icon={faGem} className="w-3 h-3 text-[#d4af37]/70" />
                    <span>Chất Liệu Mặt Kính</span>
                  </span>
                  <span className="text-foreground font-semibold truncate max-w-[210px] text-right">{watch.specs.crystal}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3.5 hover:bg-white/[0.02] transition-colors">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <FontAwesomeIcon icon={faRing} className="w-3 h-3 text-[#d4af37]/70" />
                    <span>Chất Liệu Niềng (Bezel)</span>
                  </span>
                  <span className="text-foreground font-semibold truncate max-w-[210px] text-right">{watch.specs.bezel}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3.5 hover:bg-white/[0.02] transition-colors">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <FontAwesomeIcon icon={faFingerprint} className="w-3 h-3 text-[#d4af37]/70" />
                    <span>Chất Liệu Dây Đeo</span>
                  </span>
                  <span className="text-foreground font-semibold truncate max-w-[210px] text-right">{currentStrap}</span>

                </div>
                <div className="flex items-center justify-between py-2 px-3.5 hover:bg-white/[0.02] transition-colors">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <FontAwesomeIcon icon={faClock} className="w-3 h-3 text-[#d4af37]/70" />
                    <span>Cỗ Máy Vi Cơ Khí</span>
                  </span>
                  <span className="text-foreground font-semibold truncate max-w-[210px] text-right">{watch.specs.movement}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3.5 hover:bg-white/[0.02] transition-colors">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <FontAwesomeIcon icon={faDroplet} className="w-3 h-3 text-[#d4af37]/70" />
                    <span>Khả Năng Chống Nước</span>
                  </span>
                  <span className="text-foreground font-semibold">{watch.specs.waterResistance}</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3.5 hover:bg-white/[0.02] transition-colors">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3 text-emerald-400" />
                    <span>Bảo Hành </span>
                  </span>
                  <span className="text-emerald-400 font-semibold">{watch.warrantyMonths ? watch.warrantyMonths + ' Tháng' : "24 Tháng"} Chính Hãng</span>
                </div>
              </div>
            </div>
            {/* Actions & Quantity */}
            <div className="pt-4 border-t border-border space-y-3.5">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-[#d4af37]/30 rounded-2xl p-1 bg-black/[0.03] dark:bg-white/[0.03]">
                  <button
                    onClick={() => {
                      watchAudio.tick();
                      setQuantity(Math.max(1, quantity - 1));
                    }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 text-foreground transition-colors cursor-pointer"
                    aria-label="Giảm số lượng"
                  >
                    <FontAwesomeIcon icon={faMinus} className="w-3 h-3" />
                  </button>
                  <span className="w-12 text-center font-mono font-bold text-sm text-foreground">
                    {quantity}
                  </span>
                  <button
                    onClick={() => {
                      watchAudio.tick();
                      setQuantity(quantity + 1);
                    }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 text-foreground transition-colors cursor-pointer"
                    aria-label="Tăng số lượng"
                  >
                    <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#c69f2e] to-[#b38f28] hover:from-[#e5c158] hover:to-[#c49f32] text-black font-semibold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#d4af37]/25 active:scale-98 transition-all cursor-pointer"
                >
                  <FontAwesomeIcon icon={faBagShopping} className="w-4 h-4" />
                  <span>Thêm Vào Giỏ Hàng & Đặt Mua</span>
                </button>
              </div>
            </div>

            {/* Guarantees & Security Privileges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border text-center text-xs font-mono text-muted-foreground">
              <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-border">
                <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4 text-emerald-500 mx-auto mb-1.5 block" />
                <span className="text-[11px] block text-foreground font-medium">Bảo Hành {watch.warrantyMonths ? `${watch.warrantyMonths} Tháng` : "5 Năm"}</span>
                <span className="text-[9px] text-muted-foreground">Chứng chỉ quốc tế</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-border">
                <FontAwesomeIcon icon={faTruck} className="w-4 h-4 text-[#d4af37] mx-auto mb-1.5 block" />
                <span className="text-[11px] block text-foreground font-medium">Giao Hàng Tận Nơi</span>
                <span className="text-[9px] text-muted-foreground">An toàn & bảo mật</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-border">
                <FontAwesomeIcon icon={faAward} className="w-4 h-4 text-emerald-500 mx-auto mb-1.5 block" />
                <span className="text-[11px] block text-foreground font-medium">Chuẩn Thụy Sĩ</span>
                <span className="text-[9px] text-muted-foreground">Giám định COSC</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Related Watches Recommendations */}
      {relatedWatches.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 sm:px-12 py-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#d4af37] block mb-2">
                TUYỂN CHỌN TƯƠNG ĐỒNG
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-foreground">
                Những Kiệt Tác Cùng Phân Khúc
              </h3>
            </div>
            <Link
              href="/products"
              className="text-xs font-mono uppercase text-[#d4af37] hover:underline flex items-center gap-1.5"
            >
              <span>Xem Tất Cả Bộ Sưu Tập</span>
              <FontAwesomeIcon icon={faChevronRight} className="w-2.5 h-2.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
            {relatedWatches.map((w) => (
              <ProductCard key={w.id} watch={w} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Bottom Floating Action Bar on Scroll */}
      {showStickyBar && (
        <aside aria-label="Thanh mua hàng nhanh" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-4xl bg-card/95 backdrop-blur-2xl border border-[#d4af37]/35 px-5 sm:px-8 py-3.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4 animate-slideUp">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-11 h-11 rounded-xl bg-black/40 border border-border p-1 shrink-0 hidden sm:block">
              <Image
                src={selectedVariant?.images?.[0] || watch.image}
                alt={watch.name}
                fill
                unoptimized
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.src.includes('submariner-emerald.jpg')) {
                    target.src = '/images/submariner-emerald.jpg';
                  }
                }}
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-wider block">
                {watch.brand}
              </span>
              <h4 className="font-serif text-sm font-semibold text-foreground truncate max-w-[180px] sm:max-w-xs">
                {watch.name}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden md:block">
              <span className="text-[9px] font-mono uppercase text-muted-foreground block">Giá Niêm Yết</span>
              <span className="font-serif text-base font-bold text-[#d4af37]">
                {formatPrice(currentPriceUSD, currentPriceVND)}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b38f28] hover:from-[#e5c158] hover:to-[#c49f32] text-black font-semibold text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <FontAwesomeIcon icon={faBagShopping} className="w-3.5 h-3.5" />
              <span>Mua Ngay</span>
            </button>


          </div>
        </aside>
      )}
    </div>
  );
}
