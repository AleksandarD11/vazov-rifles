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

const fallbackArsenal = [
  {
    title: "Custom AEG Setup",
    description: "Конфигурация по заявка с подбрани вътрешни части, настройка и финален тест според стила на игра.",
  },
  {
    title: "Precision Tune Service",
    description: "Фокус върху точност, консистентност и надеждна работа след диагностика на конкретната реплика.",
  },
  {
    title: "Tactical Loadout",
    description: "Практичен сетъп с аксесоари и екипировка, съобразен с терен, роля и бюджет.",
  },
];

const extractPrice = (value: string | number | null | undefined) => {
  const normalized = String(value ?? "").replace(",", ".").replace(/[^0-9.]/g, "");
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const scrollToContacts = () => {
  document.getElementById("contacts")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const ArsenalSkeletonGrid = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:gap-10">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="h-full min-h-[430px] overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] sm:rounded-[32px]">
        <div className="h-56 animate-pulse bg-white/[0.06] sm:h-72 lg:h-80" />
        <div className="space-y-4 p-5 sm:p-7">
          <div className="h-3 w-28 animate-pulse rounded-full bg-red-400/20" />
          <div className="h-7 w-3/4 animate-pulse rounded-full bg-white/10" />
          <div className="h-20 animate-pulse rounded-2xl bg-white/[0.06]" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-12 animate-pulse rounded-2xl bg-white/[0.06]" />
            <div className="h-12 animate-pulse rounded-2xl bg-red-500/20" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ArsenalFallbackGrid = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:gap-10">
    {fallbackArsenal.map((item, index) => (
      <motion.div
        key={item.title}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        className="flex h-full min-w-0 flex-col rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:rounded-[32px] sm:p-7"
      >
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/25 bg-red-600/10 text-red-300">
          <Crosshair size={24} />
        </div>
        <div className="text-[10px] uppercase tracking-[0.24em] text-red-300/70 sm:tracking-[0.34em]">Custom Request</div>
        <h3 className="mt-3 break-words text-xl font-black uppercase tracking-[0.1em] text-white sm:text-2xl">{item.title}</h3>
        <p className="mt-4 flex-1 text-sm leading-7 text-gray-300">{item.description}</p>
        <button
          type="button"
          onClick={scrollToContacts}
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-red-500/50 bg-red-600 px-4 py-3 text-center text-xs font-bold uppercase leading-tight tracking-[0.16em] text-white transition hover:bg-red-500 sm:tracking-[0.22em]"
        >
          Направи запитване
        </button>
      </motion.div>
    ))}
  </div>
);

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
      className="relative min-w-0"
    >
      <motion.div className="group relative h-full min-w-0 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] transition-all duration-500 hover:border-red-500/50 sm:rounded-[32px]">
        <motion.div
          className="pointer-events-none absolute -inset-24 rounded-full bg-red-600/20 blur-[90px]"
          style={{ left: glowX, top: glowY }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),transparent_35%,rgba(220,38,38,0.12))]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:18px_18px] opacity-20" />

        <div className="relative aspect-[4/3] overflow-hidden bg-black sm:aspect-auto sm:h-72 lg:h-80">
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

          <div className="absolute right-4 top-4 rounded-full border border-red-500/30 bg-black/60 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-red-400 sm:right-5 sm:top-5 sm:px-4 sm:text-sm sm:tracking-[0.2em]">
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

        <div className="relative p-5 sm:p-7">
          <div className="absolute left-7 right-7 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="flex min-w-0 items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.24em] text-red-300/70 sm:tracking-[0.36em]">Weapon Platform</div>
              <h3 className="mt-3 break-words text-xl font-black uppercase tracking-[0.1em] text-white sm:text-2xl sm:tracking-[0.14em]">{item.title}</h3>
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-gray-300">
            {item.description || "Ready for premium internal tuning, mission-specific attachments, and operator-grade presentation."}
          </p>

          <div className="mt-6 grid gap-3 sm:mt-7 sm:grid-cols-2">
            <button
              type="button"
              onMouseEnter={playHoverSound}
              onClick={() => {
                playClickSound();
                onInspect(item);
              }}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-xs font-bold uppercase leading-tight tracking-[0.16em] text-white transition hover:border-red-500/50 hover:bg-red-600/10 sm:py-4 sm:tracking-[0.22em]"
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
              className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-red-500/50 bg-red-600 px-4 py-3 text-center text-xs font-bold uppercase leading-tight tracking-[0.16em] text-white shadow-[0_0_24px_rgba(239,68,68,0.35)] transition hover:bg-red-500 sm:py-4 sm:tracking-[0.22em]"
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArsenal = async () => {
      try {
        const { data, error } = await supabase
          .from("arsenal")
          .select("id,title,description,price,image_url")
          .order("created_at", { ascending: false })
          .limit(12);

        if (error) throw error;
        setItems((data as ArsenalItem[]) ?? []);
      } catch (error) {
        console.error("Public arsenal feed failed to load", error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArsenal();
  }, []);

  return (
    <>
      <section id="arsenal" className="relative overflow-hidden bg-[#040404] py-14 sm:py-20 lg:py-28 xl:py-32">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-red-600/5 blur-[120px] pointer-events-none" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-white/5 blur-[120px] sm:h-[500px] sm:w-[500px] sm:blur-[150px]" />

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-10 text-center sm:mb-14 lg:mb-20"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
              <Shield className="h-4 w-4 text-red-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Elite Equipment</span>
            </div>
            <h2 className="flex items-center justify-center gap-3 text-3xl font-display font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
              <Crosshair className="h-8 w-8 text-red-500 sm:h-10 sm:w-10 lg:h-12 lg:w-12" strokeWidth={2} /> Featured Arsenal
            </h2>
            <div className="mx-auto mb-8 mt-8 h-1 w-32 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-70"></div>
            <p className="mx-auto max-w-2xl text-sm font-light leading-relaxed text-gray-400 md:text-base">
              Browse the latest custom-ready replicas assembled for aggressive performance, premium tuning, and cinematic field presence.
            </p>
          </motion.div>

          {isLoading ? (
            <ArsenalSkeletonGrid />
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:gap-10">
              {items.map((item, index) => (
                <WeaponCard key={item.id} item={item} index={index} onInspect={setInspectTarget} />
              ))}
            </div>
          ) : (
            <ArsenalFallbackGrid />
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
