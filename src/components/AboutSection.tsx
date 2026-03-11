import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wrench, Zap, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AboutSection = () => {
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    const fetchMainImage = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "services_main_image")
        .maybeSingle();

      if (data?.value) setMainImage(data.value);
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

  return (
    <section id="тунинг" className="py-32 bg-[#040404] relative overflow-hidden">
      {/* Светещи линии и ефекти */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
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
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mb-6">
              Ковем <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Победата</span> в Детайлите
            </h2>
            
            <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed mb-10">
              Във Vazov Rifles не просто поправяме реплики. Ние създаваме машини, които доминират. Всеки проект минава през стриктни тестове, за да гарантираме перфектна работа дори в най-тежките условия.
            </p>

            <div className="space-y-6">
              {features.map((feature, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.2 }}
                  className="flex items-start gap-5 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-red-500/30 hover:bg-white/[0.04] hover:shadow-[0_0_30px_rgba(239,68,68,0.05)] transition-all duration-300"
                >
                  <div className="p-3 bg-black/50 rounded-xl border border-white/10 shadow-inner">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Десния панел със снимка */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative lg:h-[850px] rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(220,38,38,0.1)] group"
          >
            <div className="absolute inset-0 bg-red-600/20 mix-blend-overlay z-10 group-hover:bg-transparent transition-all duration-700"></div>
            {/* Смени линка тук с твоя снимка от сервиза, ако искаш! */}
            <img 
              src={mainImage || "https://images.unsplash.com/photo-1584285405408-9d414e210103?q=80&w=1974&auto=format&fit=crop"} 
              alt="Airsoft Tuning Services" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
            />
            
            {/* Плаващ бадж върху снимката */}
            <div className="absolute bottom-8 left-8 right-8 bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 shadow-2xl">
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
