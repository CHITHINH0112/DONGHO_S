"use client";

import React, { useRef, useState } from "react";
import { watchAudio } from "@/utils/audio";
import { useCart } from "@/context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faVolumeHigh,
  faVolumeXmark,
  faShieldHalved,
  faAward,
  faClock,
  faGem,
  faCalendarCheck,
  faCompass,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

export default function BoutiqueIntroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const { setIsVipModalOpen } = useCart();

  const togglePlay = () => {
    watchAudio.click();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    watchAudio.click();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const scrollToBrands = () => {
    watchAudio.click();
    const el = document.getElementById("luxury-brands");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="boutique-story"
      className="relative w-full bg-[#fbf9f5] dark:bg-[#050a07] text-foreground dark:text-white overflow-hidden py-24 sm:py-32 transition-colors duration-400"
    >
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-[#006039]/5 dark:bg-[#006039]/12 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-[#d4af37]/8 dark:bg-[#a37e2c]/8 rounded-full blur-[180px] pointer-events-none" />

      {/* 1. Header Information */}
      <div className="max-w-6xl mx-auto px-6 sm:px-12 text-center relative z-10 mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-[#d4af37]/25 text-[#9a741e] dark:text-[#d4af37] text-xs font-mono tracking-[0.25em] uppercase mb-5 backdrop-blur-md">
          <FontAwesomeIcon icon={faCompass} className="w-3 h-3 text-[#9a741e] dark:text-[#d4af37]" />
          <span>BRU_WATCH Genève</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-foreground dark:text-white tracking-tight leading-[1.15]">
          Thánh Địa Của Nghệ Thuật Cơ Khí <span className="italic font-light text-[#9a741e] dark:text-[#f3e3be]">Thời Gian</span>
        </h2>
        <p className="mt-5 text-sm sm:text-base text-muted-foreground dark:text-white/65 leading-relaxed font-sans max-w-2xl mx-auto font-light">
          Không gian thưởng lãm độc bản chuẩn BRU_WATCH Thụy Sĩ. Nơi hội tụ các kiệt tác vương giả từ
          <span className="text-[#006039] dark:text-[#d4af37] font-normal"> Rolex, Audemars Piguet, Patek Philippe, Vacheron Constantin</span>.
        </p>
      </div>

      {/* 2. Full-bleed Edge-to-Edge Cinema Video Player (intro.mp4 fits 100% screen) */}
      <div className="relative w-full overflow-hidden my-8 shadow-[0_25px_80px_rgba(0,0,0,0.9)]">
        <div className="relative w-full h-[60vh] sm:h-[75vh] md:h-[85vh] max-h-[860px] overflow-hidden flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            src="/intro.mp4"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover pointer-events-none"
          />

          {/* Luxury Multi-layer Gradient Vignette (Hòa quyện không viền) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050a07] via-transparent to-[#050a07]/80 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050a07]/70 via-transparent to-[#050a07]/70 pointer-events-none" />

          {/* Top Left Floating Tag */}
          <div className="absolute top-8 left-6 sm:left-12 z-20 flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/[0.08] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#00844e] animate-ping" />
            <span className="text-white/80 uppercase tracking-widest text-[11px]">
              Kiệt Tác Cận Cảnh: <strong className="text-[#d4af37] font-semibold">Audemars Piguet Royal Oak</strong>
            </span>
          </div>

          {/* Bottom Left Narrative */}
          <div className="absolute bottom-10 left-6 sm:left-12 z-20 max-w-lg hidden sm:block">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#d4af37] uppercase font-bold">
              CINEMA SHOWROOM 4K
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-normal text-white mt-1.5 leading-snug">
              Kiệt Tác Bát Giác Huyền Thoại & Vân Grande Tapisserie
            </h3>
          </div>

          {/* Bottom Right Audio/Video Controls */}
          <div className="absolute bottom-10 right-6 sm:right-12 z-20 flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/70 hover:bg-[#006039] border border-[#d4af37]/30 text-white text-xs font-mono transition-all backdrop-blur-xl shadow-2xl active:scale-95 cursor-pointer"
              title={isPlaying ? "Tạm dừng video" : "Phát video"}
            >
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>{isPlaying ? "Tạm dừng" : "Phát video"}</span>
            </button>

            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 border border-white/[0.1] text-white flex items-center justify-center transition-all backdrop-blur-xl shadow-2xl active:scale-95 cursor-pointer"
              title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              <FontAwesomeIcon
                icon={isMuted ? faVolumeXmark : faVolumeHigh}
                className={`w-4 h-4 ${isMuted ? "text-white/60" : "text-[#d4af37]"}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Four Pillars of BRU_WATCH (Luxury shadow & hairline gold) */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="luxury-card p-7 rounded-3xl group">
            <div className="w-12 h-12 rounded-2xl bg-[#006039]/15 dark:bg-[#006039]/25 border border-[#006039]/30 flex items-center justify-center text-[#006039] dark:text-[#d4af37] mb-5 group-hover:scale-108 transition-transform">
              <FontAwesomeIcon icon={faShieldHalved} className="w-5 h-5 text-[#006039] dark:text-[#d4af37]" />
            </div>
            <h4 className="font-serif text-lg font-medium text-foreground dark:text-white mb-2">
              100% Giám Định Thụy Sĩ
            </h4>
            <p className="text-xs text-muted-foreground dark:text-white/60 leading-relaxed font-sans font-light">
              Mỗi chiếc đồng hồ qua tay đội ngũ nghệ nhân Wostep kiểm định 3 vòng với máy đo sóng âm và buồng chân không áp suất cao.
            </p>
          </div>

          <div className="luxury-card p-7 rounded-3xl group">
            <div className="w-12 h-12 rounded-2xl bg-[#a37e2c]/15 dark:bg-[#a37e2c]/20 border border-[#a37e2c]/30 flex items-center justify-center text-[#9a741e] dark:text-[#d4af37] mb-5 group-hover:scale-108 transition-transform">
              <FontAwesomeIcon icon={faAward} className="w-5 h-5 text-[#9a741e] dark:text-[#d4af37]" />
            </div>
            <h4 className="font-serif text-lg font-medium text-foreground dark:text-white mb-2">
              Đa Hãng Thượng Lưu
            </h4>
            <p className="text-xs text-muted-foreground dark:text-white/60 leading-relaxed font-sans font-light">
              Cung cấp danh mục tuyển chọn từ Rolex, Audemars Piguet, Patek Philippe, Omega với giấy khai sinh và bảo hành quốc tế trọn vẹn.
            </p>
          </div>

          <div className="luxury-card p-7 rounded-3xl group">
            <div className="w-12 h-12 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center text-[#9a741e] dark:text-[#d4af37] mb-5 group-hover:scale-108 transition-transform">
              <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-[#9a741e] dark:text-[#d4af37]" />
            </div>
            <h4 className="font-serif text-lg font-medium text-foreground dark:text-white mb-2">
              Bảo Hành 5 Năm Toàn Diện
            </h4>
            <p className="text-xs text-muted-foreground dark:text-white/60 leading-relaxed font-sans font-light">
              Đặc quyền bảo dưỡng lau dầu định kỳ, thay ron chống nước và đánh bóng thẩm mỹ miễn phí tại Trung tâm Kỹ thuật Boutique.
            </p>
          </div>

          <div className="luxury-card p-7 rounded-3xl group">
            <div className="w-12 h-12 rounded-2xl bg-[#006039]/15 dark:bg-[#006039]/25 border border-[#d4af37]/25 flex items-center justify-center text-[#006039] dark:text-[#d4af37] mb-5 group-hover:scale-108 transition-transform">
              <FontAwesomeIcon icon={faGem} className="w-5 h-5 text-[#006039] dark:text-[#d4af37]" />
            </div>
            <h4 className="font-serif text-lg font-medium text-foreground dark:text-white mb-2">
              VIP Private Lounge
            </h4>
            <p className="text-xs text-muted-foreground dark:text-white/60 leading-relaxed font-sans font-light">
              Không gian tiếp đón thượng khách hoàn toàn riêng tư tại Tràng Tiền Plaza & Rex Hotel với rượu vang và chuyên gia tư vấn 1-1.
            </p>
          </div>
        </div>

        {/* 4. Luxury Concierge Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#003822] via-[#004d2e] to-[#002617] text-white border border-[#d4af37]/30 backdrop-blur-xl shadow-2xl">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#d4af37] uppercase font-bold">
              ĐẶC QUYỀN THƯỢNG KHÁCH
            </span>
            <h4 className="font-serif text-2xl font-normal text-white">
              Quý Khách Muốn Trực Tiếp Thử Tay Tuyệt Tác Trên Cổ Tay?
            </h4>
            <p className="text-xs text-white/75 max-w-xl font-light">
              Hân hạnh tiếp đón Quý khách tại phòng VIP Salon riêng biệt. Miễn phí kiểm tra đồng hồ và định giá bộ sưu tập.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                watchAudio.click();
                setIsVipModalOpen(true);
              }}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#d4af37] via-[#c69f2e] to-[#b38f28] hover:brightness-105 text-black font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-xl active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <FontAwesomeIcon icon={faCalendarCheck} className="w-3.5 h-3.5" />
              <span>Đặt Lịch Tiếp Đón VIP</span>
            </button>
            <button
              onClick={scrollToBrands}
              className="px-5 py-3 rounded-full border border-white/20 hover:border-[#d4af37] text-white font-mono text-xs uppercase tracking-wider transition-all backdrop-blur-md cursor-pointer hover:bg-white/10"
            >
              Khám Phá Các Hãng
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
