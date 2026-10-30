import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { WATCHES, WatchItem } from "@/data/watches";
import ProductDetailView from "@/components/ProductDetailView";
import { mapDbProductToWatchItem } from "@/utils/productMapper";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchWatchByIdOrSlug(idOrSlug: string): Promise<WatchItem | null> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000';
    const res = await fetch(`${backendUrl}/api/v1/products/${idOrSlug}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.success && json?.data) {
        return mapDbProductToWatchItem(json.data);
      }
    }
  } catch (err) {
    // API server offline or network issue
  }

  // Fallback to static mock watches
  const staticMatch = WATCHES.find((w) => w.id === idOrSlug);
  return staticMatch || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const watch = await fetchWatchByIdOrSlug(id);

  if (!watch) {
    return {
      title: "Không Tìm Thấy Kiệt Tác | BRU_WATCH",
      description: "Mẫu đồng hồ không tồn tại trong danh mục bảo tàng.",
    };
  }

  return {
    title: `${watch.name} - ${watch.brand} | BRU_WATCH`,
    description: `${watch.description.slice(0, 160)}... Chính hãng Thụy Sĩ, bảo hành 5 năm toàn cầu.`,
  };
}

async function ProductDetailContent({ params }: PageProps) {
  const { id } = await params;
  const watch = await fetchWatchByIdOrSlug(id);

  if (!watch) {
    notFound();
  }

  return <ProductDetailView watch={watch} />;
}

export default function ProductDetailPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-[#d4af37] font-mono text-xs">
          <span>Đang tải thông số cỗ máy kiệt tác...</span>
        </div>
      }
    >
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
