"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiClient } from "@/lib/axios";
import { mapDbProductToWatchItem } from "@/utils/productMapper";
import { WatchItem, WATCHES } from "@/data/watches";
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
  faCrown,
  faGem,
  faAward,
  faBolt,
  faArrowRight,
  faLayerGroup,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";

const SORT_OPTIONS = [
  { value: "featured", label: "Nổi Bật / Tuyển Chọn" },
  { value: "price-desc", label: "Giá: Cao Đến Thấp" },
  { value: "price-asc", label: "Giá: Thấp Đến Cao" },
  { value: "rating", label: "Được Đánh Giá Cao Nhất" },
  { value: "newest", label: "Mới Nhất Vừa Về" },
];

const BRAND_HERITAGE: Record<
  string,
  { tagline: string; origin: string; founded: string; signature: string; icon: any }
> = {
  "rolex": {
    tagline: "Biểu Tượng Vị Thế & Độ Bền Bỉ Cơ Học Vĩnh Cửu",
    origin: "Genève, Thụy Sĩ",
    founded: "1905",
    signature: "Vành Khía Vàng 18K & Thép Oystersteel 904L",
    icon: faCrown,
  },
  "rolex genève": {
    tagline: "Biểu Tượng Vị Thế & Độ Bền Bỉ Cơ Học Vĩnh Cửu",
    origin: "Genève, Thụy Sĩ",
    founded: "1905",
    signature: "Vành Khía Vàng 18K & Thép Oystersteel 904L",
    icon: faCrown,
  },
  "patek philippe": {
    tagline: "Đế Vương Haute Horlogerie - Gìn Giữ Di Sản Cho Thế Hệ Mai Sau",
    origin: "Genève, Thụy Sĩ",
    founded: "1839",
    signature: "Grand Complication & Chạm Khắc Kim Hoàn Thủ Công",
    icon: faAward,
  },
  "audemars piguet": {
    tagline: "Kỷ Nguyên Thể Thao Xa Xỉ & Mặt Số Vân Grande Tapisserie",
    origin: "Le Brassus, Thụy Sĩ",
    founded: "1875",
    signature: "Vành Bát Giác Royal Oak & Calibre Siêu Mỏng Ultra-Thin",
    icon: faBolt,
  },
  "omega": {
    tagline: "Chinh Phục Không Gian Vũ Trụ & Độ Sâu Thẳm Đại Dương",
    origin: "Biel / Bienne, Thụy Sĩ",
    founded: "1848",
    signature: "Bộ Thoát Co-Axial & Master Chronometer METAS",
    icon: faShieldHalved,
  },
  "cartier": {
    tagline: "Nhà Kim Hoàn Của Các Bậc Đế Vương & Vua Của Các Nhà Kim Hoàn",
    origin: "Paris, Pháp",
    founded: "1847",
    signature: "Hình Khối Santos & Tank Huyền Thoại, Núm Vặn Đính Sapphire",
    icon: faGem,
  },
  "casio": {
    tagline: "Kỹ Nghệ Điện Tử & Cơ Khí Đa Năng Chuẩn Xác Nhật Bản",
    origin: "Tokyo, Nhật Bản",
    founded: "1946",
    signature: "Bền Bỉ Vượt Thời Gian & Độ Tin Cậy Tuyệt Đối",
    icon: faClock,
  },
};

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
  const [groupByBrand, setGroupByBrand] = useState<boolean>(true);
  const [allWatches, setAllWatches] = useState<WatchItem[]>([]);
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

  // Tải danh sách sản phẩm từ CSDL và kết hợp cùng bộ sưu tập kiệt tác
  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const resProd = await apiClient.get("/products?limit=100&status=active").catch(() => null);

        let dbListMapped: WatchItem[] = [];
        if (resProd?.data?.success && Array.isArray(resProd.data.data)) {
          dbListMapped = resProd.data.data.map(mapDbProductToWatchItem);
        }

        // Kết hợp sản phẩm DB với bộ sưu tập Flagship
        const combined = [
          ...dbListMapped,
          ...WATCHES.filter((w) => !dbListMapped.some((d) => d.name.toLowerCase() === w.name.toLowerCase())),
        ];

        if (isMounted) {
          setAllWatches(combined);
        }
      } catch (err) {
        if (isMounted) setAllWatches(WATCHES);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Danh sách các thương hiệu có trong kho cỗ máy
  const brandList = useMemo(() => {
    const brandMap = new Map<string, number>();
    allWatches.forEach((w) => {
      const b = w.brand || "Khác";
      brandMap.set(b, (brandMap.get(b) || 0) + 1);
    });

    const list: { id: string; label: string; count: number; icon: any }[] = [
      { id: "all", label: "Tất Cả Thương Hiệu", count: allWatches.length, icon: faLayerGroup },
    ];

    brandMap.forEach((count, name) => {
      const key = name.toLowerCase();
      const meta = BRAND_HERITAGE[key] || { icon: faCrown };
      list.push({
        id: name,
        label: name,
        count,
        icon: meta.icon,
      });
    });

    return list;
  }, [allWatches]);

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

  const handleSelectBrandTab = (brandId: string) => {
    watchAudio.tick();
    setFilters((prev) => ({
      ...prev,
      brand: brandId,
    }));
  };

  // Lọc sản phẩm theo tiêu chí
  const filteredWatches = useMemo(() => {
    return allWatches
      .filter((w) => {
        // 1. Thương hiệu
        if (filters.brand !== "all") {
          const fb = filters.brand.toLowerCase();
          const wb = w.brand.toLowerCase();
          if (!wb.includes(fb) && !fb.includes(wb)) {
            return false;
          }
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
      })
      .sort((a, b) => {
        if (filters.sortBy === "price-desc") return b.priceVND - a.priceVND;
        if (filters.sortBy === "price-asc") return a.priceVND - b.priceVND;
        if (filters.sortBy === "rating") return b.rating - a.rating;
        if (filters.sortBy === "newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        return 0;
      });
  }, [filters, allWatches]);

  // Phân nhóm sản phẩm theo từng thương hiệu
  const groupedWatches = useMemo(() => {
    const map = new Map<string, WatchItem[]>();
    filteredWatches.forEach((w) => {
      const b = w.brand || "Thương Hiệu Khác";
      if (!map.has(b)) map.set(b, []);
      map.get(b)!.push(w);
    });
    return Array.from(map.entries()).map(([brandName, items]) => ({
      brandName,
      items,
      meta: BRAND_HERITAGE[brandName.toLowerCase()] || {
        tagline: "Kiệt Tác Cơ Khí Đỉnh Cao",
        origin: "Thụy Sĩ",
        founded: "Haute Horlogerie",
        signature: "Chế tác thủ công & Calibre in-house",
        icon: faCrown,
      },
    }));
  }, [filteredWatches]);

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

  const activeBrandMeta = filters.brand !== "all" ? BRAND_HERITAGE[filters.brand.toLowerCase()] : null;

  return (
    <section id="luxury-catalog" className="py-16 bg-[#050b07] text-white relative transition-colors duration-400 selection:bg-[#006039] selection:text-white">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_rgba(0,96,57,0.18)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 space-y-10">
        {/* SECTION HEADER: HAUTE HORLOGERIE */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#006039]/25 border border-[#d4af37]/30 text-[10px] font-mono tracking-[0.25em] uppercase text-[#d4af37] font-semibold">
            <span>🇨🇭</span>
            <span>DI SẢN THƯƠNG HIỆU & BỘ SƯU TẬP KIỆT TÁC</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-light text-stone-100 tracking-tight">
            Danh Mục Cỗ Máy Thời Gian
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 font-light max-w-2xl mx-auto leading-relaxed">
            Tuyển tập đồng hồ xa xỉ đích thực được phân loại theo từng nhà chế tác danh tiếng thế giới. Bảo chứng chất lượng Chronometer cùng chứng thư kiểm định độc lập.
          </p>
        </div>

        {/* 1. BRAND SHOWCASE TABS (THƯƠNG HIỆU CAO CẤP) */}
        <div className="relative">
          <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x">
            {brandList.map((b) => {
              const isSelected = filters.brand.toLowerCase() === b.id.toLowerCase();
              return (
                <button
                  key={b.id}
                  onClick={() => handleSelectBrandTab(b.id)}
                  className={`group relative shrink-0 snap-start px-5 py-3.5 rounded-2xl border transition-all duration-300 flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-[#006039]/40 via-[#0a2014] to-[#006039]/30 border-[#d4af37] text-white shadow-lg shadow-[#006039]/30 ring-1 ring-[#d4af37]/40"
                      : "bg-[#08120d]/80 hover:bg-[#0c1a12] border-white/[0.08] hover:border-[#d4af37]/40 text-stone-400 hover:text-stone-100"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-colors ${
                      isSelected
                        ? "bg-[#d4af37] text-black font-bold shadow-md"
                        : "bg-white/[0.05] group-hover:bg-[#d4af37]/15 text-[#d4af37]"
                    }`}
                  >
                    <FontAwesomeIcon icon={b.icon || faCrown} />
                  </div>
                  <div className="text-left">
                    <span className="font-serif text-sm block font-normal text-stone-100 group-hover:text-[#d4af37] transition-colors whitespace-nowrap">
                      {b.label}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500 block">
                      {b.count} cỗ máy sẵn có
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. ACTIVE BRAND SPOTLIGHT BANNER (NẾU CHỌN 1 THƯƠNG HIỆU CỤ THỂ) */}
        {activeBrandMeta && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#006039]/25 via-[#08170f] to-[#006039]/15 border border-[#d4af37]/35 relative overflow-hidden shadow-2xl animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#d4af37] font-semibold flex items-center gap-1.5">
                    <FontAwesomeIcon icon={activeBrandMeta.icon} className="text-xs" />
                    <span>{filters.brand}</span>
                  </span>
                  <span className="text-stone-500">•</span>
                  <span className="text-xs font-mono text-stone-400">Khởi sinh: {activeBrandMeta.founded}</span>
                  <span className="text-stone-500">•</span>
                  <span className="text-xs font-mono text-emerald-400">{activeBrandMeta.origin}</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl text-stone-100 font-light italic">
                  &ldquo;{activeBrandMeta.tagline}&rdquo;
                </h3>
                <p className="text-xs text-stone-400 font-light">
                  Đặc trưng chế tác: <strong className="text-stone-200">{activeBrandMeta.signature}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setFilters({ ...filters, brand: "all" })}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-stone-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
                >
                  <FontAwesomeIcon icon={faRotateLeft} className="text-[10px]" />
                  <span>Xem Tất Cả Hãng</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. TOOLBAR: TÌM KIẾM, SẮP XẾP, CHẾ ĐỘ HIỂN THỊ */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#08120d] border border-white/[0.08] shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Ô Tìm Kiếm */}
          <div className="relative w-full md:w-80">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500"
            />
            <input
              type="text"
              placeholder="Tìm theo mẫu, thương hiệu, Calibre..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-black/50 border border-white/[0.08] focus:border-[#d4af37]/60 text-xs font-mono text-stone-200 placeholder:text-stone-500 focus:outline-none transition-colors"
            />
            {filters.search && (
              <button
                onClick={() => setFilters({ ...filters, search: "" })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-200 cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Công cụ bên phải */}
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto flex-wrap">
            {/* Toggle Group theo Hãng (khi chọn All) */}
            {filters.brand === "all" && (
              <button
                onClick={() => {
                  watchAudio.tick();
                  setGroupByBrand(!groupByBrand);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer flex items-center gap-1.5 ${
                  groupByBrand
                    ? "bg-[#006039]/30 border-[#d4af37]/50 text-[#d4af37] font-semibold"
                    : "bg-white/[0.03] border-white/[0.08] text-stone-400 hover:text-stone-200"
                }`}
              >
                <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
                <span>{groupByBrand ? "Đang Phân Theo Hãng" : "Hiển Thị Toàn Bộ"}</span>
              </button>
            )}

            {/* Chuyển đổi: 3 Cột vs Thẻ Ngang */}
            <div className="flex items-center p-1 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <button
                onClick={() => {
                  watchAudio.tick();
                  setViewMode("grid");
                }}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-mono transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#006039] text-white shadow-xs font-bold"
                    : "text-stone-400 hover:text-white"
                }`}
                title="Chế độ lưới: 3 cỗ máy / hàng"
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
                    : "text-stone-400 hover:text-white"
                }`}
                title="Chế độ thẻ ngang chi tiết"
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

            {/* Sort Dropdown */}
            <div className="relative inline-block text-xs font-mono" ref={sortRef}>
              <button
                type="button"
                onClick={() => setIsSortOpen((prev) => !prev)}
                className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/[0.08] hover:border-[#d4af37]/60 text-stone-200 text-xs font-mono flex items-center gap-2 cursor-pointer transition-all shadow-xs"
              >
                <FontAwesomeIcon icon={faArrowDownWideShort} className="w-3 h-3 text-[#d4af37]" />
                <span>{SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label || "Nổi Bật"}</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`w-2.5 h-2.5 text-[#d4af37] transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#08120d] border border-white/[0.1] shadow-2xl p-1.5 z-50 animate-fadeIn backdrop-blur-xl">
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
                            : "text-stone-300 hover:bg-white/[0.04] hover:text-[#d4af37]"
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

            <div className="hidden sm:block text-xs font-mono text-stone-400 pl-2 border-l border-white/[0.08]">
              <strong className="text-stone-100 font-bold">{filteredWatches.length}</strong> Kiệt Tác
            </div>
          </div>
        </div>

        {/* 4. ACTIVE FILTER PILLS */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-stone-400 text-[11px] mr-1">Đang lọc:</span>

            {filters.brand !== "all" && (
              <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] flex items-center gap-2">
                <span>Hãng: {filters.brand}</span>
                <button onClick={() => setFilters({ ...filters, brand: "all" })} className="hover:text-white cursor-pointer">
                  <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            {filters.movement && filters.movement !== "all" && (
              <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] flex items-center gap-2">
                <span>Máy: {filters.movement}</span>
                <button onClick={() => setFilters({ ...filters, movement: "all" })} className="hover:text-white cursor-pointer">
                  <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            {filters.priceRange !== "all" && (
              <span className="px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] flex items-center gap-2">
                <span>Giá: {filters.priceRange}</span>
                <button onClick={() => setFilters({ ...filters, priceRange: "all" })} className="hover:text-white cursor-pointer">
                  <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-[11px] text-stone-400 hover:text-white underline ml-2 cursor-pointer"
            >
              Xóa tất cả
            </button>
          </div>
        )}

        {/* 5. MAIN CONTENT: SIDEBAR + BRAND GROUPED PRODUCT SHOWCASE */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Cột Trái: Sidebar Bộ Lọc Desktop */}
          <ProductFilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            isOpenMobile={isMobileFilterOpen}
            onCloseMobile={() => setIsMobileFilterOpen(false)}
            totalResults={filteredWatches.length}
            brandsList={brandList.map((b) => ({ id: b.id, label: b.label }))}
          />

          {/* Cột Phải: Danh Sách Sản Phẩm Theo Thương Hiệu */}
          <div className="flex-1 min-w-0 w-full space-y-12">
            {loading ? (
              <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
                <FontAwesomeIcon icon={faSpinner} className="fa-spin text-3xl text-[#d4af37]" />
                <span className="text-xs font-mono text-stone-400">Đang đồng bộ cỗ máy kiệt tác từ kho BRU_WATCH...</span>
              </div>
            ) : filteredWatches.length === 0 ? (
              <div className="py-20 px-8 rounded-3xl bg-[#08120d] border border-[#d4af37]/25 text-center max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center mx-auto mb-5 text-2xl">
                  <FontAwesomeIcon icon={faClock} />
                </div>
                <h3 className="font-serif text-2xl font-normal text-stone-100">
                  Không Tìm Thấy Kiệt Tác Phù Hợp
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-stone-400 font-light leading-relaxed">
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
            ) : filters.brand === "all" && groupByBrand ? (
              /* HIỂN THỊ PHÂN THEO TỪNG THƯƠNG HIỆU (BRAND GROUPED SECTIONS) */
              <div className="space-y-14">
                {groupedWatches.map((grp) => (
                  <div key={grp.brandName} className="space-y-6">
                    {/* Brand Section Header */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-[#d4af37]/25">
                      <div>
                        <div className="flex items-center gap-2 text-[#d4af37]">
                          <FontAwesomeIcon icon={grp.meta.icon} className="text-sm" />
                          <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-semibold">
                            {grp.meta.origin} • {grp.meta.founded}
                          </span>
                        </div>
                        <h3 className="font-serif text-2xl sm:text-3xl font-light text-stone-100 mt-0.5">
                          Bộ Sưu Tập {grp.brandName}
                        </h3>
                        <p className="text-xs text-stone-400 font-light italic mt-0.5">
                          &ldquo;{grp.meta.tagline}&rdquo;
                        </p>
                      </div>

                      <button
                        onClick={() => handleSelectBrandTab(grp.brandName)}
                        className="text-xs font-mono text-[#d4af37] hover:text-[#e5c158] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        <span>Xem tất cả ({grp.items.length})</span>
                        <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                      </button>
                    </div>

                    {/* Product Grid for Brand */}
                    {viewMode === "grid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7">
                        {grp.items.map((watch) => (
                          <ProductCard key={watch.id} watch={watch} viewMode="grid" />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6 w-full">
                        {grp.items.map((watch) => (
                          <ProductCard key={watch.id} watch={watch} viewMode="horizontal" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* HIỂN THỊ LƯỚI BÌNH THƯỜNG HOẶC KHI ĐÃ CHỌN 1 BRAND */
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
