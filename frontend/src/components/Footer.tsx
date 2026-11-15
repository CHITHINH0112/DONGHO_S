"use client";

import React, { useState } from "react";
import Link from "next/link";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPhone,
  faLocationDot,
  faEnvelope,
  faArrowRight,
  faShieldHalved,
  faCircleCheck,
  faGem,
} from "@fortawesome/free-solid-svg-icons";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    watchAudio.chime();
    setSubscribed(true);
  };

  return (
    <footer className="bg-[#f0ebe1] dark:bg-[#040805] border-t border-black/[0.06] dark:border-white/[0.06] pt-20 pb-12 text-xs text-foreground dark:text-white transition-colors duration-400">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {/* 4 Columns Nav */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-16 border-b border-black/[0.06] dark:border-white/[0.06]">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8c6a21] flex items-center justify-center text-black font-serif font-black text-xs shadow-md">
                B
              </div>
              <span className="font-serif font-medium text-lg tracking-[0.15em] text-foreground dark:text-white">
                BRU_WATCH
              </span>
            </div>
            <p className="text-muted-foreground dark:text-white/55 leading-relaxed text-xs font-sans font-light">
              Cửa hàng bán lẻ và dịch vụ đồng hồ cao cấp.
            </p>
          </div>

          {/* Boutique Locations */}
          <div className="space-y-3 font-mono">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#9a741e] dark:text-[#d4af37]">
              Hệ Thống Showroom
            </h4>
            <div className="space-y-2.5 text-muted-foreground dark:text-white/60">
              <div className="flex items-start gap-2">
                <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3 text-[#9a741e] dark:text-[#d4af37] shrink-0 mt-0.5" />
                <span>119 Cao Xuân Dục, Phường 12, Quận 8, TP. Hồ Chí Minh</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 font-mono">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#9a741e] dark:text-[#d4af37]">
              Đặc Quyền Khách Hàng
            </h4>
            <ul className="space-y-2 text-muted-foreground dark:text-white/60">
              <li><Link href="/services" className="hover:text-[#006039] dark:hover:text-[#d4af37] transition-colors">Dịch Vụ Sửa Chữa & Bảo Dưỡng</Link></li>
              <li><Link href="/warranty" className="hover:text-[#006039] dark:hover:text-[#d4af37] transition-colors">Tra Cứu Bảo Hành Điện Tử</Link></li>
              <li><Link href="/account" className="hover:text-[#006039] dark:hover:text-[#d4af37] transition-colors">Hồ Sơ Khách Hàng</Link></li>
              <li><Link href="/account/orders" className="hover:text-[#006039] dark:hover:text-[#d4af37] transition-colors">Theo Dõi Đơn Hàng</Link></li>
            </ul>
          </div>

          {/* Concierge */}
          <div className="space-y-3 font-mono">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#9a741e] dark:text-[#d4af37]">
              Chăm Sóc Khách Hàng
            </h4>
            <div className="space-y-2.5 text-muted-foreground dark:text-white/60">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} className="w-3 h-3 text-[#9a741e] dark:text-[#d4af37] shrink-0" />
                <span className="font-bold text-foreground dark:text-white">1800 8899 (Hotline 24/7)</span>
              </div>
              <p className="text-[11px] text-muted-foreground dark:text-white/50 font-sans font-light leading-relaxed">
                Đường dây nóng hỗ trợ tư vấn khách hàng và tiếp nhận dịch vụ kỹ thuật đồng hồ.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-muted-foreground dark:text-white/40 text-[11px] font-mono">
          <div>
            © 2026 BRU_WATCH Genève. Tất cả các quyền được bảo lưu.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-foreground dark:hover:text-white cursor-pointer transition-colors">Chính Sách Bảo Mật</span>
            <span className="hover:text-foreground dark:hover:text-white cursor-pointer transition-colors">Bảo Hành Thụy Sĩ 5 Năm</span>
            <span className="hover:text-foreground dark:hover:text-white cursor-pointer transition-colors">Cam Kết Thẩm Định 100%</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
