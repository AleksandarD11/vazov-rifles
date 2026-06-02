import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Crosshair, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const trustItems = ["Airsoft only", "Custom approach", "Реални снимки", "Сервиз след консултация"];

const HeroSection = () => {
  return (
    <section className="relative flex min-h-[92svh] items-center justify-center overflow-hidden bg-[#040404] px-4 py-24 sm:py-28 lg:py-32">
      <div className="absolute inset-0 bg-[url('/images/hero-bg-vazov.jpg')] bg-cover bg-center bg-no-repeat opacity-100" />
      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.16)_0%,rgba(0,0,0,0.36)_58%,rgba(4,4,4,0.66)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#040404]/45 via-transparent to-[#040404]/88" />

      <div className="container relative z-10 mx-auto flex min-w-0 flex-col items-center px-0 text-center sm:px-4">
        <motion.h1
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mb-4 max-w-5xl text-3xl font-black uppercase leading-tight tracking-tight text-white drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] sm:text-5xl lg:text-6xl xl:text-7xl"
        >
          Премиум еърсофт реплики, custom build-ове и сервиз в България
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mx-auto mb-8 max-w-2xl text-sm font-light leading-relaxed tracking-wide text-gray-300 sm:text-base md:mb-10 lg:text-xl xl:mb-12"
        >
          Подбрана екипировка, индивидуални конфигурации и техническа поддръжка за airsoft и milsim играчи.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex w-full max-w-xl flex-col gap-4 sm:flex-row sm:justify-center lg:max-w-none lg:gap-6"
        >
          <Button
            asChild
            className="group relative min-h-[52px] w-full overflow-hidden rounded-xl border border-red-500/50 bg-red-600 px-6 py-4 text-sm font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-red-500 hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] sm:w-auto sm:px-8 sm:py-6 sm:text-base lg:py-8 lg:text-lg"
          >
            <Link to="/contact" className="relative z-10 flex items-center justify-center gap-2">
              <Crosshair size={20} className="transition-transform duration-500 group-hover:rotate-90" />
              Изпрати запитване
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="min-h-[52px] w-full rounded-xl border border-white/20 bg-black/40 px-6 py-4 text-sm font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all duration-300 hover:border-red-500 hover:bg-white/10 sm:w-auto sm:px-8 sm:py-6 sm:text-base lg:py-8 lg:text-lg"
          >
            <Link to="/inventory">Виж наличности</Link>
          </Button>
        </motion.div>

        <div className="mt-5 grid w-full max-w-3xl gap-3 sm:grid-cols-2">
          <Link to="/service" className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-gray-100 transition hover:border-red-400/50">
            <Wrench size={15} /> Заяви сервиз
          </Link>
          <Link to="/custom-builds" className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-gray-100 transition hover:border-red-400/50">
            <ArrowRight size={15} /> Виж custom проекти
          </Link>
        </div>

        <div className="mt-8 grid w-full max-w-4xl grid-cols-2 gap-3 text-[10px] font-black uppercase tracking-[0.16em] text-gray-200 sm:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item} className="rounded-xl border border-white/10 bg-black/35 px-3 py-3 backdrop-blur-md">
              {item}
            </div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-2 sm:bottom-10"
        onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
          Скролни надолу
        </span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown className="h-6 w-6 text-red-500" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
