"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AccountNav from "@/components/AccountNav";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { apiClient } from "@/lib/axios";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWrench,
  faClock,
  faCircleCheck,
  faCircleXmark,
  faSpinner,
  faRotateRight,
  faCalendarCheck,
  faCertificate,
  faMagnifyingGlass,
  faShieldHalved,
  faLocationDot,
  faArrowRight,
  faPhone,
  faUser,
  faCheck,
  faXmark,
  faAward,
} from "@fortawesome/free-solid-svg-icons";

interface RepairTicketItem {
  id: number;
  serialNumberId: number | null;
  customerId: number | null;
  staffId: number | null;
  serviceId: number;
  issueDescription: string;
  cost: number | string;
  status: "received" | "inspecting" | "in_progress" | "completed" | "delivered" | "cancelled";
  receivedDate: string;
  appointmentDate: string | null;
  note: string | null;
  service?: {
    id: number;
    name: string;
    serviceType: string;
    basePrice: number | string;
    estimatedDays: number;
  };
  serialNumber?: {
    id: number;
    serialNumber: string;
    status: string;
  };
  customer?: {
    id: number;
    name: string;
    phone: string;
    email: string;
  };
}

export default function AccountServicesPage() {
  const { user } = useAuth();
  const { formatPrice, showToast } = useCart();

  const [tickets, setTickets] = useState<RepairTicketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Cancel modal state
  const [cancellingTicketId, setCancellingTicketId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState<string>("Đã thu xếp được thời gian khác");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);

  // Tải danh sách lịch hẹn bảo dưỡng / sửa chữa từ MySQL
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/services/repairs/tickets");
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setTickets(res.data.data);
      }
    } catch (err) {
      console.warn("Chưa thể tải danh sách phiếu dịch vụ từ máy chủ:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user, fetchTickets]);

  const handleConfirmCancelTicket = async () => {
    if (!cancellingTicketId) return;
    try {
      setIsSubmittingCancel(true);
      watchAudio.chime();
      const res = await apiClient.put(`/services/repairs/tickets/${cancellingTicketId}/cancel`, {
        reason: cancelReason,
      });
      if (res.data?.success) {
        showToast("Đã hủy lịch hẹn dịch vụ thành công.");
        setCancellingTicketId(null);
        setCancelReason("Đã thu xếp được thời gian khác");
        fetchTickets();
      } else {
        showToast(res.data?.message || "Không thể hủy lịch hẹn lúc này.");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Không thể hủy lịch hẹn.");
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const getStatusBadge = (status: RepairTicketItem["status"]) => {
    switch (status) {
      case "completed":
        return {
          label: "Đã Hoàn Tất Phục Chế",
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
          icon: faCircleCheck,
        };
      case "delivered":
        return {
          label: "Đã Bàn Giao Cỗ Máy",
          color: "text-teal-400 bg-teal-500/10 border-teal-500/30",
          icon: faAward,
        };
      case "in_progress":
        return {
          label: "Đang Chế Tác Vi Cơ Học",
          color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
          icon: faWrench,
        };
      case "inspecting":
        return {
          label: "Đang Thẩm Định Sai Số",
          color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
          icon: faClock,
        };
      case "cancelled":
        return {
          label: "Đã Hủy Lịch Hẹn",
          color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
          icon: faCircleXmark,
        };
      case "received":
      default:
        return {
          label: "Chờ Tiếp Nhận Cỗ Máy",
          color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
          icon: faCalendarCheck,
        };
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== "all") {
      if (statusFilter === "received" && t.status !== "received") return false;
      if (statusFilter === "in_progress" && t.status !== "in_progress" && t.status !== "inspecting") return false;
      if (statusFilter === "completed" && t.status !== "completed" && t.status !== "delivered") return false;
      if (statusFilter === "cancelled" && t.status !== "cancelled") return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const idMatch = String(t.id).includes(q) || `tk-${t.id}`.includes(q);
      const serviceMatch = t.service?.name?.toLowerCase().includes(q);
      const serialMatch = t.serialNumber?.serialNumber?.toLowerCase().includes(q);
      const descMatch = t.issueDescription?.toLowerCase().includes(q) || t.note?.toLowerCase().includes(q);
      if (!idMatch && !serviceMatch && !serialMatch && !descMatch) return false;
    }
    return true;
  });

  if (!user) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <AccountNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050b07] text-white pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto selection:bg-[#006039] selection:text-white">
      <AccountNav />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#d4af37]/15">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37] font-semibold block mb-1">
              SỔ THEO DÕI DỊCH VỤ & BẢO DƯỠNG
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-light text-stone-100">
              Lịch Hẹn Phục Chế & Spa Cỗ Máy
            </h3>
            <p className="text-xs text-stone-400 font-light mt-0.5">
              Quy trình bảo dưỡng tiêu chuẩn Atelier Thụy Sĩ, phòng sạch ISO và linh kiện chính hãng.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/services"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38f28] hover:from-[#e5c158] hover:to-[#c49e35] text-black text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-[#d4af37]/20"
            >
              <FontAwesomeIcon icon={faWrench} className="text-xs" />
              <span>Đặt Lịch Hẹn Mới</span>
            </Link>

            <button
              onClick={() => {
                watchAudio.tick();
                fetchTickets();
              }}
              className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-stone-300 flex items-center gap-2 cursor-pointer transition-colors"
              title="Đồng bộ danh sách"
            >
              <FontAwesomeIcon icon={faRotateRight} className="text-[10px]" />
              <span>Đồng Bộ</span>
            </button>

            <span className="text-xs font-mono text-[#d4af37] bg-[#d4af37]/10 px-3.5 py-1.5 rounded-full border border-[#d4af37]/25 font-semibold">
              {tickets.length} Phiếu
            </span>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
            {[
              { id: "all", label: "Tất Cả" },
              { id: "received", label: "Chờ Tiếp Nhận" },
              { id: "in_progress", label: "Đang Chế Tác / Kiểm Định" },
              { id: "completed", label: "Đã Hoàn Tất" },
              { id: "cancelled", label: "Đã Hủy" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  watchAudio.tick();
                  setStatusFilter(tab.id);
                }}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${statusFilter === tab.id
                    ? "bg-[#d4af37] text-black font-bold shadow-md"
                    : "bg-white/[0.03] text-stone-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 text-xs"
            />
            <input
              type="text"
              placeholder="Tìm theo mã phiếu, serial máy, dịch vụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#d4af37] text-xs font-mono text-stone-200 placeholder:text-stone-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
            <FontAwesomeIcon icon={faSpinner} className="fa-spin text-3xl text-[#d4af37]" />
            <span className="text-xs font-mono text-stone-400">
              Đang đồng bộ hồ sơ lịch hẹn bảo dưỡng...
            </span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-24 text-center rounded-3xl bg-[#08120d]/80 border border-[#d4af37]/20 p-8 flex flex-col items-center shadow-xl backdrop-blur-xl">
            <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] mb-4">
              <FontAwesomeIcon icon={faWrench} className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg font-normal text-stone-100">
              Chưa có lịch hẹn bảo dưỡng nào
            </h4>
            <p className="text-xs text-stone-400 max-w-sm mt-1.5 font-light">
              Quý khách có thể đặt lịch hẹn định kỳ để các Master Watchmaker kiểm tra áp suất kháng nước, lau dầu và cân chỉnh Chronometer cho cỗ máy.
            </p>
            <Link
              href="/services"
              className="mt-6 px-7 py-3 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8952b] hover:from-[#e5c66b] hover:to-[#997926] text-black font-semibold text-xs font-mono uppercase tracking-wider transition-all shadow-lg shadow-[#d4af37]/20"
            >
              Xem Bảng Giá & Đặt Lịch Hẹn
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTickets.map((ticket) => {
              const statusInfo = getStatusBadge(ticket.status);
              const serial =
                ticket.serialNumber?.serialNumber ||
                ticket.note?.match(/Serial:\s*([^\s•,\]]+)/i)?.[1] ||
                ticket.issueDescription?.match(/Serial:\s*([^\s•,\]]+)/i)?.[1] ||
                null;
              const costNum = Number(ticket.cost || 0);

              return (
                <div
                  key={ticket.id}
                  className="rounded-3xl bg-[#08120d]/90 border border-[#d4af37]/20 hover:border-[#d4af37]/50 transition-all duration-300 shadow-xl overflow-hidden backdrop-blur-xl group"
                >
                  {/* Card Header Bar */}
                  <div className="p-5 sm:p-6 bg-black/40 border-b border-[#d4af37]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm font-bold text-[#d4af37] tracking-wider">
                          #TK-{ticket.id}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-3 py-1 rounded-full border uppercase tracking-wider font-semibold flex items-center gap-1.5 ${statusInfo.color}`}
                        >
                          <FontAwesomeIcon icon={statusInfo.icon} className="w-2.5 h-2.5" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </div>
                      <div className="text-xs font-mono text-stone-400 mt-1 flex items-center gap-2">
                        <span>Ngày tiếp nhận: {ticket.receivedDate ? new Date(ticket.receivedDate).toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }) : "Vừa xong"}</span>
                        <span>•</span>
                        <span className="text-stone-300">Gói: {ticket.service?.name || "Bảo Dưỡng Cỗ Máy"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:text-right">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block">
                          Chi Phí Dự Kiến
                        </span>
                        <span className="font-serif text-lg sm:text-xl font-normal text-[#d4af37]">
                          {costNum === 0 ? "Miễn Phí Theo Bảo Hành" : formatPrice(Math.round(costNum / 25000), costNum)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {ticket.status === "received" && (
                          <button
                            onClick={() => {
                              watchAudio.click();
                              setCancellingTicketId(ticket.id);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-mono text-rose-300 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                            title="Hủy lịch hẹn này"
                          >
                            <FontAwesomeIcon icon={faCircleXmark} className="text-xs" />
                            <span>Hủy Lịch Hẹn</span>
                          </button>
                        )}

                        {serial && (
                          <Link
                            href={`/warranty?serial=${encodeURIComponent(serial)}`}
                            className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-stone-300 hover:text-white flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            <FontAwesomeIcon icon={faShieldHalved} className="text-[#d4af37] text-xs" />
                            <span>Tra Cứu Bảo Hành</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Col 1: Service details */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs font-mono">
                      <span className="text-[10px] text-[#d4af37] uppercase tracking-wider block font-semibold">
                        GÓI DỊCH VỤ THỰC HIỆN
                      </span>
                      <h5 className="font-serif text-sm font-normal text-stone-100">
                        {ticket.service?.name || "Bảo Dưỡng Toàn Diện"}
                      </h5>
                      <div className="text-stone-400 space-y-1 text-[11px]">
                        <div>Thời gian dự kiến: <strong className="text-stone-200">{ticket.service?.estimatedDays || 1} ngày làm việc</strong></div>
                        <div>Tiêu chuẩn: <strong className="text-emerald-400">Atelier Genève Standard</strong></div>
                      </div>
                    </div>

                    {/* Col 2: Watch info & Appointment date */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs font-mono">
                      <span className="text-[10px] text-[#d4af37] uppercase tracking-wider block font-semibold">
                        CỖ MÁY & NGÀY TIẾP NHẬN
                      </span>
                      <div>
                        {serial ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/25 text-[11px] font-mono text-[#d4af37]">
                            <FontAwesomeIcon icon={faCertificate} className="text-xs" />
                            <span>Serial: <strong>{serial}</strong></span>
                          </div>
                        ) : (
                          <div className="text-stone-300">Cỗ máy khách hàng bàn giao</div>
                        )}
                      </div>
                      <div className="text-stone-400 text-[11px]">
                        Hẹn tiếp nhận / trả máy:{" "}
                        <strong className="text-stone-200">
                          {ticket.appointmentDate
                            ? new Date(ticket.appointmentDate).toLocaleDateString("vi-VN", {
                              weekday: "long",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                            : "Theo thỏa thuận với chuyên viên"}
                        </strong>
                      </div>
                      {/* Hiển thị địa chỉ tiếp nhận nếu là tận nơi hoặc tại salon */}
                      {ticket.note?.includes("Tiếp nhận tận nơi:") ? (
                        <div className="flex items-start gap-1.5 text-emerald-400 text-[11px] font-mono pt-1.5 border-t border-white/[0.06]">
                          <FontAwesomeIcon icon={faLocationDot} className="text-xs mt-0.5 shrink-0" />
                          <span>{ticket.note.match(/Tiếp nhận tận nơi:\s*([^•]+)/)?.[0]}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-mono pt-1.5 border-t border-white/[0.06]">
                          <FontAwesomeIcon icon={faLocationDot} className="text-xs text-[#d4af37]" />
                          <span>Tiếp nhận: Flagship Boutique Salon (1 Lê Duẩn, Q.1)</span>
                        </div>
                      )}
                    </div>

                    {/* Col 3: Customer notes / issues */}
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs font-mono">
                      <span className="text-[10px] text-[#d4af37] uppercase tracking-wider block font-semibold">
                        YÊU CẦU & GHI CHÚ KỸ THUẬT
                      </span>
                      <p className="text-stone-300 text-[11px] font-sans leading-relaxed line-clamp-2">
                        {ticket.issueDescription || "Bảo dưỡng định kỳ theo tiêu chuẩn xuất xưởng."}
                      </p>
                      {ticket.note && (
                        <div className="text-[10px] text-stone-500 font-mono truncate">
                          {ticket.note}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer notice */}
                  <div className="px-6 py-3 bg-black/30 border-t border-[#d4af37]/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-stone-400 gap-2">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-400 text-xs" />
                      <span>Cam kết bảo hành vi cơ học 12 tháng sau khi bảo dưỡng hoàn tất.</span>
                    </div>
                    <div className="text-[11px] text-[#d4af37]">
                      Hotline Tiếp Nhận Khẩn Cấp: 1900 88 99 22
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Xác Nhận Hủy Lịch Hẹn */}
      {cancellingTicketId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0c1811] border border-rose-500/30 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center text-lg">
                <FontAwesomeIcon icon={faCircleXmark} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-normal text-stone-100">
                  Xác Nhận Hủy Lịch Hẹn
                </h3>
                <p className="text-xs text-stone-400 font-mono">
                  Phiếu dịch vụ #TK-{cancellingTicketId}
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-300 font-light leading-relaxed">
              Quý khách có chắc chắn muốn hủy lịch hẹn dịch vụ này không? Chuyên viên tiếp nhận sẽ cập nhật trạng thái phiếu.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-stone-400 block">
                Lý Do Hủy Lịch Hẹn
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/[0.1] text-xs text-stone-200 focus:outline-none focus:border-[#d4af37] font-mono cursor-pointer"
              >
                <option value="Đã thu xếp được thời gian khác">Đã thu xếp được thời gian khác</option>
                <option value="Chưa mang cỗ máy đến được Salon">Chưa mang cỗ máy đến được Salon</option>
                <option value="Muốn đổi sang gói dịch vụ khác">Muốn đổi sang gói dịch vụ khác</option>
                <option value="Lý do khác">Lý do khác</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={() => setCancellingTicketId(null)}
                className="py-2.5 rounded-xl border border-white/[0.1] hover:border-white/[0.2] text-xs font-mono text-stone-300 transition-colors cursor-pointer"
              >
                Giữ Lại Lịch
              </button>

              <button
                type="button"
                disabled={isSubmittingCancel}
                onClick={handleConfirmCancelTicket}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-900/30 disabled:opacity-50"
              >
                {isSubmittingCancel ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />
                    <span>Đang Hủy...</span>
                  </>
                ) : (
                  <span>Xác Nhận Hủy</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

