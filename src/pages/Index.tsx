import Navbar from "@/components/Navbar";
import NightVisionOverlay from "@/components/NightVisionOverlay";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import HomeServicesSection from "@/components/HomeServicesSection";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Navbar />
      <NightVisionOverlay />

      <div id="home"><HeroSection /></div>
      <HomeServicesSection />
      <HowItWorksSection />
      <FAQSection />
      <div id="contacts">
        <ContactSection />
      </div>

      <Footer />
    </div>
  );
};

export default Index;
