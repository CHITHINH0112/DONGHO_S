"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/axios";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWrench,
  faShieldHalved,
  faClock,
  faAward,
  faCalendarCheck,
  faCircleCheck,
  faCrown,
  faSpinner,
  faCircleInfo,
  faLocationDot,
  faCertificate,
  faBarcode,
} from "@fortawesome/free-solid-svg-icons";

interface DbServiceItem {
  id: number;
  name: string;
  serviceType: string;
  basePrice: string | number;
  estimatedDays: number;
  isActive: boolean;
}

const SERVICE_TYPE_LABELS: Record<string, { category: string; description: string; vipBenefit: string }> = {
  battery: {
    category: "Năng Lượng Pin",
    description: "Sử dụng pin chuẩn Thụy Sĩ / Nhật Bản chính hãng, vệ sinh khoang máy và kiểm tra dòng điện vi cơ học.",
    vipBenefit: "Bảo hành nguồn pin 12 - 24 tháng chính hãng",
  },
  strap: {
    category: "Chế Tác Dây",
    description: "Thay thế và cân chỉnh dây da, dây kim loại, dây cao su cao cấp tương thích chuẩn xác với phom vỏ.",
    vipBenefit: "Tặng kèm vệ sinh và khử mùi dây đeo",
  },
  resize: {
    category: "Cắt Chỉnh Dây",
    description: "Rút hoặc thêm mắt dây kim loại tỉ mỉ theo chu vi cổ tay khách hàng, không làm xước chốt nối.",
    vipBenefit: "Miễn phí căn chỉnh trọn đời cho khách hàng BRU_WATCH",
  },
  polish: {
    category: "Đánh Bóng & Phục Chế",
    description: "Kỹ thuật đánh bóng gương và chải xước satin thủ công bảo tồn góc vát nguyên bản của thân vỏ và vành bezel.",
    vipBenefit: "Kiểm tra độ cân bằng vỏ máy sau khi hoàn thiện",
  },
  waterproof: {
    category: "Kiểm Tra Áp Suất & Ép Gioăng",
    description: "Thay thế toàn bộ gioăng nắp đáy, núm vặn và kiểm tra áp suất buồng chân không chuẩn kháng nước.",
    vipBenefit: "Cấp giấy chứng nhận kháng nước sau kiểm định",
  },
  repair: {
    category: "Sửa Chữa Vi Cơ Học",
    description: "Chẩn đoán và khắc phục sự cố sai số, kẹt cót, đứt dây tóc hoặc hỏng chi tiết truyền động cơ học.",
    vipBenefit: "Bảo hành kỹ thuật sửa chữa 12 tháng",
  },
  service: {
    category: "Bảo Dưỡng Toàn Diện",
    description: "Tháo rã hoàn toàn chi tiết máy, tẩy rửa siêu âm dung dịch chuyên dụng, tra dầu chính hãng Moebius và cân chỉnh sai số.",
    vipBenefit: "Gói bảo dưỡng cao cấp chuẩn chuyên gia kỹ thuật",
  },
};

