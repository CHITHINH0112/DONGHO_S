"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { WATCHES } from "@/data/watches";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faMagnifyingGlass,
  faCertificate,
  faCircleCheck,
  faClock,
  faTruck,
  faWrench,
  faAward,
  faQrcode,
  faCrown,
  faLocationDot,
  faArrowRight,
  faCalendarCheck,
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
  status: "active" | "expired";
  boutique: string;
  calibre: string;
  waterResistance: string;
  serviceHistory: {
    date: string;
    action: string;
    watchmaker: string;
  }[];
}

const SAMPLE_WARRANTIES: Record<string, WarrantyData> = {
  "RLX-CHRONO-99428-CH": {
    cardCode: "MDM-WAR-2026-9942",
    serialNumber: "RLX-CHRONO-99428-CH",
    watchName: "Cosmograph Daytona 126500LN",
    brand: "Rolex",
    image: WATCHES[0].image,
    customerName: "Quý Khách Alexander Vũ",
    purchaseDate: "15/01/2026",
    expiryDate: "15/01/2031",
    status: "active",
    boutique: "BRU_WATCH - Đồng Khởi Salon, TP.HCM",
    calibre: "Calibre 4131 In-house Superlative Chronometer",
    waterResistance: "100m / 330 feet (Triplock)",
    serviceHistory: [
      {
        date: "15/01/2026",
        action: "Kích hoạt bảo hành điện tử xuất xưởng từ Geneva & niêm phong chì",
        watchmaker: "Trưởng phòng Kỹ thuật Jean-Paul Morel (Geneva)",
      },
      {
        date: "10/06/2026",
        action: "Kiểm tra sai số Chronometer đạt chuẩn (+0.8s/ngày) & test buồng áp suất 10 bar",
        watchmaker: "Master Watchmaker Thụy Sĩ tại Boutique Salon",
      },
    ],
  },
  "AP-RO-2026-78119-GEN": {
    cardCode: "MDM-WAR-2026-7811",
    serialNumber: "AP-RO-2026-78119-GEN",
    watchName: "Royal Oak Jumbo Extra-Thin 16202ST",
    brand: "Audemars Piguet",
    image: WATCHES[1].image,
    customerName: "Quý Khách Alexander Vũ",
    purchaseDate: "20/02/2026",
    expiryDate: "20/02/2031",
    status: "active",
    boutique: "BRU_WATCH - Tràng Tiền Boutique, Hà Nội",
    calibre: "Calibre 7121 In-house Self-winding (28,800 vph)",
    waterResistance: "50m / 165 feet",
    serviceHistory: [
      {
        date: "20/02/2026",
        action: "Bàn giao xe bọc thép có vệ sĩ vũ trang hộ tống tại Masteri Thảo Điền",
        watchmaker: "Đội ngũ Concierge & Giám Đốc Salon",
      },
    ],
  },
  "PP-NAUT-5711-GOLD": {
    cardCode: "MDM-WAR-2026-5711",
    serialNumber: "PP-NAUT-5711-GOLD",
    watchName: "Nautilus 5711/1R Rose Gold",
    brand: "Patek Philippe",
    image: WATCHES[2].image,
    customerName: "Nữ Công Tước Sophia Lê",
    purchaseDate: "10/03/2025",
    expiryDate: "10/03/2030",
    status: "active",
    boutique: "BRU_WATCH - Private Salon",
    calibre: "Calibre 26-330 S C Patek Philippe Seal",
    waterResistance: "120m / 400 feet",
    serviceHistory: [
      {
        date: "10/03/2025",
        action: "Xuất xưởng kèm Giấy chứng nhận xuất xứ Patek Philippe Archives Certificate",
        watchmaker: "Patek Philippe Master Watchmaker",
      },
    ],
  },
};

