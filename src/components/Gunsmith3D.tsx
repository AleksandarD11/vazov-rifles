import { Suspense, useEffect, useMemo, useRef, useState, type ElementRef, type PointerEvent } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Box3, TOUCH, Vector3 } from "three";
import { RotateCcw, ShoppingCart, Sparkles, Zap } from "lucide-react";
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
const initialWeaponRotation = { x: 0, y: 0 };
const maxWeaponTilt = 0.42;

const attachmentModels: Record<AttachmentKey, string> = {
  optic: "/models/optic.glb",
  suppressor: "/models/suppressor.glb",
  laser: "/models/laser.glb",
  grip: "/models/grip.glb",
};

const attachmentTransforms: Record<
  AttachmentKey,
  {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
  }
> = {
  optic: { position: [-0.01, 0.4, 0.01], rotation: [6.25, -Math.PI / 1, 0.01], scale: 5 },
  suppressor: { position: [-0.02, -0.07, -3.1], rotation: [6.25, -Math.PI / 1, 1], scale: 0.002 },
  laser: { position: [-0.24, 0, -1.1], rotation: [5, -Math.PI / 2, 1.9], scale: 0.1 },
  grip: { position: [0, -0.21, 0.15], rotation: [6.25, -Math.PI / 1, 0], scale: 8 },
};

const AttachmentModel = ({ attachmentKey }: { attachmentKey: AttachmentKey }) => {
  const { scene } = useGLTF(attachmentModels[attachmentKey]);
  const modelScene = useMemo(() => scene.clone(), [scene]);
  const transform = attachmentTransforms[attachmentKey];

  return <primitive object={modelScene} {...transform} />;
};

const initialCameraPosition = new Vector3(0.35, 1.12, 7.15);
const initialControlTarget = new Vector3(0, -0.05, 0);

const ViewerControls = ({ resetToken }: { resetToken: number }) => {
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null);
  const { camera, gl } = useThree();

  useEffect(() => {
    camera.position.copy(initialCameraPosition);
    camera.near = 0.1;
    camera.far = 80;
    camera.updateProjectionMatrix();
    controlsRef.current?.target.copy(initialControlTarget);
    controlsRef.current?.update();
  }, [camera, resetToken]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      args={[camera, gl.domElement]}
      enablePan={false}
      enableRotate={false}
      enableZoom={true}
      enableDamping={true}
      dampingFactor={0.055}
      zoomSpeed={0.85}
      minDistance={2.8}
      maxDistance={12}
      autoRotate={false}
      touches={{
        TWO: TOUCH.DOLLY_PAN,
      }}
    />
  );
};

