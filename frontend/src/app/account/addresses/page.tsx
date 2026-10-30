"use client";

import React, { useState } from "react";
import AccountNav from "@/components/AccountNav";
import { useAuth, UserAddress } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faPlus,
  faPenToSquare,
  faTrashCan,
  faStar,
  faShieldHalved,
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

  const [formData, setFormData] = useState<Omit<UserAddress, "id">>({
    receiverName: user?.name || "",
    phone: user?.phone || "",
    address: "",
    city: "TP. Hồ Chí Minh",
    tag: "Dinh thự",
    isDefault: false,
  });

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
      address: "",
      city: "TP. Hồ Chí Minh",
      tag: "Dinh thự",
      isDefault: addresses.length === 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr: UserAddress) => {
    watchAudio.click();
    setEditingId(addr.id);
    setFormData({
      receiverName: addr.receiverName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      tag: addr.tag,
      isDefault: addr.isDefault,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    watchAudio.chime();
    if (editingId) {
      await updateAddress(editingId, formData);
      showToast("Cập nhật địa chỉ bảo mật thành công.");
    } else {
      await addAddress(formData);
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
    showToast("Đã đặt làm địa chỉ bàn giao chính thức.");
  };

  const getTagIcon = (tag: string) => {
    if (tag === "Văn phòng VIP") return faBuilding;
    return faHouse;
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
      <AccountNav />

      <div className="space-y-6">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-foreground">
              Sổ Địa Chỉ Bàn Giao Bảo Mật
            </h3>
            <p className="text-xs text-muted-foreground font-light mt-0.5">
              Địa điểm điều phối xe bọc thép chuyên dụng và lực lượng an ninh tháp tùng.
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8952b] hover:from-[#e5c66b] hover:to-[#997926] text-black font-semibold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 cursor-pointer self-start sm:self-auto transition-all"
          >
            <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
            <span>Thêm Địa Chỉ Mới</span>
          </button>
        </div>

        {/* Address Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-6 rounded-3xl luxury-card transition-all duration-300 relative flex flex-col justify-between group ${
                addr.isDefault
                  ? "border-[#d4af37]/60 shadow-xl shadow-[#d4af37]/10"
                  : "hover:border-[#d4af37]/50"
              }`}
            >
              <div>
                {/* Card Top: Tag & Default Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-xl luxury-card-inset text-foreground flex items-center gap-1.5 shadow-xs">
                      <FontAwesomeIcon icon={getTagIcon(addr.tag)} className="w-2.5 h-2.5 text-[#d4af37]" />
                      <span>{addr.tag}</span>
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold shadow-xs">
                        <FontAwesomeIcon icon={faShieldHalved} className="w-2.5 h-2.5 text-[#d4af37]" />
                        <span>Mặc Định An Ninh</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(addr)}
                      className="w-8 h-8 rounded-xl bg-black/5 dark:bg-black/30 border border-[#d4af37]/20 hover:border-[#d4af37] text-muted-foreground hover:text-[#d4af37] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                      title="Chỉnh sửa địa chỉ"
                    >
                      <FontAwesomeIcon icon={faPenToSquare} className="w-3.5 h-3.5" />
                    </button>
                    {addresses.length > 1 && (
                      <button
                        onClick={() => handleDelete(addr.id)}
                        className="w-8 h-8 rounded-xl bg-black/5 dark:bg-black/30 border border-border hover:border-rose-500/40 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                        title="Xóa địa chỉ"
                      >
                        <FontAwesomeIcon icon={faTrashCan} className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Receiver Info */}
                <h4 className="font-serif text-base font-medium text-foreground">
                  {addr.receiverName}
                </h4>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">
                  {addr.phone}
                </p>

                {/* Address text box */}
                <div className="p-3.5 rounded-2xl luxury-card-inset mt-3 text-xs leading-relaxed font-light text-foreground/90">
                  {addr.address}, {addr.city}
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="pt-4 mt-4 border-t border-[#d4af37]/15 flex items-center justify-between text-xs font-mono">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[#d4af37] hover:underline cursor-pointer flex items-center gap-1 font-semibold"
                  >
                    <span>Đặt làm địa chỉ chính</span>
                  </button>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1.5 text-[11px] font-semibold">
                    <FontAwesomeIcon icon={faCheck} className="w-3 h-3 text-emerald-400" />
                    <span>Ưu tiên điều phối an ninh Brinks</span>
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Bảo mật 100%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full bg-[#09130e] rounded-3xl p-7 border border-[#d4af37]/30 text-white shadow-2xl relative">
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
                  {editingId ? "Cập Nhật Địa Chỉ Bàn Giao" : "Thêm Địa Chỉ Bàn Giao Mới"}
                </h4>
                <p className="text-[11px] font-mono text-white/50">
                  Địa điểm tiếp nhận đồng hồ bằng xe bọc thép
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-white/70">
                  Họ Tên Người Nhận VIP
                </label>
                <input
                  type="text"
                  required
                  value={formData.receiverName}
                  onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-white/70">
                  Số Điện Thoại Trực Tiếp
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-[#d4af37] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-white/70">
                    Phân Loại Địa Điểm
                  </label>
                  <select
                    value={formData.tag}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tag: e.target.value as UserAddress["tag"],
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="Dinh thự" className="bg-[#09130e]">Dinh thự</option>
                    <option value="Tư gia" className="bg-[#09130e]">Tư gia</option>
                    <option value="Văn phòng VIP" className="bg-[#09130e]">Văn phòng VIP</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-white/70">
                    Tỉnh / Thành Phố
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="TP. Hồ Chí Minh" className="bg-[#09130e]">TP. Hồ Chí Minh</option>
                    <option value="Hà Nội" className="bg-[#09130e]">Hà Nội</option>
                    <option value="Đà Nẵng" className="bg-[#09130e]">Đà Nẵng</option>
                    <option value="Hải Phòng" className="bg-[#09130e]">Hải Phòng</option>
                    <option value="Cần Thơ" className="bg-[#09130e]">Cần Thơ</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-white/70">
                  Địa Chỉ Cụ Thể (Số nhà, Tên đường, Tòa nhà/Penthouse)
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="ví dụ: Penthouse P02, Masteri Thảo Điền, P. Thảo Điền..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-mono text-white/70 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded bg-white/10 border-white/20 text-[#d4af37] focus:ring-0"
                />
                <span>Đặt làm địa chỉ nhận bàn giao mặc định</span>
              </label>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/[0.1] text-xs font-mono cursor-pointer"
                >
                  Hủy
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
