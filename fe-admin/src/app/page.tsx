import React from 'react';
import Link from 'next/link';
import AdminShell from '@/components/layout/AdminShell';
import TopWatchesList from '@/components/dashboard/TopWatchesList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faTag,
  faLayerGroup,
  faBoxesStacked,
  faArrowRight,
  faCrown,
  faCircleCheck,
  faSliders,
} from '@fortawesome/free-solid-svg-icons';
import { MOCK_TOP_WATCHES } from '@/data/mockAdminData';

/* =========================================================================
 * TẠM ẨN CÁC COMPONENT CHƯA PHỤC VỤ DEADLINE THEO YÊU CẦU:
 * =========================================================================
import StatCards from '@/components/dashboard/StatCards';
import SalesOverviewChart from '@/components/dashboard/SalesOverviewChart';
import RecentOrdersTable from '@/components/dashboard/RecentOrdersTable';
import PendingApprovalsCard from '@/components/dashboard/PendingApprovalsCard';
import LiveShiftCard from '@/components/dashboard/LiveShiftCard';
import {
  MOCK_KPIS,
  MOCK_RECENT_ORDERS,
  MOCK_PENDING_APPROVALS,
  MOCK_ACTIVE_SHIFT,
} from '@/data/mockAdminData';
========================================================================= */

export default function AdminDashboardPage() {
  return (
    <AdminShell
      title="Trung Tâm Điều Hành BRU_WATCH"
      subtitle="Quản lý tổng hệ thống kinh doanh và các dịch vụ đồng hồ"
    >
      <div className="space-y-8">
        {/* Banner trọng tâm deadline */}
        <div className="luxury-card rounded-2xl p-6 border border-[#d4af37]/25 bg-gradient-to-r from-[#0d1a13] via-[#09120e] to-[#070e0a] relative overflow-hidden shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/25 text-xs font-medium">
                <FontAwesomeIcon icon={faCrown} className="text-[10px]" />
                Trọng Tâm
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">
                Hệ Thống Quản Trị Danh Mục và Sản Phẩm BRU_WATCH
              </h2>
              <p className="text-xs text-stone-400 font-light leading-relaxed">

              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/products"
                className="px-4 py-2.5 rounded-lg bg-[#00844e] hover:bg-[#009b5c] text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40 border border-emerald-400/25 transition-all"
              >
                <FontAwesomeIcon icon={faClock} className="text-xs" />
                Vào Kho Đồng Hồ
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Thẻ Truy Cập Nhanh Trọng Tâm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Kho Đồng Hồ & Biến Thể */}
          <Link
            href="/products"
            className="luxury-card rounded-xl p-5 border border-white/[0.08] hover:border-[#d4af37]/40 bg-[#08100c] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] mb-4 group-hover:scale-105 transition-transform">
                <FontAwesomeIcon icon={faClock} className="text-lg" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#d4af37] transition-colors">
                Kho Đồng Hồ & Biến Thể
              </h3>
              <p className="text-xs text-stone-400 mt-1 font-light leading-relaxed">
                Tạo mới mẫu đồng hồ, phân định kính Sapphire, niềng, cỗ máy và thêm các biến thể màu sắc, dây đeo.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs text-[#d4af37]">
              <span>Mở quản lý sản phẩm</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Quản Lý Thương Hiệu */}
          <Link
            href="/brands"
            className="luxury-card rounded-xl p-5 border border-white/[0.08] hover:border-sky-500/40 bg-[#08100c] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4 group-hover:scale-105 transition-transform">
                <FontAwesomeIcon icon={faTag} className="text-lg" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors">
                Quản Lý Thương Hiệu (Brands)
              </h3>
              <p className="text-xs text-stone-400 mt-1 font-light leading-relaxed">
                Thiết lập nhà sản xuất, xưởng chế tác Thụy Sĩ/Nhật Bản (Casio, Seiko, Tissot, Patek Philippe...).
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs text-sky-400">
              <span>Mở quản lý thương hiệu</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Danh Mục Sản Phẩm */}
          <Link
            href="/categories"
            className="luxury-card rounded-xl p-5 border border-white/[0.08] hover:border-emerald-500/40 bg-[#08100c] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                <FontAwesomeIcon icon={faLayerGroup} className="text-lg" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                Danh Mục Chế Tác
              </h3>
              <p className="text-xs text-stone-400 mt-1 font-light leading-relaxed">
                Phân nhánh cây danh mục đồng hồ nam, đồng hồ nữ, Chronograph, Tourbillon và Diver.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs text-emerald-400">
              <span>Mở quản lý danh mục</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Quản Lý Tính Năng Kỹ Thuật */}
          <Link
            href="/features"
            className="luxury-card rounded-xl p-5 border border-white/[0.08] hover:border-amber-400/40 bg-[#08100c] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 mb-4 group-hover:scale-105 transition-transform">
                <FontAwesomeIcon icon={faSliders} className="text-lg" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                Tính Năng Kỹ Thuật (Features)
              </h3>
              <p className="text-xs text-stone-400 mt-1 font-light leading-relaxed">
                Quản lý các tính năng độc bản: Chronograph, Dạ quang, Lịch vạn niên, Moonphase, Kháng từ, GMT...
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs text-amber-300">
              <span>Mở quản lý tính năng</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Danh sách đồng hồ tiêu biểu */}
        <section aria-label="Mẫu đồng hồ tiêu biểu">
          <TopWatchesList watches={MOCK_TOP_WATCHES} />
        </section>

        {/* =====================================================================
         * CÁC KHỐI BÁO CÁO TÀI CHÍNH, ĐƠN HÀNG, CA THU NGÂN, PHÊ DUYỆT TẠM ẨN:
         * =====================================================================
        <section aria-label="Chỉ số hoạt động chính">
          <StatCards stats={MOCK_KPIS} />
        </section>
        <section aria-label="Biểu đồ doanh thu và thị phần thương hiệu">
          <SalesOverviewChart />
        </section>
        <section aria-label="Đơn hàng gần đây và bảng tác vụ ca trực" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <RecentOrdersTable orders={MOCK_RECENT_ORDERS} />
          </div>
          <div className="space-y-6">
            <LiveShiftCard shift={MOCK_ACTIVE_SHIFT} />
            <PendingApprovalsCard initialApprovals={MOCK_PENDING_APPROVALS} />
          </div>
        </section>
        ===================================================================== */}
      </div>
    </AdminShell>
  );
}
