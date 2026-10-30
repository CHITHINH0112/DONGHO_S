"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { WATCHES, WatchItem } from "@/data/watches";
import ProductCard from "@/components/ProductCard";
import ProductFilterSidebar, { FilterState } from "@/components/ProductFilterSidebar";
import { apiClient } from "@/lib/axios";
import { mapDbProductToWatchItem } from "@/utils/productMapper";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faSliders,
  faXmark,
  faGem,
  faChevronRight,
  faClock,
  faRotateLeft,
  faArrowDownWideShort,
  faCertificate,
  faTableCells,
  faTableList,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

function ProductsContent() {
  const searchParams = useSearchParams();

  // Initial state derived from query params
  const initialBrand = searchParams.get("brand") || "all";
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("q") || "";

  const [filters, setFilters] = useState<FilterState>({
    brand: initialBrand,
    category: initialCategory,
    priceRange: "all",
    diameter: "all",
    material: "all",
    isLimitedOnly: false,
    isNewOnly: false,
    search: initialSearch,
    sortBy: "featured",
  });

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "horizontal">("grid");

  // Sync with URL params if changed externally
  useEffect(() => {
    const b = searchParams.get("brand");
    const c = searchParams.get("category");
    if (b || c) {
      setFilters((prev) => ({
        ...prev,
        brand: b || prev.brand,
        category: c || prev.category,
      }));
    }
  }, [searchParams]);

  const handleResetFilters = () => {
    watchAudio.tick();
    setFilters({
      brand: "all",
      category: "all",
      priceRange: "all",
      diameter: "all",
      material: "all",
      isLimitedOnly: false,
      isNewOnly: false,
      search: "",
      sortBy: "featured",
    });
  };

  const [dbWatches, setDbWatches] = useState<WatchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dbBrands, setDbBrands] = useState<{ id: string; label: string; icon?: any }[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const [resProd, resBrands] = await Promise.allSettled([
          apiClient.get("/products?limit=100&status=active"),
          apiClient.get("/brands"),
        ]);

        if (resProd.status === "fulfilled" && resProd.value.data?.success) {
          const list = resProd.value.data.data;
          if (Array.isArray(list) && list.length > 0) {
            const mapped = list.map(mapDbProductToWatchItem);
            if (isMounted) setDbWatches(mapped);
          } else {
            if (isMounted) setDbWatches([]);
          }
        } else {
          if (isMounted) setDbWatches(WATCHES);
        }

        if (resBrands.status === "fulfilled" && resBrands.value.data?.success) {
          const bList = resBrands.value.data.data;
          if (Array.isArray(bList) && bList.length > 0) {
            const mappedBrands = [
              { id: "all", label: "Tất cả thương hiệu" },
              ...bList.map((b: any) => ({
                id: b.name,
                label: b.name,
              })),
            ];
            if (isMounted) setDbBrands(mappedBrands);
          }
        }
      } catch (err) {
        console.warn("Không thể tải sản phẩm từ API, sử dụng dữ liệu dự phòng:", err);
        if (isMounted) setDbWatches(WATCHES);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeWatches = dbWatches.length > 0 ? dbWatches : (loading ? [] : WATCHES);

  // Filter & Sort Logic
  const filteredWatches = useMemo(() => {
    return activeWatches.filter((watch) => {
      // Brand filter
      if (filters.brand !== "all") {
        const watchBrandNorm = watch.brand.toLowerCase();
        const filterBrandNorm = filters.brand.toLowerCase();
        if (!watchBrandNorm.includes(filterBrandNorm) && !filterBrandNorm.includes(watchBrandNorm)) {
          return false;
        }
      }

      // Category filter
      if (filters.category !== "all" && watch.category !== filters.category) {
        return false;
      }

      // Price filter
      if (filters.priceRange === "under-500" && watch.priceVND >= 500000000) return false;
      if (filters.priceRange === "500-1000" && (watch.priceVND < 500000000 || watch.priceVND > 1000000000)) return false;
      if (filters.priceRange === "1000-2000" && (watch.priceVND < 1000000000 || watch.priceVND > 2000000000)) return false;
      if (filters.priceRange === "above-2000" && watch.priceVND <= 2000000000) return false;

      // Diameter filter
      if (filters.diameter !== "all") {
        const diaNum = parseFloat(watch.specs.diameter);
        if (filters.diameter === "under-38" && diaNum >= 38) return false;
        if (filters.diameter === "39-40" && (diaNum < 39 || diaNum > 40.5)) return false;
        if (filters.diameter === "41-42" && (diaNum < 41 || diaNum > 42.5)) return false;
        if (filters.diameter === "above-42" && diaNum <= 42) return false;
      }

      // Material filter
      if (filters.material !== "all") {
        const mat = watch.specs.caseMaterial.toLowerCase();
        if (filters.material === "gold" && !mat.includes("vàng") && !mat.includes("gold")) return false;
        if (filters.material === "steel" && !mat.includes("thép") && !mat.includes("steel")) return false;
        if (filters.material === "platinum" && !mat.includes("bạch kim") && !mat.includes("platinum")) return false;
        if (filters.material === "diamond" && !mat.includes("kim cương") && !mat.includes("ngọc") && !mat.includes("diamond")) return false;
      }

      // Limited filter
      if (filters.isLimitedOnly && !watch.isLimited) return false;

      // New filter
      if (filters.isNewOnly && !watch.isNew) return false;

      // Search keyword filter
      if (filters.search.trim() !== "") {
        const q = filters.search.toLowerCase().trim();
        const matchName = watch.name.toLowerCase().includes(q);
        const matchBrand = watch.brand.toLowerCase().includes(q);
        const matchCalibre = watch.specs.calibre.toLowerCase().includes(q);
        const matchSeries = watch.series.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchCalibre && !matchSeries) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === "price-asc") return a.priceVND - b.priceVND;
      if (filters.sortBy === "price-desc") return b.priceVND - a.priceVND;
      if (filters.sortBy === "rating") return b.rating - a.rating;
      if (filters.sortBy === "newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return 0; // featured default
    });
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.brand !== "all") count++;
    if (filters.category !== "all") count++;
    if (filters.priceRange !== "all") count++;
    if (filters.diameter !== "all") count++;
    if (filters.material !== "all") count++;
    if (filters.isLimitedOnly) count++;
    if (filters.isNewOnly) count++;
    if (filters.search.trim() !== "") count++;
    return count;
  }, [filters]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-400 flex flex-col selection:bg-[#d4af37] selection:text-black">
      <div className="flex-1 pt-24 pb-28">
        {/* Breadcrumb Navigation */}
        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-4">
          <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Link href="/" className="hover:text-[#d4af37] transition-colors">
              Trang Chủ
            </Link>
            <FontAwesomeIcon icon={faChevronRight} className="w-2.5 h-2.5 text-muted-foreground/60" />
            <span className="text-[#d4af37]">Bộ Sưu Tập Đồng Hồ Thụy Sĩ</span>
            {filters.brand !== "all" && (
              <>
                <FontAwesomeIcon icon={faChevronRight} className="w-2.5 h-2.5 text-muted-foreground/60" />
                <span className="text-foreground font-semibold">{filters.brand}</span>
              </>
            )}
          </nav>
        </div>

        {/* Page Hero Header */}
        <section className="relative py-12 max-w-7xl mx-auto px-6 sm:px-12 overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-[#006039]/15 dark:bg-[#006039]/20 rounded-full blur-[140px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.03] border border-[#d4af37]/35 text-[#d4af37] text-xs font-mono tracking-[0.2em] uppercase mb-4 backdrop-blur-md">
              <FontAwesomeIcon icon={faCertificate} className="w-3 h-3 text-[#d4af37]" />
              <span>BRU_WATCH • 100% Nguyên Bản Thụy Sĩ</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-foreground tracking-tight leading-tight">
              Danh Mục Tuyệt Tác <span className="italic text-[#d4af37] dark:text-[#f3e3be]">Thời Gian</span>
            </h1>

            <p className="mt-4 text-xs sm:text-sm text-muted-foreground font-light leading-relaxed max-w-2xl font-sans">
              Khám phá hơn 100+ cỗ máy cơ học đỉnh cao được bảo quản trong buồng cân bằng nhiệt ẩm tiêu chuẩn Geneva. Bảo hành chính hãng 5 năm và vận chuyển xe bảo mật.
            </p>
          </div>
        </section>

        {/* Catalog Control Bar & Content Layout */}
        <div className="max-w-7xl mx-auto px-6 sm:px-12 mt-6">
          {/* Search, Sort and Mobile Filter Button */}
          <div className="p-4 sm:p-5 rounded-2xl bg-card/90 backdrop-blur-xl border border-[#d4af37]/25 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Tìm mẫu, thương hiệu, Calibre..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-border focus:border-[#d4af37]/60 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none transition-colors"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters({ ...filters, search: "" })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Right Tools: View Mode Toggle, Result Counter, Sort & Mobile Filter Toggle */}
            <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto flex-wrap">
              {/* View Mode Switcher: 3 Cột vs Thẻ Ngang */}
              <div className="flex items-center p-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08]">
                <button
                  onClick={() => {
                    watchAudio.tick();
                    setViewMode("grid");
                  }}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-mono transition-all cursor-pointer ${viewMode === "grid"
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
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-mono transition-all cursor-pointer ${viewMode === "horizontal"
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

              {/* Mobile Filter Toggle Button */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden px-4 py-2 rounded-xl bg-[#006039] hover:bg-[#007a48] text-white text-xs font-mono font-semibold flex items-center gap-2 border border-emerald-500/30 transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faSliders} className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Bộ Lọc</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#d4af37] text-black text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="hidden sm:inline text-muted-foreground text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <FontAwesomeIcon icon={faArrowDownWideShort} className="w-3 h-3 text-[#d4af37]" />
                  Sắp xếp:
                </span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-background border border-[#d4af37]/30 text-foreground text-xs font-mono cursor-pointer focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="featured">Nổi Bật / Tuyển Chọn</option>
                  <option value="price-desc">Giá: Cao Đến Thấp</option>
                  <option value="price-asc">Giá: Thấp Đến Cao</option>
                  <option value="rating">Được Đánh Giá Cao Nhất</option>
                  <option value="newest">Mới Nhất Vừa Về</option>
                </select>
              </div>

              {/* Counter Display */}
              <div className="hidden sm:block text-xs font-mono text-muted-foreground pl-2 border-l border-border">
                <strong className="text-foreground font-bold">{filteredWatches.length}</strong> Kiệt Tác
              </div>
            </div>
          </div>

          {/* Active Filter Pills Bar */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-8 text-xs font-mono">
              <span className="text-muted-foreground text-[11px] mr-1">Đang lọc:</span>

              {filters.brand !== "all" && (
                <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] flex items-center gap-2">
                  <span>Hãng: {filters.brand}</span>
                  <button onClick={() => setFilters({ ...filters, brand: "all" })} className="hover:text-foreground">
                    <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}

              {filters.category !== "all" && (
                <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] flex items-center gap-2">
                  <span>Dòng: {filters.category}</span>
                  <button onClick={() => setFilters({ ...filters, category: "all" })} className="hover:text-foreground">
                    <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}

              {filters.priceRange !== "all" && (
                <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] flex items-center gap-2">
                  <span>Giá: {filters.priceRange}</span>
                  <button onClick={() => setFilters({ ...filters, priceRange: "all" })} className="hover:text-foreground">
                    <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}

              {filters.diameter !== "all" && (
                <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] flex items-center gap-2">
                  <span>Mặt: {filters.diameter} mm</span>
                  <button onClick={() => setFilters({ ...filters, diameter: "all" })} className="hover:text-foreground">
                    <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}

              {filters.material !== "all" && (
                <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] flex items-center gap-2">
                  <span>Vỏ: {filters.material}</span>
                  <button onClick={() => setFilters({ ...filters, material: "all" })} className="hover:text-foreground">
                    <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}

              {filters.isLimitedOnly && (
                <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] flex items-center gap-2">
                  <span>Bản giới hạn</span>
                  <button onClick={() => setFilters({ ...filters, isLimitedOnly: false })} className="hover:text-foreground">
                    <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}

              {filters.isNewOnly && (
                <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] flex items-center gap-2">
                  <span>Mới về</span>
                  <button onClick={() => setFilters({ ...filters, isNewOnly: false })} className="hover:text-foreground">
                    <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-[11px] text-muted-foreground hover:text-foreground underline ml-2 cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {/* Main Layout: Sidebar & Products Grid */}
          <div className="flex gap-8 items-start">
            {/* Desktop Filter Sidebar */}
            <ProductFilterSidebar
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
              isOpenMobile={isMobileFilterOpen}
              onCloseMobile={() => setIsMobileFilterOpen(false)}
              totalResults={filteredWatches.length}
              brandsList={dbBrands.length > 1 ? dbBrands : undefined}
            />

            {/* Products Grid or Empty State */}
            <div className="flex-1">
              {loading ? (
                <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
                  <FontAwesomeIcon icon={faSpinner} className="fa-spin text-3xl text-[#d4af37]" />
                  <span className="text-xs font-mono text-zinc-400">Đang đồng bộ cỗ máy kiệt tác từ kho BRU_WATCH...</span>
                </div>
              ) : filteredWatches.length > 0 ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7">
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
                /* Empty State */
                <div className="py-20 px-8 rounded-3xl bg-card/80 border border-[#d4af37]/25 text-center max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center mx-auto mb-5 text-2xl">
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                  <h3 className="font-serif text-2xl font-normal text-foreground">
                    Không Tìm Thấy Kiệt Tác Phù Hợp
                  </h3>
                  <p className="mt-3 text-xs sm:text-sm text-muted-foreground font-light leading-relaxed">
                    Rất tiếc, hiện chưa có mẫu đồng hồ nào khớp trọn vẹn với các tiêu chí lọc đã chọn. Quý khách vui lòng thử điều chỉnh hoặc liên hệ chuyên viên để đặt hàng riêng.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38f28] text-black font-semibold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 mx-auto"
                  >
                    <FontAwesomeIcon icon={faRotateLeft} className="w-3.5 h-3.5" />
                    <span>Xóa Toàn Bộ Bộ Lọc</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070e0a] flex items-center justify-center text-[#d4af37] font-mono text-xs">
          <FontAwesomeIcon icon={faClock} className="w-5 h-5 animate-spin mr-2" />
          <span>Đang tải bộ sưu tập kiệt tác...</span>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
