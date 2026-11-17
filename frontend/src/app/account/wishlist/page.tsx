"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AccountNav from "@/components/AccountNav";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { WATCHES, WatchItem } from "@/data/watches";
import { apiClient } from "@/lib/axios";
import { mapDbProductToWatchItem, normalizeImageUrl } from "@/utils/productMapper";
import { watchAudio } from "@/utils/audio";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faTrashCan,
  faBagShopping,
  faArrowRight,
  faShieldHalved,
  faCertificate,
  faGem,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlist, toggleWishlist, addToCart, formatPrice, showToast } = useCart();
  const [allWatches, setAllWatches] = useState<WatchItem[]>(WATCHES);
  const [loading, setLoading] = useState<boolean>(true);

  // Tải danh sách sản phẩm từ backend MySQL
  useEffect(() => {
    const fetchWatches = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/watches");
        if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          const mapped = res.data.data.map(mapDbProductToWatchItem);
          setAllWatches(mapped);
        }
      } catch {
        // Dùng fallback WATCHES
        setAllWatches(WATCHES);
      } finally {
        setLoading(false);
      }
    };

    fetchWatches();
  }, []);

  // Lọc các sản phẩm nằm trong danh sách wishlist
  const wishlistItems = allWatches.filter((w) => wishlist.includes(String(w.id)));

  const handleAddToCart = (watch: WatchItem) => {
    watchAudio.click();
    addToCart(watch, 1, watch.variants?.[0]);
    showToast(`Đã thêm ${watch.name} vào giỏ hàng VIP.`);
  };

  const handleRemoveFromWishlist = (watchId: string, watchName: string) => {
    watchAudio.ratchet();
    toggleWishlist(watchId);
    showToast(`Đã bỏ lưu tâm: ${watchName}`);
  };

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-8 max-w-7xl mx-auto selection:bg-[#006039] selection:text-white">
      <AccountNav />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#d4af37]/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#d4af37] font-semibold">
              PRIVATE CONCIERGE WISHLIST
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-stone-300">
              {wishlistItems.length} Kiệt Tác
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-light text-stone-100 mt-1">
            Danh Mục Kiệt Tác Lưu Tâm
          </h1>
          <p className="text-xs text-stone-400 font-light mt-1">
            Bộ sưu tập đồng hồ cơ khí cao cấp được Quý khách tuyển chọn và quan tâm đặc biệt
          </p>
        </div>

        {wishlistItems.length > 0 && (
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-stone-300 hover:text-white transition-all self-start sm:self-auto"
          >
            <span>Thưởng lãm thêm kiệt tác</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-4">
          <FontAwesomeIcon icon={faSpinner} className="text-3xl text-[#d4af37] animate-spin" />
          <p className="text-xs font-mono text-stone-400">Đang đồng bộ danh mục lưu tâm...</p>
        </div>
      ) : wishlistItems.length === 0 ? (
        /* Empty State */
        <div className="py-20 px-6 rounded-3xl bg-[#08120d] border border-white/[0.08] text-center max-w-2xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-stone-600 text-2xl mx-auto">
            <FontAwesomeIcon icon={faHeart} />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-serif text-xl font-light text-stone-200">
              Danh Mục Lưu Tâm Đang Trống
            </h3>
            <p className="text-xs text-stone-400 font-light max-w-md mx-auto leading-relaxed">
              Quý khách chưa lưu tâm kiệt tác nào. Hãy thưởng lãm bộ sưu tập Haute Horlogerie độc bản của BRU_WATCH và bấm biểu tượng trái tim để lưu lại.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b38f28] hover:from-[#e5c158] hover:to-[#c49e35] text-black font-mono font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-[#d4af37]/25 transition-all"
          >
            <FontAwesomeIcon icon={faGem} className="text-xs" />
            <span>Khám Phá Kiệt Tác Ngay</span>
          </Link>
        </div>
      ) : (
        /* Wishlist Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((watch) => {
            const rawImg = watch.image || watch.variants?.[0]?.images?.[0] || "/images/submariner-emerald.jpg";
            const imgUrl = normalizeImageUrl(rawImg);

            return (
              <div
                key={watch.id}
                className="group rounded-3xl bg-[#08120d] border border-white/[0.08] hover:border-[#d4af37]/40 transition-all duration-300 p-6 flex flex-col justify-between space-y-5 hover:shadow-2xl hover:shadow-[#d4af37]/5"
              >
                {/* Top Badge & Remove Action */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-1 rounded-full border border-[#d4af37]/20">
                    {watch.brand}
                  </span>
                  <button
                    onClick={() => handleRemoveFromWishlist(watch.id, watch.name)}
                    className="w-8 h-8 rounded-full bg-white/[0.03] hover:bg-rose-500/10 text-stone-400 hover:text-rose-400 border border-white/[0.06] hover:border-rose-500/30 flex items-center justify-center transition-all cursor-pointer"
                    title="Bỏ lưu tâm"
                  >
                    <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                  </button>
                </div>

                {/* Watch Image */}
                <Link
                  href={`/products/${watch.id}`}
                  className="relative w-full aspect-square rounded-2xl bg-black/50 border border-white/[0.04] overflow-hidden flex items-center justify-center p-6 group-hover:border-[#d4af37]/20 transition-all"
                >
                  <Image
                    src={imgUrl}
                    alt={watch.name}
                    fill
                    unoptimized
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                {/* Details */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block">
                    {watch.series || "Haute Horlogerie"}
                  </span>
                  <Link
                    href={`/products/${watch.id}`}
                    className="font-serif text-base font-normal text-stone-100 group-hover:text-[#d4af37] transition-colors line-clamp-1 block"
                  >
                    {watch.name}
                  </Link>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="font-serif text-base font-semibold text-[#d4af37]">
                      {formatPrice(watch.priceUSD, watch.priceVND)}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <FontAwesomeIcon icon={faCertificate} className="text-[9px]" />
                      <span>Niêm phong chính hãng</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/[0.06]">
                  <Link
                    href={`/products/${watch.id}`}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-stone-300 hover:text-white flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <span>Xem Chi Tiết</span>
                  </Link>

                  <button
                    onClick={() => handleAddToCart(watch)}
                    className="px-4 py-2.5 rounded-xl bg-[#006039] hover:bg-[#007a48] text-white text-xs font-mono font-semibold flex items-center justify-center gap-1.5 shadow-md hover:shadow-emerald-900/40 transition-all cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faBagShopping} className="text-xs" />
                    <span>Thêm Giỏ</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
