import WatchScrollHero from "@/components/WatchScrollHero";
import BoutiqueIntroSection from "@/components/BoutiqueIntroSection";
import ProductCatalog from "@/components/ProductCatalog";

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* 1. Flagship 3D Exploded Scrollytelling & Fullscreen Cinema Video */}
      <WatchScrollHero />

      {/* 2. Showroom Cinema Player (intro.mp4) */}
      <BoutiqueIntroSection />

      {/* 3. The Complete Collection Catalog (Real Database Products Only) */}
      <ProductCatalog />
    </div>
  );
}
