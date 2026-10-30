"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth, UserAddress } from "@/context/AuthContext";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldHalved,
  faTruck,
  faBuildingColumns,
  faCreditCard,
  faQrcode,
  faMoneyBillWave,
  faLock,
  faTag,
  faGem,
  faArrowRight,
  faLocationDot,
  faCheck,
  faBagShopping,
  faPhone,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    formatPrice,
    promoCode,
    discountRate,
    applyPromoCode,
    subtotalVND,
    subtotalUSD,
    clearCart,
    showToast,
  } = useCart();
  const { user, addresses, createOrder } = useAuth();

  // Selected delivery option
  const [deliveryMethod, setDeliveryMethod] = useState<"armored" | "salon">("armored");
  // Selected payment method
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer_qr" | "armored_cod" | "credit_card">("bank_transfer_qr");

  // Shipping address form or selected saved address
  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr ? defaultAddr.id : "custom");

  const [customReceiverName, setCustomReceiverName] = useState(user ? user.name : "");
  const [customPhone, setCustomPhone] = useState(user ? user.phone : "");
  const [customAddress, setCustomAddress] = useState("");
  const [customCity, setCustomCity] = useState("TP. Hồ Chí Minh");
  const [securityNotes, setSecurityNotes] = useState("");
  const [voucherInput, setVoucherInput] = useState("");

  const finalSubtotalVND = subtotalVND * (1 - discountRate);
  const finalSubtotalUSD = subtotalUSD * (1 - discountRate);

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherInput) return;
    applyPromoCode(voucherInput);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast("Giỏ hàng của Quý khách đang trống.");
      return;
    }

    watchAudio.chime();

    // Determine final address
    let finalAddress: UserAddress;
    const matchedAddr = addresses.find((a) => a.id === selectedAddressId);
    if (matchedAddr && selectedAddressId !== "custom") {
      finalAddress = matchedAddr;
    } else {
      finalAddress = {
        id: `ADDR-${Date.now()}`,
        receiverName: customReceiverName || user?.name || "Khách VIP",
        phone: customPhone || user?.phone || "0900 000 000",
        address: customAddress || (deliveryMethod === "salon" ? "Phòng VIP Salon Suite - Đồng Khởi" : "Dinh thự Quý khách"),
        city: customCity,
        isDefault: false,
        tag: deliveryMethod === "salon" ? "Văn phòng VIP" : "Dinh thự",
      };
    }

    const newOrder = createOrder({
      items: cart.map((c) => ({ watch: c.watch, quantity: c.quantity, variant: c.selectedVariant })),
      totalVND: finalSubtotalVND,
      totalUSD: finalSubtotalUSD,
      paymentMethod,
      shippingAddress: finalAddress,
    });

    clearCart();
    router.push(`/checkout/success?orderId=${encodeURIComponent(newOrder.id)}`);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 sm:px-8 max-w-4xl mx-auto text-center flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-[#006039]/20 border border-[#006039]/40 flex items-center justify-center text-[#d4af37] mb-5">
          <FontAwesomeIcon icon={faBagShopping} className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-normal text-foreground">
          Giỏ Hàng Bảo Mật Đang Trống
        </h2>
        <p className="text-xs text-muted-foreground max-w-md mt-2 font-light">
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

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#d4af37] block">
          BRU_WATCH • PRIVATE CONCIERGE
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-normal text-foreground mt-1">
          Thủ Tục Bàn Giao & Thanh Toán VIP
        </h1>
        <p className="text-xs text-muted-foreground mt-2 font-light">
          Hệ thống bảo mật quy chuẩn ngân hàng Thụy Sĩ. Mọi chuyến hàng đều được hộ tống bởi xe bọc thép có vũ trang.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Delivery & Payment Details (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Delivery Mode */}
          <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#006039]/20 text-emerald-400 border border-[#006039]/40 flex items-center justify-center">
                <FontAwesomeIcon icon={faTruck} className="w-4 h-4 text-[#d4af37]" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-normal text-foreground">
                  1. Hình Thức Bàn Giao Cỗ Máy
                </h3>
                <span className="text-xs text-muted-foreground font-light">
                  Lựa chọn phương thức tiếp nhận đồng hồ bảo mật cao nhất
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
                    ? "bg-[#006039]/10 border-emerald-500/60 shadow-md shadow-emerald-950/20"
                    : "bg-muted/20 border-border hover:border-border/80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-medium text-foreground">
                      Xe Bọc Thép Chuyên Dụng
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      MIỄN PHÍ
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 font-light leading-relaxed">
                    Được hộ tống bởi 2 vệ sĩ trang bị vũ trang chuyên trách và thiết bị niêm phong GPS Thụy Sĩ.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3 text-[#d4af37]" />
                  <span>Bảo hiểm 100% Giá trị</span>
                </div>
              </label>

              <label
                onClick={() => {
                  watchAudio.tick();
                  setDeliveryMethod("salon");
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  deliveryMethod === "salon"
                    ? "bg-[#d4af37]/10 border-[#d4af37]/60 shadow-md shadow-[#d4af37]/10"
                    : "bg-muted/20 border-border hover:border-border/80"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-medium text-foreground">
                      Bàn Giao Tại VIP Salon Suite
                    </span>
                    <span className="text-[10px] font-mono text-[#d4af37] font-semibold bg-[#d4af37]/10 px-2 py-0.5 rounded-full border border-[#d4af37]/30">
                      ĐẶC QUYỀN
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 font-light leading-relaxed">
                    Trải nghiệm phòng thử kín riêng tư tại Boutique Tràng Tiền (HN) hoặc Đồng Khởi (TP.HCM) với rượu vang Grand Cru.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-[#d4af37]">
                  <FontAwesomeIcon icon={faBuildingColumns} className="w-3 h-3 text-[#d4af37]" />
                  <span>Tiếp đón bởi Giám Đốc Salon</span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 2: Destination Address & Receiver */}
          <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#006039]/20 text-emerald-400 border border-[#006039]/40 flex items-center justify-center">
                <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 text-[#d4af37]" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-normal text-foreground">
                  2. Địa Chỉ & Danh Xưng Người Nhận
                </h3>
                <span className="text-xs text-muted-foreground font-light">
                  Thông tin nhân thân để đối chiếu với lệnh bàn giao an ninh
                </span>
              </div>
            </div>

            {/* Saved Addresses Selector (If logged in and has addresses) */}
            {user && addresses.length > 0 && deliveryMethod === "armored" && (
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-mono uppercase text-muted-foreground">
                  Chọn từ Sổ Địa Chỉ Bảo Mật Của Quý Khách:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      onClick={() => {
                        watchAudio.tick();
                        setSelectedAddressId(addr.id);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        selectedAddressId === addr.id
                          ? "border-[#d4af37] bg-[#d4af37]/10"
                          : "border-border bg-muted/20 hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-xs font-semibold text-foreground">
                          {addr.receiverName}
                        </span>
                        <span className="text-[10px] font-mono text-[#d4af37]">
                          {addr.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-1">
                        {addr.address}, {addr.city}
                      </p>
                      <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                        {addr.phone}
                      </p>
                    </label>
              ))}

                  <label
                    onClick={() => {
                      watchAudio.tick();
                      setSelectedAddressId("custom");
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center text-xs font-mono uppercase tracking-wider ${
                      selectedAddressId === "custom"
                        ? "border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]"
                        : "border-dashed border-border bg-muted/10 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    + Nhập địa chỉ mới
                  </label>
                </div>
              </div>
            )}

            {/* Custom address inputs */}
            {(selectedAddressId === "custom" || !user || deliveryMethod === "salon") && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase text-muted-foreground">
                      Họ Tên Quý Khách
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ví dụ: Alexander Vũ"
                      value={customReceiverName}
                      onChange={(e) => setCustomReceiverName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:border-[#d4af37] text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase text-muted-foreground">
                      Số Điện Thoại Trực Tiếp
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0908 889 999"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:border-[#d4af37] text-xs text-foreground focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {deliveryMethod === "armored" ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase text-muted-foreground">
                        Địa Chỉ Dinh Thự / Tư Gia
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Số nhà, Tên đường, Khu biệt thự hoặc Penthouse..."
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:border-[#d4af37] text-xs text-foreground focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase text-muted-foreground">
                        Tỉnh / Thành Phố
                      </label>
                      <select
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:border-[#d4af37] text-xs text-foreground focus:outline-none"
                      >
                        <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                        <option value="Hải Phòng">Hải Phòng</option>
                        <option value="Cần Thơ">Cần Thơ</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border text-xs text-foreground space-y-1">
                    <span className="font-semibold text-[#d4af37]">Địa Điểm Tiếp Đón VIP Salon:</span>
                    <p className="text-muted-foreground leading-relaxed">
                      BRU_WATCH Flagship Boutique - Số 15 Tràng Tiền, Hoàn Kiếm, Hà Nội hoặc 68 Đồng Khởi, Quận 1, TP. Hồ Chí Minh. Đội ngũ Concierge sẽ liên hệ đặt lịch trước với Quý khách.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Special Instructions */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[11px] font-mono uppercase text-muted-foreground">
                Chỉ Dẫn Bảo Mật Riêng Biệt (Không bắt buộc)
              </label>
              <input
                type="text"
                placeholder="ví dụ: Đỗ xe kín tại cổng sau, bảo an gọi trước 20 phút, mật mã tiếp nhận..."
                value={securityNotes}
                onChange={(e) => setSecurityNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border focus:border-[#d4af37] text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#006039]/20 text-emerald-400 border border-[#006039]/40 flex items-center justify-center">
                <FontAwesomeIcon icon={faCreditCard} className="w-4 h-4 text-[#d4af37]" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-normal text-foreground">
                  3. Phương Thức Thanh Toán Thượng Lưu
                </h3>
                <span className="text-xs text-muted-foreground font-light">
                  Bảo hiểm giao dịch ngân hàng theo quy định quốc tế
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {/* Option 1: VietQR */}
              <label
                onClick={() => {
                  watchAudio.tick();
                  setPaymentMethod("bank_transfer_qr");
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === "bank_transfer_qr"
                    ? "bg-[#006039]/15 border-emerald-500/60 shadow-md"
                    : "bg-muted/20 border-border hover:border-border/80"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-border flex items-center justify-center text-[#d4af37]">
                    <FontAwesomeIcon icon={faQrcode} className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-serif text-sm font-medium text-foreground">
                      Chuyển Khoản Ngân Hàng Tự Động (VietQR 24/7)
                    </h5>


                    <p className="text-xs text-muted-foreground font-light">
                      Quét mã QR Napas sinh tự động, đối soát ngay lập tức 0 giây.
                    </p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === "bank_transfer_qr"
                      ? "border-emerald-400 bg-emerald-400 text-black text-[10px]"
                      : "border-border"
                  }`}
                >
                  {paymentMethod === "bank_transfer_qr" && <FontAwesomeIcon icon={faCheck} />}
                </div>
              </label>

              {/* Option 2: Armored COD */}
              <label
                onClick={() => {
                  watchAudio.tick();
                  setPaymentMethod("armored_cod");
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === "armored_cod"
                    ? "bg-[#d4af37]/15 border-[#d4af37]/60 shadow-md"
                    : "bg-muted/20 border-border hover:border-border/80"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-border flex items-center justify-center text-[#d4af37]">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-serif text-sm font-medium text-foreground">
                      Thanh Toán Khi Tiếp Nhận Bàn Giao Xe Bọc Thép
                    </h5>


                    <p className="text-xs text-muted-foreground font-light">
                      Kiểm định cỗ máy thực tế trên tay trước khi quyết định ký nhận.
                    </p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === "armored_cod"
                      ? "border-[#d4af37] bg-[#d4af37] text-black text-[10px]"
                      : "border-border"
                  }`}
                >
                  {paymentMethod === "armored_cod" && <FontAwesomeIcon icon={faCheck} />}
                </div>
              </label>

              {/* Option 3: Credit Card */}
              <label
                onClick={() => {
                  watchAudio.tick();
                  setPaymentMethod("credit_card");
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  paymentMethod === "credit_card"
                    ? "bg-purple-950/20 border-purple-500/60 shadow-md"
                    : "bg-muted/20 border-border hover:border-border/80"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-border flex items-center justify-center text-purple-400">
                    <FontAwesomeIcon icon={faCreditCard} className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-serif text-sm font-medium text-foreground">
                      Thẻ Tín Dụng Quốc Tế (Visa Infinite, AmEx Centurion)
                    </h5>


                    <p className="text-xs text-muted-foreground font-light">
                      Cổng thanh toán mã hóa 3D Secure 2.0 an toàn tuyệt đối.
                    </p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    paymentMethod === "credit_card"
                      ? "border-purple-400 bg-purple-400 text-black text-[10px]"
                      : "border-border"
                  }`}
                >
                  {paymentMethod === "credit_card" && <FontAwesomeIcon icon={faCheck} />}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Voucher (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-card border border-border space-y-5 sticky top-28 shadow-xl">
            <h3 className="font-serif text-lg font-normal text-foreground pb-4 border-b border-border flex items-center justify-between">
              <span>Đơn Hàng Bảo Mật</span>
              <span className="text-xs font-mono text-[#d4af37]">
                {cart.length} Kiệt Tác
              </span>
            </h3>

            {/* Cart Items list */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {cart.map((entry) => {
                const { watch, quantity, selectedVariant } = entry;
                const entryKey = entry.id || (selectedVariant ? `${watch.id}-${selectedVariant.id}` : watch.id);
                const itemImg = selectedVariant?.images?.[0] || watch.image;
                const itemVND = selectedVariant ? selectedVariant.priceVND : watch.priceVND;
                const itemUSD = selectedVariant ? selectedVariant.priceUSD : watch.priceUSD;

                return (
                <div
                  key={entryKey}
                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-muted/30 border border-border/80"
                >
                  <div className="relative w-14 h-14 rounded-xl bg-black/40 border border-border overflow-hidden shrink-0">
                    <Image
                      src={itemImg}
                      alt={watch.name}
                      fill
                      unoptimized
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (!target.src.includes('submariner-emerald.jpg')) {
                          target.src = '/images/submariner-emerald.jpg';
                        }
                      }}
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-mono uppercase text-[#d4af37]">
                      {watch.brand}
                    </span>
                    <h5 className="font-serif text-xs font-normal text-foreground truncate">
                      {watch.name}
                    </h5>

                    {selectedVariant && (
                      <div className="text-[10px] font-mono text-[#d4af37] truncate mt-0.5">
                        {selectedVariant.mauMatSo} • SKU: {selectedVariant.sku}
                      </div>
                    )}



                    <div className="flex items-center justify-between text-xs font-mono mt-1">
                      <span className="text-muted-foreground">SL: {quantity}</span>
                      <span className="font-semibold text-foreground">
                        {formatPrice(itemUSD * quantity, itemVND * quantity)}
                      </span>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Voucher input form */}
            <div className="pt-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Mã VIP: EMERALD10"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-background border border-border text-xs font-mono uppercase text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#d4af37]"
                  />
                  <FontAwesomeIcon
                    icon={faTag}
                    className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  className="px-4 py-2.5 rounded-xl bg-muted hover:bg-[#d4af37] hover:text-black text-xs font-mono font-semibold transition-colors text-foreground cursor-pointer"
                >
                  Áp Dụng
                </button>
              </div>

              {discountRate > 0 && (
                <div className="mt-2.5 flex items-center justify-between text-xs font-mono text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30">
                  <span className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faGem} className="w-3 h-3 text-[#d4af37]" />
                    <span>Đặc quyền {promoCode}: Giảm 10%</span>
                  </span>
                  <span>-10%</span>
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs font-mono pt-3 border-t border-border">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotalUSD, subtotalVND)}</span>
              </div>
              {discountRate > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Ưu đãi hội viên VIP (-10%)</span>
                  <span>
                    -{formatPrice(subtotalUSD * 0.1, subtotalVND * 0.1)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Vận đơn xe bọc thép có vệ sĩ</span>
                <span className="text-emerald-400 font-semibold">MIỄN PHÍ</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Bảo hiểm rủi ro cỗ máy Thụy Sĩ</span>
                <span className="text-emerald-400 font-semibold">100% Giá trị</span>
              </div>

              <div className="flex justify-between text-base font-serif font-normal text-foreground pt-3 border-t border-border">
                <span>Tổng Thanh Toán</span>
                <span className="text-[#d4af37] font-bold text-lg">
                  {formatPrice(finalSubtotalUSD, finalSubtotalVND)}
                </span>
              </div>
            </div>

            {/* Security Guarantee Note */}
            <div className="p-3 rounded-2xl bg-muted/40 border border-border flex items-center gap-2.5 text-[11px] font-mono text-muted-foreground">
              <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4 text-[#d4af37] shrink-0" />
              <span>Cam kết 100% đồng hồ chính hãng xuất xưởng từ Geneva kèm thẻ bảo hành quốc tế 5 năm.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#c69f2e] to-[#b38f28] text-black font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-[#d4af37]/25 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faLock} className="w-3.5 h-3.5" />
              <span>Xác Nhận Đặt Mua & Khởi Tạo Vận Đơn</span>
              <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
