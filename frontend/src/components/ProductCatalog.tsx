"use client";

import React, { useState, useMemo, useEffect } from "react";
import { apiClient } from "@/lib/axios";
import { mapDbProductToWatchItem } from "@/utils/productMapper";
import Link from "next/link";
import { WATCHES, WatchItem } from "@/data/watches";
import ProductCard from "./ProductCard";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faFilter,
  faGem,
  faArrowRight,
  faTableCells,
  faTableList,
} from "@fortawesome/free-solid-svg-icons";

type CategoryFilter = "all" | "spotlight" | "dive" | "tourbillon" | "royal" | "chronograph" | "jewelry";
type BrandFilter = string;
type SortOption = "featured" | "price-desc" | "price-asc" | "rating";

export default function ProductCatalog() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [selectedBrand, setSelectedBrand] = useState<BrandFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "horizontal">("grid");
  const [dbWatches, setDbWatches] = useState<WatchItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get("/products?limit=50&status=active")
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

  const activeWatches = dbWatches.length > 0 ? dbWatches : WATCHES;

  const handleCategoryChange = (cat: CategoryFilter) => {
    watchAudio.tick();
    setSelectedCategory(cat);
  };

  const handleBrandChange = (brand: BrandFilter) => {
    watchAudio.tick();
    setSelectedBrand(brand);
  };

  const filteredWatches = useMemo(() => {
    return activeWatches.filter((w) => {
      const matchesCategory =
        selectedCategory === "all" || w.category === selectedCategory;
      const matchesBrand =
        selectedBrand === "all" || w.brand === selectedBrand;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.brand.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.specs.caseMaterial.toLowerCase().includes(q);

      return matchesCategory && matchesBrand && matchesSearch;
    }).sort((a, b) => {
      if (sortOption === "price-desc") return b.priceVND - a.priceVND;
      if (sortOption === "price-asc") return a.priceVND - b.priceVND;
      if (sortOption === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [selectedCategory, selectedBrand, searchQuery, sortOption, activeWatches]);

  const categories: { id: CategoryFilter; label: string }[] = [
    { id: "all", label: "Tất Cả Các Dòng" },
    { id: "spotlight", label: "Datejust 41 (Mô Hình 3D)" },
    { id: "dive", label: "Submariner Date (Lặn Biển)" },
    { id: "tourbillon", label: "Tourbillon Squelette" },
    { id: "royal", label: "Royal Tapisserie" },
    { id: "chronograph", label: "British Racing Chrono" },
    { id: "jewelry", label: "Haute Joaillerie Kim Cương" },
  ];

  const brands: { id: BrandFilter; label: string }[] = [
    { id: "all", label: "Tất Cả Thương Hiệu" },
    { id: "Rolex Genève", label: "Rolex" },
    { id: "Audemars & Piguet", label: "Audemars Piguet" },
    { id: "Patek & Philippe", label: "Patek Philippe" },
    { id: "Aurélien Genève", label: "Aurélien Genève" },
    { id: "Verdant Horology", label: "Verdant" },
  ];

  return (
    <section id="luxury-catalog" className="py-28 bg-[#fbf9f5] dark:bg-[#070e0a] relative transition-colors duration-400">
      <span id="rolex-models" className="absolute -top-20" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        {/* Multi-Brand Catalog Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#006039]/10 dark:bg-[#006039]/20 border border-[#006039]/30 dark:border-[#006039]/40 text-[#006039] dark:text-[#a7f3d0] text-xs font-mono tracking-widest uppercase font-semibold mb-3">
            <FontAwesomeIcon icon={faGem} className="w-3 h-3 text-[#9a741e] dark:text-[#d4af37]" />
            <span>DANH MỤC ĐỒNG HỒ ĐA THƯƠNG HIỆU CHÍNH HÃNG</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground dark:text-white mt-1.5 leading-tight">
            Bộ Sưu Tập Tuyệt Tác <span className="italic text-[#9a741e] dark:text-[#f3e3be]">Thụy Sĩ</span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground dark:text-white/60 leading-relaxed font-sans font-light">
            Mỗi chiếc đồng hồ là một biểu tượng của sự hoàn hảo cơ học từ Rolex, Audemars Piguet, Patek Philippe. Đầy đủ giấy tờ khai sinh quốc tế và bảo hành toàn cầu 5 năm.
          </p>
        </div>

        {/* Brand Filter Tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground dark:text-white/40 shrink-0 flex items-center gap-1.5 mr-1 font-semibold">
              <FontAwesomeIcon icon={faFilter} className="w-2.5 h-2.5 text-[#9a741e] dark:text-[#d4af37]" />
              Hãng:
            </span>
            {brands.map((b) => {
              const isActive = selectedBrand === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => handleBrandChange(b.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-gradient-to-r from-[#d4af37] via-[#c69f2e] to-[#b38f28] text-black font-bold shadow-md"
                      : "bg-black/[0.03] dark:bg-white/[0.03] hover:bg-black/[0.06] dark:hover:bg-white/[0.07] border border-black/[0.06] dark:border-white/[0.06] text-foreground/70 dark:text-white/70"
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Tabs, Search & View Mode Switcher */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-8 mb-10 border-b border-black/[0.06] dark:border-white/[0.06]">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {categories.map((c) => {
              const isActive = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleCategoryChange(c.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[#006039] text-white font-semibold shadow-md"
                      : "bg-black/[0.03] dark:bg-white/[0.03] hover:bg-black/[0.06] dark:hover:bg-white/[0.07] border border-black/[0.06] dark:border-white/[0.06] text-muted-foreground dark:text-white/60"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Search, Sort & View Mode Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* View Mode Switcher: 1 dòng 3 sản phẩm vs 1 dòng 1 sản phẩm */}
            <div className="flex items-center p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08]">
              <button
                onClick={() => {
                  watchAudio.tick();
                  setViewMode("grid");
                }}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-mono transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#006039] text-white shadow-xs font-bold"
                    : "text-muted-foreground dark:text-white/60 hover:text-foreground dark:hover:text-white"
                }`}
                title="Chế độ lưới: 1 dòng 3 sản phẩm"
                aria-label="Chế độ lưới 3 sản phẩm"
              >
                <FontAwesomeIcon icon={faTableCells} className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">3 Cột</span>
              </button>

              <button
                onClick={() => {
                  watchAudio.tick();
                  setViewMode("horizontal");
                }}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-mono transition-all cursor-pointer ${
                  viewMode === "horizontal"
                    ? "bg-[#006039] text-white shadow-xs font-bold"
                    : "text-muted-foreground dark:text-white/60 hover:text-foreground dark:hover:text-white"
                }`}
                title="Chế độ danh sách: 1 dòng 1 sản phẩm chi tiết"
                aria-label="Chế độ thẻ ngang chi tiết"
              >
                <FontAwesomeIcon icon={faTableList} className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Thẻ Ngang</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <input
                type="text"
                placeholder="Tìm mẫu, dòng máy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-xs text-foreground dark:text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#d4af37]"
              />
              <FontAwesomeIcon icon={faMagnifyingGlass} className="w-3 h-3 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Sort Select */}
            <select
              value={sortOption}
              onChange={(e) => {
                watchAudio.tick();
                setSortOption(e.target.value as SortOption);
              }}
              className="bg-card dark:bg-[#0b1611] border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono text-foreground dark:text-white/80 focus:outline-none cursor-pointer"
            >
              <option value="featured">Tuyển chọn nổi bật</option>
              <option value="price-desc">Giá cao đến thấp</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="rating">Đánh giá 5 sao</option>
            </select>
          </div>
        </div>

        {/* Product Cards: Switch between Grid (1 dòng 3 sản phẩm) and Horizontal (1 dòng 1 sản phẩm chi tiết) */}
        {filteredWatches.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {filteredWatches.map((watch) => (
                <ProductCard key={watch.id} watch={watch} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full">
              {filteredWatches.map((watch) => (
                <ProductCard key={watch.id} watch={watch} viewMode="horizontal" />
              ))}
            </div>
          )
        ) : (
          <div className="py-16 text-center text-muted-foreground dark:text-white/40 font-mono text-sm">
            Không tìm thấy mẫu đồng hồ phù hợp với bộ lọc hiện tại.
          </div>
        )}

        {/* View Full Catalog Page CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-card dark:bg-[#0c1611] hover:bg-card/80 dark:hover:bg-[#112019] border border-[#d4af37]/30 hover:border-[#d4af37] text-foreground dark:text-white font-mono text-xs uppercase tracking-widest shadow-xl transition-all group"
          >
            <span>Khám Phá Toàn Bộ Bộ Sưu Tập Với Bộ Lọc Chuyên Sâu</span>
            <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5 text-[#9a741e] dark:text-[#d4af37] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
