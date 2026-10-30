"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { WatchItem, WatchVariant, WATCHES } from "@/data/watches";
import { watchAudio } from "@/utils/audio";
import apiClient from "@/lib/axios";

export type VipTier = "Emerald VIP" | "Platinum Elite" | "Diamond Solitaire";

export interface UserAddress {
  id: string;
  receiverName: string;
  phone: string;
  address: string;
  city: string;
  isDefault: boolean;
  tag: "Tư gia" | "Dinh thự" | "Văn phòng VIP";
}

export interface UserOrder {
  id: string;
  createdAt: string;
  items: {
    watch: WatchItem;
    quantity: number;
    serialNumber: string;
    variant?: WatchVariant;
  }[];
  totalVND: number;
  totalUSD: number;
  status: "pending" | "confirmed" | "armored_transit" | "delivered" | "cancelled";
  paymentMethod: "bank_transfer_qr" | "armored_cod" | "credit_card";
  paymentStatus: "paid" | "pending";
  shippingAddress: UserAddress;
  armoredTrackingCode: string;
  securityGuardNotes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  vipTier: VipTier;
  privilegeCardNumber: string;
  memberSince: string;
  spendingTotalVND: number;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  addresses: UserAddress[];
  orders: UserOrder[];
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register";
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, phone: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (data: { email?: string; name?: string; credential?: string; googleId?: string; avatar?: string; accessToken?: string; idToken?: string }) => Promise<{ success: boolean; message?: string }>;
  openGoogleOAuthPopup: () => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  addAddress: (addr: Omit<UserAddress, "id">) => Promise<void> | void;
  updateAddress: (id: string, addr: Partial<UserAddress>) => Promise<void> | void;
  deleteAddress: (id: string) => Promise<void> | void;
  setDefaultAddress: (id: string) => Promise<void> | void;
  fetchUserAddresses: (userId?: string) => Promise<UserAddress[] | void>;
  createOrder: (order: {
    items: { watch: WatchItem; quantity: number }[];
    totalVND: number;
    totalUSD: number;
    paymentMethod: "bank_transfer_qr" | "armored_cod" | "credit_card";
    shippingAddress: UserAddress;
  }) => UserOrder;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  // Hàm tải danh sách địa chỉ từ CSDL MySQL của riêng tài khoản đó
  const fetchUserAddresses = async (userId?: string) => {
    try {
      const res = await apiClient.get("/user-addresses");
      const list = res.data?.data;
      if (Array.isArray(list)) {
        const mapped: UserAddress[] = list.map((item: any) => ({
          id: String(item.id),
          receiverName: item.receiverName || item.receiver_name || "",
          phone: item.phone || "",
          address: item.address || "",
          city: item.address?.includes("Hà Nội") ? "Hà Nội" : "TP. Hồ Chí Minh",
          isDefault: Boolean(item.isDefault ?? item.is_default),
          tag: item.address?.includes("Công ty") || item.address?.includes("Tòa nhà") || item.address?.includes("Bitexco")
            ? "Văn phòng VIP"
            : item.address?.includes("Nhà riêng")
            ? "Tư gia"
            : "Dinh thự",
        }));
        setAddresses(mapped);
        if (userId) {
          try {
            localStorage.setItem(`mdm_user_addresses_${userId}`, JSON.stringify(mapped));
          } catch {}
        }
        return mapped;
      }
    } catch (err) {
      console.warn("Chưa thể đồng bộ địa chỉ từ MySQL:", err);
      if (userId) {
        try {
          const cached = localStorage.getItem(`mdm_user_addresses_${userId}`);
          if (cached) {
            setAddresses(JSON.parse(cached));
            return JSON.parse(cached);
          }
        } catch {}
      }
      setAddresses([]);
    }
  };

