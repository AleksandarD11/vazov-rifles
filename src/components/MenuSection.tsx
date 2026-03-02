import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Crosshair } from "lucide-react";

const MenuSection = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchArsenal = async () => {
      const { data } = await supabase.from("arsenal").select("*").order("created_at", { ascending: false });
      if (data) setItems(data);
    };
    fetchArsenal();
  }, []);

  return (
    <section id="arsenal" className="py-24 bg-[#040404] relative">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16 animate-in fade-in zoom-in duration-700">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white uppercase flex items-center justify-center gap-4 tracking-wider">
            <Crosshair className="text-gold w-10 h-10" strokeWidth={1.5} /> Нашият Арсенал
          </h2>
          <div className="w-24 h-1 bg-gold mx-auto mt-6 mb-8 rounded-full"></div>
          <p className="text-gray-400 max-w-2xl mx-auto uppercase tracking-widest text-sm">
            Разгледайте най-новите ни къстъм проекти, реплики и екипировка.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
          {items.map((item) => (
            <div key={item.id} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden flex flex-col group hover:border-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-500">
              <div className="h-72 overflow-hidden relative bg-[#111]">
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
                {item.price && (
                  <div className="absolute top-5 right-5 bg-gold text-black font-bold px-4 py-2 text-sm uppercase tracking-widest rounded-md shadow-2xl">
                    {item.price.replace(/лв\.?/gi, '€')}
                  </div>
                )}
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-display font-bold text-white uppercase tracking-wider mb-4 group-hover:text-gold transition-colors">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed flex-grow">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {items.length === 0 && (
           <div className="text-center text-gray-600 border border-gray-800 p-12 rounded-xl uppercase tracking-widest text-sm">
             Складът е празен. Добавете артикули през Командния Център.
           </div>
        )}
      </div>
    </section>
  );
};

export default MenuSection;