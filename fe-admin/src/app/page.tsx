'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { admin, isLoading, isAuthenticated } = useAdminAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (admin?.position === 'warehouse') {
        router.replace('/inventory');
      } else {
        router.replace('/products');
      }
    }
  }, [admin, isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-[#070e0a] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#122319] to-[#070e0a] border border-[#d4af37]/40 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.25)] animate-pulse">
          <FontAwesomeIcon icon={faCrown} className="text-[#d4af37] text-xl" />
        </div>
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-[0.25em] text-[#d4af37] font-medium">
            BRU_WATCH LUXURY PORTAL
          </div>
          <p className="text-xs text-stone-400 font-light flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#d4af37]" />
            Đang chuyển hướng tới phân hệ làm việc...
          </p>
        </div>
      </div>
    </div>
  );
}
