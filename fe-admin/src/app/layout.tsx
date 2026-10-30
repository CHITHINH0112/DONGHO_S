import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";

config.autoAddCss = false;

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BRU_WATCH Management Portal | Hệ Thống Quản Trị Đồng Hồ Xa Xỉ",
  description: "Cổng quản trị cao cấp dành cho cửa hàng đồng hồ Thụy Sĩ: Rolex, Patek Philippe, Audemars Piguet",
};

import { AdminAuthProvider } from "@/context/AdminAuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${playfair.variable} ${jakarta.variable} dark`}>
      <body className="min-h-screen bg-[#070e0a] text-[#f4f6f5] font-sans antialiased selection:bg-[#d4af37]/20 selection:text-[#d4af37]">
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </body>
    </html>
  );
}
