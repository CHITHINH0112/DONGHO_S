"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faXmark,
  faRotateLeft,
  faCrown,
  faGem,
  faCompass,
  faBolt,
  faClock,
  faCheck,
  faGears,
  faWater,
  faRulerCombined,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";

export interface FilterState {
  brand: string;
  category?: string;
  movement: string;
  priceRange: string;
  diameter: string;
  material: string;
  waterResistance?: string;
  isLimitedOnly: boolean;
  isNewOnly: boolean;
  search: string;
  sortBy: string;
}

interface ProductFilterSidebarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  totalResults: number;
  brandsList?: { id: string; label: string; icon?: any }[];
}

export const BRANDS = [
  { id: "all", label: "Tất cả thương hiệu", icon: faCrown },
  { id: "Rolex", label: "Rolex", icon: faCrown },
  { id: "Audemars Piguet", label: "Audemars Piguet", icon: faBolt },
  { id: "Patek Philippe", label: "Patek Philippe", icon: faGem },
  { id: "Vacheron Constantin", label: "Vacheron Constantin", icon: faCompass },
  { id: "Omega", label: "Omega", icon: faClock },
  { id: "Cartier", label: "Cartier", icon: faGem },
  { id: "Casio", label: "Casio", icon: faClock },
  { id: "Citizen", label: "Citizen", icon: faClock },
];

export const PRICE_RANGES = [
  { id: "all", label: "Tất cả mức giá" },
  { id: "under-500", label: "Dưới 500 triệu VNĐ" },
  { id: "500-1000", label: "500 triệu - 1 tỷ VNĐ" },
  { id: "1000-2000", label: "1 tỷ - 2 tỷ VNĐ" },
  { id: "above-2000", label: "Trên 2 tỷ VNĐ (Haute)" },
];

export const MOVEMENTS = [
  { id: "all", label: "Tất cả loại máy" },
  { id: "automatic", label: "Cơ tự động (Automatic)" },
  { id: "manual", label: "Cơ lên cót tay (Manual)" },
  { id: "quartz", label: "Pin Thạch Anh (Quartz)" },
  { id: "solar", label: "Năng lượng ánh sáng (Solar)" },
];

export const DIAMETERS = [
  { id: "all", label: "Tất cả kích cỡ" },
  { id: "under-38", label: "< 38 mm (Cổ tay nhỏ/Nữ)" },
  { id: "39-40", label: "39 mm - 40 mm (Cổ điển)" },
  { id: "41-42", label: "41 mm - 42 mm (Tiêu chuẩn)" },
  { id: "above-42", label: "> 42 mm (Cổ tay lớn)" },
];

export const MATERIALS = [
  { id: "all", label: "Tất cả chất liệu" },
  { id: "gold", label: "Vàng Vàng / Vàng Hồng 18K" },
  { id: "steel", label: "Thép Oystersteel / 316L" },
  { id: "platinum", label: "Bạch Kim Platinum 950" },
  { id: "titanium", label: "Titanium Cao Cấp" },
];

export const WATER_RESISTANCES = [
  { id: "all", label: "Tất cả mức kháng nước" },
  { id: "3-atm", label: "3 ATM / 30m (Rửa tay, mưa nhẹ)" },
  { id: "5-atm", label: "5 ATM / 50m (Bơi lội nhẹ)" },
  { id: "10-atm", label: "10 ATM / 100m (Lặn nông, thể thao)" },
  { id: "20-atm", label: "20 ATM / 200m+ (Lặn chuyên nghiệp)" },
];

