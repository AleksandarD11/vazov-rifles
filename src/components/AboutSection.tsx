import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Zap, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AboutSection = () => {
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    const fetchMainImage = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "services_main_image")
          .maybeSingle();

        if (error) throw error;
        if (data?.value) setMainImage(data.value);
      } catch (error) {
        console.error("Public services image failed to load", error);
      }
    };

    fetchMainImage();
  }, []);

  const features = [
    {
      icon: <Wrench className="w-8 h-8 text-red-500" />,
      title: "Професионален Тунинг",
      desc: "Пълна трансформация на вътрешните компоненти за максимална далекобойност, точност и скорострелност."
    },
    {
      icon: <Zap className="w-8 h-8 text-red-500" />,
      title: "HPA Системи",
      desc: "Инсталация и настройка на HPA двигатели (PolarStar, Wolverine) за безкомпромисна надеждност на терена."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-red-500" />,
      title: "Пълна Профилактика",
      desc: "Почистване, смазване и подмяна на износени части, за да бъде репликата ти винаги готова за битка."
    }
  ];

  const popularServices = [
    "Диагностика",
    "Hop-up настройка",
    "Gearbox service",
    "Shim / AOE настройка",
    "MOSFET монтаж",
    "Custom build конфигурация",
    "Пълна профилактика",
  ];

  const scrollToContacts = () => {
    document.getElementById("contacts")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="тунинг" className="relative overflow-hidden bg-[#040404] py-14 sm:py-20 lg:py-28 xl:py-32">
      {/* Светещи линии и ефекти */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-red-600/5 blur-[120px] pointer-events-none sm:h-[800px] sm:w-[800px] sm:blur-[150px]"></div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          
          {/* Левия панел с текст */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
              <Wrench className="w-4 h-4 text-red-500" />
              <span className="text-gray-300 text-xs font-bold uppercase tracking-widest">Сервиз & Услуги</span>
            </div>
            
            <h2 className="mb-6 break-words text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
              Ковем <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Победата</span> в Детайлите
            </h2>
            
            <p className="mb-8 text-sm font-light leading-relaxed text-gray-400 sm:text-base lg:mb-10 lg:text-lg">
              Във Vazov Rifles не просто поправяме реплики. Ние създаваме машини, които доминират. Всеки проект минава през стриктни тестове, за да гарантираме перфектна работа дори в най-тежките условия.
            </p>

            <div className="space-y-4 sm:space-y-6">
              {features.map((feature, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.2 }}
                  className="flex min-w-0 items-start gap-4 rounded-3xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-300 hover:border-red-500/30 hover:bg-white/[0.04] hover:shadow-[0_0_30px_rgba(239,68,68,0.05)] sm:gap-5 sm:p-6"
                >
                  <div className="p-3 bg-black/50 rounded-xl border border-white/10 shadow-inner">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="mb-2 break-words text-base font-bold uppercase tracking-wide text-white sm:text-xl sm:tracking-wider">{feature.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-red-500/20 bg-red-600/10 p-5 sm:mt-10 sm:p-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-red-300/80">Популярни услуги</div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {popularServices.map((service) => (
                  <div key={service} className="min-h-[44px] rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold uppercase leading-tight tracking-[0.08em] text-gray-200">
                    {service}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={scrollToContacts}
                className="mt-5 inline-flex min-h-[46px] w-full items-center justify-center rounded-2xl border border-red-500/60 bg-red-600 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-red-500 sm:w-auto"
              >
                Заяви сервиз
              </button>
            </div>
          </motion.div>

          {/* Десния панел със снимка */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="group relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-white/10 shadow-[0_0_50px_rgba(220,38,38,0.1)] sm:aspect-[16/10] lg:aspect-auto lg:h-[620px] xl:h-[760px] 2xl:h-[850px]"
          >
            <div className="absolute inset-0 bg-red-600/20 mix-blend-overlay z-10 group-hover:bg-transparent transition-all duration-700"></div>
            {/* Смени линка тук с твоя снимка от сервиза, ако искаш! */}
            <img 
              src={mainImage || "https://images.unsplash.com/photo-1584285405408-9d414e210103?q=80&w=1974&auto=format&fit=crop"} 
              alt="Airsoft Tuning Services" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
            />
            
            {/* Плаващ бадж върху снимката */}
            <div className="absolute bottom-4 left-4 right-4 z-20 translate-y-4 rounded-2xl border border-white/10 bg-black/60 p-4 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 sm:bottom-8 sm:left-8 sm:right-8 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
                <p className="text-white font-bold uppercase tracking-widest text-sm">Гарантирано Качество</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
