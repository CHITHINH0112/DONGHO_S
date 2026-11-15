"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { apiClient } from "@/lib/axios";
import { mapDbProductToWatchItem } from "@/utils/productMapper";
import { WatchItem } from "@/data/watches";
import ProductCard from "./ProductCard";
import ProductFilterSidebar, { FilterState } from "./ProductFilterSidebar";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faSliders,
  faXmark,
  faClock,
  faRotateLeft,
  faArrowDownWideShort,
  faChevronDown,
  faCheck,
  faTableCells,
  faTableList,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const SORT_OPTIONS = [
  { value: "featured", label: "Nổi Bật / Tuyển Chọn" },
  { value: "price-desc", label: "Giá: Cao Đến Thấp" },
  { value: "price-asc", label: "Giá: Thấp Đến Cao" },
  { value: "rating", label: "Được Đánh Giá Cao Nhất" },
  { value: "newest", label: "Mới Nhất Vừa Về" },
];

export default function ProductCatalog() {
  const [filters, setFilters] = useState<FilterState>({
    brand: "all",
    movement: "all",
    priceRange: "all",
    diameter: "all",
    material: "all",
    waterResistance: "all",
    isLimitedOnly: false,
    isNewOnly: false,
    search: "",
    sortBy: "featured",
  });

  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "horizontal">("grid");
  const [dbWatches, setDbWatches] = useState<WatchItem[]>([]);
  const [dbBrands, setDbBrands] = useState<{ id: string; label: string; icon?: any }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Đóng Sort Dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tải danh sách sản phẩm và thương hiệu từ Database thực tế
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
          if (isMounted) setDbWatches([]);
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
        if (isMounted) setDbWatches([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleResetFilters = () => {
    watchAudio.tick();
    setFilters({
      brand: "all",
      movement: "all",
      priceRange: "all",
      diameter: "all",
      material: "all",
      waterResistance: "all",
      isLimitedOnly: false,
      isNewOnly: false,
      search: "",
      sortBy: "featured",
    });
  };

  // Lọc sản phẩm theo tiêu chí
  const filteredWatches = useMemo(() => {
    return dbWatches.filter((w) => {
      // 1. Thương hiệu
      if (filters.brand !== "all" && w.brand.toLowerCase() !== filters.brand.toLowerCase()) {
        return false;
      }

      // 2. Khoảng giá (VND)
      if (filters.priceRange !== "all") {
        const p = w.priceVND;
        if (filters.priceRange === "under-500" && p >= 500000000) return false;
        if (filters.priceRange === "500-1000" && (p < 500000000 || p > 1000000000)) return false;
        if (filters.priceRange === "1000-2000" && (p < 1000000000 || p > 2000000000)) return false;
        if (filters.priceRange === "above-2000" && p <= 2000000000) return false;
      }

      // 3. Loại cỗ máy (Movement)
      if (filters.movement && filters.movement !== "all") {
        const mov = (w.specs.movement || "").toLowerCase();
        if (filters.movement === "automatic" && !mov.includes("automatic") && !mov.includes("tự động")) return false;
        if (filters.movement === "manual" && !mov.includes("manual") && !mov.includes("cót tay") && !mov.includes("lên cót")) return false;
        if (filters.movement === "quartz" && !mov.includes("quartz") && !mov.includes("pin") && !mov.includes("thạch anh")) return false;
        if (filters.movement === "solar" && !mov.includes("solar") && !mov.includes("ánh sáng")) return false;
      }

      // 4. Kích thước mặt số
      if (filters.diameter !== "all") {
        const diaNum = parseFloat(w.specs.diameter);
        if (filters.diameter === "under-38" && diaNum >= 38) return false;
        if (filters.diameter === "39-40" && (diaNum < 39 || diaNum > 40.5)) return false;
        if (filters.diameter === "41-42" && (diaNum < 41 || diaNum > 42.5)) return false;
        if (filters.diameter === "above-42" && diaNum <= 42) return false;
      }

      // 5. Chất liệu thân vỏ
      if (filters.material !== "all") {
        const mat = (w.specs.caseMaterial || "").toLowerCase();
        if (filters.material === "steel" && !mat.includes("thép") && !mat.includes("steel")) return false;
        if (filters.material === "gold" && !mat.includes("vàng") && !mat.includes("gold")) return false;
        if (filters.material === "platinum" && !mat.includes("bạch kim") && !mat.includes("platinum")) return false;
        if (filters.material === "titanium" && !mat.includes("titan")) return false;
      }

      // 6. Khả năng kháng nước
      if (filters.waterResistance && filters.waterResistance !== "all") {
        const wr = (w.specs.waterResistance || "").toLowerCase();
        const atmMatch = wr.match(/(\d+)\s*(atm|bar|m)/i);
        const atmVal = atmMatch ? parseInt(atmMatch[1], 10) : 0;
        if (filters.waterResistance === "3-atm" && atmVal < 3) return false;
        if (filters.waterResistance === "5-atm" && atmVal < 5) return false;
        if (filters.waterResistance === "10-atm" && atmVal < 10) return false;
        if (filters.waterResistance === "20-atm" && atmVal < 20) return false;
      }

      // 7. Bản giới hạn
      if (filters.isLimitedOnly && !w.isLimited) return false;

      // 8. Mẫu mới về
      if (filters.isNewOnly && !w.isNew) return false;

      // 9. Từ khóa tìm kiếm
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        const inName = w.name.toLowerCase().includes(q);
        const inBrand = w.brand.toLowerCase().includes(q);
        const inDesc = w.description.toLowerCase().includes(q);
        const inCalibre = w.specs.calibre.toLowerCase().includes(q);
        if (!inName && !inBrand && !inDesc && !inCalibre) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === "price-desc") return b.priceVND - a.priceVND;
      if (filters.sortBy === "price-asc") return a.priceVND - b.priceVND;
      if (filters.sortBy === "rating") return b.rating - a.rating;
      if (filters.sortBy === "newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return 0; // "featured" giữ nguyên thứ tự
    });
  }, [filters, dbWatches]);

  // Đếm số lượng bộ lọc đang kích hoạt
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.brand !== "all") count++;
    if (filters.movement && filters.movement !== "all") count++;
    if (filters.priceRange !== "all") count++;
    if (filters.diameter !== "all") count++;
    if (filters.material !== "all") count++;
    if (filters.waterResistance && filters.waterResistance !== "all") count++;
    if (filters.isLimitedOnly) count++;
    if (filters.isNewOnly) count++;
    if (filters.search.trim() !== "") count++;
    return count;
  }, [filters]);

  return (
    <section id="luxury-catalog" className="py-12 bg-[#fbf9f5] dark:bg-[#070e0a] relative transition-colors duration-400">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        {/* Thanh Điều Khiển: Tìm Kiếm, Chế Độ Xem (3 Cột / Thẻ Ngang), Sắp Xếp */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card/90 backdrop-blur-xl border border-[#d4af37]/25 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Ô Tìm Kiếm */}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Công cụ bên phải: Chuyển Chế Độ Xem, Nút Bộ Lọc Mobile, Sắp Xếp */}
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto flex-wrap">
            {/* Chuyển đổi: 3 Cột vs Thẻ Ngang */}
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
                title="Chế độ lưới: 3 sản phẩm / hàng"
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
                title="Chế độ thẻ ngang chi tiết"
                aria-label="Chế độ thẻ ngang chi tiết"
              >
                <FontAwesomeIcon icon={faTableList} className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Thẻ Ngang</span>
              </button>
            </div>

            {/* Nút bật Bộ lọc trên Mobile */}
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

            {/* Custom Sort Dropdown (Tương thích 100% Sáng & Tối) */}
            <div className="relative inline-block text-xs font-mono" ref={sortRef}>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-muted-foreground text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <FontAwesomeIcon icon={faArrowDownWideShort} className="w-3 h-3 text-[#d4af37]" />
                  Sắp xếp:
                </span>
                <button
                  type="button"
                  onClick={() => setIsSortOpen((prev) => !prev)}
                  className="px-3.5 py-2 rounded-xl bg-card border border-border hover:border-[#d4af37]/60 text-foreground text-xs font-mono flex items-center gap-2 cursor-pointer transition-all shadow-xs"
                  aria-expanded={isSortOpen}
                >
                  <span>{SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label || "Nổi Bật"}</span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`w-2.5 h-2.5 text-[#d4af37] transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              {isSortOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-2xl p-1.5 z-50 animate-fadeIn backdrop-blur-xl">
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = filters.sortBy === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setFilters({ ...filters, sortBy: opt.value });
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#d4af37]/15 text-[#d4af37] font-bold"
                            : "text-foreground hover:bg-muted/70 hover:text-[#d4af37]"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#d4af37]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Số lượng kiệt tác */}
            <div className="hidden sm:block text-xs font-mono text-muted-foreground pl-2 border-l border-border">
              <strong className="text-foreground font-bold">{filteredWatches.length}</strong> Kiệt Tác
            </div>
          </div>
        </div>

        {/* Thanh hiển thị các tiêu chí lọc đang chọn (Active Filter Pills) */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8 text-xs font-mono">
            <span className="text-muted-foreground text-[11px] mr-1">Đang lọc:</span>

            {filters.brand !== "all" && (
              <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] flex items-center gap-2">
                <span>Hãng: {filters.brand}</span>
                <button onClick={() => setFilters({ ...filters, brand: "all" })} className="hover:text-foreground cursor-pointer">
                  <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            {filters.movement && filters.movement !== "all" && (
              <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] flex items-center gap-2">
                <span>Máy: {filters.movement}</span>
                <button onClick={() => setFilters({ ...filters, movement: "all" })} className="hover:text-foreground cursor-pointer">
                  <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            {filters.waterResistance && filters.waterResistance !== "all" && (
              <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] flex items-center gap-2">
                <span>Kháng nước: {filters.waterResistance}</span>
                <button onClick={() => setFilters({ ...filters, waterResistance: "all" })} className="hover:text-foreground cursor-pointer">
                  <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            {filters.priceRange !== "all" && (
              <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] flex items-center gap-2">
                <span>Giá: {filters.priceRange}</span>
                <button onClick={() => setFilters({ ...filters, priceRange: "all" })} className="hover:text-foreground cursor-pointer">
                  <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            {filters.diameter !== "all" && (
              <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] flex items-center gap-2">
                <span>Mặt: {filters.diameter} mm</span>
                <button onClick={() => setFilters({ ...filters, diameter: "all" })} className="hover:text-foreground cursor-pointer">
                  <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            {filters.material !== "all" && (
              <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] flex items-center gap-2">
                <span>Vỏ: {filters.material}</span>
                <button onClick={() => setFilters({ ...filters, material: "all" })} className="hover:text-foreground cursor-pointer">
                  <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            {filters.isLimitedOnly && (
              <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] flex items-center gap-2">
                <span>Bản giới hạn</span>
                <button onClick={() => setFilters({ ...filters, isLimitedOnly: false })} className="hover:text-foreground cursor-pointer">
                  <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            {filters.isNewOnly && (
              <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] flex items-center gap-2">
                <span>Mới về</span>
                <button onClick={() => setFilters({ ...filters, isNewOnly: false })} className="hover:text-foreground cursor-pointer">
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

        {/* Bố Cục 2 Cột: Bên Trái Bộ Lọc Kiệt Tác (Sidebar Dọc) & Bên Phải Lưới Sản Phẩm */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Cột Trái: Bộ Lọc Kiệt Tác (Desktop Sidebar Dọc) */}
          <ProductFilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            isOpenMobile={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
            totalResults={filteredWatches.length}
            brandsList={dbBrands.length > 1 ? dbBrands : undefined}
          />

          {/* Cột Phải: Lưới Sản Phẩm Hoặc Trạng Thái Rỗng */}
          <div className="flex-1 min-w-0 w-full">
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
              /* Trạng Thái Rỗng */
              <div className="py-20 px-8 rounded-3xl bg-card/80 border border-[#d4af37]/25 text-center max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center mx-auto mb-5 text-2xl">
                  <FontAwesomeIcon icon={faClock} />
                </div>
                <h3 className="font-serif text-2xl font-normal text-foreground">
                  Không Tìm Thấy Kiệt Tác Phù Hợp
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-muted-foreground font-light leading-relaxed">
                  Rất tiếc, hiện chưa có mẫu đồng hồ nào khớp trọn vẹn với các tiêu chí lọc đã chọn. Quý khách vui lòng thử điều chỉnh lại bộ lọc.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38f28] text-black font-semibold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <FontAwesomeIcon icon={faRotateLeft} className="w-3.5 h-3.5" />
                  <span>Xóa Toàn Bộ Bộ Lọc</span>
                </button>
              </div>
            )}
          </div>
        </div>
        </div>
      </section>
  );
}
