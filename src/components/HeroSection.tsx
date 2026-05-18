import { motion } from "framer-motion";
import { ChevronDown, Crosshair, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const scrollToArsenal = () => {
    document.getElementById("arsenal")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#040404] px-4 py-24 sm:py-28 lg:py-32">
      <div
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#040404]/80 via-transparent to-[#040404]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#040404] via-transparent to-[#040404]" />

      <div className="container relative z-10 mx-auto flex min-w-0 flex-col items-center px-0 text-center sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md sm:mb-8"
        >
          <ShieldAlert className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold uppercase leading-tight tracking-widest text-gray-300">
            Премиум Airsoft & Custom Shop
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          <h1 className="mb-4 text-4xl font-black uppercase leading-none tracking-tight text-white drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl">
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
          <p className="mx-auto mb-8 max-w-2xl text-sm font-light leading-relaxed tracking-wide text-gray-300 sm:text-base md:mb-10 lg:text-xl xl:mb-12">
            Безкомпромисен тунинг, професионален сервиз и елитна екипировка за тези,
            които играят за победа.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex w-full max-w-xl flex-col gap-4 sm:flex-row sm:justify-center lg:max-w-none lg:gap-6"
        >
          <Button
            onClick={scrollToArsenal}
            className="group relative min-h-[52px] w-full overflow-hidden rounded-xl border border-red-500/50 bg-red-600 px-6 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-red-500 hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] sm:w-auto sm:px-8 sm:py-6 sm:text-base lg:py-8 lg:text-lg"
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
            className="min-h-[52px] w-full rounded-xl border border-white/20 bg-black/40 px-6 py-4 text-sm font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all duration-300 hover:border-red-500 hover:bg-white/10 sm:w-auto sm:px-8 sm:py-6 sm:text-base lg:py-8 lg:text-lg"
          >
            ВИЖ УСЛУГИТЕ
          </Button>

        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-2 sm:bottom-10"
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
