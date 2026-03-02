import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Crosshair } from "lucide-react";

const AboutSection = () => {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase.from("services").select("*").order("created_at", { ascending: true });
      if (data) setServices(data);
    };
    fetchServices();
  }, []);

  return (
    <section className="py-20 bg-[#0a0a0a]">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* ЛЯВА ЧАСТ: Снимката от сервиза */}
          <div className="lg:w-1/2 w-full animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="relative rounded-2xl overflow-hidden border border-[#1a1a1a] shadow-[0_0_30px_rgba(230,57,70,0.1)]">
              <img 
                src="https://images.unsplash.com/photo-1595590424283-b8f1784cb2c8?q=80&w=1000&auto=format&fit=crop" 
                alt="Vazov Rifles Сервиз" 
                className="w-full h-[500px] md:h-[600px] object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
              />
              <div className="absolute inset-0 border-2 border-[#e63946]/20 rounded-2xl m-4 pointer-events-none"></div>
            </div>
          </div>

          {/* ДЯСНА ЧАСТ: Списък с услугите */}
          <div className="lg:w-1/2 w-full">
            <span className="text-[#e63946] text-xs font-bold tracking-widest uppercase block mb-2">Сервиз & Custom Проекти</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white uppercase leading-tight mb-6">
              Изведи играта си на <br className="hidden md:block"/> следващото ниво
            </h2>
            <p className="text-gray-400 mb-10 text-sm md:text-base leading-relaxed">
              Забрави за фабричните ограничения. В нашата работилница превръщаме стандартните реплики във високоточни машини за победа. От базово смазване до инсталация на сложна електроника – ние знаем какво правим.
            </p>

            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="bg-[#040404] border border-[#1a1a1a] p-6 rounded-xl flex gap-5 transition-all duration-300 hover:border-[#e63946]/50 hover:shadow-[0_0_15px_rgba(230,57,70,0.1)] hover:-translate-y-1">
                  <div className="mt-1">
                    <Crosshair className="text-[#e63946]" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold uppercase tracking-widest mb-2 text-sm">{service.title}</h3>
                    <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{service.description}</p>
                  </div>
                </div>
              ))}
              
              {services.length === 0 && (
                <div className="p-6 border border-[#1a1a1a] rounded-xl text-center">
                  <p className="text-gray-500 italic text-sm">В момента зареждаме услугите...</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;