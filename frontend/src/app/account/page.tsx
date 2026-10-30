"use client";

import React, { useState } from "react";
import AccountNav from "@/components/AccountNav";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCrown,
  faShieldHalved,
  faTruck,
  faGem,
  faBuildingColumns,
  faCheck,
  faPenToSquare,
  faPhone,
  faEnvelope,
  faUser,
  faAward,
  faClockRotateLeft,
  faQrcode,
  faCoins,
  faHelicopter,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

export default function AccountProfilePage() {
  const { user, updateProfile } = useAuth();
  const { formatPrice, showToast } = useCart();

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
    showToast("Cập nhật hồ sơ hội viên thành công.");
  };

  // Spending threshold calculations
  const nextTierThresholdVND = 5000000000; // 5 Billion VND for Platinum Elite
  const progressPercent = Math.min(
    100,
    Math.round((user.spendingTotalVND / nextTierThresholdVND) * 100)
  );

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
      <AccountNav />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Digital VIP Privilege Card & Spending Status (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* BRU_WATCH Metallic Hologram VIP Card */}
          <div className="relative w-full aspect-[1.586/1] rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden border border-[#d4af37]/40 bg-gradient-to-br from-[#0e2418] via-[#09150e] to-[#040806] text-white flex flex-col justify-between group">
            {/* Holographic Sheen Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#d4af37]/10 to-transparent opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />

            {/* Card Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-[#d4af37]">
                  MAISON PRIVILEGE
                </span>
                <h3 className="font-serif text-lg font-normal tracking-wider text-white">
                  {user.vipTier}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] via-[#c69f2e] to-[#8c6a21] text-black flex items-center justify-center font-serif font-bold text-sm shadow-md">
                <FontAwesomeIcon icon={faCrown} className="w-4 h-4" />
              </div>
            </div>

            {/* Chip & Security Code */}
            <div className="relative z-10 flex items-center justify-between py-2">
              <div className="w-11 h-8 rounded-lg bg-gradient-to-br from-[#e0c46c] to-[#997926] border border-[#f3e3be]/30 flex items-center justify-center shadow-inner">
                <div className="w-6 h-5 border border-black/20 rounded grid grid-cols-2 gap-0.5 p-0.5">
                  <div className="bg-black/20 rounded-xs" />
                  <div className="bg-black/20 rounded-xs" />
                  <div className="bg-black/20 rounded-xs" />
                  <div className="bg-black/20 rounded-xs" />
                </div>
              </div>
              <FontAwesomeIcon icon={faQrcode} className="w-7 h-7 text-[#d4af37]/50" />
            </div>

            {/* Card Footer: Number & Cardholder */}
            <div className="relative z-10 flex items-end justify-between">
              <div>
                <p className="font-mono text-xs sm:text-sm tracking-[0.25em] text-[#d4af37] font-semibold">
                  {user.privilegeCardNumber}
                </p>
                <p className="font-serif text-sm tracking-wide text-white uppercase mt-1">
                  {user.name}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-mono uppercase tracking-widest text-white/50 block">
                  HIỆU LỰC
                </span>
                <span className="text-xs font-mono text-white/90">VĨNH VIỄN</span>
              </div>
            </div>
          </div>

          {/* Spending & Tier Progress Panel */}
          <div className="luxury-card p-6 sm:p-7 relative overflow-hidden space-y-6">
            {/* Ambient gold background glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header badge & title */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center text-xs shadow-inner">
                  <FontAwesomeIcon icon={faCoins} className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d4af37] block font-semibold">
                    TIẾN ĐỘ THÀNH VIÊN
                  </span>
                  <h4 className="font-serif text-sm font-medium text-foreground">
                    Đẳng Cấp Tích Lũy VIP
                  </h4>
                </div>
              </div>
              <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/25 uppercase tracking-wider font-semibold">
                {user.vipTier}
              </span>
            </div>

            {/* Main Spending Display in Luxury Inset Box */}
            <div className="relative z-10 luxury-card-inset p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground block">
                  Tổng Chi Tiêu Tích Lũy
                </span>
                <span className="text-[11px] text-muted-foreground/70 font-mono mt-0.5 block">
                  Được ghi nhận trên hệ thống bảo mật Maison
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#d4af37] tracking-tight block">
                  {formatPrice(
                    Math.round(user.spendingTotalVND / 25000),
                    user.spendingTotalVND
                  )}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 sm:justify-end mt-0.5">
                  <FontAwesomeIcon icon={faCircleCheck} className="w-2.5 h-2.5" />
                  Đã thẩm định 100%
                </span>
              </div>
            </div>

            {/* Mechanical Horology Tier Gauge / Progress Bar */}
            <div className="relative z-10 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#00a86b] animate-pulse" />
                  <span>Hạng hiện tại: <strong className="text-[#d4af37]">{user.vipTier}</strong></span>
                </div>
                <div className="text-right text-muted-foreground text-[11px]">
                  <span>Mục tiêu Platinum: <strong>5 Tỷ VND</strong></span>
                  <span className="ml-1 text-[#d4af37] font-semibold">({progressPercent}%)</span>
                </div>
              </div>

              {/* Luxury Multi-layer Gauge Track with Mechanical Markers */}
              <div className="relative">
                <div className="w-full h-3 rounded-full bg-black/40 dark:bg-black/60 light:bg-black/10 p-0.5 border border-[#d4af37]/20 shadow-inner overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#006039] via-[#d4af37] to-[#f3e3be] rounded-full transition-all duration-1000 relative shadow-md shadow-[#d4af37]/20"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Milestone tick marks */}
                <div className="flex justify-between px-1 mt-1.5 text-[9px] font-mono text-muted-foreground/60">
                  <span>0 VND</span>
                  <span className="pl-4">2.5 Tỷ (50%)</span>
                  <span>5 Tỷ VND (100%)</span>
                </div>
              </div>
            </div>

            {/* Upgrade Privilege Callout Banner */}
            <div className="relative z-10 p-4 rounded-2xl bg-gradient-to-r from-[#006039]/15 via-[#006039]/8 to-transparent border border-[#006039]/30 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#997926] text-black flex items-center justify-center shrink-0 shadow-md">
                <FontAwesomeIcon icon={faHelicopter} className="w-4 h-4" />
              </div>
              <div className="text-xs leading-relaxed text-foreground/90 font-light">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#d4af37] font-semibold block mb-0.5">
                  Đặc Quyền Kế Tiếp: PLATINUM ELITE
                </span>
                Quý khách chỉ cần tích lũy thêm{" "}
                <strong className="text-foreground font-semibold">
                  {formatPrice(
                    Math.round((nextTierThresholdVND - user.spendingTotalVND) / 25000),
                    Math.max(0, nextTierThresholdVND - user.spendingTotalVND)
                  )}
                </strong>{" "}
                để kích hoạt quyền nhận bàn giao đồng hồ bằng <strong className="text-[#d4af37]">trực thăng riêng</strong> tại dinh thự hoặc du thuyền.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: VIP Privileges & Personal Profile Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Exclusive Privileges Grid */}
          <div className="luxury-card p-6 sm:p-7 relative overflow-hidden space-y-5">
            <div className="flex items-center justify-between border-b border-[#d4af37]/15 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center text-xs shadow-inner">
                  <FontAwesomeIcon icon={faAward} className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-normal text-foreground">
                    Đặc Quyền Hội Viên Dành Cho Quý Khách
                  </h4>
                  <p className="text-xs text-muted-foreground font-light">
                    Đặc quyền độc bản dành riêng cho chủ nhân thẻ {user.vipTier}
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex text-[10px] font-mono px-2.5 py-1 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 uppercase tracking-wider font-semibold">
                Đang Hoạt Động
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Privilege 1: Brinks Armored */}
              <div className="group p-5 rounded-2xl bg-gradient-to-br from-[#006039]/15 via-transparent to-transparent border border-emerald-500/25 hover:border-emerald-400/60 transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-lg hover:shadow-emerald-950/20 flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <FontAwesomeIcon icon={faTruck} className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-serif text-sm font-medium text-foreground group-hover:text-emerald-400 transition-colors">
                      Vận Đơn Xe Bọc Thép
                    </h5>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      24/7
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-light">
                    Giao tận tay bằng xe chuyên dụng bọc thép Brinks Security kèm 2 vệ sĩ trang bị cấp phép.
                  </p>
                </div>
              </div>

              {/* Privilege 2: Geneva Pre-allocation */}
              <div className="group p-5 rounded-2xl bg-gradient-to-br from-[#d4af37]/15 via-transparent to-transparent border border-[#d4af37]/25 hover:border-[#d4af37]/60 transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-lg hover:shadow-[#d4af37]/10 flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/40 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <FontAwesomeIcon icon={faCrown} className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-serif text-sm font-medium text-foreground group-hover:text-[#d4af37] transition-colors">
                      Suất Đặt Trước Geneva
                    </h5>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20">
                      VIP Ưu Tiên
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-light">
                    Ưu tiên phân bổ các cỗ máy độc bản giới hạn (Piece Unique) ngay tại triển lãm Watches and Wonders.
                  </p>
                </div>
              </div>

              {/* Privilege 3: VIP Salon */}
              <div className="group p-5 rounded-2xl bg-gradient-to-br from-purple-900/15 via-transparent to-transparent border border-purple-500/25 hover:border-purple-400/60 transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-lg hover:shadow-purple-950/20 flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/40 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <FontAwesomeIcon icon={faBuildingColumns} className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-serif text-sm font-medium text-foreground group-hover:text-purple-400 transition-colors">
                      Phòng Thử VIP Salon
                    </h5>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      Biệt Lập
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-light">
                    Không gian riêng tư thưởng lãm xì gà Cohiba Behike và rượu vang quý Grand Cru khi xem máy.
                  </p>
                </div>
              </div>

              {/* Privilege 4: Lifetime Maintenance */}
              <div className="group p-5 rounded-2xl bg-gradient-to-br from-blue-900/15 via-transparent to-transparent border border-blue-500/25 hover:border-blue-400/60 transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-lg hover:shadow-blue-950/20 flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/40 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <FontAwesomeIcon icon={faShieldHalved} className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-serif text-sm font-medium text-foreground group-hover:text-blue-400 transition-colors">
                      Bảo Dưỡng Miễn Phí Trọn Đời
                    </h5>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Thụy Sĩ
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-light">
                    Miễn phí lau dầu cơ khí, cân chỉnh sai số Chronometer COSC và kiểm tra kháng áp suất nước.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information & Concierge Form */}
          <div className="luxury-card p-6 sm:p-7 relative overflow-hidden space-y-5">
            <div className="flex items-center justify-between border-b border-[#d4af37]/15 pb-4">
              <div>
                <h4 className="font-serif text-lg font-normal text-foreground flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-[#d4af37]" />
                  <span>Hồ Sơ Liên Lạc Cá Nhân</span>
                </h4>
                <p className="text-xs text-muted-foreground font-light mt-0.5">
                  Dữ liệu phục vụ công tác an ninh và bàn giao đồng hồ bảo mật cao cấp.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  watchAudio.click();
                  setIsEditing(!isEditing);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37]/10 to-[#d4af37]/5 hover:from-[#d4af37]/25 hover:to-[#d4af37]/15 border border-[#d4af37]/30 hover:border-[#d4af37]/60 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer text-foreground shadow-sm"
              >
                <FontAwesomeIcon icon={faPenToSquare} className="w-3 h-3 text-[#d4af37]" />
                <span>{isEditing ? "Hủy Chỉnh Sửa" : "Chỉnh Sửa Hồ Sơ"}</span>
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faUser} className="w-3 h-3 text-[#d4af37]" />
                      Họ Tên Quý Khách
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
                      Số Điện Thoại VIP
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
                    Email Thường Trực (Định danh thẻ VIP - Không thể đổi)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-border/80 text-xs text-muted-foreground cursor-not-allowed font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl luxury-card-inset flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/25 text-[#d4af37] flex items-center justify-center shrink-0 text-xs">
                    <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                      Danh Xưng & Họ Tên
                    </span>
                    <span className="font-serif text-sm font-medium text-foreground mt-0.5 block truncate">
                      {user.name}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl luxury-card-inset flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0 text-xs">
                    <FontAwesomeIcon icon={faPhone} className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                      Điện Thoại Tiếp Nhận
                    </span>
                    <span className="font-mono text-sm font-medium text-foreground mt-0.5 block truncate">
                      {user.phone}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl luxury-card-inset flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center shrink-0 text-xs">
                    <FontAwesomeIcon icon={faEnvelope} className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                      Email Đăng Ký
                    </span>
                    <span className="font-mono text-xs font-medium text-foreground mt-0.5 block truncate">
                      {user.email}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