function WarrantyLookupContent() {
  const searchParams = useSearchParams();
  const initialSerial = searchParams.get("serial") || "";

  const [inputCode, setInputCode] = useState(initialSerial);
  const [searchedData, setSearchedData] = useState<WarrantyData | null>(
    initialSerial && SAMPLE_WARRANTIES[initialSerial]
      ? SAMPLE_WARRANTIES[initialSerial]
      : SAMPLE_WARRANTIES["RLX-CHRONO-99428-CH"]
  );
  const [notFoundMessage, setNotFoundMessage] = useState(false);

  useEffect(() => {
    if (initialSerial) {
      setInputCode(initialSerial);
      handleSearch(initialSerial);
    }
  }, [initialSerial]);

  const handleSearch = (codeToSearch?: string) => {
    watchAudio.ratchet();
    const target = (codeToSearch || inputCode).trim().toUpperCase();

    if (!target) {
      setSearchedData(null);
      setNotFoundMessage(false);
      return;
    }

    // Direct match by serial or card code
    const found = Object.values(SAMPLE_WARRANTIES).find(
      (w) =>
        w.serialNumber.toUpperCase() === target ||
        w.cardCode.toUpperCase() === target ||
        target.includes(w.brand.toUpperCase()) ||
        w.serialNumber.toUpperCase().includes(target)
    );

    if (found) {
      setSearchedData(found);
      setNotFoundMessage(false);
    } else {
      // Dynamic fallback for any valid user-typed serial
      setSearchedData({
        cardCode: `MDM-WAR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        serialNumber: target,
        watchName: "BRU_WATCH Timepiece Special Commission",
        brand: "Swiss Manufacture",
        image: WATCHES[0].image,
        customerName: "Quý Khách Hội Viên VIP",
        purchaseDate: "01/01/2026",
        expiryDate: "01/01/2031",
        status: "active",
        boutique: "BRU_WATCH Flagship Salon",
        calibre: "Manufacture Mechanical Calibre COSC Certified",
        waterResistance: "100m / 10 bar",
        serviceHistory: [
          {
            date: "01/01/2026",
            action: "Kích hoạt bảo hành điện tử chính hãng toàn cầu 5 năm",
            watchmaker: "Trưởng phòng Kỹ thuật Thụy Sĩ",
          },
        ],
      });
      setNotFoundMessage(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-5xl mx-auto">
      {/* Title & Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
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
          Tra cứu dữ liệu xuất xưởng, nguồn gốc cỗ máy và lịch sử dịch vụ bảo dưỡng trực tiếp từ cơ sở dữ liệu bảo mật BRU_WATCH.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-2xl mx-auto mb-10">
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
            placeholder="Nhập số Serial cỗ máy hoặc mã thẻ bảo hành (ví dụ: RLX-CHRONO-99428-CH)..."
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="w-full py-4 pl-4 pr-32 bg-transparent text-foreground placeholder:text-muted-foreground text-xs sm:text-sm font-mono focus:outline-none uppercase"
          />
          <button
            type="submit"
            className="absolute right-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38f28] text-black font-semibold text-xs font-mono uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
          >
            Tra Cứu
          </button>
        </form>

        {/* Quick sample serial chips */}
        <div className="flex items-center gap-2 mt-3 flex-wrap justify-center text-[11px] font-mono">
          <span className="text-muted-foreground">Thử mẫu Serial:</span>
          {Object.keys(SAMPLE_WARRANTIES).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setInputCode(code);
                handleSearch(code);
              }}
              className="px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-[#d4af37]/15 border border-border hover:border-[#d4af37]/40 text-[#d4af37] cursor-pointer transition-colors"
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Warranty Card Presentation */}
      {searchedData && (
        <div className="space-y-8 animate-fadeIn">
          {/* Digital Luxury Guarantee Card */}
          <div className="rounded-3xl bg-gradient-to-br from-[#0a1811] via-[#08120c] to-[#040806] border border-[#d4af37]/50 p-7 sm:p-9 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            {/* Header info */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.08] gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#8c6a21] text-black flex items-center justify-center font-bold text-lg font-serif shadow-lg shadow-[#d4af37]/20">
                  <FontAwesomeIcon icon={faShieldHalved} className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#d4af37]">
                    CHỨNG THỰC BẢO HÀNH CHÍNH HÃNG THỤY SĨ
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-normal text-white">
                    {searchedData.brand} International Guarantee
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/40 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCircleCheck} className="w-3.5 h-3.5" />
                  <span>Bảo Hành Hiệu Lực</span>
                </span>
              </div>
            </div>

            {/* Watch Details & Guarantee Specs */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 py-8 items-center border-b border-white/[0.08]">
              {/* Thumbnail (4 cols) */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="relative w-48 h-48 rounded-2xl bg-black/40 border border-white/[0.08] overflow-hidden p-3 shadow-inner">
                  <Image
                    src={searchedData.image}
                    alt={searchedData.watchName}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="mt-3 text-center">
                  <span className="text-[10px] font-mono uppercase text-[#d4af37]">
                    {searchedData.brand}
                  </span>
                  <h4 className="font-serif text-sm font-medium text-white">
                    {searchedData.watchName}
                  </h4>
                </div>
              </div>

              {/* Specs Grid (8 cols) */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] text-white/50 uppercase block">Số Serial Máy Độc Bản</span>
                  <strong className="text-[#d4af37] text-sm tracking-wider mt-0.5 block">
                    {searchedData.serialNumber}
                  </strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] text-white/50 uppercase block">Mã Thẻ Điện Tử</span>
                  <strong className="text-white text-sm tracking-wider mt-0.5 block">
                    {searchedData.cardCode}
                  </strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] text-white/50 uppercase block">Chủ Sở Hữu Đăng Ký</span>
                  <strong className="text-white text-sm font-serif mt-0.5 block">
                    {searchedData.customerName}
                  </strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] text-white/50 uppercase block">Boutique Bàn Giao</span>
                  <strong className="text-white/90 text-xs mt-0.5 block truncate">
                    {searchedData.boutique}
                  </strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] text-white/50 uppercase block">Ngày Kích Hoạt</span>
                  <strong className="text-white mt-0.5 block">
                    {searchedData.purchaseDate}
                  </strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] text-white/50 uppercase block">Thời Hạn Bảo Hành Quốc Tế</span>
                  <strong className="text-emerald-400 mt-0.5 block">
                    Đến {searchedData.expiryDate} (5 Năm Toàn Cầu)
                  </strong>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] sm:col-span-2">
                  <span className="text-[10px] text-white/50 uppercase block">Bộ Máy & Kháng Nước</span>
                  <div className="text-white/80 mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span>{searchedData.calibre}</span>
                    <span className="text-[#d4af37] font-semibold">{searchedData.waterResistance}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service & Verification History Timeline */}
            <div className="relative z-10 pt-6">
              <h4 className="font-serif text-base font-normal text-white mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faAward} className="w-4 h-4 text-[#d4af37]" />
                <span>Nhật Ký Thẩm Định & Bảo Dưỡng Thụy Sĩ</span>
              </h4>

              <div className="space-y-3">
                {searchedData.serviceHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start justify-between gap-4 text-xs font-mono"
                  >
                    <div>
                      <div className="text-[#d4af37] text-[11px] font-semibold">{item.date}</div>
                      <div className="text-white mt-0.5 font-light leading-relaxed">{item.action}</div>
                      <div className="text-white/40 text-[10px] mt-1">Chứng nhận bởi: {item.watchmaker}</div>
                    </div>
                    <FontAwesomeIcon icon={faCertificate} className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Card Action footer */}
            <div className="relative z-10 pt-6 mt-6 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <span className="text-white/50 flex items-center gap-2">
                <FontAwesomeIcon icon={faQrcode} className="w-4 h-4 text-[#d4af37]" />
                <span>Mã xác thực chữ ký điện tử mật mã Geneva: SHA-256 Valid</span>
              </span>

              <Link
                href="/services"
                className="px-5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-[#d4af37] hover:text-black text-white text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <FontAwesomeIcon icon={faWrench} className="w-3.5 h-3.5" />
                <span>Đặt Lịch Bảo Dưỡng Định Kỳ</span>
              </Link>
            </div>
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
