"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/axios";
import { watchAudio } from "@/utils/audio";
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

  const [inputCode, setInputCode] = useState(initialSerial);
  const [searchedData, setSearchedData] = useState<WarrantyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

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
          Tra cứu dữ liệu xuất xưởng, trạng thái bảo hành điện tử và nguồn gốc cỗ máy trực tiếp từ hệ thống bảo mật BRU_WATCH.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-2xl mx-auto mb-12">
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
        <div className="max-w-2xl mx-auto mb-10 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center animate-fadeIn">
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
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
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
                  <span className="text-[10px] text-white/50 uppercase block">Thời Hạn Bảo Hành</span>
                  <strong className="text-emerald-400 mt-0.5 block">
                    Đến {searchedData.expiryDate}
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
                <span>Mã xác thực chữ ký điện tử: SHA-256 Validated</span>
              </span>

              <Link
                href="/services"
                className="px-5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-[#d4af37] hover:text-black text-white text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <FontAwesomeIcon icon={faWrench} className="w-3.5 h-3.5" />
                <span>Đặt Lịch Dịch Vụ Sửa Chữa</span>
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
