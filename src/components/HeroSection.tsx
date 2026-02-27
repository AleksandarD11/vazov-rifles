import { useState } from "react";
import { Button } from "@/components/ui/button";
import ReservationDialog from "./ReservationDialog";

const HeroSection = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <section id="начало" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero.jpg"
            alt="Елегантен интериор на ресторант LUXOR"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-primary/70" />
        </div>

        <div className="relative z-10 container text-center px-4">
          <p className="text-gold font-body tracking-[0.3em] uppercase text-sm mb-4 animate-fade-in-up">
            Ресторант LUXOR
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Съчетание на елегантност<br className="hidden md:block" /> и уют.
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 font-body font-light max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            Перфектното място за вашите специални поводи.
          </p>
          <div className="animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <Button
              size="lg"
              className="bg-gold hover:bg-gold-dark text-primary font-body tracking-wider uppercase text-sm px-10 py-6"
              onClick={() => setDialogOpen(true)}
            >
              Резервирай маса
            </Button>
          </div>
        </div>
      </section>

      <ReservationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};

export default HeroSection;
