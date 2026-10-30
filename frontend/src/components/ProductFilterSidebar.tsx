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
} from "@fortawesome/free-solid-svg-icons";

export interface FilterState {
  brand: string;
  category: string;
  priceRange: string;
  diameter: string;
  material: string;
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
  { id: "Rolex Genève", label: "Rolex", icon: faCrown },
  { id: "Audemars & Piguet", label: "Audemars Piguet", icon: faBolt },
  { id: "Patek & Philippe", label: "Patek Philippe", icon: faGem },
  { id: "Vacheron Constantin", label: "Vacheron Constantin", icon: faCompass },
  { id: "Omega", label: "Omega", icon: faClock },
  { id: "Cartier", label: "Cartier", icon: faGem },
  { id: "Verdant Horology", label: "Verdant Horology", icon: faClock },
];

export const CATEGORIES = [
  { id: "all", label: "Tất cả phong cách" },
  { id: "spotlight", label: "Spotlight Đỉnh Cao" },
  { id: "dive", label: "Lặn Biển Chuyên Nghiệp" },
  { id: "tourbillon", label: "Tourbillon Cơ Khí" },
  { id: "chronograph", label: "Bấm Giờ Đua Xe" },
  { id: "royal", label: "Hoàng Gia & Doanh Nhân" },
  { id: "jewelry", label: "Đính Đá Quý & Kim Cương" },
];

export const PRICE_RANGES = [
  { id: "all", label: "Tất cả mức giá" },
  { id: "under-500", label: "Dưới 500 triệu VNĐ" },
  { id: "500-1000", label: "500 triệu - 1 tỷ VNĐ" },
  { id: "1000-2000", label: "1 tỷ - 2 tỷ VNĐ" },
  { id: "above-2000", label: "Trên 2 tỷ VNĐ (Haute)" },
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
  { id: "steel", label: "Thép Oystersteel 904L / 316L" },
  { id: "platinum", label: "Bạch Kim Platinum 950" },
  { id: "diamond", label: "Nạm Kim Cương / Ngọc Lục Bảo" },
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
    <div className="space-y-7 text-xs font-mono">
      {/* Header and Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-[#d4af37]/20">
        <div className="flex items-center gap-2 text-sm font-serif font-bold text-white tracking-wide">
          <FontAwesomeIcon icon={faFilter} className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Bộ Lọc Kiệt Tác</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/25 ml-1">
            {totalResults}
          </span>
        </div>
        <button
          onClick={onReset}
          className="text-[11px] text-zinc-400 hover:text-[#d4af37] transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <FontAwesomeIcon icon={faRotateLeft} className="w-3 h-3" />
          <span>Đặt lại</span>
        </button>
      </div>

      {/* Brand Filter */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-[#d4af37] font-semibold mb-3">
          Thương Hiệu Thụy Sĩ
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
                    : "text-zinc-300 hover:bg-white/[0.04] border border-transparent"
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

      {/* Category Filter */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-[#d4af37] font-semibold mb-3">
          Phong Cách / Dòng Máy
        </label>
        <div className="space-y-1.5">
          {CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange({ ...filters, category: cat.id })}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40 font-bold"
                    : "text-zinc-300 hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <span className="truncate">{cat.label}</span>
                {isSelected && <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#d4af37]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-[#d4af37] font-semibold mb-3">
          Khoảng Giá
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
                    : "text-zinc-300 hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <span className="truncate">{pr.label}</span>
                {isSelected && <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#d4af37]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Diameter Filter */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-[#d4af37] font-semibold mb-3">
          Kích Thước Mặt Số
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
                    : "text-zinc-300 hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <span className="truncate">{dia.label}</span>
                {isSelected && <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#d4af37]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Material Filter */}
      <div>
        <label className="block text-[11px] uppercase tracking-wider text-[#d4af37] font-semibold mb-3">
          Chất Liệu Thân Vỏ
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
                    : "text-zinc-300 hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <span className="truncate">{mat.label}</span>
                {isSelected && <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-[#d4af37]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggles */}
      <div className="pt-2 border-t border-[#d4af37]/15 space-y-3">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-zinc-300 group-hover:text-white transition-colors">
            Chỉ xem Phiên Bản Giới Hạn
          </span>
          <input
            type="checkbox"
            checked={filters.isLimitedOnly}
            onChange={(e) =>
              onChange({ ...filters, isLimitedOnly: e.target.checked })
            }
            className="w-4 h-4 rounded bg-white/[0.04] border-[#d4af37]/40 text-[#d4af37] focus:ring-0 cursor-pointer accent-[#d4af37]"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-zinc-300 group-hover:text-white transition-colors">
            Chỉ xem Mẫu Mới Về (New Arrival)
          </span>
          <input
            type="checkbox"
            checked={filters.isNewOnly}
            onChange={(e) =>
              onChange({ ...filters, isNewOnly: e.target.checked })
            }
            className="w-4 h-4 rounded bg-white/[0.04] border-[#d4af37]/40 text-[#d4af37] focus:ring-0 cursor-pointer accent-[#d4af37]"
          />
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar (Kính mờ, hairline gold, không viền trắng) */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-28 p-6 rounded-3xl bg-[#0c1611]/85 backdrop-blur-xl border border-[#d4af37]/20 shadow-[0_15px_35px_rgba(0,0,0,0.6)]">
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
          <div className="relative ml-auto w-full max-w-sm h-full bg-[#0c1611] border-l border-[#d4af37]/25 p-6 overflow-y-auto shadow-2xl z-10">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#d4af37]/20">
              <span className="font-serif text-lg font-bold text-white">
                Bộ Lọc Sản Phẩm
              </span>
              <button
                onClick={onCloseMobile}
                className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-zinc-300 hover:text-[#d4af37]"
                aria-label="Đóng bộ lọc"
              >
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            </div>
            {content}
            <div className="mt-8 pt-4 border-t border-[#d4af37]/20">
              <button
                onClick={onCloseMobile}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38f28] text-black font-semibold text-xs uppercase tracking-wider"
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
