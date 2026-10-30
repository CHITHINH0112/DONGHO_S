'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  faBars,
  faMagnifyingGlass,
  faPlus,
  faBell,
  faRotate,
  faBuildingColumns,
  faClock,
} from '@fortawesome/free-solid-svg-icons';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  title?: string;
  subtitle?: string;
}

export default function AdminHeader({
  onToggleSidebar,
  title = 'Bảng Điều Khiển Tổng Quan',
  subtitle = 'Trung tâm vận hành & quản trị chuỗi đồng hồ xa xỉ',
}: AdminHeaderProps) {
  const { admin } = useAdminAuth();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-20 bg-[#070e0a]/85 backdrop-blur-md border-b border-[#d4af37]/15 px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-stone-300 hover:text-white hover:bg-white/[0.05] lg:hidden"
          title="Mở menu điều hướng"
        >
          <FontAwesomeIcon icon={faBars} className="text-lg" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base lg:text-lg font-medium text-stone-100 tracking-wide">
              {title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-medium tracking-wider bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/25">
              Live Portal
            </span>
          </div>
          <p className="text-[11px] text-stone-300 hidden sm:block font-light">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: Search + Quick Action + Time + Notifications */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-300">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-xs" />
          </div>
          <input
            type="text"
            placeholder="Tìm mã đơn, số serial,..."
            className="w-64 lg:w-80 pl-9 pr-14 py-2 bg-[#0c1611] text-xs text-stone-200 placeholder-stone-400 rounded-lg border border-white/[0.08] focus:border-[#d4af37]/50 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/30 transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono text-stone-300 bg-white/[0.06] rounded border border-white/[0.1]">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Live Clock & Boutique Location */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0c1611]/70 border border-white/[0.06] text-xs text-stone-300">
          <FontAwesomeIcon icon={faBuildingColumns} className="text-[#d4af37] text-[11px]" />
          <span></span>
          <span className="text-stone-400">•</span>
          <FontAwesomeIcon icon={faClock} className="text-emerald-400 text-[11px]" />
          <span className="font-mono text-stone-200 font-medium">
            {currentTime || '15:30:00'}
          </span>
        </div>

        {/* Quick Refresh */}
        <button
          title="Làm mới dữ liệu"
          className="p-2 rounded-lg text-stone-300 hover:text-[#d4af37] hover:bg-white/[0.05] transition-colors"
        >
          <FontAwesomeIcon icon={faRotate} className="text-sm" />
        </button>

        {/* Notifications */}
        <button
          title="Thông báo hệ thống"
          className="relative p-2 rounded-lg text-stone-300 hover:text-white hover:bg-white/[0.05] transition-colors"
        >
          <FontAwesomeIcon icon={faBell} className="text-sm" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af37]"></span>
          </span>
        </button>

        {/* Dynamic Action Button based on position */}
        {admin?.role === 'admin' || admin?.position === 'manager' || admin?.position === 'sales' ? (
          <Link href="/products" className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#00844e] to-[#006039] hover:from-[#009b5c] hover:to-[#007345] text-white text-xs font-medium tracking-wide shadow-[0_4px_15px_rgba(0,132,78,0.25)] border border-emerald-400/30 transition-all cursor-pointer">
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
            <span className="hidden sm:inline">Kho Đồng Hồ & Mẫu</span>
          </Link>
        ) : admin?.position === 'warehouse' ? (
          <Link href="/products" className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-medium tracking-wide shadow-[0_4px_15px_rgba(217,119,6,0.25)] border border-amber-400/30 transition-all">
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
            <span className="hidden sm:inline">Nhập Kho Mới</span>
          </Link>
        ) : (
          <Link href="/products" className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white text-xs font-medium tracking-wide shadow-[0_4px_15px_rgba(2,132,199,0.25)] border border-sky-400/30 transition-all">
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
            <span className="hidden sm:inline">Tiếp Nhận Sửa Chữa</span>
          </Link>
        )}
      </div>
    </header>
  );
}
