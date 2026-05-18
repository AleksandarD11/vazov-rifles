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

const fallbackEquipment = [
  {
    title: "Tactical Loadout",
    description: "Подбор на екипировка според роля, терен и нужната мобилност.",
  },
  {
    title: "Optics Support",
    description: "Консултация за оптики, монтажи и аксесоари към конкретна платформа.",
  },
  {
    title: "Field Ready Kit",
    description: "Практичен комплект за игра с фокус върху удобство, защита и надеждност.",
  },
];

const scrollToContacts = () => {
  document.getElementById("contacts")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const EquipmentSection = () => {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      try {
        const { data, error } = await supabase
          .from("equipment")
          .select("id,title,description,price,image_url")
          .order("created_at", { ascending: false })
          .limit(12);

        if (error) throw error;
        setItems((data as EquipmentItem[]) ?? []);
      } catch (error) {
        console.error("Public equipment feed failed to load", error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  return (
    <section id="РµРєРёРїРёСЂРѕРІРєР°" className="relative overflow-hidden border-t border-[#1a1a1a] bg-[#0a0a0a] py-14 sm:py-20 lg:py-28 xl:py-32">
      <div className="pointer-events-none absolute right-1/4 top-1/2 h-72 w-72 rounded-full bg-red-600/5 blur-[120px] sm:h-[600px] sm:w-[600px] sm:blur-[150px]" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-10 text-center sm:mb-14 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
            <ShieldAlert className="text-red-500 w-4 h-4" />
            <span className="text-gray-300 text-xs font-bold uppercase tracking-widest">Protection and Tactics</span>
          </div>
          <h2 className="flex items-center justify-center gap-3 text-3xl font-display font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
            <Shield className="h-8 w-8 text-red-500 sm:h-10 sm:w-10 lg:h-12 lg:w-12" strokeWidth={2} /> Equipment
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto mt-8 mb-8 opacity-70"></div>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base font-light leading-relaxed">
            Professional carriers, helmets, optics support, and field accessories built for stability, protection, and mission tempo.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:gap-12">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="min-h-[410px] overflow-hidden rounded-3xl border border-white/5 bg-[#040404]/50">
                <div className="h-56 animate-pulse bg-white/[0.06] sm:h-72 lg:h-80" />
                <div className="space-y-4 p-5 sm:p-8">
                  <div className="h-7 w-2/3 animate-pulse rounded-full bg-white/10" />
                  <div className="h-16 animate-pulse rounded-2xl bg-white/[0.06]" />
                  <div className="h-12 animate-pulse rounded-xl bg-red-500/20" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:gap-12">
            {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative h-full min-w-0 overflow-hidden rounded-3xl border border-white/5 bg-[#040404]/50 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-red-500/50 hover:shadow-[0_0_40px_rgba(239,68,68,0.15)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-black sm:aspect-auto sm:h-72 lg:h-80">
                <img
                  src={item.image_url ?? ""}
                  alt={item.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent opacity-90" />

                {item.price && (
                  <div className="absolute right-4 top-4 rounded-xl border border-red-500/30 bg-black/60 px-3 py-2 text-xs font-bold uppercase tracking-widest text-red-500 shadow-2xl backdrop-blur-md sm:right-6 sm:top-6 sm:px-4 sm:text-sm">
                    {String(item.price).replace(/лв\.?/gi, "€")}
                  </div>
                )}
              </div>

              <div className="relative p-5 sm:p-8">
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <h3 className="mb-3 break-words text-xl font-bold uppercase tracking-wide text-white transition-colors duration-300 group-hover:text-red-500 sm:text-2xl sm:tracking-wider">
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
                  className="mt-6 min-h-[44px] w-full rounded-xl border border-red-500/60 bg-red-600 px-6 py-3 text-xs uppercase tracking-widest text-white shadow-[0_0_24px_rgba(239,68,68,0.35)] transition-all hover:bg-red-500 hover:shadow-[0_0_35px_rgba(239,68,68,0.55)] sm:py-4"
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:gap-12">
            {fallbackEquipment.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="flex min-w-0 flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-8"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/25 bg-red-600/10 text-red-300">
                  <Shield size={24} />
                </div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-red-300/70">Loadout Request</div>
                <h3 className="mt-3 break-words text-xl font-bold uppercase tracking-wide text-white sm:text-2xl">{item.title}</h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-gray-400">{item.description}</p>
                <button
                  type="button"
                  onClick={scrollToContacts}
                  className="mt-6 min-h-[44px] w-full rounded-xl border border-red-500/60 bg-red-600 px-6 py-3 text-xs uppercase tracking-widest text-white transition-all hover:bg-red-500"
                >
                  Направи запитване
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EquipmentSection;
