"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCrown,
  faBoxArchive,
  faLocationDot,
  faHeart,
  faArrowRightFromBracket,
  faShieldHalved,
  faGem,
  faBuildingColumns,
} from "@fortawesome/free-solid-svg-icons";

export default function AccountNav() {
  const pathname = usePathname();
  const { user, logout, openAuthModal } = useAuth();

  if (!user) {
    return (
      <div className="py-20 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[#006039]/20 border border-[#006039]/40 flex items-center justify-center text-[#d4af37] mb-4">
          <FontAwesomeIcon icon={faShieldHalved} className="w-7 h-7" />
        </div>
        <h2 className="font-serif text-2xl font-normal text-foreground">
          Khu Vực Dành Riêng Cho Quý Khách Hội Viên
        </h2>
        <p className="text-xs text-muted-foreground max-w-md mt-2 font-light">
          Vui lòng đăng nhập bằng thẻ thành viên bảo mật BRU_WATCH để truy cập hồ sơ đặc quyền, lịch sử vận đơn xe bọc thép và sổ địa chỉ.
        </p>
        <button
          onClick={() => openAuthModal("login")}
          className="mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b38f28] text-black font-semibold text-xs shadow-lg uppercase tracking-wider cursor-pointer"
        >
          Đăng Nhập Khách VIP Salon
        </button>
      </div>
    );
  }

  const navItems = [
    {
      label: "Hồ Sơ & Thẻ VIP",
      href: "/account",
      icon: faCrown,
    },
    {
      label: "Lịch Sử Đơn Mua",
      href: "/account/orders",
      icon: faBoxArchive,
    },
    {
      label: "Sổ Địa Chỉ Bảo Mật",
      href: "/account/addresses",
      icon: faLocationDot,
    },
    {
      label: "Kiệt Tác Ước Nguyện",
      href: "/account/wishlist",
      icon: faHeart,
    },
  ];

  const getTierIcon = (tier: string) => {
    if (tier.includes("Platinum")) return faGem;
    if (tier.includes("Diamond")) return faBuildingColumns;
    return faCrown;
  };

  const getTierBadgeClass = (tier: string) => {
    if (tier.includes("Platinum")) return "text-slate-300 bg-slate-400/10 border-slate-400/30";
    if (tier.includes("Diamond")) return "text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/30";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  };

  return (
    <div className="w-full mb-8">
      {/* Top Banner / VIP Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#09130e] via-[#0d1a13] to-[#09130e] border border-[#d4af37]/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white mb-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37] via-[#b8952b] to-[#7a5d17] text-black flex items-center justify-center font-serif text-2xl font-bold shadow-lg shadow-[#d4af37]/20 shrink-0">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-serif text-xl sm:text-2xl font-normal text-white">
                  Kính chào, {user.name}
                </h1>
                <span
                  className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border uppercase tracking-wider font-semibold flex items-center gap-1.5 ${getTierBadgeClass(
                    user.vipTier
                  )}`}
                >
                  <FontAwesomeIcon icon={getTierIcon(user.vipTier)} className="w-2.5 h-2.5" />
                  <span>{user.vipTier}</span>
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-white/50 mt-1 flex-wrap">
                <span>Mã Thẻ: {user.privilegeCardNumber}</span>
                <span>•</span>
                <span>Hội viên từ: {user.memberSince}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              onClick={() => {
                watchAudio.ratchet();
                logout();
              }}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/10 border border-white/[0.08] hover:border-rose-500/30 text-rose-400 text-xs font-mono transition-all flex items-center gap-2 cursor-pointer"
            >
              <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-3 h-3" />
              <span>Đăng Xuất</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-3 scrollbar-none border-b border-[#d4af37]/15">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => watchAudio.tick()}
              className={`px-5 py-3 rounded-2xl font-mono text-xs tracking-wider uppercase whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-[#d4af37] via-[#e5c66b] to-[#b8952b] text-black font-semibold shadow-lg shadow-[#d4af37]/20 border border-[#f5e2a3]/40"
                  : "luxury-card text-foreground/75 hover:text-foreground hover:border-[#d4af37]/40"
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="w-3 h-3" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
