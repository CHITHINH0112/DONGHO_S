"use client";

import React from "react";
import Link from "next/link";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCrown,
  faBolt,
  faAward,
  faCross,
  faCompass,
  faGem,
} from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface LuxuryBrand {
  id: string;
  name: string;
  origin: string;
  founded: string;
  tagline: string;
  signature: string;
  modelsCount: string;
  faIcon: IconDefinition;
  iconBg: string;
}

const LUXURY_BRANDS: LuxuryBrand[] = [
  {
    id: "rolex",
    name: "Rolex Genève",
    origin: "Genève, Thụy Sĩ",
    founded: "1905",
    tagline: "Biểu Tượng Của Vị Thế & Độ Bền Bỉ Cơ Học Vĩnh Cửu",
    signature: "Vành Khía Vàng 18K & Thép Oystersteel 904L",
    modelsCount: "18 Mẫu Sẵn Có",
    faIcon: faCrown,
    iconBg: "bg-[#006039]/20 text-[#00844e]",
  },
  {
    id: "audemars-piguet",
    name: "Audemars Piguet",
    origin: "Le Brassus, Thụy Sĩ",
    founded: "1875",
    tagline: "Kỷ Nguyên Thể Thao Xa Xỉ & Mặt Số Vân Grande Tapisserie",
    signature: "Vành Bát Giác Huyền Thoại & Siêu Mỏng Ultra-Thin",
    modelsCount: "12 Mẫu Sẵn Có",
    faIcon: faBolt,
    iconBg: "bg-[#a37e2c]/20 text-[#d4af37]",
  },
  {
    id: "patek-philippe",
    name: "Patek Philippe",
    origin: "Genève, Thụy Sĩ",
    founded: "1839",
    tagline: "Đế Vương BRU_WATCH - Gìn Giữ Di Sản Cho Thế Hệ Mai Sau",
    signature: "Grand Complication & Chạm Khắc Kim Hoàn Thủ Công",
    modelsCount: "9 Mẫu Phòng VIP",
    faIcon: faAward,
    iconBg: "bg-[#d4af37]/20 text-[#d4af37]",
  },
  {
    id: "vacheron-constantin",
    name: "Vacheron Constantin",
    origin: "Genève, Thụy Sĩ",
    founded: "1755",
    tagline: "Nhà Chế Tác Đồng Hồ Lâu Đời Nhất Nhân Loại Không Gián Đoạn",
    signature: "Chữ Thập Maltese & Tiêu Chuẩn Poinçon de Genève",
    modelsCount: "8 Mẫu Sẵn Có",
    faIcon: faCross,
    iconBg: "bg-[#8c6a21]/20 text-[#e6c875]",
  },
  {
    id: "omega",
    name: "Omega",
    origin: "Biel / Bienne, Thụy Sĩ",
    founded: "1848",
    tagline: "Chinh Phục Không Gian Vũ Trụ & Độ Sâu Thẳm Đại Dương",
    signature: "Bộ Thoát Đồng Trục Co-Axial Master Chronometer",
    modelsCount: "14 Mẫu Sẵn Có",
    faIcon: faCompass,
    iconBg: "bg-[#006039]/20 text-[#a7f3d0]",
  },
  {
    id: "cartier",
    name: "Cartier",
    origin: "Paris & La Chaux-de-Fonds",
    founded: "1847",
    tagline: "Vương Miện Của Các Nhà Kim Hoàn - Nghệ Thuật Hình Khối Bất Hủ",
    signature: "Mặt Số Số La Mã & Núm Đính Sapphire Cabochon Xanh",
    modelsCount: "11 Mẫu Sẵn Có",
    faIcon: faGem,
    iconBg: "bg-amber-900/20 text-[#d4af37]",
  },
];

export default function BrandDirectorySection() {
  const scrollToCatalog = () => {
    watchAudio.click();
    const catalog = document.getElementById("luxury-catalog") || document.getElementById("rolex-models");
    if (catalog) {
      catalog.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="luxury-brands" className="py-28 bg-[#f5f1e8] dark:bg-[#070e0a] relative overflow-hidden transition-colors duration-400">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[#006039]/5 dark:bg-[#006039]/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.03] border border-[#d4af37]/25 text-[#9a741e] dark:text-[#d4af37] text-xs font-mono tracking-[0.25em] uppercase mb-4 backdrop-blur-md">
            <FontAwesomeIcon icon={faCompass} className="w-3 h-3 text-[#9a741e] dark:text-[#d4af37]" />
            <span>Thương Hiệu Được Ủy Quyền & Tuyển Chọn</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground dark:text-white tracking-tight leading-tight">
            Những Đỉnh Cao Của Ngành Đồng Hồ <span className="italic text-[#9a741e] dark:text-[#f3e3be]">Thế Giới</span>
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-muted-foreground dark:text-white/60 leading-relaxed font-sans max-w-2xl mx-auto font-light">
            Mỗi thương hiệu đại diện cho một triết lý thẩm mỹ và thành tựu cơ khí đỉnh cao. 
            Tất cả cỗ máy đều được nhập khẩu nguyên chiếc và lưu trữ trong buồng cân bằng độ ẩm tiêu chuẩn Thụy Sĩ.
          </p>
        </div>

        {/* 6 Luxury Brands Grid (Luxury Shadow, Không viền trắng thô) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {LUXURY_BRANDS.map((b) => (
            <div
              key={b.id}
              className="luxury-card group rounded-3xl p-8 flex flex-col justify-between"
            >
              {/* Top Row: Icon + Origin */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-13 h-13 rounded-2xl ${b.iconBg} border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-center text-xl group-hover:scale-108 transition-transform`}>
                    <FontAwesomeIcon icon={b.faIcon} className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground dark:text-white/40 block">
                      {b.origin}
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#9a741e] dark:text-[#d4af37]">
                      Est. {b.founded}
                    </span>
                  </div>
                </div>

                {/* Brand Name & Tagline */}
                <h3 className="font-serif text-2xl font-normal text-foreground dark:text-white group-hover:text-[#006039] dark:group-hover:text-[#a7f3d0] transition-colors">
                  {b.name}
                </h3>
                <p className="mt-2.5 text-xs text-muted-foreground dark:text-white/60 leading-relaxed font-sans font-light">
                  {b.tagline}
                </p>

                {/* Signature Feature */}
                <div className="mt-6 pt-5 border-t border-black/[0.06] dark:border-white/[0.06] space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#9a741e] dark:text-[#d4af37]/70 font-semibold">
                    Dấu Ấn Đặc Trưng
                  </div>
                  <div className="text-xs font-normal text-foreground/90 dark:text-white/80 flex items-center gap-2">
                    <FontAwesomeIcon icon={faGem} className="w-3 h-3 text-[#9a741e] dark:text-[#d4af37] shrink-0" />
                    <span>{b.signature}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Models count + CTA */}
              <div className="mt-8 pt-5 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#006039] dark:text-[#a7f3d0] font-medium bg-[#006039]/10 dark:bg-[#006039]/30 border border-[#006039]/20 dark:border-[#006039]/40 px-3 py-1 rounded-full">
                  {b.modelsCount}
                </span>

                <Link
                  href={`/products?brand=${encodeURIComponent(b.name)}`}
                  className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-foreground/80 dark:text-white/80 hover:text-[#006039] dark:hover:text-[#d4af37] transition-colors cursor-pointer group-hover:translate-x-1 duration-300 font-semibold"
                >
                  <span>Xem {b.name}</span>
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3 text-[#9a741e] dark:text-[#d4af37]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
