import { Link } from "react-router-dom";
import { ArrowRight, Box, ScanSearch } from "lucide-react";

const GunsmithTeaserSection = () => {
  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-[#040404] py-14 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative min-w-0 overflow-hidden rounded-[28px] border border-red-500/20 bg-white/[0.035] p-6 backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-red-600/10 blur-[100px]" />
          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-red-300/80">
                <ScanSearch size={14} />
                Premium Feature
              </div>
              <h2 className="mt-5 break-words text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
                Конфигурирай своя сетъп в 3D
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-300 sm:text-base">
                Разгледай оръжието, аксесоарите и конфигурацията в интерактивен 3D изглед, без да зареждаме тежкия viewer на началната страница.
              </p>
              <Link
                to="/gunsmith-3d"
                className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-red-500/60 bg-red-600 px-6 py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_0_28px_rgba(239,68,68,0.25)] transition hover:bg-red-500 sm:w-auto"
              >
                Отвори 3D Оръжейник
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="min-w-0 rounded-[24px] border border-white/10 bg-black/30 p-5">
              <div className="flex aspect-[16/10] items-center justify-center rounded-[18px] border border-red-500/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(220,38,38,0.08))]">
                <div className="text-center">
                  <Box className="mx-auto h-14 w-14 text-red-300" />
                  <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white/55">
                    Interactive Configurator
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GunsmithTeaserSection;
