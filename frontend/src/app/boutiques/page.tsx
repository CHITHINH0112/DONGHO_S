"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingColumns,
  faLocationDot,
  faPhone,
  faClock,
  faCrown,
  faShieldHalved,
  faWineGlass,
  faCar,
  faCalendarCheck,
  faAward,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

export default function BoutiquesPage() {
  const { setIsVipModalOpen } = useCart();

  const handleBookVip = () => {
    watchAudio.click();
    setIsVipModalOpen(true);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#006039]/20 border border-[#006039]/40 text-[#d4af37] mb-3 shadow-lg">
          <FontAwesomeIcon icon={faBuildingColumns} className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#d4af37] block">
          EXCLUSIVE PRIVATE SALON & BOUTIQUE DIRECTORY
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-normal text-foreground mt-1">
          Hệ Thống Boutique & VIP Salon Thượng Lưu
        </h1>
        <p className="text-xs text-muted-foreground mt-2 font-light leading-relaxed">
          Không gian thưởng lãm biệt lập thiết kế theo tiêu chuẩn các salon kín đáo tại Geneva và Zurich, dành riêng cho các nhà sưu tập tinh hoa bậc nhất.
        </p>
      </div>

      {/* Boutique Locations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Boutique 1: Trang Tien, Hanoi */}
        <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-xl flex flex-col justify-between group hover:border-[#d4af37]/50 transition-all">
          <div>
            <div className="relative w-full h-64 bg-black/60 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80"
                alt="BRU_WATCH Flagship Tràng Tiền"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-black/40 to-transparent" />
              <div className="absolute bottom-4 left-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] bg-black/70 px-3 py-1 rounded-full border border-[#d4af37]/30">
                  FLAGSHIP SALON BẮC BỘ
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-white mt-1.5">
                  Boutique Tràng Tiền • Hà Nội
                </h3>
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-4">
              <div className="space-y-2 text-xs font-mono text-foreground/80">
                <div className="flex items-start gap-2.5">
                  <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 text-[#d4af37] mt-0.5 shrink-0" />
                  <span>Số 15 Tràng Tiền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faPhone} className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                  <span>Hotline VIP Concierge: <strong>024 3999 8888</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faClock} className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                  <span>Đón tiếp riêng tư: 09:30 - 21:30 (Mở cửa tất cả các ngày trong tuần)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border space-y-2">
                <span className="text-[11px] font-mono uppercase text-muted-foreground block">
                  Đặc quyền tại Salon Tràng Tiền:
                </span>
                <ul className="text-xs text-muted-foreground space-y-1.5 font-light">
                  <li className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-emerald-400" />
                    <span>Phòng thử kín Suite riêng tư nhìn thẳng ra Nhà Hát Lớn Hà Nội.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-emerald-400" />
                    <span>Tủ xì gà bảo quản Humidor nghệ thuật Cohiba Behike & Trinidad.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-emerald-400" />
                    <span>Trạm kiểm định Witschi Chronoscope trực quan cùng Thợ Thụy Sĩ.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0">
            <button
              onClick={handleBookVip}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38f28] text-black font-mono text-xs font-semibold uppercase tracking-wider shadow cursor-pointer hover:opacity-90 transition-opacity"
            >
              Đặt Phòng Thử Kín Tại Tràng Tiền
            </button>
          </div>
        </div>

        {/* Boutique 2: Dong Khoi, HCMC */}
        <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-xl flex flex-col justify-between group hover:border-[#d4af37]/50 transition-all">
          <div>
            <div className="relative w-full h-64 bg-black/60 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
                alt="BRU_WATCH Grand Salon Đồng Khởi"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-black/40 to-transparent" />
              <div className="absolute bottom-4 left-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] bg-black/70 px-3 py-1 rounded-full border border-[#d4af37]/30">
                  GRAND PRIVATE SALON NAM BỘ
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-white mt-1.5">
                  Grand Salon Đồng Khởi • Sài Gòn
                </h3>
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-4">
              <div className="space-y-2 text-xs font-mono text-foreground/80">
                <div className="flex items-start gap-2.5">
                  <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 text-[#d4af37] mt-0.5 shrink-0" />
                  <span>Số 68 Đồng Khởi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faPhone} className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                  <span>Hotline VIP Concierge: <strong>028 3888 9999</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faClock} className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                  <span>Đón tiếp riêng tư: 09:30 - 22:00 (Mở cửa tất cả các ngày trong tuần)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border space-y-2">
                <span className="text-[11px] font-mono uppercase text-muted-foreground block">
                  Đặc quyền tại Salon Đồng Khởi:
                </span>
                <ul className="text-xs text-muted-foreground space-y-1.5 font-light">
                  <li className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-emerald-400" />
                    <span>Hầm rượu vang quý hiếm lưu giữ các chai Grand Cru Classé 1855.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-emerald-400" />
                    <span>Lối đón xe bọc thép riêng biệt dưới hầm bảo mật không người qua lại.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-emerald-400" />
                    <span>Bàn tiệc trà chiều thượng lưu Geneva kết hợp giám định cỗ máy.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0">
            <button
              onClick={handleBookVip}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38f28] text-black font-mono text-xs font-semibold uppercase tracking-wider shadow cursor-pointer hover:opacity-90 transition-opacity"
            >
              Đặt Phòng Thử Kín Tại Đồng Khởi
            </button>
          </div>
        </div>
      </div>

      {/* 4-Step VIP Concierge Hospitality Protocol */}
      <div className="p-8 sm:p-10 rounded-3xl bg-card border border-border space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37]">
            WHITE-GLOVE CONCIERGE PROTOCOL
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-normal text-foreground mt-1">
            Quy Trình Đón Tiếp Khách VIP Thượng Lưu
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          <div className="p-5 rounded-2xl bg-muted/30 border border-border text-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-sm font-serif font-bold">
              01
            </div>
            <h4 className="font-serif text-sm font-medium text-foreground">
              Đưa Đón Bằng Limousine
            </h4>
            <p className="text-muted-foreground font-light leading-relaxed">
              Xe Maybach chống đạn đưa đón Quý khách tận tư gia hoặc sân bay đến salon kín đáo.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-muted/30 border border-border text-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-sm font-serif font-bold">
              02
            </div>
            <h4 className="font-serif text-sm font-medium text-foreground">
              Phòng Thử Kín 1:1
            </h4>
            <p className="text-muted-foreground font-light leading-relaxed">
              Không gian biệt lập tuyệt đối, chỉ có Quý khách và Giám Đốc Salon tiếp đón.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-muted/30 border border-border text-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-sm font-serif font-bold">
              03
            </div>
            <h4 className="font-serif text-sm font-medium text-foreground">
              Thuyết Minh Cỗ Máy 3D
            </h4>
            <p className="text-muted-foreground font-light leading-relaxed">
              Thợ Thụy Sĩ trực tiếp trình diễn chi tiết Calibre, độ dao động bánh lắc và lịch sử kiệt tác.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-muted/30 border border-border text-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center text-sm font-serif font-bold">
              04
            </div>
            <h4 className="font-serif text-sm font-medium text-foreground">
              Bàn Giao & Thẻ Geneva
            </h4>
            <p className="text-muted-foreground font-light leading-relaxed">
              Kẹp chì niêm phong điện tử và cấp Thẻ bảo hành quốc tế lưu trữ bảo mật vĩnh viễn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
