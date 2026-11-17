"use client";

import React, { useState, useMemo } from "react";
import AccountNav from "@/components/AccountNav";
import { useAuth, UserAddress } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { watchAudio } from "@/utils/audio";
import {
  isValidVietnamPhone,
  normalizeVietnamPhone,
  getVietnamCarrierName,
} from "@/utils/phoneValidator";
import {
  getAllProvinces,
  getDistricts,
  getWards,
} from "@/data/vietnamAdministrativeData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faPlus,
  faPenToSquare,
  faTrashCan,
  faStar,
  faBuilding,
  faHouse,
  faXmark,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

export default function AccountAddressesPage() {
  const {
    user,
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAuth();
  const { showToast } = useCart();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Administrative selector states & GHN API integration
  const [ghnProvinces, setGhnProvinces] = useState<{ id: number; name: string }[]>([]);
  const [ghnDistricts, setGhnDistricts] = useState<{ id: number; name: string }[]>([]);
  const [ghnWards, setGhnWards] = useState<{ code: string; name: string }[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string>("TP. Hồ Chí Minh");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Quận 1");
  const [selectedWard, setSelectedWard] = useState<string>("Phường Bến Nghé");

  // 1. Tải danh sách Tỉnh/TP từ GHN API
  React.useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const { apiClient } = await import("@/lib/axios");
        const res = await apiClient.get("/shipments/ghn/provinces");
        if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          setGhnProvinces(res.data.data.map((p: any) => ({ id: p.ProvinceID, name: p.ProvinceName })));
        }
      } catch (err) {
        console.warn("GHN Province API fallback to local:", err);
      }
    };
    fetchProvinces();
  }, []);

  // 2. Tải danh sách Quận/Huyện từ GHN API khi thay đổi Tỉnh/TP
  React.useEffect(() => {
    const fetchDistricts = async () => {
      const matchedP = ghnProvinces.find(
        (p) => p.name.toLowerCase() === selectedProvince.toLowerCase()
      );
      if (matchedP) {
        try {
          const { apiClient } = await import("@/lib/axios");
          const res = await apiClient.get(`/shipments/ghn/districts?province_id=${matchedP.id}`);
          if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
            const dMapped = res.data.data.map((d: any) => ({ id: d.DistrictID, name: d.DistrictName }));
            setGhnDistricts(dMapped);
            if (dMapped.length > 0 && !dMapped.some((d: any) => d.name === selectedDistrict)) {
              setSelectedDistrict(dMapped[0].name);
            }
            return;
          }
        } catch (err) {
          console.warn("GHN District API fallback:", err);
        }
      }
      setGhnDistricts([]);
    };
    if (ghnProvinces.length > 0) {
      fetchDistricts();
    }
  }, [selectedProvince, ghnProvinces]);

  // 3. Tải danh sách Phường/Xã từ GHN API khi thay đổi Quận/Huyện
  React.useEffect(() => {
    const fetchWards = async () => {
      const matchedD = ghnDistricts.find(
        (d) => d.name.toLowerCase() === selectedDistrict.toLowerCase()
      );
      if (matchedD) {
        try {
          const { apiClient } = await import("@/lib/axios");
          const res = await apiClient.get(`/shipments/ghn/wards?district_id=${matchedD.id}`);
          if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
            const wMapped = res.data.data.map((w: any) => ({ code: String(w.WardCode), name: w.WardName }));
            setGhnWards(wMapped);
            if (wMapped.length > 0 && !wMapped.some((w: any) => w.name === selectedWard)) {
              setSelectedWard(wMapped[0].name);
            }
            return;
          }
        } catch (err) {
          console.warn("GHN Ward API fallback:", err);
        }
      }
      setGhnWards([]);
    };
    if (ghnDistricts.length > 0) {
      fetchWards();
    }
  }, [selectedDistrict, ghnDistricts]);

  const provinces = useMemo(() => {
    if (ghnProvinces.length > 0) return ghnProvinces.map((p) => p.name);
    return getAllProvinces();
  }, [ghnProvinces]);

  const districts = useMemo(() => {
    if (ghnDistricts.length > 0) return ghnDistricts.map((d) => d.name);
    return selectedProvince ? getDistricts(selectedProvince) : [];
  }, [ghnDistricts, selectedProvince]);

  const effectiveDistrict = selectedDistrict || (districts.length > 0 ? districts[0] : "");

  const wards = useMemo(() => {
    if (ghnWards.length > 0) return ghnWards.map((w) => w.name);
    return selectedProvince && effectiveDistrict ? getWards(selectedProvince, effectiveDistrict) : [];
  }, [ghnWards, selectedProvince, effectiveDistrict]);

  const effectiveWard = selectedWard || (wards.length > 0 ? wards[0] : "");

  const [streetDetail, setStreetDetail] = useState<string>("");

  const [formData, setFormData] = useState<{
    receiverName: string;
    phone: string;
    tag: string;
    isDefault: boolean;
  }>({
    receiverName: user?.name || "",
    phone: user?.phone || "",
    tag: "Dinh thự",
    isDefault: false,
  });

  const handleProvinceChange = (pName: string) => {
    setSelectedProvince(pName);
    const dList = getDistricts(pName);
    const firstD = dList.length > 0 ? dList[0] : "";
    setSelectedDistrict(firstD);
    if (firstD) {
      const wList = getWards(pName, firstD);
      setSelectedWard(wList.length > 0 ? wList[0] : "");
    } else {
      setSelectedWard("");
    }
  };

  const handleDistrictChange = (dName: string) => {
    setSelectedDistrict(dName);
    const wList = getWards(selectedProvince, dName);
    setSelectedWard(wList.length > 0 ? wList[0] : "");
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <AccountNav />
      </div>
    );
  }

  const handleOpenAddModal = () => {
    watchAudio.click();
    setEditingId(null);
    setFormData({
      receiverName: user.name,
      phone: user.phone,
      tag: "Dinh thự",
      isDefault: addresses.length === 0,
    });
    setSelectedProvince("TP. Hồ Chí Minh");
    const distList = getDistricts("TP. Hồ Chí Minh");
    const firstDist = distList.length > 0 ? distList[0] : "";
    setSelectedDistrict(firstDist);
    if (firstDist) {
      const wardList = getWards("TP. Hồ Chí Minh", firstDist);
      setSelectedWard(wardList.length > 0 ? wardList[0] : "");
    }
    setStreetDetail("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr: UserAddress) => {
    watchAudio.click();
    setEditingId(addr.id);
    setFormData({
      receiverName: addr.receiverName,
      phone: addr.phone,
      tag: addr.tag || "Dinh thự",
      isDefault: addr.isDefault,
    });

    // Parse province, district, ward
    const parts = (addr.address || "").split(",").map((s) => s.trim());
    if (parts.length >= 4) {
      const p = parts[parts.length - 1];
      const d = parts[parts.length - 2];
      const w = parts[parts.length - 3];
      const s = parts.slice(0, parts.length - 3).join(", ");

      setSelectedProvince(p);
      setSelectedDistrict(d);
      setSelectedWard(w);
      setStreetDetail(s);
    } else {
      setSelectedProvince(addr.city || "TP. Hồ Chí Minh");
      setStreetDetail(addr.address);
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    watchAudio.chime();

    if (!isValidVietnamPhone(formData.phone)) {
      showToast(
        "Số điện thoại không hợp lệ! Quý khách vui lòng nhập số điện thoại thật của Việt Nam (10 chữ số, ví dụ: 0987654321, 0912345678)."
      );
      return;
    }

    // Ghép địa chỉ chuẩn hóa
    const fullAddress = streetDetail && effectiveWard
      ? `${streetDetail.trim()}, ${effectiveWard}, ${effectiveDistrict}, ${selectedProvince}`
      : `${streetDetail.trim()}, ${selectedProvince}`;

    const payload = {
      receiverName: formData.receiverName.trim(),
      phone: normalizeVietnamPhone(formData.phone.trim()),
      address: fullAddress,
      city: selectedProvince,
      province: selectedProvince,
      district: effectiveDistrict,
      ward: effectiveWard,
      detailAddress: streetDetail.trim(),
      tag: formData.tag,
      isDefault: formData.isDefault,
    };

    if (editingId) {
      await updateAddress(editingId, payload);
      showToast("Cập nhật địa chỉ bảo mật thành công.");
    } else {
      await addAddress(payload);
      showToast("Đã thêm địa chỉ tiếp nhận bàn giao mới.");
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteAddress(id);
    showToast("Đã xóa địa chỉ khỏi sổ bàn giao.");
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultAddress(id);
    showToast("Đã đặt làm địa chỉ nhận bàn giao mặc định.");
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
      <AccountNav />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-foreground">
              Sổ Địa Chỉ Giao Nhận Bảo Mật
            </h3>
            <p className="text-xs text-muted-foreground font-light mt-0.5">
              Danh sách các dinh thự, tư gia và văn phòng VIP của Quý khách đã được bảo an xác thực.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8952b] hover:from-[#e5c66b] hover:to-[#997926] text-black font-semibold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#d4af37]/20 transition-all self-start sm:self-auto"
          >
            <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
            <span>Thêm Địa Chỉ Mới</span>
          </button>
        </div>

        {/* Addresses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`luxury-card rounded-3xl p-6 transition-all duration-300 relative flex flex-col justify-between ${
                addr.isDefault
                  ? "border-[#d4af37]/50 shadow-xl shadow-[#d4af37]/10"
                  : ""
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif text-base font-semibold text-foreground">
                      {addr.receiverName}
                    </span>
                    <span className="text-[10px] font-mono text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-0.5 rounded-full border border-[#d4af37]/30 flex items-center gap-1">
                      {addr.tag === "Dinh thự" ? (
                        <FontAwesomeIcon icon={faHouse} className="w-2.5 h-2.5" />
                      ) : (
                        <FontAwesomeIcon icon={faBuilding} className="w-2.5 h-2.5" />
                      )}
                      <span>{addr.tag}</span>
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <FontAwesomeIcon icon={faStar} className="w-2.5 h-2.5 text-[#d4af37]" />
                        <span>Mặc Định</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(addr)}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                      title="Chỉnh sửa địa chỉ"
                    >
                      <FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5" />
                    </button>
                    {addresses.length > 1 && (
                      <button
                        onClick={() => handleDelete(addr.id)}
                        className="p-2 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                        title="Xóa địa chỉ"
                      >
                        <FontAwesomeIcon icon={faTrashCan} className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-start gap-2 text-foreground/90 leading-relaxed font-sans font-light">
                    <FontAwesomeIcon icon={faLocationDot} className="w-3.5 h-3.5 text-[#d4af37] shrink-0 mt-0.5" />
                    <span>{addr.address}</span>
                  </p>
                  <p className="font-mono text-xs text-muted-foreground pl-5">
                    SĐT liên hệ: <strong className="text-foreground">{addr.phone}</strong>
                  </p>
                </div>
              </div>

              {/* Footer action */}
              <div className="mt-5 pt-4 border-t border-[#d4af37]/15 flex items-center justify-between text-xs font-mono">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[#d4af37] hover:underline cursor-pointer"
                  >
                    <span>Đặt làm địa chỉ chính</span>
                  </button>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1.5 text-[11px] font-semibold">
                    <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-emerald-400" />
                    <span>Ưu tiên vận chuyển bảo mật</span>
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Bảo hiểm 100%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Address Modal with Full Vietnam Administrative Cascading */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-lg w-full bg-[#08120d] rounded-3xl p-7 border border-[#d4af37]/35 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#006039]/30 text-emerald-400 border border-[#006039]/50 flex items-center justify-center">
                <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 text-[#d4af37]" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-normal text-white">
                  {editingId ? "Cập Nhật Địa Chỉ Bàn Giao" : "Thêm Địa Chỉ Tiếp Nhận Mới"}
                </h4>
                <p className="text-[11px] font-mono text-[#d4af37]">
                  Tích hợp dữ liệu hành chính 63 Tỉnh Thành Việt Nam
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-white/70">
                    Họ Tên Người Nhận VIP
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ví dụ: Alexander Vũ"
                    value={formData.receiverName}
                    onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono uppercase text-white/70">
                      Số Điện Thoại Trực Tiếp (10 số thật)
                    </label>
                    {formData.phone.trim() && (
                      isValidVietnamPhone(formData.phone) ? (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                          <FontAwesomeIcon icon={faCheck} className="text-[9px]" />
                          <span>{getVietnamCarrierName(formData.phone)}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                          Chưa đúng 10 số
                        </span>
                      )
                    )}
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={13}
                    placeholder="0908 889 999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border text-xs text-white focus:outline-none font-mono transition-colors ${
                      formData.phone.trim() && !isValidVietnamPhone(formData.phone)
                        ? "border-rose-500/50 focus:border-rose-500"
                        : formData.phone.trim() && isValidVietnamPhone(formData.phone)
                        ? "border-emerald-500/50 focus:border-emerald-500"
                        : "border-white/[0.1] focus:border-[#d4af37]"
                    }`}
                  />
                  {formData.phone.trim() && !isValidVietnamPhone(formData.phone) && (
                    <p className="text-[10px] text-rose-400/90 font-mono">
                      Phải là số di động Việt Nam 10 chữ số (đầu 03, 05, 07, 08, 09).
                    </p>
                  )}
                </div>
              </div>

              {/* Dữ liệu Hành Chính Việt Nam: Tỉnh/Thành -> Quận/Huyện -> Phường/Xã */}
              <div className="space-y-3 pt-1 border-t border-white/[0.08]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#d4af37] block font-semibold">
                  Địa Danh Hành Chính Bàn Giao (Chuẩn GHTK)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Tỉnh / Thành Phố */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase text-white/70">
                      Tỉnh / TP
                    </label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#09130e] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    >
                      {provinces.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quận / Huyện */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase text-white/70">
                      Quận / Huyện
                    </label>
                    <select
                      value={effectiveDistrict}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#09130e] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    >
                      {districts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phường / Xã */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase text-white/70">
                      Phường / Xã
                    </label>
                    <select
                      value={effectiveWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#09130e] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    >
                      {wards.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Số nhà, Tên đường cụ thể */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-white/70">
                    Địa Chỉ Cụ Thể (Số nhà, Tên đường, Biệt thự / Penthouse)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ví dụ: Penthouse Landmark 81, Masteri Thảo Điền..."
                    value={streetDetail}
                    onChange={(e) => setStreetDetail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Phân loại địa điểm */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-white/70">
                    Phân Loại Địa Điểm
                  </label>
                  <select
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#09130e] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="Dinh thự">Dinh thự</option>
                    <option value="Tư gia">Tư gia</option>
                    <option value="Văn phòng VIP">Văn phòng VIP</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-xs font-mono text-white/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="rounded bg-white/10 border-white/20 text-[#d4af37] focus:ring-0"
                    />
                    <span>Đặt làm mặc định</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/[0.1] text-xs font-mono cursor-pointer hover:bg-white/[0.05]"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-black text-xs font-semibold font-mono uppercase tracking-wider cursor-pointer shadow-lg"
                >
                  {editingId ? "Lưu Cập Nhật" : "Xác Nhận Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
