import { useEffect, useMemo, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion";
import { ArrowLeft, Check, Clipboard, Loader2, ShoppingCart, Sparkles, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCartStore } from "@/store/useCartStore";

type BaseReplica = { id: string; title: string; description: string | null; price: string | number | null; image_url: string | null };
type UpgradeItem = { id: string; title: string; price: number; description: string };
type UpgradeCategory = { id: string; title: string; subtitle: string; items: UpgradeItem[] };
type SpecSheet = { buildId: string; createdAt: string; base: BaseReplica; upgrades: UpgradeItem[]; total: number; selectedIds: string[] };

const upgradeCategories: UpgradeCategory[] = [
  { id: "internal-tuning", title: "ВЪТРЕШЕН ТУНИНГ", subtitle: "Уплътнение, точност и стабилност на траекторията.", items: [
    { id: "hop-rhopped", title: "R-Hop Chamber Tune", price: 95, description: "Flat-hop pressure arm and trajectory calibration." },
    { id: "barrel-6-01", title: "6.01 Precision Barrel", price: 120, description: "Tightbore stainless barrel for tighter shot spread." },
    { id: "airseal-kit", title: "Air Seal Package", price: 78, description: "Compression refresh across the firing cycle." },
  ]},
  { id: "gearbox", title: "GEARBOX", subtitle: "Електронен отклик и здравина на трансмисията.", items: [
    { id: "mosfet-leviathan", title: "Leviathan MOSFET", price: 165, description: "Programmable trigger behavior and active braking." },
    { id: "gears-13-1", title: "13:1 CNC Gear Set", price: 88, description: "High-response ratio for faster cycle time." },
    { id: "brushless-motor", title: "Brushless Motor Core", price: 210, description: "High torque spool-up for snappier semi-auto response." },
  ]},
  { id: "external-attachments", title: "ВЪНШНИ КОМПОНЕНТИ", subtitle: "Мебелировка, контрол и визуален профил.", items: [
    { id: "optic-holo", title: "Holographic Optic", price: 135, description: "Low-profile reticle system with clear target pickup." },
    { id: "suppressor-tracer", title: "Tracer Suppressor", price: 99, description: "Threaded tracer unit with matte suppressor housing." },
    { id: "grip-angled", title: "Angled Assault Grip", price: 42, description: "Forward-hand control with improved weapon indexing." },
  ]},
];

const extractPrice = (value: string | number | null | undefined) => {
  const normalized = String(value ?? "").replace(",", ".").replace(/[^0-9.]/g, "");
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatPrice = (value: number) => `${value.toFixed(2)} €`;
const makeBuildId = () => `GL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const RollingPrice = ({ value }: { value: number }) => {
  const current = useMotionValue(value);
  const spring = useSpring(current, { stiffness: 180, damping: 24, mass: 0.8 });
  const formatted = useTransform(spring, (latest) => latest.toFixed(2));
  const [display, setDisplay] = useState(value.toFixed(2));

  useEffect(() => {
    const controls = animate(current, value, { type: "spring", stiffness: 180, damping: 24, mass: 0.8 });
    return () => controls.stop();
  }, [current, value]);

  useMotionValueEvent(formatted, "change", (latest) => setDisplay(latest));

  return <span>{display} €</span>;
};

const GunLabPage = () => {
  const [replicas, setReplicas] = useState<BaseReplica[]>([]);
  const [selectedBaseId, setSelectedBaseId] = useState("");
  const [selectedUpgradeIds, setSelectedUpgradeIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [specSheet, setSpecSheet] = useState<SpecSheet | null>(null);
  const addToCart = useCartStore((s) => s.addToCart);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const cartCount = useCartStore((s) => s.items.reduce((sum, item) => sum + item.qty, 0));

  useEffect(() => {
    const fetchReplicas = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("arsenal")
        .select("id,title,description,price,image_url")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Неуспешно зареждане на базовите реплики.");
        setLoading(false);
        return;
      }

      const next = (data ?? []) as BaseReplica[];
      setReplicas(next);
      if (next[0]) setSelectedBaseId(next[0].id);
      setLoading(false);
    };

    fetchReplicas();
  }, []);

  const selectedBase = useMemo(() => replicas.find((item) => item.id === selectedBaseId) ?? null, [replicas, selectedBaseId]);
  const selectedUpgrades = useMemo(
    () => upgradeCategories.flatMap((category) => category.items).filter((item) => selectedUpgradeIds.includes(item.id)),
    [selectedUpgradeIds]
  );
  const total = useMemo(
    () => extractPrice(selectedBase?.price) + selectedUpgrades.reduce((sum, item) => sum + item.price, 0),
    [selectedBase, selectedUpgrades]
  );
  const selectedIds = useMemo(
    () => [selectedBase?.id, ...selectedUpgrades.map((item) => item.id)].filter(Boolean) as string[],
    [selectedBase, selectedUpgrades]
  );
  const compactSelectedIds = useMemo(() => selectedIds.map((id) => id.slice(0, 8)).join(", "), [selectedIds]);

  const toggleUpgrade = (upgradeId: string) =>
    setSelectedUpgradeIds((current) => current.includes(upgradeId) ? current.filter((id) => id !== upgradeId) : [...current, upgradeId]);

  const buildDetails = (nextBuildId: string) => {
    if (!selectedBase) return "";
    return [
      `Build ID: ${nextBuildId}`,
      `Base Replica ID: ${selectedBase.id}`,
      `Base Replica: ${selectedBase.title}`,
      "",
      "Selected Upgrade IDs:",
      ...(selectedUpgrades.length ? selectedUpgrades.map((item) => `- ${item.id}`) : ["- none"]),
      "",
      "Upgrade Breakdown:",
      ...(selectedUpgrades.length ? selectedUpgrades.map((item) => `- ${item.title} (${formatPrice(item.price)})`) : ["- Base-only configuration"]),
      "",
      `Total Configuration Value: ${formatPrice(total)}`,
    ].join("\n");
  };

  const handleCheckout = () => {
    if (!selectedBase) return toast.error("Избери базова реплика първо.");
    const nextBuildId = makeBuildId();
    addToCart({
      id: `gunlab-${nextBuildId}`,
      title: `Gun Lab Build | ${selectedBase.title}`,
      price: total,
      image_url: selectedBase.image_url ?? undefined,
      details: buildDetails(nextBuildId),
    });
    setCartOpen(true);
    toast.success("Конфигурацията е добавена в количката.");
  };

  const handleGenerateSpecSheet = () => {
    if (!selectedBase) return toast.error("Избери базова реплика първо.");
    setSpecSheet({
      buildId: makeBuildId(),
      createdAt: new Date().toLocaleString("bg-BG"),
      base: selectedBase,
      upgrades: selectedUpgrades,
      total,
      selectedIds,
    });
  };

  const copySpecSheet = async () => {
    if (!specSheet || typeof navigator === "undefined" || !navigator.clipboard) {
      return toast.error("Клипбордът не е наличен.");
    }

    const summary = [
      "VAZOV RIFLES // GUN LAB",
      `Build ID: ${specSheet.buildId}`,
      `Generated: ${specSheet.createdAt}`,
      `Base: ${specSheet.base.title} (${specSheet.base.id})`,
      ...(specSheet.upgrades.length
        ? specSheet.upgrades.map((item) => `- ${item.title} [${item.id}] ${formatPrice(item.price)}`)
        : ["- Base-only configuration"]),
      `Total: ${formatPrice(specSheet.total)}`,
      `Selected IDs: ${specSheet.selectedIds.join(", ")}`,
    ].join("\n");

    await navigator.clipboard.writeText(summary);
    toast.success("Спецификацията е копирана.");
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#04070d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(127,29,29,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(127,29,29,0.18)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.15),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(34,211,238,0.12),transparent_24%),linear-gradient(180deg,#020408_0%,#04070d_48%,#090d15_100%)]" />
        <div className="absolute left-[-8%] top-24 h-80 w-80 rounded-full bg-red-600/10 blur-[120px]" />
        <div className="absolute right-[-6%] top-32 h-96 w-96 rounded-full bg-cyan-400/10 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-6 md:px-8 md:pt-8">
        <header className="absolute left-4 right-4 top-6 z-20 md:left-8 md:right-8 md:top-8">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Link to="/" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-gray-300 transition hover:border-red-500/40 hover:text-white">
                  <ArrowLeft size={18} />
                </Link>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.42em] text-red-400">ПРЕМИУМ СЕКЦИЯ</div>
                  <div className="text-xl font-black uppercase tracking-[0.24em]">Gun Lab</div>
                </div>
              </div>
              <button type="button" onClick={() => setCartOpen(true)} className="relative inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-bold uppercase tracking-[0.24em] text-gray-200 transition hover:border-red-500/40 hover:text-white">
                <ShoppingCart size={16} />
                Cart
                {cartCount > 0 && <span className="absolute -right-2 -top-2 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full border border-red-300/40 bg-red-600 px-1 text-[10px] shadow-[0_0_20px_rgba(239,68,68,0.65)]">{cartCount}</span>}
              </button>
            </div>
          </div>
        </header>

        <section className="pt-28 md:pt-36">
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="relative rounded-[36px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.4)] md:p-8">
              <div className="absolute left-6 right-6 top-6 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.35em] text-red-300"><Sparkles size={14} /> Tactical Blueprint Configurator</div>
                  <h1 className="text-5xl leading-tight font-black uppercase tracking-[0.16em] md:text-7xl">СГЛОБИ СВОЯТА<span className="block bg-gradient-to-r from-red-400 via-white to-cyan-300 bg-clip-text text-transparent">СИСТЕМА</span></h1>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">Избери базова реплика от арсенала, добави елитни компоненти и поръчай директно конфигурацията си.</p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                  <div className="flex-shrink-0 rounded-[28px] border border-white/10 bg-black/25 px-5 py-4">
                    <div className="text-[10px] uppercase tracking-[0.35em] text-slate-400">ОБЩО</div>
                    <div className="mt-2 whitespace-nowrap text-3xl font-black tracking-[0.14em] text-red-400 md:text-4xl">
                      <RollingPrice value={total} />
                    </div>
                  </div>
                  <div className="flex-shrink-0 rounded-[28px] border border-white/10 bg-black/25 px-5 py-4">
                    <div className="text-[10px] uppercase tracking-[0.35em] text-slate-400">КОДОВЕ</div>
                    <div className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                      {compactSelectedIds || "НЯМА ИЗБРАНИ"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-[36px] border border-red-500/15 bg-black/30 p-6 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.4)] md:p-8">
              <div className="flex h-full flex-col justify-between gap-6">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.38em] text-red-300">ИЗБРАНА ПЛАТФОРМА</div>
                  <h2 className="mt-3 text-3xl font-black uppercase tracking-[0.16em]">{selectedBase?.title ?? "НЯМА ИЗБРАНА РЕПЛИКА"}</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{selectedBase?.description ?? "Избери базова реплика, за да отключиш модулите за конфигурация."}</p>
                </div>
                <div className="flex flex-col gap-3 md:gap-4">
                  <button type="button" onClick={handleGenerateSpecSheet} className="inline-flex h-auto w-full items-center justify-center gap-2 rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-center text-xs font-bold uppercase leading-tight tracking-[0.25em] whitespace-normal text-white transition hover:border-cyan-300/30 hover:bg-cyan-400/10 sm:text-sm"><Clipboard size={16} /> СПЕЦИФИКАЦИЯ</button>
                  <button type="button" onClick={handleCheckout} className="inline-flex h-auto w-full items-center justify-center gap-2 rounded-[22px] border border-red-400/40 bg-red-600 px-4 py-3 text-center text-xs font-bold uppercase leading-tight tracking-[0.25em] whitespace-normal text-white shadow-[0_0_35px_rgba(239,68,68,0.4)] transition hover:bg-red-500 sm:text-sm"><ShoppingCart size={16} /> ПОРЪЧАЙ КОНФИГУРАЦИЯТА</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-10 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_30px_100px_rgba(0,0,0,0.38)] md:p-8">
            <div className="mb-6"><div className="text-[10px] uppercase tracking-[0.36em] text-slate-400">Step 01</div><h3 className="mt-2 text-2xl font-black uppercase tracking-[0.16em]">БАЗОВА РЕПЛИКА</h3></div>
            {loading ? (
              <div className="flex h-72 items-center justify-center rounded-[28px] border border-white/10 bg-black/25"><Loader2 className="animate-spin text-red-400" size={28} /></div>
            ) : replicas.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-white/10 bg-black/25 p-8 text-sm uppercase tracking-[0.22em] text-slate-400">Няма налични базови реплики.</div>
            ) : (
              <div className="grid gap-4">
                {replicas.map((replica) => {
                  const isSelected = replica.id === selectedBaseId;
                  return (
                    <button key={replica.id} type="button" onClick={() => setSelectedBaseId(replica.id)} className={`group rounded-[28px] border p-4 text-left transition duration-300 md:p-5 ${isSelected ? "border-red-400/50 bg-red-500/10 shadow-[0_0_40px_rgba(239,68,68,0.18)]" : "border-white/10 bg-black/25 hover:border-cyan-300/30 hover:bg-white/[0.05]"}`}>
                      <div className="grid gap-4 md:grid-cols-[172px_1fr]">
                        <div className="relative h-36 overflow-hidden rounded-[22px] border border-white/10 bg-[#05070d]">
                          {replica.image_url ? <img src={replica.image_url} alt={replica.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-[11px] uppercase tracking-[0.28em] text-slate-500">Няма визуализация</div>}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#04070d] via-transparent to-transparent" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.35em] text-slate-500">КОД</div>
                              <h4 className="mt-2 text-xl font-black uppercase tracking-[0.12em] text-white">{replica.title}</h4>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="rounded-full border border-white/10 bg-black/30 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-red-300">{formatPrice(extractPrice(replica.price))}</div>
                              {isSelected && <div className="relative inline-flex items-center gap-2 rounded-full border border-red-400/40 bg-red-500/15 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-red-200"><motion.span aria-hidden="true" className="absolute inset-0 rounded-full border border-red-400/60" animate={{ opacity: [0.25, 0.9, 0.25], scale: [1, 1.08, 1] }} transition={{ duration: 1.6, repeat: Infinity }} /><Check size={13} className="relative z-10" /><span className="relative z-10">Избрана</span></div>}
                            </div>
                          </div>
                          <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-300">{replica.description || "Платформа, подготвена за премиум конфигурация."}</p>
                          <div className="mt-5 text-[11px] uppercase tracking-[0.25em] text-cyan-200/80">{replica.id}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_30px_100px_rgba(0,0,0,0.38)] md:p-8">
            <div className="mb-6 flex items-center justify-between"><div><div className="text-[10px] uppercase tracking-[0.36em] text-slate-400">Step 02</div><h3 className="mt-2 text-2xl font-black uppercase tracking-[0.16em]">КАТЕГОРИИ</h3></div><div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-2 text-[11px] uppercase tracking-[0.28em] text-red-200"><Wrench size={13} /> МОДУЛИ</div></div>
            {!selectedBase ? (
              <div className="rounded-[28px] border border-dashed border-white/10 bg-black/25 p-8 text-sm uppercase tracking-[0.22em] text-slate-400">Избери базова реплика, за да отключиш категориите.</div>
            ) : (
              <div className="grid gap-5">
                {upgradeCategories.map((category) => (
                  <div key={category.id} className="rounded-[28px] border border-white/10 bg-black/25 p-5 md:p-6">
                    <div><div className="text-[10px] uppercase tracking-[0.34em] text-slate-500">{category.id.replace(/-/g, " ")}</div><h4 className="mt-2 text-xl font-black uppercase tracking-[0.12em] text-white">{category.title}</h4><p className="mt-2 text-sm text-slate-300">{category.subtitle}</p></div>
                    <div className="mt-5 grid gap-4">
                      {category.items.map((item) => {
                        const active = selectedUpgradeIds.includes(item.id);
                        return (
                          <button key={item.id} type="button" onClick={() => toggleUpgrade(item.id)} className={`group relative rounded-[24px] border px-4 py-4 text-left transition duration-300 md:px-5 ${active ? "border-red-400/50 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.12)]" : "border-white/10 bg-white/[0.02] hover:border-cyan-300/30 hover:bg-white/[0.05]"}`}>
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className="text-lg font-black uppercase tracking-[0.1em] text-white">{item.title}</span>
                                  {active && <div className="relative inline-flex items-center gap-2 rounded-full border border-red-400/40 bg-red-500/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-red-200"><motion.span aria-hidden="true" className="absolute inset-0 rounded-full border border-red-400/60" animate={{ opacity: [0.25, 0.85, 0.25], scale: [1, 1.08, 1] }} transition={{ duration: 1.4, repeat: Infinity }} /><span className="relative z-10">Избрано</span></div>}
                                </div>
                                <p className="mt-2 text-sm leading-7 text-slate-300">{item.description}</p>
                                <div className="mt-3 text-[11px] uppercase tracking-[0.26em] text-cyan-200/70">Module ID: {item.id}</div>
                              </div>
                              <div className="flex items-center justify-between gap-4 md:block md:text-right"><div className="text-xl font-black uppercase tracking-[0.12em] text-red-300">{formatPrice(item.price)}</div><div className="mt-2 text-[11px] uppercase tracking-[0.24em] text-slate-400">Превключи модул</div></div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {specSheet && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[36px] border border-white/10 bg-[#070b13] shadow-[0_40px_140px_rgba(0,0,0,0.7)]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="relative border-b border-white/10 px-6 py-5 md:px-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div><div className="text-[10px] uppercase tracking-[0.38em] text-cyan-200/70">Споделяне</div><h3 className="mt-2 text-3xl font-black uppercase tracking-[0.16em] text-white">Спецификация</h3></div>
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={copySpecSheet} className="rounded-[18px] border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.22em] text-cyan-100 transition hover:bg-cyan-400/15">Копирай</button>
                  <button type="button" onClick={() => setSpecSheet(null)} className="rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold uppercase tracking-[0.22em] text-slate-200 transition hover:bg-white/[0.08]">Затвори</button>
                </div>
              </div>
            </div>
            <div className="relative grid gap-6 px-6 py-6 md:grid-cols-[1fr_0.8fr] md:px-8 md:py-8">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
                  <div><div className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Build ID</div><div className="mt-2 text-2xl font-black uppercase tracking-[0.16em] text-red-300">{specSheet.buildId}</div></div>
                  <div className="text-right"><div className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Генерирана</div><div className="mt-2 text-sm uppercase tracking-[0.22em] text-cyan-100">{specSheet.createdAt}</div></div>
                </div>
                <div className="mt-6"><div className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Платформа</div><div className="mt-2 text-2xl font-black uppercase tracking-[0.14em] text-white">{specSheet.base.title}</div><div className="mt-2 text-sm text-slate-300">{specSheet.base.id}</div></div>
                <div className="mt-8"><div className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Модули</div><div className="mt-4 space-y-3">{specSheet.upgrades.length ? specSheet.upgrades.map((item) => <div key={item.id} className="flex items-center justify-between rounded-[20px] border border-white/10 bg-black/20 px-4 py-3"><div><div className="text-sm font-bold uppercase tracking-[0.12em] text-white">{item.title}</div><div className="mt-1 text-[11px] uppercase tracking-[0.25em] text-cyan-100/70">{item.id}</div></div><div className="text-sm font-black uppercase tracking-[0.14em] text-red-300">{formatPrice(item.price)}</div></div>) : <div className="rounded-[20px] border border-dashed border-white/10 bg-black/20 px-4 py-6 text-sm uppercase tracking-[0.18em] text-slate-400">Няма избрани модули.</div>}</div></div>
              </div>
              <div className="space-y-6">
                <div className="rounded-[28px] border border-red-500/20 bg-red-500/10 p-6"><div className="text-[10px] uppercase tracking-[0.35em] text-red-200/70">Общо</div><div className="mt-3 text-4xl font-black uppercase tracking-[0.16em] text-red-300">{formatPrice(specSheet.total)}</div></div>
                <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6"><div className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Кодове</div><div className="mt-4 flex flex-wrap gap-2">{specSheet.selectedIds.map((id) => <span key={id} className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-100">{id}</span>)}</div></div>
                <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6"><div className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Бележка</div><p className="mt-4 text-sm leading-7 text-slate-300">Тази спецификация е генерирана от текущата Gun Lab конфигурация и може да бъде използвана при запитване или поръчка.</p></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GunLabPage;
