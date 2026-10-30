'use client';

import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faChevronRight,
  faBoxesStacked,
  faFire,
} from '@fortawesome/free-solid-svg-icons';
import { TopSellingWatch } from '@/types/admin';

interface TopWatchesListProps {
  watches: TopSellingWatch[];
}

export default function TopWatchesList({ watches }: TopWatchesListProps) {
  return (
    <div className="luxury-card rounded-xl p-5 lg:p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faFire} className="text-[#d4af37] text-sm" />
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              Top Đồng Hồ Thanh Khoản Cao
            </h3>
          </div>
          <Link
            href="/products"
            className="text-[11px] text-stone-300 hover:text-[#d4af37] flex items-center gap-1 transition-colors"
          >
            <span>Quản lý kho</span>
            <FontAwesomeIcon icon={faChevronRight} className="text-[9px]" />
          </Link>
        </div>

        {/* List */}
        <div className="mt-4 space-y-3">
          {watches.map((watch) => (
            <div
              key={watch.id}
              className="p-3 rounded-lg bg-[#070e0a]/70 border border-white/[0.05] hover:border-[#d4af37]/30 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-lg bg-[#122319] border border-[#d4af37]/20 flex items-center justify-center shrink-0 text-[#d4af37]">
                  <FontAwesomeIcon icon={faClock} className="text-lg opacity-80" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-stone-100 truncate group-hover:text-[#d4af37] transition-colors">
                    {watch.name}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-stone-300 mt-0.5">
                    <span className="font-mono text-emerald-400 font-medium">{watch.referenceNo}</span>
                    <span>•</span>
                    <span className="text-[#d4af37]">{watch.brand}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-serif font-semibold text-stone-200">
                  {watch.price.toLocaleString('vi-VN')} ₫
                </div>
                <div className="text-[10px] text-stone-300 mt-0.5">
                  Tồn:{' '}
                  <span
                    className={`font-semibold ${
                      watch.stock <= 1 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {watch.stock} chiếc
                  </span>{' '}
                  | Đã bán: {watch.soldCount}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-stone-300">
        <span className="flex items-center gap-1.5">
          <FontAwesomeIcon icon={faBoxesStacked} className="text-stone-400 text-xs" />
          Tổng danh mục: 28 dòng máy BRU_WATCH
        </span>
        <span className="text-emerald-400 font-medium">Bảo hiểm kho 100%</span>
      </div>
    </div>
  );
}
