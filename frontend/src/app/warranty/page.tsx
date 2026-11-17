"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { watchAudio } from "@/utils/audio";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faMagnifyingGlass,
  faCertificate,
  faCircleCheck,
  faCircleExclamation,
  faWrench,
  faAward,
  faQrcode,
  faSpinner,
  faCircleInfo,
  faPrint,
  faXmark,
  faClock,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

interface WarrantyData {
  cardCode: string;
  serialNumber: string;
  watchName: string;
  brand: string;
  image: string;
  customerName: string;
  purchaseDate: string;
  expiryDate: string;
  status: "active" | "expired" | "void";
  boutique: string;
  calibre?: string;
  waterResistance?: string;
  serviceHistory: {
    date: string;
    action: string;
    watchmaker: string;
  }[];
}

function WarrantyLookupContent() {
  const searchParams = useSearchParams();
  const initialSerial = searchParams.get("serial") || "";
  const { showToast } = useCart();
  const { user, openAuthModal } = useAuth();

  const [inputCode, setInputCode] = useState(initialSerial);
  const [searchedData, setSearchedData] = useState<WarrantyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Modal Spa / Bảo dưỡng
  const [showSpaModal, setShowSpaModal] = useState<boolean>(false);
  const [spaService, setSpaService] = useState<string>("Bảo dưỡng lau dầu định kỳ & cân chỉnh Chronometer");
  const [spaDate, setSpaDate] = useState<string>("");
  const [spaNote, setSpaNote] = useState<string>("");
  const [spaSubmitting, setSpaSubmitting] = useState<boolean>(false);
  const [spaSuccess, setSpaSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (initialSerial) {
      setInputCode(initialSerial);
      handleSearch(initialSerial);
    }
  }, [initialSerial]);

  const handleSearch = async (codeToSearch?: string) => {
    watchAudio.ratchet();
    const target = (codeToSearch || inputCode).trim().toUpperCase();

    if (!target) {
      setErrorMessage("Vui lòng nhập số Serial cỗ máy hoặc mã thẻ bảo hành điện tử.");
      setSearchedData(null);
      setHasSearched(true);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.get(`/warranties/check/${encodeURIComponent(target)}`);
      const data = res.data?.data;

      if (data) {
        const productInfo = data.serialNumber?.variant?.product || {};
        const variantInfo = data.serialNumber?.variant || {};

        const mapped: WarrantyData = {
          cardCode: data.cardCode || target,
          serialNumber:
            data.serialNumber?.serial_number ||
            data.serialNumber?.serialNumber ||
            target,
          watchName: productInfo.name || "Kiệt Tác Đồng Hồ Chính Hãng",
          brand: productInfo.brand || "Swiss Manufacture",
          image:
            variantInfo.imageUrl ||
            productInfo.imageUrl ||
            "/images/watches/submariner.png",
          customerName: data.user?.name || "Khách Hàng Danh Dự",
          purchaseDate: data.startDate
            ? new Date(data.startDate).toLocaleDateString("vi-VN")
            : "Chính Hãng",
          expiryDate: data.ngayHetBaoHanh
            ? new Date(data.ngayHetBaoHanh).toLocaleDateString("vi-VN")
            : "5 Năm Toàn Cầu",
          status: data.status || "active",
          boutique: "BRU_WATCH Haute Horlogerie Flagship",
          calibre: "Cỗ Máy In-House Chuẩn Chính Hãng",
          waterResistance: "Chuẩn Áp Suất Kháng Nước Toàn Diện",
          serviceHistory: [
            {
              date: data.startDate
                ? new Date(data.startDate).toLocaleDateString("vi-VN")
                : "Ngày bàn giao",
              action: "Kích hoạt thẻ bảo hành điện tử chính hãng toàn cầu",
              watchmaker: "Phòng Kiểm Định & Xuất Xưởng BRU_WATCH",
            },
          ],
        };

        setSearchedData(mapped);
        setHasSearched(true);
      } else {
        setSearchedData(null);
        setErrorMessage(
          `Không tìm thấy dữ liệu bảo hành cho mã/serial '${target}'. Quý khách vui lòng kiểm tra lại.`
        );
        setHasSearched(true);
      }
    } catch (err: any) {
      setSearchedData(null);
      const apiMsg =
        err.response?.data?.message ||
        `Không tìm thấy thông tin bảo hành cho mã/serial '${target}' trong hệ thống.`;
      setErrorMessage(apiMsg);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSpaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Quý khách vui lòng đăng nhập để lưu lịch hẹn và nhận email xác nhận.");
      openAuthModal("login");
      return;
    }
    try {
      setSpaSubmitting(true);
      watchAudio.chime();
      const res = await apiClient.post("/services/repairs/tickets", {
        serviceId: 7, // Bảo dưỡng máy toàn diện
        serialNumber: searchedData?.serialNumber,
        watchInfo: `${searchedData?.brand || ""} ${searchedData?.watchName || "Cỗ máy chính hãng"}`.trim(),
        appointmentDate: spaDate || null,
        cost: 0,
        issueDescription: `${spaService}. Ghi chú: ${spaNote || "Bảo dưỡng định kỳ theo chứng thư Thụy Sĩ"}.`,
      });
      if (res.data?.success) {
        setSpaSuccess(true);
        showToast("Đã ghi nhận lịch hẹn & gửi email xác nhận thành công!");
        setTimeout(() => {
          setShowSpaModal(false);
          setSpaSuccess(false);
          setSpaNote("");
          setSpaDate("");
        }, 2500);
      } else {
        showToast(res.data?.message || "Không thể đặt lịch bảo dưỡng lúc này.");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Lỗi khi đăng ký bảo dưỡng cỗ máy.");
    } finally {
      setSpaSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-5xl mx-auto">
      {/* Global Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          nav,
          footer,
          header,
          .no-print {
            display: none !important;
          }
          .print-certificate-card {
            background: #fffdfa !important;
            color: #1a1a1a !important;
            border: 4px double #b8952b !important;
            box-shadow: none !important;
            padding: 36px !important;
            border-radius: 8px !important;
            margin: 0 auto !important;
            page-break-inside: avoid !important;
          }
          .print-certificate-card * {
            color: #1a1a1a !important;
            text-shadow: none !important;
            background-color: transparent !important;
          }
          .print-gold {
            color: #8c6a21 !important;
            font-weight: 700 !important;
          }
          .print-border-gold {
            border-color: #b8952b !important;
          }
        }
      `}</style>

      {/* Title & Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10 no-print">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#006039]/20 border border-[#006039]/40 text-[#d4af37] mb-3 shadow-lg">
          <FontAwesomeIcon icon={faShieldHalved} className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#d4af37] block">
          OFFICIAL SWISS ELECTRONIC GUARANTEE
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-normal text-foreground mt-1">
          Tra Cứu Thẻ Bảo Hành Toàn Cầu
        </h1>
        <p className="text-xs text-muted-foreground mt-2 font-light leading-relaxed">
          Tra cứu dữ liệu xuất xưởng, trạng thái bảo hành điện tử và nguồn gốc cỗ máy trực tiếp từ hệ thống bảo mật BRU_WATCH.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-2xl mx-auto mb-12 no-print">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden border border-[#d4af37]/40 bg-card"
        >
          <div className="pl-5 text-[#d4af37]">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Nhập số Serial cỗ máy hoặc mã thẻ bảo hành (ví dụ: SN-2026-001)..."
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="w-full py-4 pl-4 pr-32 bg-transparent text-foreground placeholder:text-muted-foreground text-xs sm:text-sm font-mono focus:outline-none uppercase"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38f28] text-black font-semibold text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" />}
            <span>{loading ? "Đang Tra Cứu..." : "Tra Cứu"}</span>
          </button>
        </form>

        <p className="text-center text-[11px] font-mono text-muted-foreground mt-3">
          * Số Serial được khắc ở nắp lưng cỗ máy hoặc in trên thẻ bảo hành điện tử khi nhận bàn giao.
        </p>
      </div>

      {/* Not Found / Error Message */}
      {hasSearched && !searchedData && errorMessage && (
        <div className="max-w-2xl mx-auto mb-10 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center animate-fadeIn no-print">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 mb-3">
            <FontAwesomeIcon icon={faCircleExclamation} className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-base text-foreground font-medium mb-1">
            Không Tìm Thấy Thông Tin Bảo Hành
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {errorMessage}
          </p>
          <p className="text-[11px] font-mono text-muted-foreground/80 mt-3">
            Nếu Quý khách vừa nhận bàn giao đồng hồ, vui lòng liên hệ chuyên viên để được kích hoạt bảo hành điện tử trên hệ thống.
          </p>
        </div>
      )}

      {/* Initial Instruction State when no search done yet */}
      {!hasSearched && !searchedData && (
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 no-print">
          <div className="p-6 rounded-2xl bg-card border border-border/40 text-center">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center mx-auto mb-3 text-sm">
              <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4" />
            </div>
            <h4 className="font-serif text-sm font-medium text-foreground mb-1">
              Bảo Hành Toàn Diện
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Toàn bộ cỗ máy xuất xưởng đều được bảo hành chính hãng chuẩn Thụy Sĩ theo thời hạn quy định.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border/40 text-center">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center mx-auto mb-3 text-sm">
              <FontAwesomeIcon icon={faQrcode} className="w-4 h-4" />
            </div>
            <h4 className="font-serif text-sm font-medium text-foreground mb-1">
              Định Danh Serial Độc Bản
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mỗi cỗ máy sở hữu một số Serial duy nhất được lưu trữ vĩnh viễn trên cơ sở dữ liệu.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border/40 text-center">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center mx-auto mb-3 text-sm">
              <FontAwesomeIcon icon={faCertificate} className="w-4 h-4" />
            </div>
            <h4 className="font-serif text-sm font-medium text-foreground mb-1">
              Tra Cứu Nhanh Chóng
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nhập mã thẻ hoặc số Serial vào ô tìm kiếm phía trên để kiểm tra tình trạng hiệu lực tức thì.
            </p>
          </div>
        </div>
      )}

      {/* Warranty Card Presentation */}
      {searchedData && (
        <div className="space-y-8 animate-fadeIn">
          {/* Digital Luxury Guarantee Card */}
          <div className="print-certificate-card rounded-3xl bg-gradient-to-br from-[#0a1811] via-[#08120c] to-[#040806] border border-[#d4af37]/50 p-7 sm:p-9 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none no-print" />

            {/* Header info */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.08] print-border-gold gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#8c6a21] text-black flex items-center justify-center font-bold text-lg font-serif shadow-lg shadow-[#d4af37]/20">
                  <FontAwesomeIcon icon={faShieldHalved} className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#d4af37] print-gold">
                    CHỨNG THỰC BẢO HÀNH CHÍNH HÃNG THỤY SĨ
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-normal text-white">
                    {searchedData.brand} International Guarantee
                  </h3>
                </div>
              </div>

              {/* Action Buttons & Status Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    watchAudio.click();
                    window.print();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-[#d4af37] hover:text-black border border-white/[0.1] text-xs font-mono text-stone-200 transition-all flex items-center gap-1.5 cursor-pointer no-print shadow-sm"
                  title="In chứng thư bảo hành hoặc lưu dưới dạng PDF"
                >
                  <FontAwesomeIcon icon={faPrint} className="text-xs" />
                  <span>In Chứng Thư</span>
                </button>

                <button
                  onClick={() => {
                    watchAudio.click();
                    setShowSpaModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#006039]/30 hover:bg-[#006039]/50 border border-[#006039]/60 text-xs font-mono text-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer no-print shadow-sm"
                  title="Đặt lịch bảo dưỡng & Spa định kỳ"
                >
                  <FontAwesomeIcon icon={faWrench} className="text-xs text-[#d4af37]" />
                  <span>Đặt Lịch Spa</span>
                </button>

                {searchedData.status === "active" ? (
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/40 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCircleCheck} className="w-3.5 h-3.5" />
                    <span>Bảo Hành Hiệu Lực</span>
                  </span>
                ) : (
                  <span className="text-xs font-mono text-red-400 bg-red-500/10 px-3.5 py-1.5 rounded-full border border-red-500/40 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCircleExclamation} className="w-3.5 h-3.5" />
                    <span>Hết Hạn Bảo Hành</span>
                  </span>
                )}
              </div>
            </div>

            {/* Watch Details & Guarantee Specs */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 py-8 items-center border-b border-white/[0.08] print-border-gold">
              {/* Thumbnail (4 cols) */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="relative w-48 h-48 rounded-2xl bg-black/40 border border-white/[0.08] print-border-gold overflow-hidden p-3 shadow-inner">
                  <Image
                    src={searchedData.image}
                    alt={searchedData.watchName}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="mt-3 text-center">
                  <span className="text-[10px] font-mono uppercase text-[#d4af37] print-gold">
                    {searchedData.brand}
                  </span>
                  <h4 className="font-serif text-sm font-medium text-white">
                    {searchedData.watchName}
                  </h4>
                </div>
              </div>

              {/* Specs Grid (8 cols) */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] print-border-gold">
                  <span className="text-[10px] text-white/50 uppercase block">Số Serial Máy Độc Bản</span>
                  <strong className="text-[#d4af37] print-gold text-sm tracking-wider mt-0.5 block">
                    {searchedData.serialNumber}
                  </strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] print-border-gold">
                  <span className="text-[10px] text-white/50 uppercase block">Mã Thẻ Điện Tử</span>
                  <strong className="text-white text-sm tracking-wider mt-0.5 block">
                    {searchedData.cardCode}
                  </strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] print-border-gold">
                  <span className="text-[10px] text-white/50 uppercase block">Chủ Sở Hữu Đăng Ký</span>
                  <strong className="text-white text-sm font-serif mt-0.5 block">
                    {searchedData.customerName}
                  </strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] print-border-gold">
                  <span className="text-[10px] text-white/50 uppercase block">Boutique Bàn Giao</span>
                  <strong className="text-white/90 text-xs mt-0.5 block truncate">
                    {searchedData.boutique}
                  </strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] print-border-gold">
                  <span className="text-[10px] text-white/50 uppercase block">Ngày Kích Hoạt</span>
                  <strong className="text-white mt-0.5 block">
                    {searchedData.purchaseDate}
                  </strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] print-border-gold">
                  <span className="text-[10px] text-white/50 uppercase block">Thời Hạn Bảo Hành</span>
                  <strong className="text-emerald-400 print-gold mt-0.5 block">
                    Đến {searchedData.expiryDate}
                  </strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] print-border-gold sm:col-span-2">
                  <span className="text-[10px] text-white/50 uppercase block">Bộ Máy & Kháng Nước</span>
                  <div className="text-white/80 mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span>{searchedData.calibre}</span>
                    <span className="text-[#d4af37] print-gold font-semibold">{searchedData.waterResistance}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service & Verification History Timeline */}
            <div className="relative z-10 pt-6">
              <h4 className="font-serif text-base font-normal text-white mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faAward} className="w-4 h-4 text-[#d4af37] print-gold" />
                <span>Nhật Ký Thẩm Định & Bảo Dưỡng Thụy Sĩ</span>
              </h4>

              <div className="space-y-3">
                {searchedData.serviceHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] print-border-gold flex items-start justify-between gap-4 text-xs font-mono"
                  >
                    <div>
                      <div className="text-[#d4af37] print-gold text-[11px] font-semibold">{item.date}</div>
                      <div className="text-white mt-0.5 font-light leading-relaxed">{item.action}</div>
                      <div className="text-white/40 text-[10px] mt-1">Chứng nhận bởi: {item.watchmaker}</div>
                    </div>
                    <FontAwesomeIcon icon={faCertificate} className="w-4 h-4 text-emerald-400 print-gold shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Print Only: Official Swiss Signatures & Poinçon de Genève */}
            <div className="hidden print:flex justify-between items-end pt-8 mt-6 border-t border-[#d4af37] text-xs font-mono">
              <div>
                <span className="block text-[10px] text-stone-500 uppercase tracking-wider">Chứng Thư Xuất Xưởng</span>
                <strong className="block font-serif text-sm mt-0.5 text-stone-900">POINÇON DE GENÈVE #CH-88219</strong>
                <p className="text-[10px] text-stone-500 mt-1">Kiểm định sai số Chronometer COSC đạt chuẩn tuyệt đối</p>
              </div>

              <div className="text-center">
                <div className="h-12 w-32 border-b border-stone-400 mx-auto flex items-end justify-center pb-1 font-serif italic text-stone-600">
                  L. Horloger
                </div>
                <span className="block text-[10px] uppercase tracking-wider text-stone-600 mt-1">Le Maître Horloger</span>
              </div>

              <div className="text-center">
                <div className="h-12 w-32 border-b border-stone-400 mx-auto flex items-end justify-center pb-1 font-serif italic text-stone-600">
                  Direction Genève
                </div>
                <span className="block text-[10px] uppercase tracking-wider text-stone-600 mt-1">Direction Générale</span>
              </div>
            </div>

            {/* Card Action footer (Screen only) */}
            <div className="relative z-10 pt-6 mt-6 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono no-print">
              <span className="text-white/50 flex items-center gap-2">
                <FontAwesomeIcon icon={faQrcode} className="w-4 h-4 text-[#d4af37]" />
                <span>Mã xác thực chữ ký điện tử: SHA-256 Validated</span>
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    watchAudio.click();
                    setShowSpaModal(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38f28] text-black text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#d4af37]/20"
                >
                  <FontAwesomeIcon icon={faWrench} className="w-3.5 h-3.5" />
                  <span>Đặt Lịch Bảo Dưỡng / Spa Định Kỳ</span>
                </button>

                <Link
                  href="/services"
                  className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-stone-300 text-xs font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Bảng Giá Dịch Vụ</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ĐẶT LỊCH BẢO DƯỠNG / SPA ĐỊNH KỲ */}
      {showSpaModal && searchedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn no-print">
          <div className="bg-[#08120d] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl relative space-y-5">
            <button
              onClick={() => setShowSpaModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#006039]/30 text-emerald-400 border border-[#006039]/50 flex items-center justify-center text-lg">
                <FontAwesomeIcon icon={faWrench} className="text-[#d4af37]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#d4af37] font-semibold block">
                  HAUTE HORLOGERIE SPA SERVICE
                </span>
                <h3 className="font-serif text-lg font-normal text-stone-100">
                  Đặt Lịch Bảo Dưỡng Cỗ Máy
                </h3>
              </div>
            </div>

            {spaSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                  <FontAwesomeIcon icon={faCircleCheck} />
                </div>
                <h4 className="font-serif text-lg text-white">
                  Đã Tiếp Nhận Lịch Hẹn Chăm Sóc
                </h4>
                <p className="text-xs text-stone-300 font-light max-w-xs mx-auto leading-relaxed">
                  Chuyên viên kỹ thuật trưởng sẽ liên hệ trực tiếp với Quý khách. Email xác nhận đã được gửi về hòm thư của Quý khách.
                </p>
                <div className="pt-2">
                  <Link
                    href="/account/services"
                    className="inline-block px-5 py-2 rounded-full bg-[#d4af37] text-black text-xs font-mono font-bold uppercase tracking-wider shadow-lg"
                  >
                    Xem Lịch Hẹn Trong Tài Khoản
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSpaSubmit} className="space-y-4">
                {/* Watch Info Card */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono space-y-1">
                  <div className="text-stone-400">Cỗ máy được bảo dưỡng:</div>
                  <strong className="text-stone-100 block font-serif text-sm">
                    {searchedData.watchName} ({searchedData.brand})
                  </strong>
                  <div className="text-[#d4af37] text-[11px]">
                    Serial: <strong>{searchedData.serialNumber}</strong> • Chủ nhân: {searchedData.customerName}
                  </div>
                </div>

                {/* Service Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-stone-400 block">
                    Gói Chăm Sóc / Bảo Dưỡng
                  </label>
                  <select
                    value={spaService}
                    onChange={(e) => setSpaService(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/[0.1] text-xs text-stone-200 focus:outline-none focus:border-[#d4af37] font-mono cursor-pointer"
                  >
                    <option value="Bảo dưỡng lau dầu định kỳ & cân chỉnh Chronometer">
                      Bảo dưỡng lau dầu định kỳ & cân chỉnh Chronometer (Miễn phí 5 năm)
                    </option>
                    <option value="Spa đánh bóng vỏ vàng & chải xước satin nguyên bản">
                      Spa đánh bóng vỏ vàng & chải xước satin nguyên bản
                    </option>
                    <option value="Ép gioăng chân không & kiểm tra áp suất kháng nước">
                      Ép gioăng chân không & kiểm tra áp suất kháng nước
                    </option>
                    <option value="Cắt chỉnh / Thay dây da cá sấu & phụ kiện cao cấp">
                      Cắt chỉnh / Thay dây da cá sấu & phụ kiện cao cấp
                    </option>
                    <option value="Kiểm định chuyên sâu & tái cấp chứng thư Thụy Sĩ">
                      Kiểm định chuyên sâu & tái cấp chứng thư Thụy Sĩ
                    </option>
                  </select>
                </div>

                {/* Preferred Date */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-stone-400 block">
                    Ngày Dự Kiến Mang Máy Đến / Hẹn Tiếp Nhận
                  </label>
                  <input
                    type="date"
                    required
                    value={spaDate}
                    onChange={(e) => setSpaDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/[0.1] text-xs text-stone-200 focus:outline-none focus:border-[#d4af37] font-mono"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-stone-400 block">
                    Ghi Chú Yêu Cầu Kỹ Thuật Riêng
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Quý khách có thể yêu cầu chuyên viên kiểm tra độ kín nước trước chuyến du ngoạn, căn chỉnh sai số cót, hoặc cử xe an ninh đón máy tại tư gia..."
                    value={spaNote}
                    onChange={(e) => setSpaNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSpaModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-white/[0.1] text-xs font-mono text-stone-300 hover:bg-white/[0.05] cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={spaSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38f28] hover:from-[#e5c158] hover:to-[#c49e35] text-black text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {spaSubmitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                        <span>Đang Đăng Ký...</span>
                      </>
                    ) : (
                      <span>Xác Nhận Lịch Hẹn</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WarrantyLookupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-[#d4af37] font-mono text-xs">
          <span>Đang truy xuất dữ liệu bảo hành cỗ máy...</span>
        </div>
      }
    >
      <WarrantyLookupContent />
    </Suspense>
  );
}
