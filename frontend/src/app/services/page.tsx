"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWrench,
  faShieldHalved,
  faClock,
  faAward,
  faCalendarCheck,
  faCheck,
  faGem,
  faTruck,
  faLocationDot,
  faPhone,
  faUser,
  faCircleCheck,
  faCrown,
} from "@fortawesome/free-solid-svg-icons";

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  estimatedTime: string;
  priceVND: number;
  priceUSD: number;
  vipBenefit: string;
}

const SERVICES_CATALOG: ServiceItem[] = [
  {
    id: "srv-1",
    name: "Bảo Dưỡng Cỗ Máy Toàn Diện (Complete Overhaul)",
    category: "Cơ Học Máy",
    description:
      "Tháo rã hoàn toàn hơn 300 chi tiết máy, tẩy rửa siêu âm đa tầng dung dịch Elma Thụy Sĩ, bôi trơn 5 loại dầu Moebius đặc chế, thay thế gioăng đệm và cân chỉnh sai số đạt chuẩn Chronometer COSC.",
    estimatedTime: "7 - 10 Ngày",
    priceVND: 12500000,
    priceUSD: 500,
    vipBenefit: "Giảm 100% cho Hội viên Diamond & Platinum",
  },
  {
    id: "srv-2",
    name: "Đánh Bóng & Phục Chế Vỏ Vàng / Bạch Kim (Haute Refinishing)",
    category: "Ngoại Thất",
    description:
      "Kỹ thuật đánh bóng gương và chải xước satin thủ công theo góc vát nguyên bản (Bevel polishing) bảo tồn 100% tỷ lệ vàng và phom dáng xuất xưởng của cỗ máy, không làm mòn góc cạnh.",
    estimatedTime: "3 - 5 Ngày",
    priceVND: 6500000,
    priceUSD: 260,
    vipBenefit: "Tặng kèm 1 lần/năm cho Hội viên Emerald",
  },
  {
    id: "srv-3",
    name: "Kiểm Định Sai Số Chronometer & Test Áp Suất Nước 30 Bar",
    category: "Kiểm Định",
    description:
      "Đo biểu đồ xung nhịp cỗ máy trên máy đo Witschi Chronoscope Thụy Sĩ 6 tư thế. Thử áp suất buồng chân không và buồng nước cao áp 300m / 30 bar kèm cấp chứng thư sai số chính hãng.",
    estimatedTime: "Lấy Ngay (60 Phút)",
    priceVND: 1500000,
    priceUSD: 60,
    vipBenefit: "Miễn phí vĩnh viễn trọn đời cho toàn bộ khách VIP",
  },
  {
    id: "srv-4",
    name: "Thay Pin Thụy Sĩ Renata & Gioăng Kín Khí Chống Nhiễm Từ",
    category: "Bảo Dưỡng Nhanh",
    description:
      "Sử dụng pin oxit bạc Renata chuẩn Thụy Sĩ không rò rỉ dung môi. Vệ sinh mạch vi điện tử, thay thế toàn bộ gioăng nắp đáy và núm vặn, thử kín nước áp lực.",
    estimatedTime: "Lấy Ngay (30 Phút)",
    priceVND: 1200000,
    priceUSD: 48,
    vipBenefit: "Bảo hành pin 24 tháng không điều kiện",
  },
  {
    id: "srv-5",
    name: "May Đo Dây Da Cá Sấu Alligator Pháp Thủ Công Bespoke",
    category: "Chế Tác Dây",
    description:
      "Chất liệu da cá sấu Mississippi hoặc Alligator Pháp thuộc thảo mộc cao cấp nhất, khâu tay thủ công bằng chỉ sáp Hermès, may đo riêng vừa vặn tuyệt đối theo chu vi cổ tay và khóa gập.",
    estimatedTime: "5 - 7 Ngày",
    priceVND: 8500000,
    priceUSD: 340,
    vipBenefit: "Khắc tên chữ cái vàng kim mặt trong dây đeo",
  },
  {
    id: "srv-6",
    name: "Thay Kính Sapphire Nguyên Khối Phủ Chống Lóa Kép (Double AR)",
    category: "Kính & Mặt Số",
    description:
      "Kính Sapphire tinh thể nguyên khối độ cứng 9 Mohs (chỉ sau kim cương), được phủ 2 lớp chống lóa quang học cao cấp giúp mặt số trong suốt không tì vết dưới ánh sáng mạnh.",
    estimatedTime: "2 - 3 Ngày",
    priceVND: 9500000,
    priceUSD: 380,
    vipBenefit: "Bảo hành chống bong tróc lớp AR 3 năm",
  },
];

