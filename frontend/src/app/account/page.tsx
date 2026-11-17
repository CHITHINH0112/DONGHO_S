"use client";

import React, { useState } from "react";
import AccountNav from "@/components/AccountNav";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { watchAudio } from "@/utils/audio";
import {
  isValidVietnamPhone,
  normalizeVietnamPhone,
  getVietnamCarrierName,
} from "@/utils/phoneValidator";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faPhone,
  faEnvelope,
  faPenToSquare,
  faCircleCheck,
  faShieldHalved,
  faKey,
  faLock,
  faSpinner,
  faCrown,
  faGem,
  faClockRotateLeft,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

export default function AccountProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useCart();

  // Profile edit states
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });

  // Password change states
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [isSavingPass, setIsSavingPass] = useState(false);
  const [passData, setPassData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!user) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <AccountNav />
      </div>
    );
  }

  // Lưu thông tin cá nhân vào MySQL
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.phone && !isValidVietnamPhone(formData.phone)) {
      showToast("Số điện thoại không hợp lệ. Quý khách vui lòng nhập số điện thoại thật 10 chữ số của Việt Nam.");
      return;
    }

    try {
      setIsSavingProfile(true);
      watchAudio.chime();

      const res = await updateProfile({
        name: formData.name.trim(),
        phone: normalizeVietnamPhone(formData.phone),
      });

      if (res.success) {
        showToast(res.message || "Cập nhật hồ sơ tài khoản thành công.");
        setIsEditing(false);
      } else {
        showToast(res.message || "Không thể cập nhật hồ sơ lúc này.");
      }
    } catch {
      showToast("Lỗi kết nối khi cập nhật hồ sơ.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Đổi mật khẩu tài khoản
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passData.newPassword || passData.newPassword.length < 6) {
      showToast("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (passData.newPassword !== passData.confirmPassword) {
      showToast("Xác nhận mật khẩu mới không trùng khớp.");
      return;
    }

    try {
      setIsSavingPass(true);
      watchAudio.chime();

      const res = await changePassword({
        oldPassword: passData.oldPassword,
        newPassword: passData.newPassword,
        confirmPassword: passData.confirmPassword,
      });

      if (res.success) {
        showToast(res.message || "Đổi mật khẩu thành công!");
        setIsChangingPass(false);
        setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        showToast(res.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ khi đổi mật khẩu.");
    } finally {
      setIsSavingPass(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
      <AccountNav />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* VIP Member Tier Header Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#006039]/20 via-[#08120d] to-[#d4af37]/15 border border-[#d4af37]/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#8f7521] text-black flex items-center justify-center text-2xl shadow-lg shadow-[#d4af37]/20">
              <FontAwesomeIcon icon={faCrown} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37] font-semibold">
                  PRIVILEGE CONCIERGE MEMBER
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Thành Viên Danh Dự
                </span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-normal text-stone-100 mt-0.5">
                {user.name || "Quý Khách Hàng VIP"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-stone-400 bg-black/40 px-4 py-2.5 rounded-2xl border border-white/[0.06] self-start sm:self-auto">
            <FontAwesomeIcon icon={faGem} className="text-[#d4af37]" />
            <span>Đặc quyền bảo dưỡng trọn đời tại Salon</span>
          </div>
        </div>

        {/* 1. Hồ Sơ Cá Nhân Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-[#d4af37]/25 bg-gradient-to-br from-[#0c1811] via-[#08110c] to-[#050a07] text-white shadow-2xl relative overflow-hidden space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d4af37]/15 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1b3827] to-[#070e0a] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] text-lg font-serif font-bold shadow-lg shadow-black/40">
                {user.name ? user.name.substring(0, 2).toUpperCase() : "US"}
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-normal text-stone-100">
                  Hồ Sơ Cá Nhân & Định Danh
                </h3>
                <p className="text-xs text-stone-400 font-light mt-0.5">
                  Quản lý thông tin tài khoản đồng bộ vĩnh viễn với cơ sở dữ liệu BRU_WATCH
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                watchAudio.click();
                setIsEditing(!isEditing);
                setFormData({
                  name: user.name || "",
                  phone: user.phone || "",
                  email: user.email || "",
                });
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37]/10 to-[#d4af37]/5 hover:from-[#d4af37]/25 hover:to-[#d4af37]/15 border border-[#d4af37]/30 hover:border-[#d4af37]/60 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer text-stone-200 shadow-sm self-start sm:self-auto"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>{isEditing ? "Hủy Chỉnh Sửa" : "Chỉnh Sửa Hồ Sơ"}</span>
            </button>
          </div>

          {/* Form Editing Mode */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faUser} className="w-3 h-3 text-[#d4af37]" />
                    Họ Và Tên
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-[#d4af37]/30 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/40 text-xs text-stone-100 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faPhone} className="w-3 h-3 text-[#d4af37]" />
                      Số Điện Thoại (10 số thật)
                    </label>
                    {formData.phone.trim() && (
                      isValidVietnamPhone(formData.phone) ? (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                          <FontAwesomeIcon icon={faCheck} className="text-[9px]" />
                          <span>{getVietnamCarrierName(formData.phone)}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                          Chưa đúng 10 số
                        </span>
                      )
                    )}
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={13}
                    placeholder="0908 889 999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl bg-black/60 border text-xs text-stone-100 focus:outline-none font-mono transition-all ${
                      formData.phone.trim() && !isValidVietnamPhone(formData.phone)
                        ? "border-rose-500/50 focus:border-rose-500"
                        : formData.phone.trim() && isValidVietnamPhone(formData.phone)
                        ? "border-emerald-500/50 focus:border-emerald-500"
                        : "border-[#d4af37]/30 focus:border-[#d4af37]"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3 text-[#d4af37]" />
                  Địa Chỉ Email (Định danh bảo mật - Không thể đổi)
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.08] text-xs text-stone-500 cursor-not-allowed font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/[0.1] hover:border-white/[0.2] text-xs font-mono cursor-pointer transition-colors text-stone-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8952b] hover:from-[#e0c46c] hover:to-[#997926] text-black text-xs font-semibold font-mono uppercase tracking-wider cursor-pointer shadow-lg shadow-[#d4af37]/25 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                      <span>Đang Lưu...</span>
                    </>
                  ) : (
                    <span>Lưu Vào CSDL</span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-white/[0.02] flex items-start gap-3.5 border border-white/[0.06]">
                <div className="w-9 h-9 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/25 text-[#d4af37] flex items-center justify-center shrink-0 text-xs">
                  <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">
                    Họ Và Tên
                  </span>
                  <span className="font-serif text-sm font-medium text-stone-100 mt-0.5 block truncate">
                    {user.name || "Chưa cập nhật"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] flex items-start gap-3.5 border border-white/[0.06]">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0 text-xs">
                  <FontAwesomeIcon icon={faPhone} className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">
                    Số Điện Thoại Trực Tiếp
                  </span>
                  <span className="font-mono text-sm font-medium text-stone-100 mt-0.5 block truncate">
                    {user.phone || "Chưa cập nhật"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] flex items-start gap-3.5 border border-white/[0.06]">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center shrink-0 text-xs">
                  <FontAwesomeIcon icon={faEnvelope} className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">
                    Địa Chỉ Email
                  </span>
                  <span className="font-mono text-xs font-medium text-stone-200 mt-0.5 block truncate">
                    {user.email}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] flex items-start gap-3.5 border border-white/[0.06]">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0 text-xs">
                  <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">
                    Trạng Thái Định Danh
                  </span>
                  <span className="font-mono text-xs font-medium text-emerald-400 mt-0.5 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCircleCheck} className="text-[10px]" />
                    Đã Xác Thực An Toàn
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Đổi Mật Khẩu Bảo Mật Card */}
        <div className="p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-[#08120d] text-white shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#d4af37] text-lg">
                <FontAwesomeIcon icon={faKey} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-normal text-stone-100">
                  Mật Khẩu & An Ninh Tài Khoản
                </h3>
                <p className="text-xs text-stone-400 font-light mt-0.5">
                  Bảo vệ tài khoản với mật khẩu mã hóa chuẩn bcrypt 256-bit
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                watchAudio.click();
                setIsChangingPass(!isChangingPass);
                setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" });
              }}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer text-stone-300 self-start sm:self-auto"
            >
              <FontAwesomeIcon icon={faLock} className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>{isChangingPass ? "Hủy Đổi Mật Khẩu" : "Đổi Mật Khẩu"}</span>
            </button>
          </div>

          {isChangingPass && (
            <form onSubmit={handleChangePassword} className="space-y-4 pt-1 animate-fadeIn">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
                  Mật Khẩu Hiện Tại
                </label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu hiện tại của bạn"
                  value={passData.oldPassword}
                  onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/[0.1] focus:border-[#d4af37] text-xs text-stone-100 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
                    Mật Khẩu Mới (Tối thiểu 6 ký tự)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Nhập mật khẩu mới"
                    value={passData.newPassword}
                    onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/[0.1] focus:border-[#d4af37] text-xs text-stone-100 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
                    Xác Nhận Mật Khẩu Mới
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Nhập lại mật khẩu mới"
                    value={passData.confirmPassword}
                    onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/[0.1] focus:border-[#d4af37] text-xs text-stone-100 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsChangingPass(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/[0.1] text-xs font-mono text-stone-400 hover:text-white transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingPass}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8952b] hover:from-[#e0c46c] hover:to-[#997926] text-black text-xs font-bold font-mono uppercase tracking-wider cursor-pointer shadow-lg shadow-[#d4af37]/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingPass ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                      <span>Đang Cập Nhật...</span>
                    </>
                  ) : (
                    <span>Cập Nhật Mật Khẩu</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
