'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { canAccessRoute, getPositionBadgeInfo } from '@/utils/permissions';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCrown,
  faSpinner,
  faShieldHalved,
  faArrowLeft,
  faLock,
} from '@fortawesome/free-solid-svg-icons';

interface AdminShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AdminShell({
  children,
  title,
  subtitle,
}: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { admin, isAuthenticated, isLoading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Loading state with luxury branding
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070e0a] flex flex-col items-center justify-center gap-4 text-stone-200">
        <div className="w-14 h-14 rounded-2xl bg-[#0c1611] border border-[#d4af37]/40 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)]">
          <FontAwesomeIcon icon={faCrown} className="text-[#d4af37] text-2xl animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#d4af37]">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm" />
          <span>Đang xác thực quyền truy cập hệ thống...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isAllowed = canAccessRoute(admin, pathname);
  const positionInfo = getPositionBadgeInfo(admin?.position, admin?.role);

  return (
    <div className="min-h-screen bg-[#070e0a] text-stone-100 flex">
      {/* Background radial luxury lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-[600px] h-[350px] bg-emerald-950/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/4 right-10 w-[500px] h-[350px] bg-[#d4af37]/5 rounded-full blur-[160px]" />
      </div>

      {/* Sidebar with dynamic RBAC filtering */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 z-10 min-w-0">
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          title={title}
          subtitle={subtitle}
        />

        <main className="flex-1 p-4 lg:p-8 space-y-8 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {isAllowed ? (
            children
          ) : (
            /* 403 Forbidden Restricted Screen */
            <div className="py-16 flex flex-col items-center justify-center text-center max-w-xl mx-auto luxury-card rounded-2xl p-8 border border-red-500/25">
              <div className="w-16 h-16 rounded-2xl bg-red-950/30 border border-red-500/40 flex items-center justify-center text-red-400 mb-4 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <FontAwesomeIcon icon={faLock} className="text-2xl" />
              </div>

              <div className="text-[10px] tracking-[0.25em] uppercase font-semibold text-red-400 mb-1">
                403 Forbidden • Quyền Hạn Bị Giới Hạn
              </div>
              <h2 className="text-lg font-serif font-semibold text-white">
                Thao Tác Nằm Ngoài Thẩm Quyền Phân Công
              </h2>

              <p className="text-xs text-stone-300 mt-3 leading-relaxed">
                Phân hệ này yêu cầu thẩm quyền cấp cao hơn. Tài khoản của bạn hiện được phân công vai trò:{' '}
                <span className={`inline-block font-mono font-medium px-2 py-0.5 rounded border text-[11px] ${positionInfo.badgeColor}`}>
                  {positionInfo.title}
                </span>
                . Vui lòng liên hệ Quản Lý Cửa Hàng (Store Director) nếu cần mở rộng quyền hạn.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <Link
                  href={admin?.position === 'warehouse' ? '/inventory' : '/products'}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#00844e] to-[#006039] hover:from-[#009b5c] hover:to-[#007345] text-white text-xs font-medium flex items-center gap-2 shadow-lg transition-all"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
                  <span>
                    {admin?.position === 'warehouse'
                      ? 'Quay Về Trang Kiểm Kho'
                      : 'Quay Về Kho Đồng Hồ'}
                  </span>
                </Link>
              </div>
            </div>
          )}
        </main>

        {/* Footer info bar */}
        <footer className="h-14 px-8 border-t border-white/[0.05] bg-[#070e0a]/80 text-[11px] text-stone-300 flex items-center justify-between">
          <div>
            <span>ChronoLuxe Genève Management Portal</span>
            <span className="mx-2">•</span>
            <span>Phân quyền: <strong className="text-[#d4af37]">{positionInfo.title}</strong></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              RBAC Policy: Hoạt động (Strict Mode)
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
