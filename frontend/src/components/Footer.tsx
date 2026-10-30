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
        {/* Top Newsletter Card - Deep Emerald & Hairline Gold */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#003822] via-[#004d2e] to-[#002617] text-white shadow-2xl mb-16 relative overflow-hidden border border-[#d4af37]/30 backdrop-blur-xl">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 text-[#d4af37] mb-2.5">
              <FontAwesomeIcon icon={faGem} className="w-4 h-3.5 text-[#d4af37]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37] font-semibold">
                BẢN TIN BRU_WATCH GENÈVE
              </span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-white">
              Thế Giới Nghệ Thuật Cơ Khí <span className="italic text-[#f3e3be]">Thụy Sĩ</span>
            </h3>
            <p className="mt-2.5 text-xs sm:text-sm text-white/75 leading-relaxed font-sans font-light">
              Đăng ký để nhận phân tích xu hướng sưu tầm, những kiệt tác mới cập bến từ Rolex, Audemars Piguet, Patek Philippe và thiệp mời triển lãm độc quyền.
            </p>

            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md">
                <input
                  required
                  type="email"
                  placeholder="Nhập địa chỉ email quý khách..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-3 rounded-full bg-white/[0.08] border border-white/20 text-white placeholder:text-white/40 text-xs focus:outline-none focus:border-[#d4af37] flex-1 backdrop-blur-md"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-[#d4af37] via-[#c69f2e] to-[#b38f28] hover:brightness-105 text-black font-mono text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Đăng Ký</span>
                  <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                </button>
              </form>
            ) : (
              <div className="mt-6 flex items-center gap-2 text-emerald-300 font-mono text-sm">
                <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4 text-emerald-400" />
                Cảm ơn Quý khách. Thư ký Maison sẽ liên hệ gửi bản tin sớm nhất.
              </div>
            )}
          </div>
        </div>

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
              Boutique phân phối và giám định đồng hồ xa xỉ Thụy Sĩ hàng đầu. Nơi hội tụ các thương hiệu đỉnh cao: Rolex, Audemars Piguet, Patek Philippe, Vacheron Constantin, Omega, Cartier.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-[#006039] dark:text-[#a7f3d0]">
              <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5 text-[#006039] dark:text-[#00844e]" />
              <span>100% Thẩm Định Chuẩn Geneva & Wostep</span>
            </div>
          </div>

          {/* Boutique Locations */}
          <div className="space-y-3 font-mono">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#9a741e] dark:text-[#d4af37]">
              Hệ Thống Showroom & Salon
            </h4>
            <div className="space-y-2.5 text-muted-foreground dark:text-white/60">
              <Link href="/boutiques" className="flex items-start gap-2 hover:text-[#006039] dark:hover:text-[#d4af37] transition-colors">
                <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3 text-[#9a741e] dark:text-[#d4af37] shrink-0 mt-0.5" />
                <span>Boutique Tràng Tiền Plaza, Hoàn Kiếm, Hà Nội</span>
              </Link>
              <Link href="/boutiques" className="flex items-start gap-2 hover:text-[#006039] dark:hover:text-[#d4af37] transition-colors">
                <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3 text-[#9a741e] dark:text-[#d4af37] shrink-0 mt-0.5" />
                <span>Boutique 68 Đồng Khởi, Quận 1, TP. Hồ Chí Minh</span>
              </Link>
              <div className="flex items-start gap-2 text-muted-foreground/70 dark:text-white/40">
                <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3 text-muted-foreground/70 dark:text-white/40 shrink-0 mt-0.5" />
                <span>Trụ sở Thụy Sĩ: Rue du Rhône 42, 1204 Genève</span>
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
              <li><Link href="/boutiques" className="hover:text-[#006039] dark:hover:text-[#d4af37] transition-colors">Khám Phá VIP Salon Suite</Link></li>
              <li><Link href="/account" className="hover:text-[#006039] dark:hover:text-[#d4af37] transition-colors">Hồ Sơ & Thẻ Hội Viên VIP</Link></li>
              <li><Link href="/account/orders" className="hover:text-[#006039] dark:hover:text-[#d4af37] transition-colors">Theo Dõi Vận Đơn Xe Bọc Thép</Link></li>
            </ul>
          </div>

          {/* Concierge */}
          <div className="space-y-3 font-mono">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-[#9a741e] dark:text-[#d4af37]">
              Chăm Sóc Khách Hàng & VIP
            </h4>
            <div className="space-y-2.5 text-muted-foreground dark:text-white/60">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faPhone} className="w-3 h-3 text-[#9a741e] dark:text-[#d4af37] shrink-0" />
                <span className="font-bold text-foreground dark:text-white">1800 8899 (Hotline 24/7)</span>
              </div>
              <p className="text-[11px] text-muted-foreground dark:text-white/50 font-sans font-light leading-relaxed">
                Đường dây nóng hỗ trợ khách hàng, thẩm định đồng hồ và đặt lịch tiếp đón VIP Salon riêng tư.
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
