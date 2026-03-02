import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import KidsSection from "@/components/KidsSection";
import MenuSection from "@/components/MenuSection";
import GallerySection from "@/components/GallerySection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* КОТВА: НАЧАЛО */}
      <div id="начало">
        <HeroSection />
      </div>

      {/* КОТВА: АРСЕНАЛ (Предполагам, че каталогът ти е в MenuSection) */}
      <div id="арсенал">
        <MenuSection />
      </div>

      {/* КОТВА: ТУНИНГ (Предполагам, че инфото ти е в AboutSection) */}
      <div id="тунинг">
        <AboutSection />
      </div>

      {/* Тази секция я оставям без котва, защото не е в менюто, но да не ти счупя дизайна */}
      <KidsSection />

      {/* КОТВА: В ДЕЙСТВИЕ */}
      <div id="в-действие">
        <GallerySection />
      </div>

      {/* КОТВА: КОНТАКТИ */}
      <div id="контакти">
        <ContactSection />
      </div>

      <Footer />
    </div>
  );
};

export default Index;