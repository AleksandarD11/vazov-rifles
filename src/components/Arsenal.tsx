import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Crosshair, Shield } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { toast } from "sonner";
import WeaponInspectModal, { type InspectWeapon } from "@/components/WeaponInspectModal";
import { useTacticalSounds } from "@/hooks/useTacticalSounds";
import { useCartStore } from "@/store/useCartStore";
import { useIntelStore } from "@/store/useIntelStore";

type ArsenalItem = InspectWeapon;

const extractPrice = (value: string | number | null | undefined) => {
  const normalized = String(value ?? "").replace(",", ".").replace(/[^0-9.]/g, "");
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const WeaponCard = ({
  item,
  index,
  onInspect,
}: {
  item: ArsenalItem;
  index: number;
  onInspect: (item: ArsenalItem) => void;
}) => {
  const addToCart = useCartStore((s) => s.addToCart);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const markIntelFound = useIntelStore((state) => state.markIntelFound);
  const foundIds = useIntelStore((state) => state.foundIds);
  const { playClickSound, playHoverSound } = useTacticalSounds();
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [11, -11]), { stiffness: 180, damping: 18 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-13, 13]), { stiffness: 180, damping: 18 });
  const glowX = useTransform(mouseX, [0, 1], ["20%", "80%"]);
  const glowY = useTransform(mouseY, [0, 1], ["18%", "82%"]);
  const [isHovered, setIsHovered] = useState(false);
  const hasHiddenIntel = index === 1;
  const intelFound = foundIds.includes("arsenal-cache");

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    mouseX.set((event.clientX - bounds.left) / bounds.width);
    mouseY.set((event.clientY - bounds.top) / bounds.height);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      style={{ rotateX, rotateY, transformPerspective: 1400 }}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={handlePointerLeave}
      className="relative"
    >
      <motion.div className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] transition-all duration-500 hover:border-red-500/50">
        <motion.div
          className="pointer-events-none absolute -inset-24 rounded-full bg-red-600/20 blur-[90px]"
          style={{ left: glowX, top: glowY }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),transparent_35%,rgba(220,38,38,0.12))]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:18px_18px] opacity-20" />

        <div className="relative h-80 overflow-hidden bg-black">
          <img
            src={item.image_url ?? ""}
            alt={item.title}
            className="h-full w-full object-cover opacity-80 transition duration-700 ease-out group-hover:scale-110 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/45 to-transparent" />

          <motion.div
            animate={isHovered ? { y: ["-140%", "140%"], opacity: [0, 0.75, 0] } : { y: "-140%", opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeInOut", repeat: isHovered ? Infinity : 0, repeatDelay: 0.35 }}
            className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,transparent_0%,rgba(239,68,68,0.45)_50%,transparent_100%)] mix-blend-screen"
          />

          <div className="absolute right-5 top-5 rounded-full border border-red-500/30 bg-black/60 px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-red-400">
            {extractPrice(item.price).toFixed(2)} €
          </div>

          {hasHiddenIntel && (
            <button
              type="button"
              onClick={() => markIntelFound("arsenal-cache")}
              className={`absolute left-4 top-4 z-10 transition ${intelFound ? "text-red-300 opacity-90" : "text-red-500/30 opacity-25 hover:opacity-70"}`}
              aria-label="Recover hidden intel"
            >
              <Crosshair size={14} />
            </button>
          )}
        </div>

        <div className="relative p-7">
          <div className="absolute left-7 right-7 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.36em] text-red-300/70">Weapon Platform</div>
              <h3 className="mt-3 text-2xl font-black uppercase tracking-[0.14em] text-white">{item.title}</h3>
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-gray-300">
            {item.description || "Ready for premium internal tuning, mission-specific attachments, and operator-grade presentation."}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onMouseEnter={playHoverSound}
              onClick={() => {
                playClickSound();
                onInspect(item);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-xs font-bold uppercase tracking-[0.26em] text-white transition hover:border-red-500/50 hover:bg-red-600/10"
            >
              <Crosshair size={15} />
              Inspect Weapon
            </button>

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
              className="inline-flex items-center justify-center rounded-2xl border border-red-500/50 bg-red-600 px-4 py-4 text-xs font-bold uppercase tracking-[0.26em] text-white shadow-[0_0_24px_rgba(239,68,68,0.35)] transition hover:bg-red-500"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const MenuSection = () => {
  const [items, setItems] = useState<ArsenalItem[]>([]);
  const [inspectTarget, setInspectTarget] = useState<ArsenalItem | null>(null);

  useEffect(() => {
    const fetchArsenal = async () => {
      const { data } = await supabase.from("arsenal").select("*").order("created_at", { ascending: false });
      if (data) setItems((data as ArsenalItem[]) ?? []);
    };
    fetchArsenal();
  }, []);

  return (
    <>
      <section id="arsenal" className="relative overflow-hidden bg-[#040404] py-32">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-red-600/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-white/5 blur-[150px] pointer-events-none" />

        <div className="container relative z-10 mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20 text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
              <Shield className="h-4 w-4 text-red-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Elite Equipment</span>
            </div>
            <h2 className="flex items-center justify-center gap-4 text-4xl font-display font-black uppercase tracking-tight text-white md:text-6xl">
              <Crosshair className="h-12 w-12 text-red-500" strokeWidth={2} /> Featured Arsenal
            </h2>
            <div className="mx-auto mb-8 mt-8 h-1 w-32 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-70"></div>
            <p className="mx-auto max-w-2xl text-sm font-light leading-relaxed text-gray-400 md:text-base">
              Browse the latest custom-ready replicas assembled for aggressive performance, premium tuning, and cinematic field presence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-10">
            {items.map((item, index) => (
              <WeaponCard key={item.id} item={item} index={index} onInspect={setInspectTarget} />
            ))}
          </div>

          {items.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-16 text-center text-sm uppercase tracking-widest text-gray-500 backdrop-blur-md">
              Arsenal feed is refreshing. Stand by for the next drop.
            </div>
          )}
        </div>
      </section>

      <WeaponInspectModal
        weapon={inspectTarget}
        open={Boolean(inspectTarget)}
        onClose={() => setInspectTarget(null)}
      />
    </>
  );
};

export default MenuSection;
