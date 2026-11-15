"use client";

import React, { useState } from "react";
import AccountNav from "@/components/AccountNav";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faPhone,
  faEnvelope,
  faPenToSquare,
  faCircleCheck,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";

export default function AccountProfilePage() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useCart();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });

  if (!user) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <AccountNav />
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    watchAudio.chime();
    updateProfile({
      name: formData.name,
      phone: formData.phone,
    });
    setIsEditing(false);
    showToast("Cập nhật hồ sơ tài khoản thành công.");
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
      <AccountNav />

      <div className="max-w-3xl mx-auto">
        {/* Personal Information Card */}
        <div className="luxury-card p-6 sm:p-8 rounded-3xl border border-[#d4af37]/25 bg-gradient-to-br from-[#0c1811] via-[#08110c] to-[#050a07] text-white shadow-2xl relative overflow-hidden space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d4af37]/15 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1b3827] to-[#070e0a] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] text-lg font-serif font-bold shadow-lg shadow-black/40">
                {user.name ? user.name.substring(0, 2).toUpperCase() : "US"}
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-normal text-foreground">
                  Hồ Sơ Cá Nhân
                </h3>
                <p className="text-xs text-muted-foreground font-light mt-0.5">
                  Quản lý và cập nhật thông tin tài khoản mua hàng tại BRU_WATCH
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
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37]/10 to-[#d4af37]/5 hover:from-[#d4af37]/25 hover:to-[#d4af37]/15 border border-[#d4af37]/30 hover:border-[#d4af37]/60 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer text-foreground shadow-sm self-start sm:self-auto"
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
                  <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faUser} className="w-3 h-3 text-[#d4af37]" />
                    Họ Và Tên
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background/80 border border-[#d4af37]/30 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/40 text-xs text-foreground focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faPhone} className="w-3 h-3 text-[#d4af37]" />
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background/80 border border-[#d4af37]/30 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/40 text-xs text-foreground focus:outline-none font-mono transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3 text-[#d4af37]" />
                  Địa Chỉ Email (Định danh tài khoản - Không thể đổi)
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/80 text-xs text-muted-foreground cursor-not-allowed font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl border border-border hover:border-[#d4af37]/40 text-xs font-mono cursor-pointer transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8952b] hover:from-[#e0c46c] hover:to-[#997926] text-black text-xs font-semibold font-mono uppercase tracking-wider cursor-pointer shadow-lg shadow-[#d4af37]/25 transition-all"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Tile 1: Họ tên */}
              <div className="p-4 rounded-2xl luxury-card-inset flex items-start gap-3.5 border border-white/[0.05]">
                <div className="w-9 h-9 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/25 text-[#d4af37] flex items-center justify-center shrink-0 text-xs">
                  <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                    Họ Và Tên
                  </span>
                  <span className="font-serif text-sm font-medium text-foreground mt-0.5 block truncate">
                    {user.name || "Chưa cập nhật"}
                  </span>
                </div>
              </div>

              {/* Tile 2: Số điện thoại */}
              <div className="p-4 rounded-2xl luxury-card-inset flex items-start gap-3.5 border border-white/[0.05]">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0 text-xs">
                  <FontAwesomeIcon icon={faPhone} className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                    Số Điện Thoại
                  </span>
                  <span className="font-mono text-sm font-medium text-foreground mt-0.5 block truncate">
                    {user.phone || "Chưa cập nhật"}
                  </span>
                </div>
              </div>

              {/* Tile 3: Email */}
              <div className="p-4 rounded-2xl luxury-card-inset flex items-start gap-3.5 border border-white/[0.05]">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center shrink-0 text-xs">
                  <FontAwesomeIcon icon={faEnvelope} className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                    Địa Chỉ Email
                  </span>
                  <span className="font-mono text-xs font-medium text-foreground mt-0.5 block truncate">
                    {user.email}
                  </span>
                </div>
              </div>

              {/* Tile 4: Trạng thái tài khoản */}
              <div className="p-4 rounded-2xl luxury-card-inset flex items-start gap-3.5 border border-white/[0.05]">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0 text-xs">
                  <FontAwesomeIcon icon={faShieldHalved} className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                    Trạng Thái Tài Khoản
                  </span>
                  <span className="font-mono text-xs font-medium text-emerald-400 mt-0.5 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCircleCheck} className="text-[10px]" />
                    Đang hoạt động (Bảo mật 100%)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
