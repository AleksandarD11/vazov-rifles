import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Crosshair, Image as ImageIcon } from "lucide-react";

type ServiceRow = {
  id: string;
  title: string;
  description: string | null;
};

type SettingRow = {
  key: string;
  value: string;
};

const AboutSection = () => {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [mainImageUrl, setMainImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);

      const [servicesRes, settingsRes] = await Promise.all([
        supabase.from("services").select("*").order("created_at", { ascending: true }),
        supabase.from("site_settings").select("*"),
      ]);

      if (servicesRes.data) setServices(servicesRes.data as ServiceRow[]);

      if (settingsRes.data) {
        const settings = settingsRes.data as SettingRow[];
        const url = settings.find((s) => s.key === "services_main_image")?.value;
        if (url) setMainImageUrl(url);
      }

      setLoading(false);
    };

    run();
  }, []);

  return (
    <section id="тунинг" className="py-24 bg-[#040404]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-10 items-stretch">
          {/* ЛЯВО: динамична снимка от site_settings */}
          <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.05)] min-h-[420px]">
            {mainImageUrl ? (
              <img
                src={mainImageUrl}
                alt="Сервиз - главна снимка"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-3 p-10">
                <ImageIcon className="text-gold" size={40} />
                <p className="uppercase tracking-widest text-xs text-center">
                  Няма зададена главна снимка.
                  <br />
                  Качи я от Admin → Services.
                </p>
              </div>
            )}
          </div>

          {/* ДЯСНО: услугите */}
          <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-10 shadow-[0_0_50px_rgba(212,175,55,0.03)]">
            <p className="text-gold text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Crosshair size={16} /> Сервиз & Custom Проекти
            </p>

            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4 uppercase">
              Изведи играта си на следващото ниво
            </h2>

            <p className="text-gray-500 text-sm leading-relaxed mb-10">
              Забрави за фабричните ограничения. В нашата работилница превръщаме стандартните
              реплики във високоточни машини. От базово обслужване до сложна електроника – знаем какво правим.
            </p>

            <div className="space-y-6">
              {services.map((service) => (
                <div key={service.id} className="border border-[#1a1a1a] bg-[#040404] rounded-xl p-6">
                  <h3 className="text-white font-bold uppercase tracking-wider mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {service.description || ""}
                  </p>
                </div>
              ))}

              {loading && (
                <div className="text-gray-500 uppercase tracking-widest text-xs">
                  Зареждане...
                </div>
              )}

              {!loading && services.length === 0 && (
                <div className="text-gray-500 uppercase tracking-widest text-xs">
                  Няма добавени услуги. Добави ги от Admin → Services.
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