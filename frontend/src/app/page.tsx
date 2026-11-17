import WatchScrollHero from "@/components/WatchScrollHero";
import BoutiqueIntroSection from "@/components/BoutiqueIntroSection";
import BestSellersSection from "@/components/BestSellersSection";
import CraftsmanshipSection from "@/components/CraftsmanshipSection";
import BrandDirectorySection from "@/components/BrandDirectorySection";
import ProductCatalog from "@/components/ProductCatalog";

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* 1. Flagship 3D Exploded Scrollytelling & Fullscreen Cinema Video */}
      <WatchScrollHero />

      {/* 2. Showroom Cinema Player (intro.mp4) */}
      <BoutiqueIntroSection />

      {/* 3. Curated Masterpieces & Bestsellers Spotlight */}
      <BestSellersSection />

      {/* 4. Swiss Haute Horlogerie Craftsmanship & Movement Anatomy */}
      <CraftsmanshipSection />

      {/* 5. Maison Heritage Brands Directory */}
      <BrandDirectorySection />

    </div>
  );
}
