'use client';

import React from 'react';
import AdminShell from '@/components/layout/AdminShell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSliders,
  faBuildingColumns,
  faShieldHalved,
  faBell,
  faFloppyDisk,
} from '@fortawesome/free-solid-svg-icons';

export default function SettingsPage() {
  return (
    <AdminShell
      title="Cài Đặt Hệ Thống & Cấu Hình Cửa Hàng"
      subtitle="Thiết lập thông tin thương hiệu boutique, cổng thanh toán VNPAY, hạn mức phê duyệt chiết khấu"
    >
      <div className="max-w-4xl space-y-6">
        <div className="luxury-card rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.05]">
            <FontAwesomeIcon icon={faBuildingColumns} className="text-[#d4af37]" />
            <h3 className="text-sm font-semibold text-white uppercase">
              Thông Tin Boutique & Showroom
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-stone-300 block mb-1">Tên Chuỗi Boutique</label>
              <input
                type="text"
                defaultValue="BRU_WATCH Genève"
                className="w-full px-3 py-2 rounded bg-[#070e0a] border border-white/[0.08] text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-stone-300 block mb-1">Địa Chỉ Showroom Chính</label>
              <input
                type="text"
                defaultValue="Số 88 Đồng Khởi, Phường Bến Nghé, Quận 1, TP. HCM"
                className="w-full px-3 py-2 rounded bg-[#070e0a] border border-white/[0.08] text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-stone-300 block mb-1">Hotline VIP Concierge</label>
              <input
                type="text"
                defaultValue="1900 8888 99 (24/7)"
                className="w-full px-3 py-2 rounded bg-[#070e0a] border border-white/[0.08] text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-stone-300 block mb-1">Hạn Mức Chiết Khấu Nhân Viên Tự Duyệt</label>
              <input
                type="text"
                defaultValue="1.5% (Tối đa 20.000.000 ₫)"
                className="w-full px-3 py-2 rounded bg-[#070e0a] border border-white/[0.08] text-white focus:border-[#d4af37] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.05] flex justify-end">
            <button className="px-5 py-2 rounded-lg bg-[#00844e] hover:bg-[#009b5c] text-white text-xs font-medium flex items-center gap-2 shadow-lg">
              <FontAwesomeIcon icon={faFloppyDisk} className="text-xs" />
              Lưu Thiết Lập Hệ Thống
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
