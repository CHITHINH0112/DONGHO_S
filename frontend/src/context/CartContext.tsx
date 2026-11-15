"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { WatchItem, WatchVariant, WATCHES } from "@/data/watches";
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
}

interface CartContextType {
  cart: CartEntry[];
  wishlist: string[];
  compareList: WatchItem[];
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (priceUSD: number, priceVND: number) => string;
  addToCart: (watch: WatchItem, qty?: number, variant?: WatchVariant | null) => Promise<boolean> | void;
  removeFromCart: (cartEntryId: string) => Promise<void> | void;
  updateQuantity: (cartEntryId: string, delta: number) => Promise<void> | void;
  setCartItemQuantity: (cartEntryId: string, quantity: number) => Promise<void> | void;
  clearCart: () => Promise<void> | void;
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
  const { user, isAuthenticated } = useAuth();
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

  // Tham chiếu để tránh loop đồng bộ khi user đăng nhập
  const hasSyncedRef = useRef(false);

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
      variants: [variantObj],
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
    };
  }, []);

  // Tải giỏ hàng từ CSDL Backend
  const fetchBackendCart = useCallback(async () => {
    try {
      const res = await apiClient.get("/cart");
      if (res.data?.success && res.data?.data) {
        const rawItems = res.data.data.items || [];
        const mappedCart: CartEntry[] = rawItems.map(mapBackendItemToCartEntry);
        setCart(mappedCart);
        try {
          localStorage.setItem("chrono-cart", JSON.stringify(mappedCart));
        } catch {}
      }
    } catch (err) {
      console.warn("Chưa thể lấy giỏ hàng từ máy chủ:", err);
    }
  }, [mapBackendItemToCartEntry]);

  // Load from localStorage on client first
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("chrono-cart");
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem("chrono-wishlist");
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedCurr = localStorage.getItem("chrono-curr") as Currency | null;
      if (savedCurr) setCurrencyState(savedCurr);
    } catch {
      // Fallback
    }
  }, []);

  // Tự động đồng bộ giỏ hàng khi người dùng đăng nhập
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!hasSyncedRef.current) {
        hasSyncedRef.current = true;
        const syncUserCart = async () => {
          // Lấy hàng từ local hiện có
          const localCartStr = localStorage.getItem("chrono-cart");
          let localItems: CartEntry[] = [];
          try {
            if (localCartStr) localItems = JSON.parse(localCartStr);
          } catch {}

          // Tải giỏ hàng từ backend
          try {
            const res = await apiClient.get("/cart");
            const backendItems = res.data?.data?.items || [];

            // Nếu trong local có item chưa được đưa lên backend, gửi lên
            if (localItems.length > 0) {
              for (const item of localItems) {
                const targetVarId = item.selectedVariant?.id || item.watch.variants?.[0]?.id;
                if (targetVarId) {
                  const alreadyInBackend = backendItems.some(
                    (bi: any) => bi.variantId === targetVarId || bi.variant?.id === targetVarId
                  );
                  if (!alreadyInBackend) {
                    await apiClient.post("/cart/items", {
                      variantId: targetVarId,
                      quantity: item.quantity,
                    }).catch(() => {});
                  }
                }
              }
            }
            // Fetch lại giỏ hàng đầy đủ từ backend
            await fetchBackendCart();
          } catch {
            await fetchBackendCart();
          }
        };

        syncUserCart();
      }
    } else {
      hasSyncedRef.current = false;
    }
  }, [isAuthenticated, user, fetchBackendCart]);

  const saveCart = (newCart: CartEntry[]) => {
    setCart(newCart);
    try {
      localStorage.setItem("chrono-cart", JSON.stringify(newCart));
    } catch {}
  };

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

  const addToCart = async (watch: WatchItem, qty = 1, variant?: WatchVariant | null) => {
    watchAudio.click();
    const effectiveVariant = variant || watch.variants?.[0];
    const entryId = effectiveVariant ? `${watch.id}-var-${effectiveVariant.id}` : watch.id;
    const existingIndex = cart.findIndex((e) => (e.id || e.watch.id) === entryId);

    // Kiểm tra tồn kho khả dụng
    const availableStock = effectiveVariant?.stockCount ?? 99;
    const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;
    if (availableStock > 0 && currentQtyInCart + qty > availableStock) {
      showToast(`Kho chỉ còn ${availableStock} sản phẩm khả dụng cho phiên bản này.`);
      return false;
    }

    let newCart: CartEntry[];
    if (existingIndex > -1) {
      newCart = [...cart];
      newCart[existingIndex].quantity += qty;
    } else {
      newCart = [
        ...cart,
        { id: entryId, watch, quantity: qty, selectedVariant: effectiveVariant || undefined },
      ];
    }
    saveCart(newCart);

    const variantDesc = effectiveVariant?.mauMatSo ? ` (${effectiveVariant.mauMatSo})` : "";
    showToast(`Đã thêm "${watch.name}${variantDesc}" vào giỏ hàng bảo mật.`);

    // Nếu đã đăng nhập, gửi đồng bộ lên Backend API
    if (isAuthenticated && effectiveVariant?.id) {
      try {
        const res = await apiClient.post("/cart/items", {
          variantId: effectiveVariant.id,
          quantity: qty,
        });
        if (res.data?.success && res.data?.data) {
          const rawItems = res.data.data.items || [];
          const mappedCart: CartEntry[] = rawItems.map(mapBackendItemToCartEntry);
          saveCart(mappedCart);
        }
      } catch (err: any) {
        const msg = err.response?.data?.message;
        if (msg) showToast(msg);
      }
    }

    return true;
  };

  const removeFromCart = async (cartEntryId: string) => {
    watchAudio.click();
    const targetItem = cart.find((e) => (e.id || e.watch.id) === cartEntryId);
    const newCart = cart.filter((e) => (e.id || e.watch.id) !== cartEntryId);
    saveCart(newCart);

    // Nếu đã đăng nhập, xóa trên backend API
    if (isAuthenticated && targetItem?.backendCartItemId) {
      try {
        await apiClient.delete(`/cart/items/${targetItem.backendCartItemId}`);
      } catch (err) {
        console.warn("Lỗi khi xóa sản phẩm trên backend cart:", err);
      }
    }
  };

  const updateQuantity = async (cartEntryId: string, delta: number) => {
    watchAudio.tick();
    const targetItem = cart.find((e) => (e.id || e.watch.id) === cartEntryId);
    if (!targetItem) return;

    const newQty = targetItem.quantity + delta;

    // Kiểm tra tồn kho
    const availableStock = targetItem.selectedVariant?.stockCount ?? 99;
    if (delta > 0 && availableStock > 0 && newQty > availableStock) {
      showToast(`Kho chỉ còn ${availableStock} sản phẩm khả dụng cho phiên bản này.`);
      return;
    }

    if (newQty <= 0) {
      removeFromCart(cartEntryId);
      return;
    }

    const newCart = cart.map((e) =>
      (e.id || e.watch.id) === cartEntryId ? { ...e, quantity: newQty } : e
    );
    saveCart(newCart);

    // Nếu đã đăng nhập, cập nhật backend API
    if (isAuthenticated && targetItem.backendCartItemId) {
      try {
        await apiClient.put(`/cart/items/${targetItem.backendCartItemId}`, {
          quantity: newQty,
        });
      } catch (err: any) {
        const msg = err.response?.data?.message;
        if (msg) showToast(msg);
      }
    }
  };

  const setCartItemQuantity = async (cartEntryId: string, quantity: number) => {
    watchAudio.tick();
    const targetItem = cart.find((e) => (e.id || e.watch.id) === cartEntryId);
    if (!targetItem) return;

    const validQty = Math.max(1, Math.floor(quantity));
    const availableStock = targetItem.selectedVariant?.stockCount ?? 99;
    if (availableStock > 0 && validQty > availableStock) {
      showToast(`Kho chỉ còn ${availableStock} sản phẩm khả dụng cho phiên bản này.`);
      return;
    }

    const newCart = cart.map((e) =>
      (e.id || e.watch.id) === cartEntryId ? { ...e, quantity: validQty } : e
    );
    saveCart(newCart);

    if (isAuthenticated && targetItem.backendCartItemId) {
      try {
        await apiClient.put(`/cart/items/${targetItem.backendCartItemId}`, {
          quantity: validQty,
        });
      } catch (err: any) {
        const msg = err.response?.data?.message;
        if (msg) showToast(msg);
      }
    }
  };

  const clearCart = async () => {
    saveCart([]);
    if (isAuthenticated) {
      try {
        await apiClient.delete("/cart");
      } catch (err) {
        console.warn("Lỗi khi dọn giỏ hàng trên backend:", err);
      }
    }
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
