'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCrown,
  faLock,
  faEnvelope,
  faArrowRightToBracket,
  faShieldHalved,
  faCircleExclamation,
  faCircleCheck,
  faEye,
  faEyeSlash,
  faUserTie,
  faSpinner,
  faBoxesStacked,
} from '@fortawesome/free-solid-svg-icons';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading, admin } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getDestination = (roleOrPosition?: string) => {
    if (roleOrPosition === 'warehouse') return '/inventory';
    try {
      const stored = localStorage.getItem('admin_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.position === 'warehouse') return '/inventory';
      }
    } catch {
      // ignore
    }
    return '/products';
  };

  // If already logged in, redirect to primary workspace
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(getDestination(admin?.position));
    }
  }, [isAuthenticated, authLoading, admin, router]);

  // Check if session expired
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('expired')) {
        setErrorMessage('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        setSuccessMessage('Xác thực danh tính thành công! Đang chuyển hướng vào hệ thống...');
        setTimeout(() => {
          router.push(getDestination());
        }, 800);
      } else {
        setErrorMessage(result.message || 'Đăng nhập không thành công.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Đã có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#070e0a] text-stone-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient background lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-950/25 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-[#d4af37]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md luxury-card rounded-2xl p-8 relative z-10 border border-[#d4af37]/25 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* Brand Header */}
        <div className="text-center space-y-3 pb-6 border-b border-white/[0.06]">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-[#122319] to-[#070e0a] border border-[#d4af37]/40 items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.25)]">
            <FontAwesomeIcon icon={faCrown} className="text-[#d4af37] text-2xl" />
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-[0.2em] text-white uppercase font-sans">
              BRU_WATCH<span className="text-[#d4af37]"></span>
            </h1>
            <div className="text-[11px] tracking-[0.3em] text-[#d4af37]/80 uppercase mt-0.5">
              Quản Trị Hệ Thống
            </div>
            <p className="text-xs text-stone-400 mt-2 font-light">
              KHU VỰC NỘI BỘ
            </p>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="mt-5 p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
            <FontAwesomeIcon icon={faCircleExclamation} className="text-red-400 text-sm mt-0.5 shrink-0" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-5 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2.5">
            <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-400 text-sm mt-0.5 shrink-0" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* Login Form (NO REGISTER FORM - Strict Requirement) */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-300 block mb-1.5 font-medium">
              Email Tài Khoản Nội Bộ
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <FontAwesomeIcon icon={faEnvelope} className="text-xs" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten.nhanvien@watchshop.local"
                className="w-full pl-10 pr-3 py-2.5 bg-[#070e0a] rounded-lg border border-white/[0.1] text-xs text-white placeholder-stone-400 focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37]/30 transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-300 block mb-1.5 font-medium">
              Mật Khẩu Xác Thực
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <FontAwesomeIcon icon={faLock} className="text-xs" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu an toàn..."
                className="w-full pl-10 pr-10 py-2.5 bg-[#070e0a] rounded-lg border border-white/[0.1] text-xs text-white placeholder-stone-400 focus:border-[#d4af37] focus:outline-none focus:ring-1 focus:ring-[#d4af37]/30 transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-white"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-xs" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-lg bg-gradient-to-r from-[#00844e] to-[#006039] hover:from-[#009b5c] hover:to-[#007345] text-white text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,132,78,0.35)] border border-emerald-400/30 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-sm" />
                <span>Đang Xác Thực </span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faArrowRightToBracket} className="text-xs" />
                <span>Đăng Nhập Quản Trị</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Credentials Helper for Testing */}
        <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-2.5">
          <div className="text-[10px] uppercase tracking-wider text-stone-400 text-center font-medium">
            Tài Khoản Kiểm Thử Phân Quyền Nhanh
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@watchshop.local', 'admin123456')}
              className="p-2 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-[#d4af37]/25 text-left text-stone-200 transition-colors"
            >
              <div className="font-semibold text-[#d4af37] flex items-center gap-1">
                <FontAwesomeIcon icon={faCrown} className="text-[9px]" />
                Admin (Manager)
              </div>

            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('staff6@watchshop.local', 'staff123')}
              className="p-2 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-emerald-500/25 text-left text-stone-200 transition-colors"
            >
              <div className="font-semibold text-emerald-400 flex items-center gap-1">
                <FontAwesomeIcon icon={faUserTie} className="text-[9px]" />
                Thu Ngân (Sales)
              </div>

            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('staff8@watchshop.local', 'staff123')}
              className="p-2 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-amber-500/25 text-left text-stone-200 transition-colors"
            >
              <div className="font-semibold text-amber-400 flex items-center gap-1">
                <FontAwesomeIcon icon={faBoxesStacked} className="text-[9px]" />
                Thủ Kho (Warehouse)
              </div>

            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('tech@watchshop.local', 'tech123')}
              className="p-2 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-sky-500/25 text-left text-stone-200 transition-colors"
            >
              <div className="font-semibold text-sky-400 flex items-center gap-1">
                <FontAwesomeIcon icon={faShieldHalved} className="text-[9px]" />
                Kỹ Thuật Viên
              </div>

            </button>

          </div>
        </div>


      </div>
    </div>
  );
}
