import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Crosshair } from "lucide-react";
import ReservationDialog from "./ReservationDialog";

const HeroSection = () => {
  const [title, setTitle] = useState("ИЗГРАДИ СВОЯ ПЕРФЕКТЕН АРСЕНАЛ");
  const [subtitle, setSubtitle] = useState("Професионален тунинг и ремонт на еърсофт реплики");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("*");
      if (data) {
        const hTitle = data.find(s => s.key === "hero_title")?.value;
        const hSub = data.find(s => s.key === "hero_subtitle")?.value;
        if (hTitle) setTitle(hTitle);
        if (hSub) setSubtitle(hSub);
      }
    };
    fetchSettings();
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-[#040404] overflow-hidden">
      {/* Background with Dark Cinematic Overlay */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-b from-[#040404] via-[#040404]/80 to-[#040404] z-10" />
         <img src="/placeholder.svg" alt="Airsoft background" className="w-full h-full object-cover opacity-20 scale-105 animate-pulse duration-[10000ms]" />
      </div>

      <div className="container mx-auto px-4 relative z-20 text-center animate-in fade-in zoom-in duration-1000">
        <div className="inline-block p-4 rounded-full border border-gold/20 bg-gold/5 mb-8 backdrop-blur-sm">
           <Crosshair className="text-gold w-16 h-16" strokeWidth={1} />
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white uppercase tracking-[0.15em] mb-8 leading-tight drop-shadow-2xl">
          {title}
        </h1>
        
        <div className="w-24 h-1 bg-gold mx-auto mb-10 rounded-full" />
        
        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto uppercase tracking-[0.2em] mb-14 leading-relaxed font-light">
          {subtitle}
        </p>
        
        <Button 
          onClick={() => setIsDialogOpen(true)} 
          className="bg-gold text-black px-12 py-8 text-lg font-bold uppercase tracking-widest hover:bg-amber-400 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300 border-2 border-transparent hover:border-gold/50"
        >
          Заяви Сервиз
        </Button>

        <ReservationDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </div>
    </section>
  );
};

export default HeroSection;