import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, Environment, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Box3, Vector3 } from "three";
import { ShoppingCart, Sparkles, Target, Zap } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";

type AttachmentKey = "optic" | "suppressor" | "laser" | "grip";

type AttachmentOption = {
  key: AttachmentKey;
  label: string;
  price: number;
  accent: string;
};

const attachmentOptions: AttachmentOption[] = [
  { key: "optic", label: "ОПТИКА (HOLO)", price: 50, accent: "from-red-500/25 to-red-500/5" },
  { key: "suppressor", label: "СУПРЕСОР", price: 40, accent: "from-white/15 to-white/5" },
  { key: "laser", label: "ТАКТИЧЕСКИ ЛАЗЕР", price: 30, accent: "from-red-600/25 to-red-950/10" },
  { key: "grip", label: "ГРИП", price: 15, accent: "from-cyan-400/20 to-cyan-950/10" },
];

const basePrice = 320;

const WeaponRig = ({
  equipped,
}: {
  equipped: Record<AttachmentKey, boolean>;
}) => {
  const { scene } = useGLTF("/models/m16_assault_rifle.glb");
  const opticGlb = useGLTF("/models/optic.glb");
  const suppressorGlb = useGLTF("/models/suppressor.glb");
  const laserGlb = useGLTF("/models/laser.glb");
  const gripGlb = useGLTF("/models/grip.glb");

  const normalizedScene = useMemo(() => {
    const clone = scene.clone();
    const bounds = new Box3().setFromObject(clone);
    const size = bounds.getSize(new Vector3());
    const largestAxis = Math.max(size.x, size.y, size.z) || 1;
    const scale = 5.4 / largestAxis;
    clone.scale.setScalar(scale);
    return clone;
  }, [scene]);
  const opticScene = useMemo(() => opticGlb.scene.clone(), [opticGlb.scene]);
  const suppressorScene = useMemo(() => suppressorGlb.scene.clone(), [suppressorGlb.scene]);
  const laserScene = useMemo(() => laserGlb.scene.clone(), [laserGlb.scene]);
  const gripScene = useMemo(() => gripGlb.scene.clone(), [gripGlb.scene]);

  return (
    <Center rotation={[0, 1.57, 0]}>
      <primitive object={normalizedScene} />

      {equipped.optic && (
        <primitive object={opticScene} position={[0, 0.6, 0]} rotation={[6.25, -Math.PI / 2.01, 0.01]} scale={5} />
      )}

      {equipped.suppressor && (
        <primitive object={suppressorScene} position={[-0.02, -0.07, -3.1]} rotation={[6.25, -Math.PI / 1, 1]} scale={0.002} />
      )}

      {equipped.laser && (
        <primitive object={laserScene} position={[0.18, 0, -1.1]} rotation={[5, -Math.PI / 2, 1.9]} scale={0.1} />
      )}

      {equipped.grip && (
        <primitive object={gripScene} position={[0, -0.21, 0.15]} rotation={[6.25, -Math.PI / 1, 0]} scale={8} />
      )}
    </Center>
  );
};

