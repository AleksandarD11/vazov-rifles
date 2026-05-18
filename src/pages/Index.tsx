import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import NightVisionOverlay from "@/components/NightVisionOverlay";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import KidsSection from "@/components/KidsSection";
import MenuSection from "@/components/MenuSection";
import EquipmentSection from "@/components/EquipmentSection";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";
import GunsmithTeaserSection from "@/components/GunsmithTeaserSection";
import HowItWorksSection from "@/components/HowItWorksSection";

const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const GallerySection = lazy(() => import("@/components/GallerySection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));

const SectionFallback = ({ minHeight = "min-h-80" }: { minHeight?: string }) => (
  <div className={`flex ${minHeight} items-center justify-center bg-[#040404] px-4 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-red-300/60 sm:tracking-[0.34em]`}>
    <span className="animate-pulse">Loading sector...</span>
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navbar />
      <NightVisionOverlay />

      <div id="home"><HeroSection /></div>
      <div id="arsenal"><MenuSection /></div>
      <div id="equipment"><EquipmentSection /></div>
      <div id="tuning"><AboutSection /></div>
      <KidsSection />
      <HowItWorksSection />
      <GunsmithTeaserSection />
      <div id="action">
        <Suspense fallback={<SectionFallback />}>
          <GallerySection />
        </Suspense>
      </div>
      <Suspense fallback={<SectionFallback />}>
        <TestimonialsSection />
      </Suspense>
      <FAQSection />
      <div id="contacts">
        <Suspense fallback={<SectionFallback minHeight="min-h-[520px]" />}>
          <ContactSection />
        </Suspense>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
