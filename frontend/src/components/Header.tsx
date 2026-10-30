"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faMoon,
  faBagShopping,
  faHeart,
  faScaleBalanced,
  faBars,
  faXmark,
  faCalendarCheck,
  faVolumeHigh,
  faVolumeXmark,
  faUser,
  faCrown,
  faGem,
  faArrowRightFromBracket,
  faLocationDot,
  faBoxArchive,
  faWrench,
  faCertificate,
  faBuildingColumns,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

export default function Header() {
  const { theme, toggleTheme, soundEnabled, toggleSound } = useTheme();
  const {
    totalItems,
    setIsCartOpen,
    wishlist,
    compareList,
    setIsCompareOpen,
    setIsVipModalOpen,
  } = useCart();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (id: string) => {
    watchAudio.click();
    setMobileMenuOpen(false);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  const getVipBadgeColor = (tier?: string) => {
    if (tier?.includes("Platinum")) return "text-slate-300 bg-slate-400/10 border-slate-400/30";
    if (tier?.includes("Diamond")) return "text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/30";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-8 ${
          scrolled ? "py-2" : "py-3.5"
        }`}
      >
        <div
          className={`max-w-7xl mx-auto px-5 sm:px-7 py-2.5 rounded-full transition-all duration-500 flex items-center justify-between border bg-card/90 backdrop-blur-2xl border-[#d4af37]/30 shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.7)] text-foreground`}
        >
          {/* Boutique Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8c6a21] flex items-center justify-center text-black font-serif font-bold text-xs shadow-md group-hover:scale-105 transition-transform">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-medium tracking-[0.16em] text-sm sm:text-base text-foreground group-hover:text-[#d4af37] transition-colors leading-none">
                BRU_WATCH
              </span>
              <span className="text-[7px] font-mono tracking-[0.25em] uppercase text-muted-foreground mt-0.5">
                BRU_WATCH • GENÈVE
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 font-mono text-[11px] tracking-wider uppercase font-medium text-foreground/80">
            <Link
              href="/products"
              className="text-[#d4af37] hover:text-[#f3e3be] transition-colors font-semibold flex items-center gap-1.5"
            >
              <span>Kiệt Tác</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
            </Link>

            <Link
              href="/services"
              className="hover:text-[#d4af37] transition-colors cursor-pointer"
            >
              Dịch Vụ
            </Link>

            <Link
              href="/warranty"
              className="hover:text-[#d4af37] transition-colors cursor-pointer"
            >
              Bảo Hành
            </Link>

            <Link
              href="/boutiques"
              className="hover:text-[#d4af37] transition-colors cursor-pointer"
            >
              Boutiques
            </Link>

            <button
              onClick={() => {
                watchAudio.click();
                setIsVipModalOpen(true);
              }}
              className="hover:text-[#d4af37] transition-colors cursor-pointer text-foreground/80 flex items-center gap-1.5"
            >
              <FontAwesomeIcon icon={faCalendarCheck} className="w-3 h-3 text-[#d4af37]" />
              <span>VIP Salon</span>
            </button>
          </nav>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === "light" ? "Chuyển chế độ Dark Mode" : "Chuyển chế độ Light Mode"}
              aria-label={theme === "light" ? "Chuyển chế độ Dark Mode" : "Chuyển chế độ Light Mode"}
              className="w-9 h-9 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-[#d4af37]/20 border border-[#d4af37]/25 flex items-center justify-center transition-all cursor-pointer text-foreground"
            >
              <FontAwesomeIcon
                icon={theme === "light" ? faMoon : faSun}
                className="w-3.5 h-3.5 text-[#d4af37]"
              />
            </button>

            {/* Compare */}
            {compareList.length > 0 && (
              <button
                onClick={() => {
                  watchAudio.click();
                  setIsCompareOpen(true);
                }}
                className="relative w-9 h-9 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] cursor-pointer"
                title="So sánh đồng hồ"
                aria-label="So sánh đồng hồ"
              >
                <FontAwesomeIcon icon={faScaleBalanced} className="w-3.5 h-3.5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#d4af37] text-black font-mono text-[9px] font-bold flex items-center justify-center">
                  {compareList.length}
                </span>
              </button>
            )}

            {/* Wishlist Button */}
            <Link
              href="/account/wishlist"
              title="Danh sách yêu thích"
              className="relative w-9 h-9 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-rose-500/10 border border-[#d4af37]/25 flex items-center justify-center transition-all cursor-pointer text-foreground"
            >
              <FontAwesomeIcon
                icon={faHeart}
                className={`w-3.5 h-3.5 ${
                  wishlist.length > 0 ? "text-rose-500" : "text-muted-foreground"
                }`}
              />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Button */}
            <button
              onClick={() => {
                watchAudio.click();
                setIsCartOpen(true);
              }}
              className="flex items-center gap-2 pl-3.5 pr-4 py-2 rounded-full bg-gradient-to-r from-[#d4af37] via-[#c69f2e] to-[#b38f28] text-black font-mono text-xs font-semibold uppercase tracking-wider shadow-md hover:scale-102 active:scale-95 transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faBagShopping} className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-bold">Giỏ Hàng</span>
              <span className="w-4 h-4 rounded-full bg-black text-[#d4af37] text-[10px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            </button>

            {/* User Account Button & Dropdown */}
            <div className="relative" ref={dropdownRef}>
              {isAuthenticated && user ? (
                <div>
                  <button
                    onClick={() => {
                      watchAudio.click();
                      setUserDropdownOpen(!userDropdownOpen);
                    }}
                    className="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-[#d4af37]/15 border border-[#d4af37]/35 text-foreground transition-all cursor-pointer"
                    title="Tài khoản VIP"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8c6a21] text-black flex items-center justify-center font-bold text-[10px] font-serif shadow">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-[11px] font-mono font-medium max-w-[80px] sm:max-w-[100px] truncate hidden md:inline">
                      {user.name.split(" ").slice(-1)[0]}
                    </span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`w-2.5 h-2.5 text-muted-foreground transition-transform duration-200 ${
                        userDropdownOpen ? "rotate-180 text-[#d4af37]" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#09130e]/95 border border-[#d4af37]/30 shadow-2xl p-2.5 text-white backdrop-blur-2xl z-50 animate-fadeIn space-y-1">
                      {/* User Info Bar */}
                      <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-serif font-normal text-white truncate max-w-[140px]">
                            {user.name}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${getVipBadgeColor(
                              user.vipTier
                            )}`}
                          >
                            {user.vipTier.split(" ")[0]}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-white/50 truncate mt-0.5">
                          {user.email}
                        </div>
                      </div>

                      {/* Menu Links */}
                      <Link
                        href="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <FontAwesomeIcon icon={faCrown} className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Hồ Sơ & Thẻ VIP</span>
                      </Link>

                      <Link
                        href="/account/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <FontAwesomeIcon icon={faBoxArchive} className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Lịch Sử Đơn Mua</span>
                      </Link>

                      <Link
                        href="/account/addresses"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Sổ Địa Chỉ Bảo Mật</span>
                      </Link>

                      <Link
                        href="/account/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <FontAwesomeIcon icon={faHeart} className="w-3.5 h-3.5 text-rose-400" />
                        <span>Kiệt Tác Ước Nguyện</span>
                      </Link>

                      <div className="pt-1 border-t border-white/[0.06]">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono text-rose-400/90 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-3.5 h-3.5" />
                          <span>Đăng Xuất An Toàn</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal("login")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-[#d4af37]/20 border border-[#d4af37]/25 text-xs font-mono transition-all cursor-pointer text-foreground"
                  title="Đăng nhập VIP"
                >
                  <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span className="hidden xl:inline text-[11px] font-medium tracking-wider uppercase">
                    Đăng Nhập
                  </span>
                </button>
              )}
            </div>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-[#d4af37]/25 flex items-center justify-center text-foreground cursor-pointer"
              aria-label="Menu"
            >
              <FontAwesomeIcon
                icon={mobileMenuOpen ? faXmark : faBars}
                className="w-4 h-4 text-[#d4af37]"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-background/95 backdrop-blur-2xl flex flex-col justify-center px-8 py-16 animate-fadeIn">
          <div className="flex flex-col gap-5 text-foreground">
            {isAuthenticated && user ? (
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-[#d4af37]/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-[#d4af37] uppercase">{user.vipTier}</div>
                  <div className="font-serif text-lg font-normal text-white">{user.name}</div>
                </div>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-full bg-[#d4af37] text-black text-xs font-mono font-bold uppercase"
                >
                  Vào Hồ Sơ
                </Link>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal("login");
                }}
                className="p-3.5 rounded-2xl bg-white/[0.04] border border-[#d4af37]/30 flex items-center justify-center gap-2 text-[#d4af37] font-mono text-xs uppercase font-semibold"
              >
                <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5" />
                <span>Đăng Nhập Khách VIP Salon</span>
              </button>
            )}

            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left font-serif text-xl font-normal text-[#d4af37]"
            >
              Bộ Sưu Tập Kiệt Tác
            </Link>

            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left font-serif text-xl font-normal hover:text-[#d4af37]"
            >
              Dịch Vụ Sửa Chữa BRU_WATCH
            </Link>

            <Link
              href="/warranty"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left font-serif text-xl font-normal hover:text-[#d4af37]"
            >
              Tra Cứu Bảo Hành Toàn Cầu
            </Link>

            <Link
              href="/boutiques"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left font-serif text-xl font-normal hover:text-[#d4af37]"
            >
              Hệ Thống Showroom Boutique
            </Link>

            <button
              onClick={() => handleNavClick("luxury-brands")}
              className="text-left font-serif text-xl font-normal hover:text-[#d4af37]"
            >
              Các Hãng Đồng Hồ Danh Tiếng
            </button>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Âm thanh cơ học:
              </span>
              <button
                onClick={toggleSound}
                className="px-3 py-1.5 rounded-full border border-border text-xs font-mono flex items-center gap-1.5"
              >
                <FontAwesomeIcon icon={soundEnabled ? faVolumeHigh : faVolumeXmark} className="w-3 h-3 text-[#d4af37]" />
                <span>{soundEnabled ? "Bật" : "Tắt"}</span>
              </button>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsVipModalOpen(true);
              }}
              className="mt-2 py-3.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b38f28] text-black text-xs font-bold font-mono uppercase tracking-widest text-center shadow-xl"
            >
              Đặt Lịch Hẹn Tại Boutique VIP
            </button>
          </div>
        </div>
      )}
    </>
  );
}