const Gunsmith3D = () => {
  const [equipped, setEquipped] = useState<Record<AttachmentKey, boolean>>({
    optic: false,
    suppressor: false,
    laser: false,
    grip: false,
  });
  const addToCart = useCartStore((s) => s.addToCart);
  const setCartOpen = useCartStore((s) => s.setCartOpen);

  const totalPrice = useMemo(
    () => basePrice + attachmentOptions.reduce((sum, option) => sum + (equipped[option.key] ? option.price : 0), 0),
    [equipped]
  );

  const selectedAttachments = useMemo(
    () => attachmentOptions.filter((option) => equipped[option.key]).map((option) => option.label),
    [equipped]
  );

  const toggleAttachment = (key: AttachmentKey) => {
    setEquipped((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleAddToCart = () => {
    addToCart({
      id: `gunsmith-3d-${Object.entries(equipped)
        .filter(([, active]) => active)
        .map(([key]) => key)
        .join("-") || "base"}`,
      title: "3D КОНФИГУРАТОР // ПЛАТФОРМА VZR-01",
      price: totalPrice,
      details: [
        "3D ОРЪЖЕЙНИК",
        "Платформа: VZR-01",
        `Компоненти: ${selectedAttachments.length ? selectedAttachments.join(", ") : "БАЗОВА КОНФИГУРАЦИЯ"}`,
        `Обща цена: ${totalPrice.toFixed(2)} €`,
      ].join("\n"),
    });
    setCartOpen(true);
    toast.success("3D конфигурацията е добавена в количката.");
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#040404] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.18),transparent_28%),linear-gradient(180deg,#020202_0%,#040404_50%,#080808_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.07)_1px,transparent_1px)] bg-[size:42px_42px] opacity-30" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-red-600/15 blur-[120px]" />
        <div className="absolute right-0 top-16 h-96 w-96 rounded-full bg-red-500/10 blur-[160px]" />
      </div>

      <div className="pointer-events-auto absolute inset-0 h-full w-full">
        <Canvas className="pointer-events-auto h-full w-full" camera={{ position: [3.2, 1.4, 6.4], fov: 38 }}>
          <Suspense fallback={<Html center className="rounded-full border border-red-500/30 bg-black/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.32em] text-red-300 backdrop-blur-xl">LOADING ASSETS...</Html>}>
            <fog attach="fog" args={["#040404", 7, 16]} />
            <ambientLight intensity={0.2} color="#f5f5f5" />
            <directionalLight position={[5, 6, 4]} intensity={1.6} color="#ffffff" />
            <directionalLight position={[-4, 3, -5]} intensity={1.05} color="#ef4444" />
            <directionalLight position={[2, -3, 5]} intensity={0.5} color="#fecaca" />
            <Environment preset="city" />

            <group position={[0, -0.1, 0]}>
              <WeaponRig equipped={equipped} />
            </group>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
              <planeGeometry args={[40, 40]} />
              <meshStandardMaterial color="#060606" metalness={0.1} roughness={0.95} />
            </mesh>

            <OrbitControls
              makeDefault
              enablePan={true}
              enableRotate={true}
              enableZoom={true}
              enableDamping={true}
              dampingFactor={0.04}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="pointer-events-none relative z-10 flex min-h-screen items-end justify-end p-4 md:p-8">
        <div className="pointer-events-auto w-full max-w-md rounded-[32px] border border-red-500/20 bg-black/45 p-5 backdrop-blur-2xl shadow-[0_25px_90px_rgba(0,0,0,0.55)] md:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.34em] text-red-300">
                <Sparkles size={14} />
                3D ОРЪЖЕЙНИК
              </div>
              <h2 className="mt-4 text-3xl font-black uppercase tracking-[0.16em] text-white md:text-4xl">
                ТАКТИЧЕСКИ
                <span className="block bg-gradient-to-r from-red-400 via-white to-red-200 bg-clip-text text-transparent">
                  КОНФИГУРАТОР
                </span>
              </h2>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-red-300 transition hover:border-red-400/40 hover:text-white"
              aria-label="Нулирай камерата"
            >
              <Target size={18} />
            </button>
          </div>

          <p className="text-sm leading-7 text-slate-300">
            Избери модулите вдясно и разгледай платформата свободно. Автоматичното въртене спира веднага щом поемеш контрол.
          </p>

          <div className="mt-6 space-y-3">
            {attachmentOptions.map((option) => {
              const active = equipped[option.key];
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => toggleAttachment(option.key)}
                  className={`group relative flex w-full items-center justify-between overflow-hidden rounded-[22px] border px-4 py-4 text-left transition duration-300 ${
                    active
                      ? "border-red-400/45 bg-red-500/10 shadow-[0_0_30px_rgba(220,38,38,0.14)]"
                      : "border-white/10 bg-white/[0.03] hover:border-red-400/25 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r opacity-70 transition ${option.accent}`} />
                  <div className="relative min-w-0">
                    <div className="text-sm font-black uppercase tracking-[0.18em] text-white">{option.label}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.3em] text-slate-400">
                      {active ? "АКТИВЕН МОДУЛ" : "НАЛИЧЕН СЛОТ"}
                    </div>
                  </div>
                  <div className="relative flex items-center gap-3 pl-4">
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-red-200">+{option.price}€</span>
                    <span
                      className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full border px-2 text-[10px] font-black uppercase tracking-[0.22em] ${
                        active ? "border-red-300/40 bg-red-500 text-white" : "border-white/10 bg-black/30 text-slate-400"
                      }`}
                    >
                      {active ? "ON" : "OFF"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/35 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.34em] text-slate-400">ОБЩА ЦЕНА</div>
                <div className="mt-2 text-3xl font-black uppercase tracking-[0.14em] text-red-400">{totalPrice.toFixed(2)} €</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-[0.34em] text-slate-400">КОНФИГУРАЦИЯ</div>
                <div className="mt-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-100">
                  {selectedAttachments.length ? selectedAttachments.length : 0} МОДУЛА
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-[22px] border border-red-400/40 bg-red-600 px-4 py-4 text-sm font-black uppercase tracking-[0.24em] text-white shadow-[0_0_35px_rgba(220,38,38,0.28)] transition hover:bg-red-500"
            >
              <ShoppingCart size={18} />
              ДОБАВИ В КОЛИЧКАТА
            </button>

            <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-slate-500">
              <Zap size={14} className="text-red-400" />
              ПЛАТФОРМА VZR-01 // МАТОВ GUNMETAL // ЖИВА 3D ВИЗУАЛИЗАЦИЯ
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

useGLTF.preload("/models/m16_assault_rifle.glb");
useGLTF.preload("/models/optic.glb");
useGLTF.preload("/models/suppressor.glb");
useGLTF.preload("/models/laser.glb");
useGLTF.preload("/models/grip.glb");

export default Gunsmith3D;
