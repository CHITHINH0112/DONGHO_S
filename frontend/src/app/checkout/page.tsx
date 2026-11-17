"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth, UserAddress } from "@/context/AuthContext";
import { apiClient } from "@/lib/axios";
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
  faShieldHalved,
  faTruck,
  faBuildingColumns,
  faQrcode,
  faMoneyBillWave,
  faLock,
  faArrowRight,
  faLocationDot,
  faCheck,
  faBagShopping,
  faPhone,
  faUser,
  faPlus,
  faSpinner,
  faCircleCheck,
  faCreditCard,
  faBuilding,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    formatPrice,
    subtotalVND,
    subtotalUSD,
    discountRate,
    clearCart,
    showToast,
  } = useCart();
  const { user, isAuthenticated, addresses, addAddress, openAuthModal } = useAuth();

  // Delivery method: Armored GHTK express vs Salon VIP experience
  const [deliveryMethod, setDeliveryMethod] = useState<"armored" | "salon">("armored");

  // Payment method: bank_transfer_qr | armored_cod | vnpay (BỎ CREDIT CARD THEO YÊU CẦU)
  const [paymentMethod, setPaymentMethod] = useState<"vnpay" | "bank_transfer_qr" | "armored_cod">("vnpay");

  // Selected address state
  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr ? defaultAddr.id : "new");

  // New address form states (Dữ liệu hành chính Việt Nam & GHN API)
  const [ghnProvinces, setGhnProvinces] = useState<{ id: number; name: string }[]>([]);
  const [ghnDistricts, setGhnDistricts] = useState<{ id: number; name: string }[]>([]);
  const [ghnWards, setGhnWards] = useState<{ code: string; name: string }[]>([]);

  const [receiverName, setReceiverName] = useState(user ? user.name : "");
  const [receiverPhone, setReceiverPhone] = useState(user ? user.phone : "");
  const [selectedProvince, setSelectedProvince] = useState<string>("TP. Hồ Chí Minh");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("Quận 1");
  const [selectedWard, setSelectedWard] = useState<string>("Phường Bến Nghé");
  const [streetDetail, setStreetDetail] = useState<string>("");
  const [saveToAddressBook, setSaveToAddressBook] = useState<boolean>(true);
  const [securityNotes, setSecurityNotes] = useState<string>("");

  // GHN Shipping fee calculation state
  const [shippingFee, setShippingFee] = useState<number>(28000);
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>("Trong 24 giờ (Nội thành hỏa tốc)");
  const [carrierName, setCarrierName] = useState<string>("Giao Hàng Nhanh (GHN Express)");
  const [isCalculatingFee, setIsCalculatingFee] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 1. Tải danh sách Tỉnh/TP từ GHN API Master Data
  useEffect(() => {
    const fetchGhnProvinces = async () => {
      try {
        const res = await apiClient.get("/shipments/ghn/provinces");
        if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          setGhnProvinces(res.data.data.map((p: any) => ({ id: p.ProvinceID, name: p.ProvinceName })));
        }
      } catch (err) {
        console.warn("GHN Province API fallback to local:", err);
      }
    };
    fetchGhnProvinces();
  }, []);

  // 2. Tải danh sách Quận/Huyện từ GHN API khi thay đổi Tỉnh/TP
  useEffect(() => {
    const fetchGhnDistricts = async () => {
      const matchedP = ghnProvinces.find(
        (p) => p.name.toLowerCase() === selectedProvince.toLowerCase()
      );
      if (matchedP) {
        try {
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
      fetchGhnDistricts();
    }
  }, [selectedProvince, ghnProvinces]);

  // 3. Tải danh sách Phường/Xã từ GHN API khi thay đổi Quận/Huyện
  useEffect(() => {
    const fetchGhnWards = async () => {
      const matchedD = ghnDistricts.find(
        (d) => d.name.toLowerCase() === selectedDistrict.toLowerCase()
      );
      if (matchedD) {
        try {
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
      fetchGhnWards();
    }
  }, [selectedDistrict, ghnDistricts]);

  // Sync default user info
  useEffect(() => {
    if (user) {
      if (!receiverName) setReceiverName(user.name);
      if (!receiverPhone) setReceiverPhone(user.phone);
    }
  }, [user]);

  // Sync selected address ID when addresses change
  useEffect(() => {
    if (addresses.length > 0 && selectedAddressId === "new" && !streetDetail) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      if (def) setSelectedAddressId(def.id);
    }
  }, [addresses]);

  const provinces = useMemo(() => {
    if (ghnProvinces.length > 0) return ghnProvinces.map((p) => p.name);
    return getAllProvinces();
  }, [ghnProvinces]);

  const districts = useMemo(() => {
    if (ghnDistricts.length > 0) return ghnDistricts.map((d) => d.name);
    return selectedProvince ? getDistricts(selectedProvince) : [];
  }, [ghnDistricts, selectedProvince]);

  const wards = useMemo(() => {
    if (ghnWards.length > 0) return ghnWards.map((w) => w.name);
    return selectedProvince && selectedDistrict ? getWards(selectedProvince, selectedDistrict) : [];
  }, [ghnWards, selectedProvince, selectedDistrict]);

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
    const wardList = getWards(selectedProvince, dName);
    setSelectedWard(wardList.length > 0 ? wardList[0] : "");
  };

  // Tính phí vận chuyển GHN tự động khi thay đổi địa chỉ
  useEffect(() => {
    if (deliveryMethod === "salon") {
      setShippingFee(0);
      setEstimatedDelivery("Bàn giao tại Flagship Boutique");
      return;
    }

    let targetProv = selectedProvince;
    let targetDist = selectedDistrict;
    let targetWard = selectedWard;
    let targetAddress = `${streetDetail}, ${selectedWard}, ${selectedDistrict}, ${selectedProvince}`;
    let resolvedToDistrictId: number | undefined = undefined;
    let resolvedToWardCode: string | undefined = undefined;

    if (selectedAddressId !== "new") {
      const matched = addresses.find((a) => a.id === selectedAddressId);
      if (matched) {
        targetAddress = matched.address || "";
        const parts = targetAddress.split(",").map((s) => s.trim());
        targetProv = matched.city || matched.province || (parts.length >= 1 ? parts[parts.length - 1] : "TP. Hồ Chí Minh");
        targetDist = matched.district || (parts.length >= 2 ? parts[parts.length - 2] : "");
        targetWard = matched.ward || (parts.length >= 3 ? parts[parts.length - 3] : "");
      }
    } else {
      const dObj = ghnDistricts.find((d) => d.name.toLowerCase() === selectedDistrict.toLowerCase());
      if (dObj) resolvedToDistrictId = dObj.id;
      const wObj = ghnWards.find((w) => w.name.toLowerCase() === selectedWard.toLowerCase());
      if (wObj) resolvedToWardCode = wObj.code;
    }

    const fetchShippingFee = async () => {
      try {
        setIsCalculatingFee(true);
        const res = await apiClient.post("/shipments/fee", {
          province: targetProv,
          district: targetDist,
          ward: targetWard,
          address: targetAddress,
          toDistrictId: resolvedToDistrictId,
          toWardCode: resolvedToWardCode,
          weight: 500,
          value: subtotalVND,
        });

        if (res.data?.success && res.data?.data) {
          setShippingFee(res.data.data.fee || 32000);
          setEstimatedDelivery(res.data.data.estimated_deliver_time || "1 - 2 ngày làm việc (GHN Fast)");
          setCarrierName(res.data.data.carrier || "Giao Hàng Nhanh (GHN Express)");
        }
      } catch {
        setShippingFee(32000);
      } finally {
        setIsCalculatingFee(false);
      }
    };

    fetchShippingFee();
  }, [selectedAddressId, selectedProvince, selectedDistrict, selectedWard, streetDetail, deliveryMethod, addresses, subtotalVND]);

  const finalSubtotalVND = subtotalVND * (1 - discountRate);
  const totalAmountVND = finalSubtotalVND + (deliveryMethod === "salon" ? 0 : shippingFee);
  const totalAmountUSD = Math.round(totalAmountVND / 25000);

  // AUTH GUARD: Bắt buộc đăng nhập để mua hàng
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050b07] text-white pt-32 pb-24 px-4 sm:px-6 lg:px-8 selection:bg-[#006039] selection:text-white flex items-center justify-center">
        <div className="max-w-xl w-full mx-auto text-center p-8 sm:p-12 rounded-3xl bg-[#08120d]/90 border border-[#d4af37]/25 backdrop-blur-2xl shadow-2xl relative">
          <div className="w-20 h-20 rounded-full bg-[#006039]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] mx-auto mb-6">
            <FontAwesomeIcon icon={faLock} className="w-8 h-8 text-[#d4af37]" />
          </div>

          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#d4af37] block mb-2 font-semibold">
            BẢO MẬT GIAO DỊCH
          </span>

          <h2 className="text-2xl sm:text-3xl font-serif font-light text-stone-100 mb-3">
            Đăng Nhập Để Tiến Hành Đặt Hàng
          </h2>

          <p className="text-xs sm:text-sm text-stone-400 font-light leading-relaxed mb-8 max-w-md mx-auto">
            Hợp đồng bàn giao và chứng thư bảo hành số serial cỗ máy Thụy Sĩ cần được liên kết với hồ sơ chủ sở hữu VIP.
          </p>

          <button
            onClick={() => openAuthModal("login")}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#c69f2e] to-[#b38f28] hover:from-[#e5c158] hover:to-[#c49f32] text-black font-mono text-xs font-bold uppercase tracking-wider shadow-xl shadow-[#d4af37]/25 transition-all hover:scale-102 active:scale-98 cursor-pointer inline-flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faLock} className="text-xs" />
            <span>Đăng Nhập Tài Khoản Của Quý Khách</span>
          </button>
        </div>
      </div>
    );
  }

  // EMPTY CART CHECK
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#050b07] text-white pt-32 pb-20 px-4 sm:px-8 max-w-4xl mx-auto text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-[#006039]/20 border border-[#006039]/40 flex items-center justify-center text-[#d4af37] mb-5">
          <FontAwesomeIcon icon={faBagShopping} className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-100">
          Giỏ Hàng Bảo Mật Đang Trống
        </h2>
        <p className="text-xs text-stone-400 max-w-md mt-2 font-light">
          Quý khách chưa lựa chọn kiệt tác nào để tiến hành thủ tục thanh toán. Hãy thưởng lãm bộ sưu tập cỗ máy thời gian độc bản.
        </p>
        <Link
          href="/products"
          className="mt-8 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b38f28] text-black font-semibold text-xs uppercase tracking-wider shadow-lg transition-transform hover:scale-105"
        >
          Khám Phá Toàn Bộ Kiệt Tác
        </Link>
      </div>
    );
  }

  // XỬ LÝ ĐẶT HÀNG THỰC TẾ LƯU VÀO MYSQL BACKEND
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast("Giỏ hàng của Quý khách đang trống.");
      return;
    }

    try {
      setIsSubmitting(true);
      watchAudio.chime();

      let finalAddressId: number | null = null;
      let finalFullAddressText = "";
      let finalPhone = receiverPhone.trim();

      // Kiểm tra tính hợp lệ của số điện thoại nếu là đơn giao hàng
      if (deliveryMethod === "armored") {
        if (selectedAddressId !== "new" && addresses.length > 0) {
          const matched = addresses.find((a) => a.id === selectedAddressId);
          if (matched) {
            finalPhone = matched.phone;
          }
        }

        if (!isValidVietnamPhone(finalPhone)) {
          showToast(
            "Số điện thoại nhận hàng không hợp lệ! Quý khách vui lòng nhập đúng số điện thoại thật của Việt Nam (10 chữ số, ví dụ: 0987654321, 0912345678)."
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Nếu chọn nhập địa chỉ mới
      if (selectedAddressId === "new" && deliveryMethod === "armored") {
        if (!streetDetail.trim()) {
          showToast("Quý khách vui lòng nhập số nhà, tên đường cụ thể.");
          setIsSubmitting(false);
          return;
        }

        finalFullAddressText = selectedWard
          ? `${streetDetail.trim()}, ${selectedWard}, ${selectedDistrict}, ${selectedProvince}`
          : `${streetDetail.trim()}, ${selectedProvince}`;

        // Lưu vào MySQL CSDL nếu tích chọn lưu
        if (saveToAddressBook) {
          const resAddr = await apiClient.post("/user-addresses", {
            receiverName: receiverName.trim() || user?.name || "Quý khách",
            phone: normalizeVietnamPhone(finalPhone),
            address: finalFullAddressText,
            isDefault: addresses.length === 0,
          });
          if (resAddr.data?.data?.id) {
            finalAddressId = resAddr.data.data.id;
          }
        }
      } else if (selectedAddressId !== "new") {
        const numericId = Number(selectedAddressId);
        if (!isNaN(numericId)) {
          finalAddressId = numericId;
        }
        const matched = addresses.find((a) => a.id === selectedAddressId);
        if (matched) finalFullAddressText = matched.address;
      }

      // Format payload gửi lên Backend API POST /orders
      const orderItemsPayload = cart.map((item) => ({
        variantId: item.selectedVariant?.id || item.watch.variants?.[0]?.id,
        quantity: item.quantity,
      }));

      // Map paymentMethod sang backend enum: 'vnpay' | 'bank_transfer' | 'cod'
      let backendPaymentMethod: "vnpay" | "bank_transfer" | "cod" = "vnpay";
      if (paymentMethod === "bank_transfer_qr") backendPaymentMethod = "bank_transfer";
      if (paymentMethod === "armored_cod") backendPaymentMethod = "cod";

      const orderPayload = {
        userAddressId: finalAddressId,
        receiverName: receiverName.trim() || user?.name || "Khách Hàng Luxury",
        receiverPhone: normalizeVietnamPhone(finalPhone),
        shippingAddress: finalFullAddressText,
        items: orderItemsPayload,
        paymentMethod: backendPaymentMethod,
        banOnlineHoacOffline: deliveryMethod === "salon" ? "offline" : "online",
        shippingFee: deliveryMethod === "salon" ? 0 : shippingFee,
        securityNotes: securityNotes.trim(),
      };

      const resOrder = await apiClient.post("/orders", orderPayload);

      if (resOrder.data?.success && resOrder.data?.data) {
        const orderData = resOrder.data.data;
        const paymentUrl = resOrder.data.meta?.paymentUrl;

        // Xóa giỏ hàng trên frontend
        await clearCart();

        // NẾU LÀ VNPAY: CHUYỂN HƯỚNG SANG CỔNG THANH TOÁN VNPAY
        if (paymentMethod === "vnpay" && paymentUrl) {
          showToast("Đang kết nối tới Cổng Thanh Toán VNPay...");
          window.location.href = paymentUrl;
          return;
        }

        // NẾU LÀ COD HOẶC VIETQR: CHUYỂN SANG TRANG THÔNG BÁO THÀNH CÔNG
        router.push(
          `/checkout/success?orderId=${encodeURIComponent(
            orderData.id
          )}&orderCode=${encodeURIComponent(orderData.orderCode)}&method=${paymentMethod}&total=${totalAmountVND}`
        );
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể khởi tạo đơn hàng lúc này. Quý khách vui lòng thử lại.";
      showToast(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050b07] text-white pt-28 pb-24 px-4 sm:px-6 lg:px-8 selection:bg-[#006039] selection:text-white">
      <div className="max-w-7xl mx-auto">
        {/* Top Banner */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#d4af37] block font-semibold">
            BRU_WATCH • PRIVATE CONCIERGE CHECKOUT
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-light text-stone-100 mt-1">
            Thủ Tục Bàn Giao & Thanh Toán
          </h1>
          <p className="text-xs text-stone-400 mt-2 font-light">
            Vận chuyển bởi Giao Hàng Nhanh (GHN Express) bảo mật cao cấp, bảo hiểm 100% giá trị trên toàn bộ lộ trình.
          </p>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Delivery Mode */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#08120d]/90 border border-[#d4af37]/20 space-y-4 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#006039]/20 text-emerald-400 border border-[#006039]/40 flex items-center justify-center">
                  <FontAwesomeIcon icon={faTruck} className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-normal text-stone-100">
                    1. Hình Thức Tiếp Nhận Đồng Hồ
                  </h3>
                  <span className="text-xs text-stone-400 font-light">
                    Lựa chọn phương thức giao nhận bảo mật cao nhất
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label
                  onClick={() => {
                    watchAudio.tick();
                    setDeliveryMethod("armored");
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    deliveryMethod === "armored"
                      ? "bg-[#006039]/15 border-emerald-500/60 shadow-md shadow-emerald-950/20"
                      : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-sm font-medium text-stone-100">
                        Giao Hàng Nhanh (GHN Express)
                      </span>
                      <span className="text-[10px] font-mono text-[#d4af37] font-semibold bg-[#d4af37]/10 px-2 py-0.5 rounded-full border border-[#d4af37]/30">
                        {isCalculatingFee ? "Đang tính..." : formatPrice(Math.round(shippingFee / 25000), shippingFee)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-2 font-light leading-relaxed">
                      Đóng gói niêm phong cẩn thận và giao tận tay Quý khách bảo đảm an toàn tuyệt đối.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                    <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3 text-[#d4af37]" />
                    <span>{estimatedDelivery}</span>
                  </div>
                </label>

                <label
                  onClick={() => {
                    watchAudio.tick();
                    setDeliveryMethod("salon");
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    deliveryMethod === "salon"
                      ? "bg-[#d4af37]/15 border-[#d4af37]/60 shadow-md shadow-[#d4af37]/10"
                      : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-sm font-medium text-stone-100">
                        Nhận Tại Boutique BRU_WATCH
                      </span>
                      <span className="text-[10px] font-mono text-[#d4af37] font-semibold bg-[#d4af37]/10 px-2 py-0.5 rounded-full border border-[#d4af37]/30">
                        MIỄN PHÍ
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-2 font-light leading-relaxed">
                      Trải nghiệm phòng thử kín riêng tư tại Flagship Salon Tràng Tiền (Hà Nội) hoặc Đồng Khởi (TP.HCM).
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-[#d4af37]">
                    <FontAwesomeIcon icon={faBuildingColumns} className="w-3 h-3 text-[#d4af37]" />
                    <span>Tiếp đón bởi Giám Đốc Salon</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Section 2: Address & Receiver Info */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#08120d]/90 border border-[#d4af37]/20 space-y-4 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#006039]/20 text-emerald-400 border border-[#006039]/40 flex items-center justify-center">
                  <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-normal text-stone-100">
                    2. Địa Chỉ & Danh Xưng Người Nhận
                  </h3>
                  <span className="text-xs text-stone-400 font-light">
                    Đối chiếu với lệnh bàn giao an ninh và đơn vị vận chuyển GHN
                  </span>
                </div>
              </div>

              {/* Saved Addresses Selector (Nếu có) */}
              {addresses.length > 0 && deliveryMethod === "armored" && (
                <div className="space-y-3 pt-1">
                  <span className="text-[11px] font-mono uppercase text-stone-400 block font-medium">
                    Chọn Từ Sổ Địa Chỉ Bảo Mật Của Quý Khách:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => {
                            watchAudio.tick();
                            setSelectedAddressId(addr.id);
                          }}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#d4af37] bg-[#d4af37]/15 shadow-md shadow-[#d4af37]/10"
                              : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-serif text-xs font-semibold text-stone-100">
                              {addr.receiverName}
                            </span>
                            <span className="text-[10px] font-mono text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded-full border border-[#d4af37]/20">
                              {addr.tag || "Tư gia"}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 truncate mt-1">
                            {addr.address}
                          </p>
                          <p className="text-[11px] font-mono text-stone-500 mt-0.5">
                            {addr.phone}
                          </p>
                        </div>
                      );
                    })}

                    <div
                      onClick={() => {
                        watchAudio.tick();
                        setSelectedAddressId("new");
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center text-xs font-mono uppercase tracking-wider gap-2 ${
                        selectedAddressId === "new"
                          ? "border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37]"
                          : "border-dashed border-white/[0.15] bg-white/[0.01] text-stone-400 hover:text-white hover:border-[#d4af37]/40"
                      }`}
                    >
                      <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                      <span>Nhập Địa Chỉ Mới</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Form nhập địa chỉ mới (Nếu chọn "new" hoặc chưa có địa chỉ) */}
              {(selectedAddressId === "new" || addresses.length === 0) && deliveryMethod === "armored" && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase text-stone-300">
                        Họ Tên Quý Khách
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ví dụ: Alexander Vũ"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] focus:border-[#d4af37] text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-mono uppercase text-stone-300">
                          Số Điện Thoại Trực Tiếp (10 số thật)
                        </label>
                        {receiverPhone.trim() && (
                          isValidVietnamPhone(receiverPhone) ? (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                              <FontAwesomeIcon icon={faCheck} className="text-[9px]" />
                              <span>{getVietnamCarrierName(receiverPhone)}</span>
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
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-black/40 border text-xs text-white focus:outline-none font-mono transition-colors ${
                          receiverPhone.trim() && !isValidVietnamPhone(receiverPhone)
                            ? "border-rose-500/50 focus:border-rose-500"
                            : receiverPhone.trim() && isValidVietnamPhone(receiverPhone)
                            ? "border-emerald-500/50 focus:border-emerald-500"
                            : "border-white/[0.1] focus:border-[#d4af37]"
                        }`}
                      />
                      {receiverPhone.trim() && !isValidVietnamPhone(receiverPhone) && (
                        <p className="text-[10px] text-rose-400/90 font-mono">
                          Phải là số di động Việt Nam 10 chữ số (đầu 03, 05, 07, 08, 09).
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cascading Dropdown Hành Chính Việt Nam */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase text-stone-300">
                        Tỉnh / TP
                      </label>
                      <select
                        value={selectedProvince}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#09130e] border border-white/[0.1] focus:border-[#d4af37] text-xs text-white focus:outline-none"
                      >
                        {provinces.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase text-stone-300">
                        Quận / Huyện
                      </label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#09130e] border border-white/[0.1] focus:border-[#d4af37] text-xs text-white focus:outline-none"
                      >
                        {districts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase text-stone-300">
                        Phường / Xã
                      </label>
                      <select
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#09130e] border border-white/[0.1] focus:border-[#d4af37] text-xs text-white focus:outline-none"
                      >
                        {wards.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase text-stone-300">
                      Số Nhà, Tên Đường, Biệt Thự / Penthouse Cụ Thể
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ví dụ: Số 68 Đồng Khởi, Masteri Thảo Điền..."
                      value={streetDetail}
                      onChange={(e) => setStreetDetail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] focus:border-[#d4af37] text-xs text-white focus:outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs font-mono text-stone-400 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={saveToAddressBook}
                      onChange={(e) => setSaveToAddressBook(e.target.checked)}
                      className="rounded bg-white/10 border-white/20 text-[#d4af37] focus:ring-0"
                    />
                    <span>Lưu địa chỉ này vào sổ địa chỉ để sử dụng cho lần sau</span>
                  </label>
                </div>
              )}

              {/* Salon info if selected */}
              {deliveryMethod === "salon" && (
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-[#d4af37]/30 text-xs text-stone-300 space-y-1.5">
                  <span className="font-semibold text-[#d4af37] flex items-center gap-2">
                    <FontAwesomeIcon icon={faBuildingColumns} />
                    <span>Địa Điểm Tiếp Đón Riêng Tư Tại Salon:</span>
                  </span>
                  <p className="text-stone-400 leading-relaxed font-light">
                    Flagship Boutique BRU_WATCH - Số 15 Tràng Tiền, Hoàn Kiếm, Hà Nội hoặc 68 Đồng Khởi, Quận 1, TP. Hồ Chí Minh. Giám đốc Concierge sẽ liên hệ để sắp xếp thời gian thử tay và tiếp đón riêng tư với Quý khách.
                  </p>
                </div>
              )}

              {/* Special Security Notes */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-mono uppercase text-stone-400">
                  Chỉ Dẫn Riêng Biệt Khi Giao Hàng (Không bắt buộc)
                </label>
                <input
                  type="text"
                  placeholder="ví dụ: Đỗ xe kín tại sảnh, shipper gọi trước 30 phút, kiểm tra niêm phong..."
                  value={securityNotes}
                  onChange={(e) => setSecurityNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.1] focus:border-[#d4af37] text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Section 3: Payment Method (BỎ THẺ TÍN DỤNG, BỔ SUNG VNPAY) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#08120d]/90 border border-[#d4af37]/20 space-y-4 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#006039]/20 text-emerald-400 border border-[#006039]/40 flex items-center justify-center">
                  <FontAwesomeIcon icon={faQrcode} className="w-4 h-4 text-[#d4af37]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-normal text-stone-100">
                    3. Phương Thức Thanh Toán Bảo Mật
                  </h3>
                  <span className="text-xs text-stone-400 font-light">
                    Bảo hiểm giao dịch ngân hàng theo quy định của Ngân Hàng Nhà Nước Việt Nam
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {/* Option 1: VNPay */}
                <label
                  onClick={() => {
                    watchAudio.tick();
                    setPaymentMethod("vnpay");
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === "vnpay"
                      ? "bg-[#d4af37]/15 border-[#d4af37] shadow-lg shadow-[#d4af37]/10"
                      : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#006039]/30 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                      <FontAwesomeIcon icon={faShieldHalved} className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-serif text-sm font-medium text-stone-100">
                          Cổng Thanh Toán Quốc Gia VNPay
                        </h5>
                        <span className="text-[9px] font-mono bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 font-semibold">
                          VNPay-QR / ATM / Thẻ
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 font-light mt-0.5">
                        Quét mã VNPay-QR trên ứng dụng 40+ ngân hàng Việt Nam, thanh toán an toàn tức thì.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === "vnpay"
                        ? "border-[#d4af37] bg-[#d4af37] text-black text-[10px]"
                        : "border-white/20"
                    }`}
                  >
                    {paymentMethod === "vnpay" && <FontAwesomeIcon icon={faCheck} />}
                  </div>
                </label>

                {/* Option 2: VietQR */}
                <label
                  onClick={() => {
                    watchAudio.tick();
                    setPaymentMethod("bank_transfer_qr");
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === "bank_transfer_qr"
                      ? "bg-[#006039]/20 border-emerald-500/60 shadow-lg shadow-emerald-950/20"
                      : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-center text-emerald-400">
                      <FontAwesomeIcon icon={faQrcode} className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-serif text-sm font-medium text-stone-100">
                        Chuyển Khoản Ngân Hàng Tự Động (VietQR 24/7)
                      </h5>
                      <p className="text-xs text-stone-400 font-light mt-0.5">
                        Quét mã QR sinh động, đối soát 0 giây qua tài khoản độc quyền ngân hàng.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === "bank_transfer_qr"
                        ? "border-emerald-400 bg-emerald-400 text-black text-[10px]"
                        : "border-white/20"
                    }`}
                  >
                    {paymentMethod === "bank_transfer_qr" && <FontAwesomeIcon icon={faCheck} />}
                  </div>
                </label>

                {/* Option 3: Armored COD */}
                <label
                  onClick={() => {
                    watchAudio.tick();
                    setPaymentMethod("armored_cod");
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    paymentMethod === "armored_cod"
                      ? "bg-[#d4af37]/15 border-[#d4af37]/60 shadow-md"
                      : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-center text-[#d4af37]">
                      <FontAwesomeIcon icon={faMoneyBillWave} className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-serif text-sm font-medium text-stone-100">
                        Thanh Toán Khi Nhận Hàng (COD)
                      </h5>
                      <p className="text-xs text-stone-400 font-light mt-0.5">
                        Kiểm tra niêm phong và cỗ máy thực tế trên tay trước khi quyết định ký nhận.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      paymentMethod === "armored_cod"
                        ? "border-[#d4af37] bg-[#d4af37] text-black text-[10px]"
                        : "border-white/20"
                    }`}
                  >
                    {paymentMethod === "armored_cod" && <FontAwesomeIcon icon={faCheck} />}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Placement (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-7 rounded-3xl bg-[#08120d]/95 border border-[#d4af37]/25 space-y-5 sticky top-28 shadow-2xl backdrop-blur-2xl">
              <h3 className="font-serif text-lg font-normal text-stone-100 pb-4 border-b border-white/[0.08] flex items-center justify-between">
                <span>Đơn Hàng Bảo Mật</span>
                <span className="text-xs font-mono text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-0.5 rounded-full border border-[#d4af37]/25">
                  {cart.length} Kiệt Tác
                </span>
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-white/[0.04]">
                {cart.map((entry) => {
                  const { watch, quantity, selectedVariant } = entry;
                  const itemKey = entry.id || watch.id;
                  const itemImg = selectedVariant?.images?.[0] || watch.image;
                  const itemVND = selectedVariant ? selectedVariant.priceVND : watch.priceVND;
                  const itemUSD = selectedVariant ? selectedVariant.priceUSD : watch.priceUSD;

                  return (
                    <div key={itemKey} className="pt-3 first:pt-0 flex items-center gap-3.5">
                      <div className="relative w-14 h-14 rounded-xl bg-black/60 border border-white/[0.08] overflow-hidden shrink-0">
                        <Image
                          src={itemImg}
                          alt={watch.name}
                          fill
                          unoptimized
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            if (!target.src.includes("submariner-emerald.jpg")) {
                              target.src = "/images/submariner-emerald.jpg";
                            }
                          }}
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-mono uppercase text-[#d4af37] font-semibold">
                          {watch.brand}
                        </span>
                        <h5 className="font-serif text-xs font-normal text-stone-100 truncate">
                          {watch.name}
                        </h5>
                        {selectedVariant && (
                          <div className="text-[10px] font-mono text-stone-400 truncate">
                            {selectedVariant.mauMatSo} • {selectedVariant.sku}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs font-mono mt-1">
                          <span className="text-stone-400">SL: {quantity}</span>
                          <span className="font-semibold text-[#d4af37]">
                            {formatPrice(itemUSD * quantity, itemVND * quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2.5 text-xs font-mono pt-3 border-t border-white/[0.08]">
                <div className="flex justify-between text-stone-400">
                  <span>Tạm tính giá trị:</span>
                  <span className="text-stone-200">{formatPrice(subtotalUSD, subtotalVND)}</span>
                </div>

                <div className="flex justify-between text-stone-400">
                  <span>Cước Giao Hàng Nhanh (GHN Express):</span>
                  <span className="text-emerald-400 font-semibold">
                    {deliveryMethod === "salon"
                      ? "MIỄN PHÍ"
                      : shippingFee === 0
                      ? "MIỄN PHÍ ĐẶC QUYỀN"
                      : formatPrice(Math.round(shippingFee / 25000), shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between text-stone-400">
                  <span>Bảo hiểm rủi ro vận chuyển:</span>
                  <span className="text-emerald-400 font-semibold">100% Giá Trị</span>
                </div>

                <div className="flex justify-between text-base font-serif font-normal text-stone-100 pt-3 border-t border-[#d4af37]/20">
                  <span>Tổng Thanh Toán:</span>
                  <span className="text-[#d4af37] font-mono font-bold text-xl">
                    {formatPrice(totalAmountUSD, totalAmountVND)}
                  </span>
                </div>
              </div>

              {/* Security note */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-[#d4af37]/25 flex items-center gap-2.5 text-[11px] font-mono text-stone-300">
                <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span>Cam kết 100% đồng hồ chính hãng xuất xưởng từ Geneva kèm thẻ bảo hành quốc tế 5 năm.</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#c69f2e] to-[#b38f28] hover:from-[#e5c158] hover:to-[#c49f32] text-black font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-[#d4af37]/25 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
                    <span>Đang Khởi Tạo Đơn Hàng...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faLock} className="w-3.5 h-3.5" />
                    <span>
                      {paymentMethod === "vnpay"
                        ? "Thanh Toán Qua Cổng VNPay"
                        : "Xác Nhận Đặt Hàng & Giao Nhận"}
                    </span>
                    <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