export default function ProductFilterSidebar({
  filters,
  onChange,
  onReset,
  isOpenMobile,
  onCloseMobile,
  totalResults,
  brandsList,
}: ProductFilterSidebarProps) {
  const displayBrands = brandsList && brandsList.length > 1 ? brandsList : BRANDS;

  const content = (
    <div className="space-y-6 text-xs font-mono">
      {/* Header and Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-border/80 dark:border-[#d4af37]/20">
        <div className="flex items-center gap-2 text-sm font-serif font-bold text-foreground tracking-wide">
          <FontAwesomeIcon icon={faFilter} className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Bộ Lọc Kiệt Tác</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/25 ml-1">
            {totalResults}
          </span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] text-muted-foreground hover:text-[#d4af37] transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <FontAwesomeIcon icon={faRotateLeft} className="w-3 h-3" />
          <span>Đặt lại</span>
        </button>
      </div>

      {/* Brand Filter */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-[#d4af37] font-semibold mb-2.5 flex items-center gap-1.5">
          <FontAwesomeIcon icon={faCrown} className="w-3 h-3" />
          <span>Thương Hiệu</span>
        </label>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
          {displayBrands.map((b) => {
            const isSelected = filters.brand === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onChange({ ...filters, brand: b.id })}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40 font-bold"
                    : "text-foreground/80 hover:bg-muted/60 dark:hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <FontAwesomeIcon icon={b.icon || faCrown} className="w-3 h-3 text-[#d4af37]/80 shrink-0" />
                  <span className="truncate">{b.label}</span>
                </span>
                {isSelected && <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#d4af37]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-[#d4af37] font-semibold mb-2.5 flex items-center gap-1.5">
          <FontAwesomeIcon icon={faGem} className="w-3 h-3" />
          <span>Khoảng Giá</span>
        </label>
        <div className="space-y-1.5">
          {PRICE_RANGES.map((pr) => {
            const isSelected = filters.priceRange === pr.id;
            return (
              <button
                key={pr.id}
                type="button"
                onClick={() => onChange({ ...filters, priceRange: pr.id })}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40 font-bold"
                    : "text-foreground/80 hover:bg-muted/60 dark:hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <span className="truncate">{pr.label}</span>
                {isSelected && <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#d4af37]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* THÔNG TIN CỖ MÁY */}
      <div className="pt-3 border-t border-border/80 dark:border-[#d4af37]/15 space-y-6">
        <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground font-semibold">
          Thông Tin Cỗ Máy & Chi Tiết
        </div>

        {/* 1. Loại cỗ máy (Movement) */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#d4af37] font-semibold mb-2.5 flex items-center gap-1.5">
            <FontAwesomeIcon icon={faGears} className="w-3 h-3" />
            <span>Loại Bộ Máy</span>
          </label>
          <div className="space-y-1.5">
            {MOVEMENTS.map((m) => {
              const isSelected = (filters.movement || "all") === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChange({ ...filters, movement: m.id })}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40 font-bold"
                      : "text-foreground/80 hover:bg-muted/60 dark:hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <span className="truncate">{m.label}</span>
                  {isSelected && <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#d4af37]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Kích thước mặt số (Diameter) */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#d4af37] font-semibold mb-2.5 flex items-center gap-1.5">
            <FontAwesomeIcon icon={faRulerCombined} className="w-3 h-3" />
            <span>Kích Thước Mặt Số</span>
          </label>
          <div className="space-y-1.5">
            {DIAMETERS.map((dia) => {
              const isSelected = filters.diameter === dia.id;
              return (
                <button
                  key={dia.id}
                  type="button"
                  onClick={() => onChange({ ...filters, diameter: dia.id })}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40 font-bold"
                      : "text-foreground/80 hover:bg-muted/60 dark:hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <span className="truncate">{dia.label}</span>
                  {isSelected && <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#d4af37]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Chất liệu thân vỏ & niềng (Material) */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#d4af37] font-semibold mb-2.5 flex items-center gap-1.5">
            <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3" />
            <span>Chất Liệu Thân Vỏ</span>
          </label>
          <div className="space-y-1.5">
            {MATERIALS.map((mat) => {
              const isSelected = filters.material === mat.id;
              return (
                <button
                  key={mat.id}
                  type="button"
                  onClick={() => onChange({ ...filters, material: mat.id })}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40 font-bold"
                      : "text-foreground/80 hover:bg-muted/60 dark:hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <span className="truncate">{mat.label}</span>
                  {isSelected && <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#d4af37]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Khả năng kháng nước (Water Resistance) */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#d4af37] font-semibold mb-2.5 flex items-center gap-1.5">
            <FontAwesomeIcon icon={faWater} className="w-3 h-3" />
            <span>Khả Năng Kháng Nước</span>
          </label>
          <div className="space-y-1.5">
            {WATER_RESISTANCES.map((wr) => {
              const isSelected = (filters.waterResistance || "all") === wr.id;
              return (
                <button
                  key={wr.id}
                  type="button"
                  onClick={() => onChange({ ...filters, waterResistance: wr.id })}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40 font-bold"
                      : "text-foreground/80 hover:bg-muted/60 dark:hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <span className="truncate">{wr.label}</span>
                  {isSelected && <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#d4af37]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="pt-3 border-t border-border/80 dark:border-[#d4af37]/15 space-y-3">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-foreground/80 group-hover:text-foreground transition-colors">
            Chỉ xem Phiên Bản Giới Hạn
          </span>
          <input
            type="checkbox"
            checked={filters.isLimitedOnly}
            onChange={(e) =>
              onChange({ ...filters, isLimitedOnly: e.target.checked })
            }
            className="w-4 h-4 rounded bg-background border-border text-[#d4af37] focus:ring-0 cursor-pointer accent-[#d4af37]"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-foreground/80 group-hover:text-foreground transition-colors">
            Chỉ xem Mẫu Mới Về (New Arrival)
          </span>
          <input
            type="checkbox"
            checked={filters.isNewOnly}
            onChange={(e) =>
              onChange({ ...filters, isNewOnly: e.target.checked })
            }
            className="w-4 h-4 rounded bg-background border-border text-[#d4af37] focus:ring-0 cursor-pointer accent-[#d4af37]"
          />
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-28 p-6 rounded-3xl bg-card/95 backdrop-blur-xl border border-border shadow-xl dark:bg-[#0c1611]/90 dark:border-[#d4af37]/20">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto w-full max-w-sm h-full bg-card border-l border-border dark:bg-[#0c1611] dark:border-[#d4af37]/25 p-6 overflow-y-auto shadow-2xl z-10">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-border dark:border-[#d4af37]/20">
              <span className="font-serif text-lg font-bold text-foreground">
                Bộ Lọc Kiệt Tác
              </span>
              <button
                onClick={onCloseMobile}
                className="w-8 h-8 rounded-full bg-muted/60 border border-border flex items-center justify-center text-foreground/80 hover:text-[#d4af37] cursor-pointer"
                aria-label="Đóng bộ lọc"
              >
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            </div>
            {content}
            <div className="mt-8 pt-4 border-t border-border dark:border-[#d4af37]/20">
              <button
                onClick={onCloseMobile}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38f28] text-black font-semibold text-xs uppercase tracking-wider cursor-pointer"
              >
                Áp Dụng ({totalResults} Kiệt Tác)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
