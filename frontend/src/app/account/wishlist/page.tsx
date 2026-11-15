"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/products");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-xs font-mono text-muted-foreground">
      <span>Đang chuyển hướng đến bộ sưu tập...</span>
    </div>
  );
}
