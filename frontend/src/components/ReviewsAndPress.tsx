"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faQuoteLeft,
  faAward,
  faShieldHalved,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

export default function ReviewsAndPress() {
  const pressReviews = [
    {
      source: "HODINKEE MAGAZINE",
      quote:
        "“Mỗi nhịp đập 28,800 vph của cỗ máy Calibre in-house là minh chứng hùng hồn cho kỹ nghệ chế tác Geneva không thỏa hiệp.”",
      author: "Benjamin Clymer",
      role: "Senior Watch Critic",
    },
    {
      source: "REVOLUTION WATCH",
      quote:
        "“Sắc xanh ngọc lục bảo sunburst dưới mặt kính sapphire nguyên khối tạo nên hiệu ứng thị giác mê hoặc bất kỳ nhà sưu tầm kỳ cựu nào.”",
      author: "Wei Koh",
      role: "Founder & Horology Editor",
    },
    {
      source: "FORBES LUXURY",
      quote:
        "“Khoản đầu tư xứng tầm di sản. Độ chuẩn xác vượt chuẩn COSC và giá trị bảo tồn trường tồn cùng năm tháng.”",
      author: "Elizabeth Doerr",
      role: "BRU_WATCH Contributor",
    },
  ];

  const collectorReviews = [
    {
      name: "Trần Minh Hoàng",
      title: "Chủ tịch Hội Sưu Tầm Đồng Hồ Cổ Hà Nội",
      watch: "Submariner Date 'Kermit Emerald'",
      content:
        "Tôi đã thử nghiệm đo sai số cỗ máy qua máy cân chỉnh Timegrapher: kết quả chỉ sai lệch +0.8s/ngày, vượt xa tiêu chuẩn COSC. Dây đeo hoàn thiện satin mượt mà không chút tì vết.",
      rating: 5,
    },
    {
      name: "Alexandre Laurent",
      title: "Nhà đầu tư & Sưu tầm Geneva",
      watch: "Aurélien Tourbillon Squelette",
      content:
        "Lồng Tourbillon bay xoay nhịp nhàng dưới ánh sáng vàng hồng là một tác phẩm điêu khắc nghệ thuật thực sự. Dịch vụ tiếp đón tại phòng VIP Salon cực kỳ chu đáo.",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-28 bg-[#fbf9f5] dark:bg-[#050a07] relative overflow-hidden transition-colors duration-400">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.03] border border-[#d4af37]/25 text-[#9a741e] dark:text-[#d4af37] text-xs font-mono tracking-widest uppercase mb-3">
            <FontAwesomeIcon icon={faAward} className="w-3 h-3 text-[#9a741e] dark:text-[#d4af37]" />
            <span>Bảo Chứng Danh Tiếng Toàn Cầu</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground dark:text-white tracking-tight leading-tight">
            Báo Chí & Giới Mộ Điệu <span className="italic text-[#9a741e] dark:text-[#f3e3be]">Đánh Giá</span>
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground dark:text-white/60 font-light">
            Được công nhận bởi các tạp chí chuyên ngành đồng hồ uy tín nhất thế giới.
          </p>
        </div>

        {/* Press Quotes (Luxury Shadow Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {pressReviews.map((item, idx) => (
            <div
              key={idx}
              className="luxury-card p-8 rounded-3xl flex flex-col justify-between group"
            >
              <FontAwesomeIcon icon={faQuoteLeft} className="w-7 h-7 text-[#006039]/30 dark:text-[#006039]/40 mb-4" />
              <p className="font-serif text-sm sm:text-base italic text-foreground/90 dark:text-white/80 leading-relaxed font-light">
                {item.quote}
              </p>
              <div className="mt-6 pt-4 border-t border-black/[0.06] dark:border-white/[0.05]">
                <div className="font-mono text-xs uppercase tracking-widest font-semibold text-[#9a741e] dark:text-[#d4af37]">
                  {item.source}
                </div>
                <div className="text-[11px] text-muted-foreground dark:text-white/50 mt-0.5 font-light">
                  {item.author} • {item.role}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Collector Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collectorReviews.map((rev, idx) => (
            <div
              key={idx}
              className="luxury-card p-7 rounded-3xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <FontAwesomeIcon key={i} icon={faStar} className="w-3.5 h-3.5" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground dark:text-white/70 leading-relaxed font-light font-sans">
                  &quot;{rev.content}&quot;
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-black/[0.06] dark:border-white/[0.05] flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-normal text-sm text-foreground dark:text-white">
                    {rev.name}
                  </h4>
                  <div className="text-[11px] text-muted-foreground dark:text-white/40 font-light">{rev.title}</div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#006039]/10 dark:bg-[#006039]/20 text-[#006039] dark:text-[#a7f3d0] border border-[#006039]/20 dark:border-[#006039]/30">
                  Đã sở hữu: {rev.watch}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges Bar (Luxury Card Shadow) */}
        <div className="mt-16 p-8 rounded-3xl luxury-card grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faAward} className="w-6 h-6 text-[#9a741e] dark:text-[#d4af37] mb-2.5" />
            <span className="font-serif font-normal text-sm text-foreground dark:text-white">COSC Certified</span>
            <span className="text-[11px] font-mono text-muted-foreground dark:text-white/50 font-light">Độ lệch ±2s / 24h</span>
          </div>
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faShieldHalved} className="w-6 h-6 text-[#006039] dark:text-[#00844e] mb-2.5" />
            <span className="font-serif font-normal text-sm text-foreground dark:text-white">Bảo Hành 5 Năm</span>
            <span className="text-[11px] font-mono text-muted-foreground dark:text-white/50 font-light">Hệ thống toàn cầu</span>
          </div>
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faCircleCheck} className="w-6 h-6 text-[#9a741e] dark:text-[#d4af37] mb-2.5" />
            <span className="font-serif font-normal text-sm text-foreground dark:text-white">Swiss Made 100%</span>
            <span className="text-[11px] font-mono text-muted-foreground dark:text-white/50 font-light">Chứng chỉ xuất xứ</span>
          </div>
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faAward} className="w-6 h-6 text-[#006039] dark:text-[#00844e] mb-2.5" />
            <span className="font-serif font-normal text-sm text-foreground dark:text-white">Vận Chuyển Bọc Thép</span>
            <span className="text-[11px] font-mono text-muted-foreground dark:text-white/50 font-light">Bảo mật tuyệt đối</span>
          </div>
        </div>
      </div>
    </section>
  );
}
