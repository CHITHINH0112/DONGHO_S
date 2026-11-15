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
      className="relative w-full bg-[#fbf9f5] dark:bg-[#050a07] text-foreground dark:text-white overflow-hidden py-12 sm:py-16 transition-colors duration-400"
    >
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-[#006039]/5 dark:bg-[#006039]/12 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-[#d4af37]/8 dark:bg-[#a37e2c]/8 rounded-full blur-[180px] pointer-events-none" />

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

    </section>
  );
}