function ServicesContent() {
  const searchParams = useSearchParams();
  const initialSerial = searchParams.get("serial") || "";

  const { showToast } = useCart();
  const { user, addresses, openAuthModal } = useAuth();

  const [services, setServices] = useState<DbServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingServiceId, setBookingServiceId] = useState<number | string>("");
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [watchInfo, setWatchInfo] = useState("");
  const [serialNumber, setSerialNumber] = useState(initialSerial);
  const [preferredDate, setPreferredDate] = useState("");
  const [locationType, setLocationType] = useState<"salon" | "home">("salon");
  const [pickupAddress, setPickupAddress] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [useCustomAddress, setUseCustomAddress] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookedTicketId, setBookedTicketId] = useState<number | null>(null);

  useEffect(() => {
    if (initialSerial && !serialNumber) {
      setSerialNumber(initialSerial);
    }
  }, [initialSerial, serialNumber]);

  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name || "");
      if (!customerPhone) setCustomerPhone(user.phone || "");
      if (!customerEmail) setCustomerEmail(user.email || "");
    }
  }, [user, customerName, customerPhone, customerEmail]);

  // Tự động gán địa chỉ mặc định từ Sổ địa chỉ nếu có
  useEffect(() => {
    if (addresses && addresses.length > 0 && !pickupAddress) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      if (def) {
        setSelectedAddressId(String(def.id));
        setPickupAddress(def.address);
      }
    }
  }, [addresses, pickupAddress]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/services");
        const data = res.data?.data;
        if (Array.isArray(data) && data.length > 0) {
          const activeOnly = data.filter((s: DbServiceItem) => s.isActive !== false);
          setServices(activeOnly);
          setBookingServiceId(activeOnly[0]?.id || "");
        } else {
          setServices([]);
        }
      } catch (err) {
        console.error("Lỗi khi tải bảng giá dịch vụ:", err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Quý khách vui lòng đăng nhập để lưu lịch hẹn và nhận email xác nhận.");
      openAuthModal("login");
      return;
    }
    if (locationType === "home" && !pickupAddress.trim()) {
      showToast("Vui lòng cung cấp địa chỉ tiếp nhận tận nơi để chuyên viên bảo an đến phục vụ.");
      return;
    }
    try {
      setSubmitting(true);
      watchAudio.chime();
      const trimmedSerial = serialNumber.trim();
      const res = await apiClient.post("/services/repairs/tickets", {
        serviceId: Number(bookingServiceId),
        watchInfo,
        serialNumber: trimmedSerial || undefined,
        appointmentDate: preferredDate || null,
        locationType,
        pickupAddress: locationType === "home" ? pickupAddress.trim() : null,
        customerName,
        customerPhone,
        customerEmail,
        issueDescription: `Khách hẹn: ${customerName} (${customerPhone}). Cỗ máy: ${watchInfo}${
          trimmedSerial ? ` [Serial: ${trimmedSerial}]` : ""
        }. Tiếp nhận: ${
          locationType === "home" ? `Tận nơi (${pickupAddress.trim()})` : "Tại Flagship Salon"
        }.`,
      });
      if (res.data?.success) {
        setIsSubmitted(true);
        setBookedTicketId(res.data?.data?.id || null);
        showToast("Đã ghi nhận lịch hẹn & gửi email xác nhận thành công!");
      } else {
        showToast(res.data?.message || "Không thể đặt lịch hẹn lúc này.");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Lỗi khi gửi lịch hẹn dịch vụ.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPriceVND = (price: string | number) => {
    const num = typeof price === "number" ? price : parseFloat(price);
    return `${new Intl.NumberFormat("vi-VN").format(num)} ₫`;
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
          Dịch Vụ Kỹ Thuật & Bảo Dưỡng Đồng Hồ
        </h1>
        <p className="text-xs text-muted-foreground mt-2 font-light leading-relaxed">
          Được thực hiện trực tiếp bởi các Master Watchmaker với trang thiết bị đo đạc điện tử, buồng thử áp suất chân không và linh kiện chuẩn xác.
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
              {services.length} Dịch Vụ Hệ Thống
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[#d4af37] font-mono text-xs flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
              <span>Đang tải bảng giá dịch vụ từ hệ thống...</span>
            </div>
          ) : services.length === 0 ? (
            <div className="p-8 rounded-3xl bg-card border border-border text-center">
              <FontAwesomeIcon icon={faCircleInfo} className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-sm text-foreground">Hiện chưa có gói dịch vụ nào được công bố.</p>
              <p className="text-xs text-muted-foreground mt-1">Quý khách vui lòng liên hệ trực tiếp hotline để được hỗ trợ.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((srv) => {
                const meta = SERVICE_TYPE_LABELS[srv.serviceType] || {
                  category: "Kỹ Thuật",
                  description: "Dịch vụ kỹ thuật tiêu chuẩn thực hiện bởi đội ngũ thợ đồng hồ giàu kinh nghiệm.",
                  vipBenefit: "Cam kết chuẩn quy trình xuất xưởng",
                };
                const timeText =
                  srv.estimatedDays <= 1
                    ? "Lấy Ngay Trong Ngày"
                    : `${srv.estimatedDays} Ngày Làm Việc`;

                return (
                  <div
                    key={srv.id}
                    className="p-5 sm:p-6 rounded-3xl bg-card border border-border hover:border-[#d4af37]/50 transition-all shadow-md group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase text-[#d4af37] px-2 py-0.5 rounded-md bg-[#d4af37]/10 border border-[#d4af37]/20">
                            {meta.category}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                            <FontAwesomeIcon icon={faClock} className="w-2.5 h-2.5" />
                            <span>{timeText}</span>
                          </span>
                        </div>

                        <h4 className="font-serif text-base font-medium text-foreground mt-2">
                          {srv.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-light">
                          {meta.description}
                        </p>

                        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 w-fit">
                          <FontAwesomeIcon icon={faCrown} className="w-2.5 h-2.5 text-[#d4af37]" />
                          <span>{meta.vipBenefit}</span>
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0 pt-2 sm:pt-0">
                        <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                          Chi Phí Niêm Yết
                        </span>
                        <span className="font-serif text-base sm:text-lg font-bold text-[#d4af37]">
                          {formatPriceVND(srv.basePrice)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            watchAudio.click();
                            setBookingServiceId(srv.id);
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
                );
              })}
            </div>
          )}
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
                  Phục vụ tại Trung tâm hoặc tiếp nhận tận nơi
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
                {bookedTicketId && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] font-mono text-xs font-semibold">
                      Mã phiếu dịch vụ: #TK-{bookedTicketId}
                    </span>
                    {serialNumber && (
                      <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
                        Serial: {serialNumber}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground font-light max-w-xs mx-auto leading-relaxed">
                  Hệ thống đã gửi email xác nhận chi tiết về hòm thư của Quý khách. Chuyên viên kỹ thuật sẽ chủ động liên hệ để chuẩn bị đón nhận cỗ máy.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/account/services"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b38f28] text-black text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-[#d4af37]/20 transition-all text-center"
                  >
                    Xem Lịch Hẹn Trong Tài Khoản
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setBookedTicketId(null);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-border text-foreground hover:bg-muted/30 text-xs font-mono cursor-pointer transition-colors"
                  >
                    Đặt Thêm Lịch Hẹn
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitBooking} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-muted-foreground">
                    Gói Dịch Vụ Cần Thực Hiện
                  </label>
                  <select
                    value={bookingServiceId}
                    onChange={(e) => setBookingServiceId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070e0a] border border-[#d4af37]/40 text-[#f3e3be] text-xs font-mono focus:outline-none focus:border-[#d4af37]"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#0c1610] text-[#f3e3be]">
                        {s.name} - {formatPriceVND(s.basePrice)}
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
                      placeholder="ví dụ: Nguyễn Văn A"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase text-muted-foreground">
                      Số Điện Thoại
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0908 123 456"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-[#d4af37] font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-muted-foreground flex items-center justify-between">
                    <span>Email Nhận Xác Nhận Lịch Hẹn</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Tự động gửi email</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-[#d4af37] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-muted-foreground flex items-center justify-between">
                    <span>Thương Hiệu & Dòng Cỗ Máy</span>
                    <span className="text-[10px] text-amber-400 font-mono">* Bắt buộc</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ví dụ: Rolex Submariner Date, Cartier Santos, Casio Edifice..."
                    value={watchInfo}
                    onChange={(e) => setWatchInfo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-muted-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCertificate} className="w-3 h-3 text-[#d4af37]" />
                      <span>Số Serial / Mã Khắc Đáy (Nếu Có)</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">Không bắt buộc</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="ví dụ: SN-8-1-GENEVE hoặc mã khắc sau nắp đáy..."
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#070e0a] border border-[#d4af37]/30 text-xs text-[#f3e3be] placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#d4af37] font-mono uppercase tracking-wider transition-colors"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                      <FontAwesomeIcon icon={faBarcode} className="w-3.5 h-3.5 text-[#d4af37]/70" />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-light leading-tight">
                    Đối với cỗ máy mua tại BRU_WATCH, số Serial giúp chuyên viên tra cứu chứng thư bảo hành và lịch sử bảo dưỡng ngay lập tức.
                  </p>
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
                      Tại Trung Tâm Kỹ Thuật
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
                      Tiếp Nhận Tận Nơi
                    </button>
                  </div>
                </div>

                {/* Khối Nhập Địa Chỉ Tận Nơi khi chọn Tiếp Nhận Tận Nơi */}
                {locationType === "home" && (
                  <div className="space-y-3 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-mono uppercase text-emerald-400 font-semibold flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faLocationDot} className="text-xs" />
                        <span>Địa Chỉ Tiếp Nhận Cỗ Máy Tận Nơi *</span>
                      </label>
                      {addresses && addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setUseCustomAddress(!useCustomAddress)}
                          className="text-[#d4af37] text-[10px] font-mono hover:underline cursor-pointer"
                        >
                          {useCustomAddress ? "Chọn từ Sổ địa chỉ" : "+ Nhập địa chỉ khác"}
                        </button>
                      )}
                    </div>

                    {addresses && addresses.length > 0 && !useCustomAddress ? (
                      <div className="space-y-1.5">
                        <select
                          value={selectedAddressId}
                          onChange={(e) => {
                            setSelectedAddressId(e.target.value);
                            const matched = addresses.find((a) => String(a.id) === e.target.value);
                            if (matched) setPickupAddress(matched.address);
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:border-[#d4af37]"
                        >
                          {addresses.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.receiverName} ({a.phone}) - {a.address} {a.isDefault ? "[Mặc định]" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <textarea
                        rows={2}
                        required
                        placeholder="Quý khách vui lòng nhập số nhà, tên đường, phường/xã, quận/huyện, tỉnh/TP để chuyên viên bảo an đến tận nơi tiếp nhận..."
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:border-emerald-500 text-xs text-foreground focus:outline-none placeholder:text-muted-foreground font-sans leading-relaxed"
                      />
                    )}

                    <div className="text-[11px] font-mono text-stone-400 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-400 text-xs" />
                      <span>Chuyên viên trang bị vali an ninh chống sốc & niêm phong biên nhận tận tay.</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c69f2e] to-[#b38f28] text-black font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 hover:scale-101 active:scale-99 transition-all cursor-pointer mt-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang Gửi Lịch Hẹn...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCalendarCheck} className="w-3.5 h-3.5" />
                      <span>Xác Nhận Đặt Lịch Hẹn</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-28 pb-20 px-4 text-center text-muted-foreground font-mono text-xs flex items-center justify-center">
          <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin text-[#d4af37] mr-2" />
          Đang tải bảng giá dịch vụ...
        </div>
      }
    >
      <ServicesContent />
    </Suspense>
  );
}
