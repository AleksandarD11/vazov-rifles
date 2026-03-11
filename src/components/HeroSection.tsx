import { motion } from "framer-motion";
import { ChevronDown, Crosshair, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const scrollToArsenal = () => {
    document.getElementById("arsenal")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#040404]">
      <div
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#040404]/80 via-transparent to-[#040404]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#040404] via-transparent to-[#040404]" />

      <div className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
        >
          <ShieldAlert className="w-4 h-4 text-red-500" />
          <span className="text-gray-300 text-xs font-bold uppercase tracking-widest">
            Премиум Airsoft & Custom Shop
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter mb-4 drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            VAZOV{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">
              RIFLES
            </span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p className="text-lg md:text-xl text-gray-300 font-light max-w-2xl mx-auto mb-12 tracking-wide">
            Безкомпромисен тунинг, професионален сервиз и елитна екипировка за тези,
            които играят за победа.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <Button
            onClick={scrollToArsenal}
            className="group relative px-8 py-8 bg-red-600 text-white font-bold uppercase tracking-widest text-lg hover:bg-red-500 hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] transition-all duration-300 overflow-hidden rounded-xl border border-red-500/50"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Crosshair
                size={20}
                className="group-hover:rotate-90 transition-transform duration-500"
              />
              КЪМ АРСЕНАЛА
            </span>
          </Button>

          <Button
            onClick={() => document.getElementById("tuning")?.scrollIntoView({ behavior: "smooth" })}
            variant="outline"
            className="px-8 py-8 bg-black/40 border border-white/20 text-white font-bold uppercase tracking-widest text-lg backdrop-blur-md hover:bg-white/10 hover:border-red-500 transition-all duration-300 rounded-xl"
          >
            ВИЖ УСЛУГИТЕ
          </Button>

          <Button
            asChild
            className="px-8 py-8 bg-white/10 border border-red-500/40 text-white font-bold uppercase tracking-widest text-lg backdrop-blur-md hover:bg-red-600/20 hover:border-red-400 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.15)]"
          >
            <Link to="/gun-lab">ВЛЕЗ В GUN LAB</Link>
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        onClick={scrollToArsenal}
      >
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
          СКРОЛНИ НАДОЛУ
        </span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown className="text-red-500 w-6 h-6" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
