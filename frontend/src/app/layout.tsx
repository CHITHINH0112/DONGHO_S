import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetailModal from "@/components/ProductDetailModal";
import CartDrawer from "@/components/CartDrawer";
import WatchCompareModal from "@/components/WatchCompareModal";
import VipBookingModal from "@/components/VipBookingModal";
import AuthModal from "@/components/AuthModal";
import LuxuryToast from "@/components/LuxuryToast";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BRU_WATCH | Boutique Đồng Hồ Xa Xỉ Thụy Sĩ Chính Hãng",
  description:
    "Boutique phân phối đồng hồ xa xỉ chính hãng hàng đầu Thụy Sĩ: Rolex, Audemars Piguet, Patek Philippe, Vacheron Constantin. Trải nghiệm giải phẫu 3D và phòng chờ VIP.",
  keywords: [
    "đồng hồ thụy sĩ chính hãng",
    "bru_watch",
    "rolex chính hãng",
    "audemars piguet",
    "patek philippe",
    "đồng hồ xa xỉ hà nội",
    "đồng hồ cao cấp sài gòn",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      data-theme="dark"
      className={`${playfair.variable} ${jakarta.variable} dark scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col font-sans bg-background text-foreground transition-colors duration-400 selection:bg-emerald-700 selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <Header />
              <main className="flex-1 w-full">{children}</main>
              <Footer />

              {/* Global Overlays & Modals */}
              <ProductDetailModal />
              <CartDrawer />
              <WatchCompareModal />
              <VipBookingModal />
              <AuthModal />
              <LuxuryToast />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
