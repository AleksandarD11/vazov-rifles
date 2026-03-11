import Navbar from "@/components/Navbar";
import NightVisionOverlay from "@/components/NightVisionOverlay";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import KidsSection from "@/components/KidsSection";
import MenuSection from "@/components/MenuSection";
import EquipmentSection from "@/components/EquipmentSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import GallerySection from "@/components/GallerySection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <NightVisionOverlay />

      <div id="home"><HeroSection /></div>
      <div id="arsenal"><MenuSection /></div>
      <div id="equipment"><EquipmentSection /></div>
      <div id="tuning"><AboutSection /></div>
      <KidsSection />
      <TestimonialsSection />
      <div id="action"><GallerySection /></div>
      <div id="contacts"><ContactSection /></div>

      <Footer />
    </div>
  );
};

export default Index;
