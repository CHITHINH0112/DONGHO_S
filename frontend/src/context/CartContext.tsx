"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { WatchItem, WatchVariant } from "@/data/watches";
import { watchAudio } from "@/utils/audio";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/axios";
import { normalizeImageUrl } from "@/utils/productMapper";

export type Currency = "VND" | "USD" | "EUR";

export interface CartEntry {
  id?: string;
  backendCartItemId?: number;
  watch: WatchItem;
  quantity: number;
  selectedVariant?: WatchVariant;
  availableVariants?: WatchVariant[];
}

interface CartContextType {
  cart: CartEntry[];
  wishlist: string[];
  compareList: WatchItem[];
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (priceUSD: number, priceVND: number) => string;
  addToCart: (watch: WatchItem, qty?: number, variant?: WatchVariant | null) => Promise<boolean>;
  removeFromCart: (cartEntryId: string) => Promise<void>;
  updateQuantity: (cartEntryId: string, delta: number) => Promise<void>;
  setCartItemQuantity: (cartEntryId: string, quantity: number) => Promise<void>;
  switchVariant: (cartEntryId: string, newVariantId: number | string) => Promise<boolean>;
  clearCart: () => Promise<void>;
  fetchBackendCart: () => Promise<void>;
  toggleWishlist: (watchId: string) => void;
  isInWishlist: (watchId: string) => boolean;
  toggleCompare: (watch: WatchItem) => void;
  removeFromCompare: (watchId: string) => void;
  clearCompare: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;
  selectedWatchModal: WatchItem | null;
  setSelectedWatchModal: (watch: WatchItem | null) => void;
  isVipModalOpen: boolean;
  setIsVipModalOpen: (open: boolean) => void;
  promoCode: string;
  discountRate: number;
  applyPromoCode: (code: string) => boolean;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  totalItems: number;
  subtotalVND: number;
  subtotalUSD: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<WatchItem[]>([]);
  const [currency, setCurrencyState] = useState<Currency>("VND");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedWatchModal, setSelectedWatchModal] = useState<WatchItem | null>(null);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discountRate, setDiscountRate] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Helper chuyển đổi từ DB CartItem sang Frontend CartEntry
  const mapBackendItemToCartEntry = useCallback((item: any): CartEntry => {
    const variant = item.variant;
    const prod = variant?.product;
    const rawImg = variant?.images?.[0]?.imageUrl || prod?.imageUrl || "/images/submariner-emerald.jpg";
    const priceVND = Number(variant?.price || prod?.basePrice || 0);
    const priceUSD = Math.round(priceVND / 25000);

    const availableStock = variant?.serialNumbers && variant.serialNumbers.length > 0
      ? variant.serialNumbers.filter((s: any) => s.status === "available").length
      : 10;

    const variantObj: WatchVariant = {
      id: variant?.id || item.variantId,
      sku: variant?.sku || `BRU-${item.variantId}`,
      priceVND,
      priceUSD,
      mauMatSo: variant?.mauMatSo || "Mặt Số Cổ Điển",
      mauDayDeo: variant?.mauDayDeo || null,
      mauNieng: variant?.mauNieng || null,
      images: [normalizeImageUrl(rawImg)],
      stockCount: availableStock > 0 ? availableStock : 1,
    };

    // Danh sách tất cả các biến thể khả dụng của sản phẩm
    const availableVariants: WatchVariant[] = Array.isArray(prod?.variants) && prod.variants.length > 0
      ? prod.variants.map((v: any) => {
          const vImg = v.images?.[0]?.imageUrl || prod.imageUrl || "/images/submariner-emerald.jpg";
          const vPrice = Number(v.price || prod.basePrice || 0);
          const vStock = v.serialNumbers && v.serialNumbers.length > 0
            ? v.serialNumbers.filter((s: any) => s.status === "available").length
            : 10;
          return {
            id: v.id,
            sku: v.sku || `BRU-${v.id}`,
            priceVND: vPrice,
            priceUSD: Math.round(vPrice / 25000),
            mauMatSo: v.mauMatSo || "Mặt số",
            mauDayDeo: v.mauDayDeo || null,
            mauNieng: v.mauNieng || null,
            images: [normalizeImageUrl(vImg)],
            stockCount: vStock > 0 ? vStock : 1,
          };
        })
      : [variantObj];

    const watchObj: WatchItem = {
      id: String(prod?.id || `watch-${item.variantId}`),
      name: prod?.name || "Đồng Hồ Cơ Khí Chế Tác",
      brand: "BRU_WATCH",
      series: "Haute Horlogerie",
      category: "all",
      priceUSD,
      priceVND,
      image: normalizeImageUrl(rawImg),
      tag: "Chính Hãng Thụy Sỹ",
      rating: 5,
      reviewsCount: 1,
      variants: availableVariants,
      specs: {
        diameter: "40mm",
        thickness: "12mm",
        caseMaterial: "Thép Oystersteel 904L",
        bezel: "Gốm Cerachrom xoay 1 chiều",
        crystal: "Sapphire chống trầy xước",
        movement: "Cơ tự động Thụy Sỹ",
        calibre: "Calibre Cao Cấp",
        jewels: "31 chân kính",
        powerReserve: "70 giờ",
        waterResistance: "300m / 1000ft",
        frequency: "28.800 vph",
        strap: "Thép chống gỉ siêu bền",
        clasp: "Khóa bấm an toàn",
      },
      description: "Tuyệt tác đồng hồ cơ khí tinh xảo đạt chứng nhận bảo mật và độ chính xác cao nhất.",
      highlights: ["Bộ chuyển động cơ khí đạt chuẩn Chronometer", "Vật liệu cao cấp chống ăn mòn nước biển"],
    };

    return {
      id: `${watchObj.id}-var-${variantObj.id}`,
      backendCartItemId: item.id,
      watch: watchObj,
      quantity: Number(item.quantity || 1),
      selectedVariant: variantObj,
      availableVariants,
    };
  }, []);

  // Tải giỏ hàng từ CSDL Backend khi đã đăng nhập
  const fetchBackendCart = useCallback(async () => {
    try {
      const res = await apiClient.get("/cart");
      if (res.data?.success && res.data?.data) {
        const rawItems = res.data.data.items || [];
        const mappedCart: CartEntry[] = rawItems.map(mapBackendItemToCartEntry);
        setCart(mappedCart);
      }
    } catch (err) {
      console.warn("Chưa thể lấy giỏ hàng từ máy chủ:", err);
    }
  }, [mapBackendItemToCartEntry]);

  // Load wishlist và currency từ client localStorage (chỉ lưu sở thích cá nhân, KHÔNG lưu giỏ hàng)
  useEffect(() => {
    try {
      // Xóa vĩnh viễn key giỏ hàng cũ trong localStorage để dứt điểm lỗi lưu rác
      localStorage.removeItem("chrono-cart");

      const savedWishlist = localStorage.getItem("chrono-wishlist");
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedCurr = localStorage.getItem("chrono-curr") as Currency | null;
      if (savedCurr) setCurrencyState(savedCurr);
    } catch {}
  }, []);

  // Tự động đồng bộ giỏ hàng theo trạng thái đăng nhập
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBackendCart();
    } else {
      setCart([]); // Xóa sạch giỏ hàng khỏi RAM khi chưa đăng nhập hoặc vừa đăng xuất
    }
  }, [isAuthenticated, user, fetchBackendCart]);

  const saveWishlist = (newWish: string[]) => {
    setWishlist(newWish);
    try {
      localStorage.setItem("chrono-wishlist", JSON.stringify(newWish));
    } catch {}
  };

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    watchAudio.click();
    try {
      localStorage.setItem("chrono-curr", c);
    } catch {}
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const formatPrice = (priceUSD: number, priceVND: number) => {
    if (currency === "VND") {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(priceVND);
    }
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(priceUSD);
    }
    // EUR (~0.92 USD)
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(priceUSD * 0.92);
  };

  const addToCart = async (watch: WatchItem, qty = 1, variant?: WatchVariant | null): Promise<boolean> => {
    watchAudio.click();

    // RÀNG BUỘC: BẮT BUỘC ĐĂNG NHẬP MỚI ĐƯỢC THÊM VÀO GIỎ HÀNG
    if (!isAuthenticated) {
      openAuthModal("login");
      showToast("Quý khách vui lòng đăng nhập để lưu trữ cỗ máy vào giỏ hàng bảo mật.");
      return false;
    }

    const effectiveVariant = variant || watch.variants?.[0];
    if (!effectiveVariant?.id) {
      showToast("Không tìm thấy thông tin phiên bản đồng hồ hợp lệ.");
      return false;
    }

    // Gửi trực tiếp lên Backend API
    try {
      const res = await apiClient.post("/cart/items", {
        variantId: effectiveVariant.id,
        quantity: qty,
      });

      if (res.data?.success && res.data?.data) {
        const rawItems = res.data.data.items || [];
        const mappedCart: CartEntry[] = rawItems.map(mapBackendItemToCartEntry);
        setCart(mappedCart);

        const variantDesc = effectiveVariant?.mauMatSo ? ` (${effectiveVariant.mauMatSo})` : "";
        showToast(`Đã thêm "${watch.name}${variantDesc}" vào giỏ hàng bảo mật.`);
        return true;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể thêm sản phẩm vào giỏ hàng lúc này.";
      showToast(msg);
      return false;
    }

    return false;
  };

  const removeFromCart = async (cartEntryId: string) => {
    watchAudio.click();
    const targetItem = cart.find((e) => (e.id || e.watch.id) === cartEntryId);
    if (!targetItem) return;

    // Cập nhật optimistic local state trước
    setCart((prev) => prev.filter((e) => (e.id || e.watch.id) !== cartEntryId));

    if (isAuthenticated && targetItem.backendCartItemId) {
      try {
        await apiClient.delete(`/cart/items/${targetItem.backendCartItemId}`);
        showToast("Đã gỡ kiệt tác khỏi giỏ hàng.");
      } catch (err: any) {
        console.warn("Lỗi khi xóa sản phẩm trên backend cart:", err);
        await fetchBackendCart();
      }
    }
  };

  const updateQuantity = async (cartEntryId: string, delta: number) => {
    watchAudio.tick();
    const targetItem = cart.find((e) => (e.id || e.watch.id) === cartEntryId);
    if (!targetItem || !targetItem.backendCartItemId) return;

    const newQty = targetItem.quantity + delta;
    if (newQty <= 0) {
      await removeFromCart(cartEntryId);
      return;
    }

    const availableStock = targetItem.selectedVariant?.stockCount ?? 99;
    if (delta > 0 && availableStock > 0 && newQty > availableStock) {
      showToast(`Kho chỉ còn ${availableStock} sản phẩm khả dụng cho phiên bản này.`);
      return;
    }

    try {
      const res = await apiClient.put(`/cart/items/${targetItem.backendCartItemId}`, {
        quantity: newQty,
      });
      if (res.data?.success && res.data?.data) {
        const rawItems = res.data.data.items || [];
        setCart(rawItems.map(mapBackendItemToCartEntry));
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể cập nhật số lượng.";
      showToast(msg);
      await fetchBackendCart();
    }
  };

  const setCartItemQuantity = async (cartEntryId: string, quantity: number) => {
    watchAudio.tick();
    const targetItem = cart.find((e) => (e.id || e.watch.id) === cartEntryId);
    if (!targetItem || !targetItem.backendCartItemId) return;

    const validQty = Math.max(1, Math.floor(quantity));
    const availableStock = targetItem.selectedVariant?.stockCount ?? 99;
    if (availableStock > 0 && validQty > availableStock) {
      showToast(`Kho chỉ còn ${availableStock} sản phẩm khả dụng cho phiên bản này.`);
      return;
    }

    try {
      const res = await apiClient.put(`/cart/items/${targetItem.backendCartItemId}`, {
        quantity: validQty,
      });
      if (res.data?.success && res.data?.data) {
        const rawItems = res.data.data.items || [];
        setCart(rawItems.map(mapBackendItemToCartEntry));
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể cập nhật số lượng.";
      showToast(msg);
      await fetchBackendCart();
    }
  };

  // Đổi biến thể trực tiếp trong giỏ hàng
  const switchVariant = async (cartEntryId: string, newVariantId: number | string): Promise<boolean> => {
    watchAudio.click();
    if (!isAuthenticated) {
      openAuthModal("login");
      return false;
    }

    const targetItem = cart.find((e) => (e.id || e.watch.id) === cartEntryId);
    if (!targetItem || !targetItem.backendCartItemId) {
      showToast("Không tìm thấy mục tương ứng trong giỏ hàng.");
      return false;
    }

    try {
      const res = await apiClient.put(`/cart/items/${targetItem.backendCartItemId}`, {
        variantId: Number(newVariantId),
      });

      if (res.data?.success && res.data?.data) {
        const rawItems = res.data.data.items || [];
        const mappedCart: CartEntry[] = rawItems.map(mapBackendItemToCartEntry);
        setCart(mappedCart);
        showToast("Đã đổi phiên bản đồng hồ thành công.");
        return true;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Không thể đổi phiên bản lúc này.";
      showToast(msg);
      return false;
    }

    return false;
  };

  const clearCart = async () => {
    watchAudio.ratchet();
    if (isAuthenticated) {
      try {
        await apiClient.delete("/cart");
      } catch (err) {
        console.warn("Lỗi khi dọn giỏ hàng trên backend:", err);
      }
    }
    setCart([]);
  };

  const toggleWishlist = (watchId: string) => {
    watchAudio.click();
    const inWish = wishlist.includes(watchId);
    let newWish: string[];
    if (inWish) {
      newWish = wishlist.filter((id) => id !== watchId);
      showToast("Đã xóa khỏi danh sách yêu thích.");
    } else {
      newWish = [...wishlist, watchId];
      showToast("Đã thêm vào danh sách ước nguyện cá nhân.");
    }
    saveWishlist(newWish);
  };

  const isInWishlist = (watchId: string) => wishlist.includes(watchId);

  const toggleCompare = (watch: WatchItem) => {
    watchAudio.click();
    const exists = compareList.some((w) => w.id === watch.id);
    if (exists) {
      setCompareList(compareList.filter((w) => w.id !== watch.id));
    } else {
      if (compareList.length >= 3) {
        showToast("Chỉ có thể so sánh tối đa 3 mẫu đồng hồ cùng lúc.");
        return;
      }
      setCompareList([...compareList, watch]);
      setIsCompareOpen(true);
    }
  };

  const removeFromCompare = (watchId: string) => {
    setCompareList(compareList.filter((w) => w.id !== watchId));
  };

  const clearCompare = () => {
    setCompareList([]);
    setIsCompareOpen(false);
  };

  const applyPromoCode = (code: string): boolean => {
    watchAudio.ratchet();
    const cleaned = code.trim().toUpperCase();
    if (cleaned === "EMERALD10" || cleaned === "VIP2026") {
      setPromoCode(cleaned);
      setDiscountRate(0.1); // 10% discount
      showToast("Áp dụng mã đặc quyền VIP thành công! Giảm 10%.");
      return true;
    }
    showToast("Mã đặc quyền không hợp lệ hoặc đã hết hạn.");
    return false;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalVND = cart.reduce(
    (sum, item) =>
      sum +
      (item.selectedVariant ? item.selectedVariant.priceVND : item.watch.priceVND) *
        item.quantity,
    0
  );
  const subtotalUSD = cart.reduce(
    (sum, item) =>
      sum +
      (item.selectedVariant ? item.selectedVariant.priceUSD : item.watch.priceUSD) *
        item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        compareList,
        currency,
        setCurrency,
        formatPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        setCartItemQuantity,
        switchVariant,
        clearCart,
        fetchBackendCart,
        toggleWishlist,
        isInWishlist,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        isCartOpen,
        setIsCartOpen,
        isCompareOpen,
        setIsCompareOpen,
        selectedWatchModal,
        setSelectedWatchModal,
        isVipModalOpen,
        setIsVipModalOpen,
        promoCode,
        discountRate,
        applyPromoCode,
        toastMessage,
        showToast,
        totalItems,
        subtotalVND,
        subtotalUSD,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