const WeaponRig = ({
  equipped,
  rotation,
}: {
  equipped: Record<AttachmentKey, boolean>;
  rotation: { x: number; y: number };
}) => {
  const { scene } = useGLTF("/models/m16_assault_rifle.glb");

  const weaponAsset = useMemo(() => {
    const clone = scene.clone();
    const bounds = new Box3().setFromObject(clone);
    const size = bounds.getSize(new Vector3());
    const largestAxis = Math.max(size.x, size.y, size.z) || 1;
    const scale = 5.55 / largestAxis;
    clone.scale.setScalar(scale);
    const scaledBounds = new Box3().setFromObject(clone);
    const center = scaledBounds.getCenter(new Vector3());

    return {
      scene: clone,
      offset: [-center.x, -center.y, -center.z] as [number, number, number],
    };
  }, [scene]);

  return (
    <group rotation={[rotation.x, rotation.y, 0]}>
      <group position={weaponAsset.offset} rotation={[0, 1.57, 0]}>
        <primitive object={weaponAsset.scene} />

        {attachmentOptions.map((option) =>
          equipped[option.key] ? <AttachmentModel key={option.key} attachmentKey={option.key} /> : null
        )}
      </group>
    </group>
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
  const [resetToken, setResetToken] = useState(0);
  const [weaponRotation, setWeaponRotation] = useState(initialWeaponRotation);
  const dragState = useRef({ active: false, lastX: 0, lastY: 0 });

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

  const resetView = () => {
    setWeaponRotation(initialWeaponRotation);
    setResetToken((value) => value + 1);
  };

  const handleViewerPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    dragState.current = { active: true, lastX: event.clientX, lastY: event.clientY };
    if (event.pointerType !== "touch") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handleViewerPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;

    const deltaX = event.clientX - dragState.current.lastX;
    const deltaY = event.clientY - dragState.current.lastY;
    dragState.current.lastX = event.clientX;
    dragState.current.lastY = event.clientY;

    setWeaponRotation((current) => ({
      x: Math.max(-maxWeaponTilt, Math.min(maxWeaponTilt, current.x + deltaY * 0.004)),
      y: current.y + deltaX * 0.008,
    }));
  };

  const handleViewerPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    dragState.current.active = false;
    if (event.pointerType !== "touch" && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
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
    <section className="relative min-h-screen overflow-x-hidden bg-[#040404] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(245,245,245,0.12),transparent_18%),radial-gradient(circle_at_50%_48%,rgba(220,38,38,0.14),transparent_34%),linear-gradient(180deg,#090909_0%,#030303_58%,#070707_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.72)_78%)]" />
        <div className="absolute bottom-0 left-1/2 h-px w-[90vw] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="absolute -left-20 top-32 h-72 w-72 rounded-full bg-red-600/10 blur-[130px]" />
        <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-white/5 blur-[150px]" />
      </div>

      <div
        className="pointer-events-auto relative z-0 h-[360px] w-full max-w-full touch-none overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(180deg,#0a0a0a,#030303)] sm:h-[460px] lg:absolute lg:inset-0 lg:h-full lg:border-b-0"
        onPointerDown={handleViewerPointerDown}
        onPointerMove={handleViewerPointerMove}
        onPointerUp={handleViewerPointerEnd}
        onPointerCancel={handleViewerPointerEnd}
        onPointerLeave={handleViewerPointerEnd}
      >
        <div className="pointer-events-none absolute inset-x-4 top-16 z-10 flex items-center justify-between gap-3 sm:inset-x-6 lg:inset-x-8">
          <div className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300 backdrop-blur-xl sm:text-[11px] sm:tracking-[0.22em]">
            <span className="hidden sm:inline">Drag to rotate weapon вЂў Scroll to zoom</span>
            <span className="sm:hidden">Swipe to rotate вЂў Pinch to zoom</span>
          </div>
          <button
            type="button"
            onClick={resetView}
            className="pointer-events-auto inline-flex min-h-[40px] shrink-0 items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-black/45 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-red-200 backdrop-blur-xl transition hover:border-red-400/60 hover:bg-red-600/15 hover:text-white sm:min-h-[44px] sm:px-4 sm:tracking-[0.2em] lg:hidden"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Reset view</span>
          </button>
        </div>
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center px-6 text-center text-xs font-bold uppercase tracking-[0.22em] text-red-300 sm:text-sm sm:tracking-[0.28em]">Зареждане на 3D модела...</div>}>
          <Canvas
            className="pointer-events-auto h-full w-full"
            camera={{ position: [initialCameraPosition.x, initialCameraPosition.y, initialCameraPosition.z], fov: 40, near: 0.1, far: 80 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            shadows
          >
            <fog attach="fog" args={["#050505", 10, 22]} />
            <hemisphereLight args={["#f8fafc", "#111111", 0.55]} />
            <ambientLight intensity={0.42} color="#f5f5f5" />
            <directionalLight position={[4, 5, 4]} intensity={2.1} color="#ffffff" />
            <directionalLight position={[-5, 2.5, -4]} intensity={1.05} color="#ef4444" />
            <spotLight position={[0, 5.2, 5.8]} angle={0.42} penumbra={0.75} intensity={1.35} color="#ffffff" castShadow />
            <spotLight position={[-4, 2.6, 2.5]} angle={0.5} penumbra={0.8} intensity={0.65} color="#fecaca" />
            <Environment preset="studio" environmentIntensity={0.75} />

            <group position={[-0.35, -0.18, 0]}>
              <WeaponRig equipped={equipped} rotation={weaponRotation} />
            </group>

            <gridHelper args={[12, 24, "#3f3f46", "#18181b"]} position={[0, -1.18, 0]} />
            <ContactShadows position={[0, -1.16, 0]} opacity={0.38} scale={8} blur={2.4} far={3.2} color="#000000" />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
              <planeGeometry args={[36, 36]} />
              <meshStandardMaterial color="#050505" metalness={0.02} roughness={0.92} />
            </mesh>

            <ViewerControls resetToken={resetToken} />
          </Canvas>
        </Suspense>
      </div>

      <div className="pointer-events-none relative z-10 flex w-full min-w-0 justify-center px-4 pb-6 pt-4 sm:px-6 lg:min-h-screen lg:items-end lg:justify-end lg:p-6 xl:p-8">
        <div className="pointer-events-auto w-full max-w-full min-w-0 rounded-[24px] border border-red-500/20 bg-black/65 p-4 backdrop-blur-2xl shadow-[0_25px_90px_rgba(0,0,0,0.55)] sm:rounded-[28px] sm:p-5 md:p-6 lg:max-w-[360px] lg:bg-black/45 lg:p-5 xl:max-w-[390px] xl:p-6">
          <div className="mb-4 flex min-w-0 items-start justify-between gap-3 sm:mb-5 sm:gap-4 lg:mb-4">
            <div className="min-w-0">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-2 text-[10px] font-bold uppercase leading-tight tracking-[0.18em] text-red-300 sm:text-[11px] sm:tracking-[0.34em]">
                <Sparkles size={14} />
                3D ORUZHEINIK
              </div>
              <h2 className="mt-3 break-words text-2xl font-black uppercase leading-tight tracking-[0.06em] text-white sm:text-3xl sm:tracking-[0.1em] md:text-4xl lg:mt-3 lg:text-[1.65rem] lg:tracking-[0.04em] xl:text-3xl xl:tracking-[0.06em]">
                ТАКТИЧЕСКИ
                <span className="block bg-gradient-to-r from-red-400 via-white to-red-200 bg-clip-text text-transparent">
                  KONFIGURATOR
                </span>
              </h2>
            </div>
            <button
              type="button"
              onClick={resetView}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-red-300 transition hover:border-red-400/40 hover:text-white sm:h-11 sm:w-11"
              aria-label="Нулирай камерата"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          <p className="text-sm leading-6 text-slate-300 sm:leading-7 lg:text-xs lg:leading-5 xl:text-sm xl:leading-6">
            Избери модулите вдясно и завърти оръжието свободно. Камерата остава стабилна, а scroll/pinch управляват приближаването.
          </p>

          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-bold uppercase leading-tight tracking-[0.18em] text-slate-400 sm:hidden">
            Плъзни върху модела, за да го завъртиш. Приближи с два пръста.
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 lg:mt-4 lg:block lg:space-y-2 xl:space-y-3">
            {attachmentOptions.map((option) => {
              const active = equipped[option.key];
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => toggleAttachment(option.key)}
                  className={`group relative flex min-h-[92px] w-full min-w-0 flex-col items-start justify-between overflow-hidden rounded-[18px] border px-3 py-3 text-left transition duration-300 sm:min-h-[96px] sm:px-4 sm:py-4 lg:min-h-[64px] lg:flex-row lg:items-center lg:rounded-[18px] lg:px-3 lg:py-2.5 xl:min-h-[68px] xl:px-4 xl:py-3 ${
                    active
                      ? "border-red-400/45 bg-red-500/10 shadow-[0_0_30px_rgba(220,38,38,0.14)]"
                      : "border-white/10 bg-white/[0.03] hover:border-red-400/25 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r opacity-70 transition ${option.accent}`} />
                  <div className="relative min-w-0 max-w-full">
                    <div className="break-words text-xs font-black uppercase leading-tight tracking-[0.08em] text-white sm:text-sm sm:tracking-[0.14em] lg:text-xs lg:tracking-[0.12em] xl:text-sm xl:tracking-[0.16em]">{option.label}</div>
                    <div className="mt-1 break-words text-[10px] uppercase leading-tight tracking-[0.12em] text-slate-400 sm:text-[11px] sm:tracking-[0.2em] lg:text-[10px] lg:tracking-[0.16em] xl:text-[11px] xl:tracking-[0.22em]">
                      {active ? "АКТИВЕН МОДУЛ" : "НАЛИЧЕН СЛОТ"}
                    </div>
                  </div>
                  <div className="relative mt-3 flex w-full items-center justify-between gap-2 lg:mt-0 lg:w-auto lg:justify-start lg:gap-3 lg:pl-4">
                    <span className="text-sm font-bold uppercase tracking-[0.14em] text-red-200 xl:tracking-[0.2em]">+{option.price}€</span>
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

          <div className="mt-4 rounded-[20px] border border-white/10 bg-black/35 p-3.5 sm:mt-5 sm:rounded-[22px] sm:p-4 xl:p-5">
            <div className="grid grid-cols-1 gap-3 sm:flex sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.26em] text-slate-400 sm:text-[11px] sm:tracking-[0.34em]">ОБЩА ЦЕНА</div>
                <div className="mt-1.5 text-2xl font-black uppercase tracking-[0.1em] text-red-400 sm:text-3xl sm:tracking-[0.14em] lg:text-2xl xl:text-3xl">{totalPrice.toFixed(2)} €</div>
              </div>
              <div className="min-w-0 sm:text-right">
                <div className="text-[10px] uppercase tracking-[0.26em] text-slate-400 sm:text-[11px] sm:tracking-[0.34em]">CONFIGURATION</div>
                <div className="mt-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100 sm:tracking-[0.24em]">
                  {selectedAttachments.length ? selectedAttachments.length : 0} МОДУЛА
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center gap-3 rounded-[18px] border border-red-400/40 bg-red-600 px-4 py-3.5 text-center text-xs font-black uppercase leading-tight tracking-[0.14em] text-white shadow-[0_0_35px_rgba(220,38,38,0.28)] transition hover:bg-red-500 sm:rounded-[20px] sm:text-sm sm:tracking-[0.22em] lg:text-xs xl:text-sm"
            >
              <ShoppingCart size={18} />
              ДОБАВИ В КОЛИЧКАТА
            </button>

            <div className="mt-3 flex min-w-0 items-start gap-2 text-[10px] uppercase leading-relaxed tracking-[0.14em] text-slate-500 sm:text-[11px] sm:tracking-[0.24em] lg:text-[10px] lg:tracking-[0.16em] xl:text-[11px] xl:tracking-[0.24em]">
              <Zap size={14} className="mt-1 shrink-0 text-red-400" />
              PLATFORM VZR-01 // MATTE GUNMETAL // LIVE 3D VISUALIZATION
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gunsmith3D;


