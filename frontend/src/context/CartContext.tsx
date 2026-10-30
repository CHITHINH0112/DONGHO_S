"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { WatchItem, WatchVariant, WATCHES } from "@/data/watches";
import { watchAudio } from "@/utils/audio";

export type Currency = "VND" | "USD" | "EUR";

export interface CartEntry {
  id?: string;
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
  addToCart: (watch: WatchItem, qty?: number, variant?: WatchVariant | null) => void;
  removeFromCart: (cartEntryId: string) => void;
  updateQuantity: (cartEntryId: string, delta: number) => void;
  clearCart: () => void;
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

  // Load from localStorage on client
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

  const addToCart = (watch: WatchItem, qty = 1, variant?: WatchVariant | null) => {
    watchAudio.click();
    const entryId = variant ? `${watch.id}-var-${variant.id}` : watch.id;
    const existingIndex = cart.findIndex((e) => (e.id || e.watch.id) === entryId);
    let newCart: CartEntry[];
    if (existingIndex > -1) {
      newCart = [...cart];
      newCart[existingIndex].quantity += qty;
    } else {
      newCart = [
        ...cart,
        { id: entryId, watch, quantity: qty, selectedVariant: variant || undefined },
      ];
    }
    saveCart(newCart);
    const variantDesc = variant?.mauMatSo ? ` (${variant.mauMatSo})` : "";
    showToast(`Đã thêm "${watch.name}${variantDesc}" vào giỏ hàng bảo mật.`);
  };

  const removeFromCart = (cartEntryId: string) => {
    watchAudio.click();
    const newCart = cart.filter((e) => (e.id || e.watch.id) !== cartEntryId);
    saveCart(newCart);
  };

  const updateQuantity = (cartEntryId: string, delta: number) => {
    watchAudio.tick();
    const newCart = cart
      .map((e) => {
        if ((e.id || e.watch.id) === cartEntryId) {
          const newQty = e.quantity + delta;
          return newQty > 0 ? { ...e, quantity: newQty } : null;
        }
        return e;
      })
      .filter(Boolean) as CartEntry[];
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
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
    (sum, item) => sum + (item.selectedVariant ? item.selectedVariant.priceVND : item.watch.priceVND) * item.quantity,
    0
  );
  const subtotalUSD = cart.reduce(
    (sum, item) => sum + (item.selectedVariant ? item.selectedVariant.priceUSD : item.watch.priceUSD) * item.quantity,
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
        clearCart,
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
