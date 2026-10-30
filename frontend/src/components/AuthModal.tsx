"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faCrown,
  faGem,
  faShieldHalved,
  faEnvelope,
  faLock,
  faUser,
  faPhone,
  faArrowRight,
  faSpinner,
  faCircleExclamation,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    login,
    register,
    loginWithGoogle,
    openGoogleOAuthPopup,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load official Google Identity Services script if NEXT_PUBLIC_GOOGLE_CLIENT_ID exists
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (clientId && typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if ((window as any).google?.accounts?.id) {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: any) => {
              if (response.credential) {
                setIsLoading(true);
                setErrorMessage(null);
                const res = await loginWithGoogle({ credential: response.credential });
                if (!res.success) {
                  setErrorMessage(res.message || "Đăng nhập Google thất bại.");
                }
                setIsLoading(false);
              }
            },
          });
        }
      };
      document.head.appendChild(script);
    }
  }, [loginWithGoogle]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    watchAudio.click();
    setErrorMessage(null);
    setSuccessMessage(null);
    closeAuthModal();
  };

  const handleTabSwitch = (mode: "login" | "register") => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setPassword("");
    openAuthModal(mode);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(trimmedEmail, password);
      if (!res.success) {
        setErrorMessage(res.message || "Tài khoản hoặc mật khẩu không chính xác.");
        watchAudio.tick();
      }
    } catch {
      setErrorMessage("Đã xảy ra lỗi kết nối tới máy chủ. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setErrorMessage("Vui lòng nhập họ và tên của Quý khách.");
      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Mật khẩu bảo mật phải có ít nhất 6 ký tự.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await register(trimmedName, trimmedEmail, trimmedPhone, password);
      if (!res.success) {
        setErrorMessage(res.message || "Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.");
        watchAudio.tick();
      }
    } catch {
      setErrorMessage("Đã xảy ra lỗi kết nối tới máy chủ. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Kích hoạt cửa sổ Popup Google OAuth 2.0 chính thức (accounts.google.com)
  const handleGoogleClick = async () => {
    watchAudio.click();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await openGoogleOAuthPopup();
      if (!res.success) {
        setErrorMessage(res.message || "Đăng nhập Google thất bại hoặc người dùng đã đóng cửa sổ.");
        watchAudio.tick();
      }
    } catch {
      setErrorMessage("Đã xảy ra lỗi khi kết nối tới dịch vụ xác thực Google.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#09130e]/95 border border-[#d4af37]/30 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden text-white backdrop-blur-2xl">
        {/* Decorative Top Accent Light */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer z-10"
          aria-label="Đóng"
        >
          <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
        </button>

        {/* Header Branding */}
        <div className="pt-8 pb-6 px-8 text-center border-b border-white/[0.06] bg-black/20">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8c6a21] text-black shadow-lg shadow-[#d4af37]/20 mb-3">
            <FontAwesomeIcon icon={faCrown} className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-normal tracking-wide text-white">
            Cổng Khách Hàng VIP Salon
          </h3>
          <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#d4af37] mt-1">
            BRU_WATCH VIP SALON • GENÈVE
          </p>
        </div>

        {/* Tabs for Login / Register */}
        <div className="flex border-b border-white/[0.06] bg-black/30">
          <button
            onClick={() => handleTabSwitch("login")}
            className={`flex-1 py-3 text-xs font-mono tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${authModalMode === "login"
                ? "text-[#d4af37] border-b-2 border-[#d4af37] bg-white/[0.02] font-semibold"
                : "text-white/50 hover:text-white"
              }`}
          >
            <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5" />
            <span>Đăng Nhập VIP</span>
          </button>
          <button
            onClick={() => handleTabSwitch("register")}
            className={`flex-1 py-3 text-xs font-mono tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${authModalMode === "register"
                ? "text-[#d4af37] border-b-2 border-[#d4af37] bg-white/[0.02] font-semibold"
                : "text-white/50 hover:text-white"
              }`}
          >
            <FontAwesomeIcon icon={faGem} className="w-3.5 h-3.5" />
            <span>Đăng Ký Hội Viên</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-4">
          {/* Error Message Box */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono animate-fadeIn">
              <FontAwesomeIcon icon={faCircleExclamation} className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Success Message Box */}
          {successMessage && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono animate-fadeIn">
              <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] hover:border-[#d4af37]/45 text-white font-mono text-xs font-medium flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 group shadow-sm hover:shadow-md"
          >
            <FontAwesomeIcon icon={faGoogle} className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            <span className="tracking-wide">Tiếp Tục Với Tài Khoản Google</span>
          </button>

          {/* Luxury Divider */}
          <div className="relative my-2 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <span className="relative px-3 bg-[#09130e] text-[10px] font-mono tracking-wider text-white/40 uppercase">
              Hoặc dùng email bảo mật
            </span>
          </div>

          {authModalMode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-white/70 flex items-center justify-between">
                  <span>Email Quý Khách</span>
                  <span className="text-[#d4af37] text-[10px]">Bảo mật SSL 256-bit</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="quykhanh@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37] transition-all font-mono disabled:opacity-50"
                  />
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-white/70 flex items-center justify-between">
                  <span>Mật Mã An Toàn</span>
                  <button
                    type="button"
                    onClick={() => watchAudio.tick()}
                    className="text-[#d4af37]/80 hover:text-[#d4af37] text-[10px] cursor-pointer"
                  >
                    Quên mật mã?
                  </button>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37] transition-all font-mono disabled:opacity-50"
                  />
                  <FontAwesomeIcon
                    icon={faLock}
                    className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/60">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    className="rounded bg-white/10 border-white/20 text-[#d4af37] focus:ring-0"
                  />
                  <span className="text-[11px] font-mono">Ghi nhớ thiết bị an toàn</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c69f2e] to-[#b38f28] text-black font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang Xác Thực...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng Nhập Salon Thượng Lưu</span>
                    <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-white/70">
                  Danh Xưng & Họ Tên <span className="text-[#d4af37]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="ví dụ: Nguyễn Văn Nam"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37] transition-all disabled:opacity-50"
                  />
                  <FontAwesomeIcon
                    icon={faUser}
                    className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-white/70">
                  Email Liên Lạc VIP <span className="text-[#d4af37]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="email@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37] transition-all font-mono disabled:opacity-50"
                  />
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-white/70">
                  Số Điện Thoại Tiếp Nhận Bảo An
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="0908 889 999 (không bắt buộc)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37] transition-all font-mono disabled:opacity-50"
                  />
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-white/70">
                  Mật Mã Cá Nhân (tối thiểu 6 ký tự) <span className="text-[#d4af37]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37] transition-all font-mono disabled:opacity-50"
                  />
                  <FontAwesomeIcon
                    icon={faLock}
                    className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c69f2e] to-[#b38f28] text-black font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang Khởi Tạo Thẻ VIP...</span>
                  </>
                ) : (
                  <>
                    <span>Kích Hoạt Thẻ Đặc Quyền VIP</span>
                    <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="py-3 px-8 bg-black/40 border-t border-white/[0.04] text-center text-[10px] font-mono text-white/40 flex items-center justify-center gap-2">
          <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3 text-[#d4af37]" />
          <span>Hệ thống bảo mật dữ liệu khách hàng theo quy chuẩn ngân hàng Thụy Sĩ.</span>
        </div>
      </div>
    </div>
  );
}