  // Load from localStorage on mount & clean up legacy mock users
  useEffect(() => {
    try {
      // Xóa bỏ key mdm_user_addresses dùng chung trước đây để loại bỏ việc lưu trùng địa chỉ
      localStorage.removeItem("mdm_user_addresses");

      const savedToken = localStorage.getItem("customer_token");
      const savedUser = localStorage.getItem("mdm_auth_user");

      if (savedToken && savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.email === "alexander.vu@maison.ch" || parsed.id === "USR-VIP-8899") {
          localStorage.removeItem("customer_token");
          localStorage.removeItem("customer_refresh_token");
          localStorage.removeItem("mdm_auth_user");
          setUser(null);
          setToken(null);
          setAddresses([]);
        } else {
          setToken(savedToken);
          setUser(parsed);
          // Tải địa chỉ chính chủ từ MySQL theo token của người dùng hiện tại
          fetchUserAddresses(parsed.id);
        }
      } else {
        setUser(null);
        setToken(null);
        setAddresses([]);
      }

      const savedOrders = localStorage.getItem("mdm_user_orders");
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        setOrders([]);
      }
    } catch {
      setUser(null);
      setToken(null);
      setAddresses([]);
    }
  }, []);

  const saveUser = (u: UserProfile | null) => {
    setUser(u);
    try {
      if (u) {
        localStorage.setItem("mdm_auth_user", JSON.stringify(u));
      } else {
        localStorage.removeItem("mdm_auth_user");
      }
    } catch {}
  };

  const saveOrders = (list: UserOrder[]) => {
    setOrders(list);
    try {
      localStorage.setItem("mdm_user_orders", JSON.stringify(list));
    } catch {}
  };

  const openAuthModal = (mode: "login" | "register" = "login") => {
    watchAudio.click();
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    watchAudio.click();
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; message?: string }> => {
    watchAudio.chime();
    try {
      const res = await apiClient.post("/auth/login", {
        email: email.trim(),
        password: pass,
      });
      const data = res.data?.data;
      const accessToken = data?.accessToken || data?.token;
      const refreshToken = data?.refreshToken;

      if (accessToken) {
        setToken(accessToken);
        localStorage.setItem("customer_token", accessToken);
        if (refreshToken) {
          localStorage.setItem("customer_refresh_token", refreshToken);
        }
        const account = data.account || {};
        const loggedUser: UserProfile = {
          id: String(account.id || Date.now()),
          name: account.name || email.split("@")[0],
          email: account.email || email,
          phone: account.phone || "",
          vipTier: "Emerald VIP",
          privilegeCardNumber: `MDM-EME-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          memberSince: account.createdAt
            ? new Date(account.createdAt).toLocaleDateString("vi-VN", { month: "long", year: "numeric" })
            : "Hôm nay",
          spendingTotalVND: 0,
        };
        saveUser(loggedUser);

        // Tải danh sách địa chỉ riêng của tài khoản này từ CSDL MySQL
        await fetchUserAddresses(loggedUser.id);

        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, message: "Không nhận được phản hồi hợp lệ từ máy chủ." };
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.";
      return { success: false, message: errorMsg };
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    pass: string
  ): Promise<{ success: boolean; message?: string }> => {
    watchAudio.chime();
    try {
      const res = await apiClient.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        phone: phone ? phone.trim() : undefined,
        password: pass,
      });
      const data = res.data?.data;
      const accessToken = data?.accessToken || data?.token;
      const refreshToken = data?.refreshToken;

      if (accessToken) {
        setToken(accessToken);
        localStorage.setItem("customer_token", accessToken);
        if (refreshToken) {
          localStorage.setItem("customer_refresh_token", refreshToken);
        }
        const userItem = data.user || {};
        const newUser: UserProfile = {
          id: String(userItem.id || Date.now()),
          name: userItem.name || name.trim(),
          email: userItem.email || email.trim(),
          phone: userItem.phone || phone.trim() || "",
          vipTier: "Emerald VIP",
          privilegeCardNumber: `MDM-EME-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          memberSince: "Hôm nay",
          spendingTotalVND: 0,
        };
        saveUser(newUser);

        // Khởi tạo danh sách địa chỉ rỗng cho tài khoản mới
        setAddresses([]);

        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, message: "Đăng ký không thành công. Vui lòng thử lại." };
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";
      return { success: false, message: errorMsg };
    }
  };

  const loginWithGoogle = async (
    googleData: { email?: string; name?: string; credential?: string; googleId?: string; avatar?: string; accessToken?: string; idToken?: string }
  ): Promise<{ success: boolean; message?: string }> => {
    watchAudio.chime();
    try {
      const res = await apiClient.post("/auth/google", googleData);
      const data = res.data?.data;
      const accessToken = data?.accessToken || data?.token;
      const refreshToken = data?.refreshToken;

      if (accessToken) {
        setToken(accessToken);
        localStorage.setItem("customer_token", accessToken);
        if (refreshToken) {
          localStorage.setItem("customer_refresh_token", refreshToken);
        }
        const account = data.account || data.user || {};
        const loggedUser: UserProfile = {
          id: String(account.id || Date.now()),
          name: account.name || googleData.name || "Quý Khách Google VIP",
          email: account.email || googleData.email || "",
          phone: account.phone || "",
          vipTier: "Emerald VIP",
          privilegeCardNumber: `MDM-EME-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          memberSince: account.createdAt
            ? new Date(account.createdAt).toLocaleDateString("vi-VN", { month: "long", year: "numeric" })
            : "Hôm nay",
          spendingTotalVND: 0,
        };
        saveUser(loggedUser);

        // Tải danh sách địa chỉ của tài khoản Google này từ MySQL
        await fetchUserAddresses(loggedUser.id);

        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, message: "Không nhận được phản hồi hợp lệ từ máy chủ." };
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Đăng nhập bằng Google thất bại. Vui lòng thử lại.";
      return { success: false, message: errorMsg };
    }
  };

  const openGoogleOAuthPopup = (): Promise<{ success: boolean; message?: string }> => {
    watchAudio.click();
    return new Promise((resolve) => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId || clientId.trim() === "" || clientId.includes("watchshopluxury2026")) {
        resolve({
          success: false,
          message: "Chưa thiết lập NEXT_PUBLIC_GOOGLE_CLIENT_ID trong file frontend/.env.local. Vui lòng tạo Client ID trên Google Cloud Console theo hướng dẫn.",
        });
        return;
      }

      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scope = encodeURIComponent("openid email profile");
      const nonce = Math.random().toString(36).substring(2);

      const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token id_token&scope=${scope}&nonce=${nonce}&prompt=select_account`;

      const width = 500;
      const height = 620;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        googleOAuthUrl,
        "GoogleSignInPopup",
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );

      if (!popup) {
        resolve({
          success: false,
          message: "Trình duyệt đã chặn cửa sổ Popup. Vui lòng cho phép popup để tiếp tục đăng nhập với Google.",
        });
        return;
      }

      let isResolved = false;

      const messageListener = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
          isResolved = true;
          window.removeEventListener("message", messageListener);
          const { accessToken, idToken } = event.data;
          const loginRes = await loginWithGoogle({ accessToken, idToken });
          resolve(loginRes);
        } else if (event.data?.type === "GOOGLE_AUTH_ERROR") {
          isResolved = true;
          window.removeEventListener("message", messageListener);
          resolve({
            success: false,
            message: event.data.message || "Đăng nhập Google thất bại hoặc bị hủy.",
          });
        }
      };

      window.addEventListener("message", messageListener);

      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          window.removeEventListener("message", messageListener);
          if (!isResolved) {
            setTimeout(() => {
              resolve({
                success: false,
                message: "Cửa sổ xác thực Google đã được đóng.",
              });
            }, 300);
          }
        }
      }, 1000);
    });
  };

  const logout = () => {
    watchAudio.ratchet();
    setToken(null);
    try {
      localStorage.removeItem("customer_token");
      localStorage.removeItem("customer_refresh_token");
      localStorage.removeItem("mdm_auth_user");
      localStorage.removeItem("mdm_user_addresses");
    } catch {}
    saveUser(null);
    // RESET HOÀN TOÀN ĐỊA CHỈ VÀ ĐƠN HÀNG TRÁNH LƯU VẾT CHO TÀI KHOẢN SAU
    setAddresses([]);
    setOrders([]);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    saveUser(updated);
  };

  const addAddress = async (addr: Omit<UserAddress, "id">) => {
    watchAudio.click();
    try {
      const fullAddress = addr.city && !addr.address.includes(addr.city)
        ? `${addr.address}, ${addr.city}`
        : addr.address;

      await apiClient.post("/user-addresses", {
        receiverName: addr.receiverName,
        phone: addr.phone,
        address: fullAddress,
        isDefault: addr.isDefault || addresses.length === 0,
      });

      if (user) {
        await fetchUserAddresses(user.id);
        return;
      }
    } catch (err: any) {
      console.error("Lỗi gửi địa chỉ tới máy chủ:", err);
    }

    // Fallback nếu API ngoại lệ
    const newId = `ADDR-${Date.now()}`;
    let newAddresses: UserAddress[];
    if (addr.isDefault || addresses.length === 0) {
      newAddresses = addresses.map((a) => ({ ...a, isDefault: false }));
      newAddresses.push({ ...addr, id: newId, isDefault: true });
    } else {
      newAddresses = [...addresses, { ...addr, id: newId }];
    }
    setAddresses(newAddresses);
    if (user) {
      try {
        localStorage.setItem(`mdm_user_addresses_${user.id}`, JSON.stringify(newAddresses));
      } catch {}
    }
  };

  const updateAddress = async (id: string, addr: Partial<UserAddress>) => {
    watchAudio.click();
    try {
      const numericId = !isNaN(Number(id)) ? Number(id) : null;
      if (numericId) {
        await apiClient.put(`/user-addresses/${numericId}`, {
          receiverName: addr.receiverName,
          phone: addr.phone,
          address: addr.address,
          isDefault: addr.isDefault,
        });
        if (user) {
          await fetchUserAddresses(user.id);
          return;
        }
      }
    } catch (err: any) {
      console.error("Lỗi cập nhật địa chỉ:", err);
    }

    // Fallback
    const newAddresses = addresses.map((a) => {
      if (a.id === id) {
        return { ...a, ...addr };
      }
      if (addr.isDefault) {
        return { ...a, isDefault: false };
      }
      return a;
    });
    setAddresses(newAddresses);
    if (user) {
      try {
        localStorage.setItem(`mdm_user_addresses_${user.id}`, JSON.stringify(newAddresses));
      } catch {}
    }
  };

  const deleteAddress = async (id: string) => {
    watchAudio.tick();
    try {
      const numericId = !isNaN(Number(id)) ? Number(id) : null;
      if (numericId) {
        await apiClient.delete(`/user-addresses/${numericId}`);
        if (user) {
          await fetchUserAddresses(user.id);
          return;
        }
      }
    } catch (err: any) {
      console.error("Lỗi xóa địa chỉ:", err);
    }

    // Fallback
    const filtered = addresses.filter((a) => a.id !== id);
    if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
      filtered[0].isDefault = true;
    }
    setAddresses(filtered);
    if (user) {
      try {
        localStorage.setItem(`mdm_user_addresses_${user.id}`, JSON.stringify(filtered));
      } catch {}
    }
  };

  const setDefaultAddress = async (id: string) => {
    watchAudio.click();
    try {
      const numericId = !isNaN(Number(id)) ? Number(id) : null;
      if (numericId) {
        await apiClient.put(`/user-addresses/${numericId}`, {
          isDefault: true,
        });
        if (user) {
          await fetchUserAddresses(user.id);
          return;
        }
      }
    } catch (err: any) {
      console.error("Lỗi đặt địa chỉ mặc định:", err);
    }

    // Fallback
    const newAddresses = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(newAddresses);
    if (user) {
      try {
        localStorage.setItem(`mdm_user_addresses_${user.id}`, JSON.stringify(newAddresses));
      } catch {}
    }
  };

  const createOrder = (orderData: {
    items: { watch: WatchItem; quantity: number }[];
    totalVND: number;
    totalUSD: number;
    paymentMethod: "bank_transfer_qr" | "armored_cod" | "credit_card";
    shippingAddress: UserAddress;
  }): UserOrder => {
    watchAudio.chime();
    const newOrderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timeFormatted = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}, ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const serialPrefix = ["CHRONO", "TOURBILLON", "CALIBRE", "GENEVE"];

    const orderItems = orderData.items.map((item, idx) => ({
      watch: item.watch,
      quantity: item.quantity,
      serialNumber: `${item.watch.brand.slice(0, 3).toUpperCase()}-${serialPrefix[idx % serialPrefix.length]}-${Math.floor(10000 + Math.random() * 90000)}-CH`,
    }));

    const newOrder: UserOrder = {
      id: newOrderId,
      createdAt: timeFormatted,
      items: orderItems,
      totalVND: orderData.totalVND,
      totalUSD: orderData.totalUSD,
      status: "pending",
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentMethod === "bank_transfer_qr" ? "pending" : "pending",
      shippingAddress: orderData.shippingAddress,
      armoredTrackingCode: `BRINKS-SEC-${Math.floor(1000 + Math.random() * 9000)}VN`,
      securityGuardNotes: "Đang phân bổ xe bọc thép chuyên dụng và đội bảo an bàn giao tận tay.",
    };

    const updatedOrders = [newOrder, ...orders];
    saveOrders(updatedOrders);

    // Update user spending
    if (user) {
      updateProfile({
        spendingTotalVND: user.spendingTotalVND + orderData.totalVND,
      });
    }

    return newOrder;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        addresses,
        orders,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        loginWithGoogle,
        openGoogleOAuthPopup,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        fetchUserAddresses,
        createOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
