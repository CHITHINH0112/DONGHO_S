'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCrown,
  faGaugeHigh,
  faClock,
  faReceipt,
  faShieldHalved,
  faCashRegister,
  faFileCircleCheck,
  faUserTie,
  faSliders,
  faRightFromBracket,
  faCircle,
  faXmark,
  faBoxesStacked,
  faWrench,
  faTag,
  faLayerGroup,
} from '@fortawesome/free-solid-svg-icons';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { canAccessRoute, getPositionBadgeInfo } from '@/utils/permissions';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();
  const positionInfo = getPositionBadgeInfo(admin?.position, admin?.role);

  const navigation = [
    {
      name: 'Tổng Quan',
      href: '/',
      icon: faGaugeHigh,
      badge: null,
    },
    {
      name: 'Kho Đồng Hồ & Mẫu',
      href: '/products',
      icon: faClock,
      badge: null,
    },
    {
      name: 'Thương Hiệu & Hãng',
      href: '/brands',
      icon: faTag,
      badge: null,
    },
    {
      name: 'Danh Mục Chế Tác',
      href: '/categories',
      icon: faLayerGroup,
      badge: null,
    },
    {
      name: 'Tính Năng Kỹ Thuật',
      href: '/features',
      icon: faSliders,
      badge: null,
    },
    /* =========================================================================
     * CÁC PHÂN HỆ TẠM ẨN CHO DEADLINE (CHƯA CẦN THIẾT):
     * =========================================================================
    {
      name: 'Đơn Hàng & Cọc VIP',
      href: '/orders',
      icon: faReceipt,
      badge: '14 mới',
    },
    {
      name: 'Bảo Hành & Sửa Chữa',
      href: '/warranties',
      icon: faShieldHalved,
      badge: null,
    },
    {
      name: 'Quản Lý Ca Thu Ngân',
      href: '/shifts',
      icon: faCashRegister,
      badge: 'Đang mở',
      badgeColor: 'emerald',
    },
    {
      name: 'Phiếu Phê Duyệt',
      href: '/approvals',
      icon: faFileCircleCheck,
      badge: '2 chờ',
      badgeColor: 'gold',
    },
    {
      name: 'Nhân Sự & Phân Quyền',
      href: '/staff',
      icon: faUserTie,
      badge: null,
    },
    {
      name: 'Cài Đặt Hệ Thống',
      href: '/settings',
      icon: faSliders,
      badge: null,
    },
    ========================================================================= */
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col bg-[#09110d] border-r border-[#d4af37]/15 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-white/[0.06] bg-[#070e0a]/80 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#122319] to-[#070e0a] border border-[#d4af37]/40 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)] group-hover:border-[#d4af37] transition-colors">
              <FontAwesomeIcon icon={faCrown} className="text-[#d4af37] text-base" />
            </div>
            <div>
              <div className="text-sm font-semibold tracking-[0.2em] text-white uppercase font-sans flex items-center gap-1.5">
                BRU_WATCH<span className="text-[#d4af37]"></span>
              </div>
              <div className="text-[10px] tracking-[0.25em] text-[#d4af37]/70 uppercase font-light">
                LUXURY
              </div>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/[0.05] lg:hidden"
          >
            <FontAwesomeIcon icon={faXmark} className="text-base" />
          </button>
        </div>

        {/* Position-Specific Status Banner */}
        <div className="mx-4 my-3 px-3.5 py-2.5 rounded-lg bg-[#0c1a13]/80 border border-[#d4af37]/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="text-[11px] leading-tight">
              <span className="text-emerald-400 font-medium block">Hệ Thống Trực Tuyến</span>
              <span className="text-stone-400 text-[10px]"></span>
            </div>
          </div>
          <span className="text-[10px] text-[#d4af37] font-mono font-medium bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/20">
            {admin?.name || 'Admin'}
          </span>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
          <div className="px-3 pb-2 pt-1 flex items-center justify-between text-[10px] uppercase font-semibold tracking-[0.2em] text-stone-300">
            <span>Phân Hệ Hoạt Động</span>
            <span className="font-mono text-[#d4af37] text-[9px] lowercase">({navigation.length} mục)</span>
          </div>

          {navigation
            .filter((item) => canAccessRoute(admin, item.href))
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-normal transition-all duration-200 ${isActive
                    ? 'bg-gradient-to-r from-[#00844e]/20 to-transparent text-[#f4f6f5] border-l-2 border-[#d4af37] font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                    : 'text-stone-300 hover:text-white hover:bg-white/[0.04]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isActive
                        ? 'text-[#d4af37] bg-[#d4af37]/10'
                        : 'text-stone-300 group-hover:text-[#d4af37]'
                        }`}
                    >
                      <FontAwesomeIcon icon={item.icon} className="text-sm" />
                    </div>
                    <span className="tracking-wide">{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-white/[0.05] text-stone-300 border-white/[0.08]"
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
        </nav>

        {/* Admin Profile & Exit Footer */}
        <div className="p-3 border-t border-white/[0.06] bg-[#070e0a]/90">
          <div className="p-2.5 rounded-lg bg-[#0c1611] border border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#00844e] p-[1.5px] shadow-sm shrink-0">
                <div className="w-full h-full rounded-full bg-[#070e0a] flex items-center justify-center text-[11px] font-semibold text-[#d4af37]">
                  {admin?.name ? admin.name.substring(0, 2).toUpperCase() : 'AD'}
                </div>
              </div>
              <div className="text-left min-w-0">
                <div className="text-xs font-medium text-stone-200 truncate">
                  {admin?.name || 'Quản Trị Viên'}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-medium truncate ${positionInfo.badgeColor}`}>
                    {positionInfo.shortTitle}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Đăng xuất khỏi hệ thống"
              className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-white/[0.04] rounded transition-colors shrink-0"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="text-xs" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
