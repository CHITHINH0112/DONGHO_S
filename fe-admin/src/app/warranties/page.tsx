'use client';

import React from 'react';
import AdminShell from '@/components/layout/AdminShell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faWrench,
  faCircleCheck,
  faClock,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';

import { useAdminAuth } from '@/context/AdminAuthContext';
import { hasPermission } from '@/utils/permissions';

export default function WarrantiesPage() {
  const { admin } = useAdminAuth();
  const canManageWarranties = hasPermission(admin, 'WARRANTIES_MANAGE');

  const tickets = [
    {
      id: 'BH-2026-119',
      customer: 'Đặng Tuấn Anh',
      watch: 'Vacheron Constantin Overseas Dual Time',
      serial: 'SN-VC-88319',
      issue: 'Bảo dưỡng định kỳ 2 năm & căn chỉnh sai số máy cơ',
      status: 'IN_PROGRESS',
      technician: 'Nguyễn Văn Minh (Kỹ thuật trưởng)',
      receivedDate: '26/10/2026',
      estimatedReturn: '30/10/2026',
    },
    {
      id: 'BH-2026-118',
      customer: 'Hoàng Kim Long',
      watch: 'Rolex Submariner Date 126610LN',
      serial: 'SN-RLX-44219',
      issue: 'Đánh bóng vết xước nhẹ khóa Oysterlock & kiểm tra chống nước 300m',
      status: 'READY',
      technician: 'Trần Đình Trọng',
      receivedDate: '24/10/2026',
      estimatedReturn: '28/10/2026',
    },
  ];

  return (
    <AdminShell
      title="Bảo Hành & Phòng Kỹ Thuật Thụy Sĩ"
      subtitle="Theo dõi tiếp nhận, kiểm định chống nước, lau dầu bảo dưỡng máy cơ chuẩn BRU_WATCH"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-xs text-stone-300">
            Hiện có <span className="text-[#d4af37] font-semibold">2 đồng hồ</span> đang trong phòng kỹ thuật
          </div>
          {canManageWarranties ? (
            <button className="px-4 py-2 rounded-lg bg-[#00844e] hover:bg-[#009b5c] text-white text-xs font-medium flex items-center gap-2 shadow-md">
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
              Tiếp Nhận Bảo Hành / Sửa Chữa
            </button>
          ) : (
            <span className="text-[11px] text-stone-400 font-mono">Chế độ xem tiến độ kỹ thuật</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((t) => (
            <div key={t.id} className="luxury-card rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faWrench} className="text-[#d4af37] text-xs" />
                  <span className="font-mono text-xs font-bold text-[#d4af37]">{t.id}</span>
                </div>
                {t.status === 'READY' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <FontAwesomeIcon icon={faCircleCheck} className="text-[9px]" />
                    Sẵn Sàng Trả Khách
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <FontAwesomeIcon icon={faClock} className="text-[9px]" />
                    Đang Căn Chỉnh Máy
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white">{t.watch}</h4>
                <div className="text-[11px] text-emerald-400 font-mono mt-0.5">{t.serial}</div>
                <p className="text-xs text-stone-300 mt-2 bg-[#070e0a]/80 p-2.5 rounded border border-white/[0.04]">
                  {t.issue}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.05] text-[11px] text-stone-300 flex items-center justify-between">
                <span>Khách hàng: <strong className="text-white">{t.customer}</strong></span>
                <span>KTV: <strong className="text-stone-200">{t.technician}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
