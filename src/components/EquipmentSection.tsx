import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTacticalSounds } from "@/hooks/useTacticalSounds";
import { useCartStore } from "@/store/useCartStore";

type EquipmentItem = {
  id: string;
  title: string;
  description: string | null;
  price: string | number | null;
  image_url: string | null;
};

const EquipmentSection = () => {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const addToCart = useCartStore((s) => s.addToCart);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const { playClickSound, playHoverSound } = useTacticalSounds();

  const extractPrice = (value: string | number | null | undefined) => {
    const normalized = String(value ?? "").replace(",", ".").replace(/[^0-9.]/g, "");
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  useEffect(() => {
    const fetchEquipment = async () => {
      const { data } = await supabase
        .from("equipment")
        .select("id,title,description,price,image_url")
        .order("created_at", { ascending: false })
        .limit(12);
      if (data) setItems((data as EquipmentItem[]) ?? []);
    };
    fetchEquipment();
  }, []);

  return (
    <section id="РµРєРёРїРёСЂРѕРІРєР°" className="py-32 bg-[#0a0a0a] relative overflow-hidden border-t border-[#1a1a1a]">
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
            <ShieldAlert className="text-red-500 w-4 h-4" />
            <span className="text-gray-300 text-xs font-bold uppercase tracking-widest">Protection and Tactics</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-black text-white uppercase flex items-center justify-center gap-4 tracking-tight">
            <Shield className="text-red-500 w-12 h-12" strokeWidth={2} /> Equipment
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto mt-8 mb-8 opacity-70"></div>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base font-light leading-relaxed">
            Professional carriers, helmets, optics support, and field accessories built for stability, protection, and mission tempo.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative bg-[#040404]/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden hover:border-red-500/50 hover:shadow-[0_0_40px_rgba(239,68,68,0.15)] hover:-translate-y-2 transition-all duration-500"
            >
              <div className="h-80 overflow-hidden relative bg-black">
                <img
                  src={item.image_url ?? ""}
                  alt={item.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent opacity-90" />

                {item.price && (
                  <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md border border-red-500/30 text-red-500 font-bold px-4 py-2 text-sm uppercase tracking-widest rounded-xl shadow-2xl">
                    {String(item.price).replace(/лв\.?/gi, "€")}
                  </div>
                )}
              </div>

              <div className="p-8 relative">
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-3 group-hover:text-red-500 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed font-light">
                  {item.description}
                </p>
                <button
                  type="button"
                  onMouseEnter={playHoverSound}
                  onClick={() => {
                    playClickSound();
                    addToCart({
                      id: item.id,
                      title: item.title,
                      price: extractPrice(item.price),
                      image_url: item.image_url ?? undefined,
                    });
                    toast.success("Added to cart");
                    setCartOpen(true);
                  }}
                  className="mt-6 w-full bg-red-600 text-white hover:bg-red-500 uppercase tracking-widest text-xs px-6 py-4 rounded-xl transition-all border border-red-500/60 shadow-[0_0_24px_rgba(239,68,68,0.35)] hover:shadow-[0_0_35px_rgba(239,68,68,0.55)]"
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center text-gray-500 border border-white/10 bg-white/5 backdrop-blur-md p-16 rounded-3xl uppercase tracking-widest text-sm">
            Equipment deck is updating. Fresh tactical loadouts incoming.
          </div>
        )}
      </div>
    </section>
  );
};

export default EquipmentSection;