export default function ServicesPage() {
  const { formatPrice, showToast } = useCart();
  const { user } = useAuth();

  const [bookingService, setBookingService] = useState<string>("srv-1");
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [watchInfo, setWatchInfo] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [locationType, setLocationType] = useState<"salon" | "home">("salon");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    watchAudio.chime();
    setIsSubmitted(true);
    showToast("Đã ghi nhận lịch hẹn kiểm định cỗ máy.");
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#006039]/20 border border-[#006039]/40 text-[#d4af37] mb-3 shadow-lg">
          <FontAwesomeIcon icon={faWrench} className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#d4af37] block">
          BRU_WATCH ATELIER • GENÈVE STANDARDS
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-normal text-foreground mt-1">
          Dịch Vụ Kỹ Thuật & Bảo Dưỡng Thụy Sĩ
        </h1>
        <p className="text-xs text-muted-foreground mt-2 font-light leading-relaxed">
          Được thực hiện trực tiếp bởi các Master Watchmaker chứng nhận tại Thụy Sĩ với thiết bị kiểm định Witschi, buồng áp suất chân không và phụ tùng nguyên bản 100%.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        {/* Left Column: Services Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-serif text-lg font-normal text-foreground">
              Bảng Giá Niêm Yết Dịch Vụ Chính Hãng
            </h3>
            <span className="text-xs font-mono text-muted-foreground">
              6 Phân Hệ Tiêu Chuẩn
            </span>
          </div>

          <div className="space-y-4">
            {SERVICES_CATALOG.map((srv) => (
              <div
                key={srv.id}
                className="p-5 sm:p-6 rounded-3xl bg-card border border-border hover:border-[#d4af37]/50 transition-all shadow-md group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase text-[#d4af37] px-2 py-0.5 rounded-md bg-[#d4af37]/10 border border-[#d4af37]/20">
                        {srv.category}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                        <FontAwesomeIcon icon={faClock} className="w-2.5 h-2.5" />
                        <span>{srv.estimatedTime}</span>
                      </span>
                    </div>

                    <h4 className="font-serif text-base font-medium text-foreground mt-2">
                      {srv.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-light">
                      {srv.description}
                    </p>

                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 w-fit">
                      <FontAwesomeIcon icon={faCrown} className="w-2.5 h-2.5 text-[#d4af37]" />
                      <span>{srv.vipBenefit}</span>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 pt-2 sm:pt-0">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                      Chi Phí Niêm Yết
                    </span>
                    <span className="font-serif text-base sm:text-lg font-bold text-foreground">
                      {formatPrice(srv.priceUSD, srv.priceVND)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        watchAudio.click();
                        setBookingService(srv.id);
                        const formElem = document.getElementById("booking-form");
                        if (formElem) formElem.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="mt-2 block w-full sm:w-auto px-4 py-1.5 rounded-lg border border-border group-hover:border-[#d4af37] text-xs font-mono text-foreground hover:text-[#d4af37] transition-colors cursor-pointer text-center"
                    >
                      Chọn Đặt Lịch
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Service Booking Form (5 cols) */}
        <div className="lg:col-span-5" id="booking-form">
          <div className="p-6 sm:p-7 rounded-3xl bg-card border border-[#d4af37]/40 shadow-xl space-y-5 sticky top-28">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-9 h-9 rounded-xl bg-[#006039]/20 text-emerald-400 border border-[#006039]/40 flex items-center justify-center">
                <FontAwesomeIcon icon={faCalendarCheck} className="w-4 h-4 text-[#d4af37]" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-normal text-foreground">
                  Đặt Lịch Tiếp Nhận Cỗ Máy
                </h3>
                <span className="text-xs text-muted-foreground font-light">
                  Phục vụ tại Salon hoặc tiếp nhận bằng xe bọc thép
                </span>
              </div>
            </div>

            {isSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
                  <FontAwesomeIcon icon={faCircleCheck} />
                </div>
                <h4 className="font-serif text-xl text-foreground">
                  Lịch Hẹn Đã Được Tiếp Nhận
                </h4>
                <p className="text-xs text-muted-foreground font-light max-w-xs mx-auto leading-relaxed">
                  Trưởng phòng Kỹ thuật Thụy Sĩ sẽ gọi trực tiếp đến số điện thoại của Quý khách để xác nhận cỗ máy và sắp xếp chuyên viên bảo an tiếp đón.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2.5 rounded-full bg-[#d4af37] text-black text-xs font-mono font-semibold uppercase"
                >
                  Đặt Thêm Lịch Hẹn Khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-muted-foreground">
                    Gói Dịch Vụ Cần Thực Hiện
                  </label>
                  <select
                    value={bookingService}
                    onChange={(e) => setBookingService(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-[#d4af37]"
                  >
                    {SERVICES_CATALOG.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase text-muted-foreground">
                      Họ Tên Quý Khách
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ví dụ: Alexander Vũ"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase text-muted-foreground">
                      Số Điện Thoại VIP
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0908 889 999"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-[#d4af37] font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-muted-foreground">
                    Thương Hiệu & Mẫu Cỗ Máy (hoặc Serial nếu có)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ví dụ: Rolex Daytona 126500LN / Patek Philippe 5711..."
                    value={watchInfo}
                    onChange={(e) => setWatchInfo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-muted-foreground">
                    Ngày Hẹn Mong Muốn
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-[#d4af37] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-muted-foreground">
                    Địa Điểm Tiếp Nhận Cỗ Máy
                  </label>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setLocationType("salon")}
                      className={`p-2.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                        locationType === "salon"
                          ? "border-[#d4af37] bg-[#d4af37]/15 text-foreground font-semibold"
                          : "border-border bg-muted/20 text-muted-foreground"
                      }`}
                    >
                      Boutique VIP Salon
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationType("home")}
                      className={`p-2.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                        locationType === "home"
                          ? "border-emerald-500 bg-emerald-500/15 text-emerald-400 font-semibold"
                          : "border-border bg-muted/20 text-muted-foreground"
                      }`}
                    >
                      Xe Bọc Thép Tận Tư Gia
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c69f2e] to-[#b38f28] text-black font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 hover:scale-101 active:scale-99 transition-all cursor-pointer mt-2"
                >
                  <FontAwesomeIcon icon={faCalendarCheck} className="w-3.5 h-3.5" />
                  <span>Xác Nhận Đặt Lịch Hẹn Thẩm Định</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
