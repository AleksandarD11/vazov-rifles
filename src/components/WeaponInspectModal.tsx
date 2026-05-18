import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, X } from "lucide-react";

export type InspectWeapon = {
  id: string;
  title: string;
  description: string | null;
  price: string | number | null;
  image_url: string | null;
};

const extractPrice = (value: string | number | null | undefined) => {
  const normalized = String(value ?? "").replace(",", ".").replace(/[^0-9.]/g, "");
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const scramble = "01X#[]<>";

const buildTerminalFrames = (text: string) =>
  text.split("").map((_, index) =>
    text
      .split("")
      .map((char, charIndex) => {
        if (char === " ") return " ";
        if (charIndex < index) return text[charIndex];
        return scramble[(charIndex + index) % scramble.length];
      })
      .join("")
  );

const useTerminalTypewriter = (text: string, active: boolean, speed = 38) => {
  const [output, setOutput] = useState("");
  const frames = useMemo(() => buildTerminalFrames(text), [text]);

  useEffect(() => {
    if (!active) {
      setOutput("");
      return;
    }

    let frameIndex = 0;
    setOutput(frames[0] ?? "");
    const timer = window.setInterval(() => {
      frameIndex += 1;
      if (frameIndex >= frames.length) {
        setOutput(text);
        window.clearInterval(timer);
        return;
      }
      setOutput(frames[frameIndex]);
    }, speed);

    return () => window.clearInterval(timer);
  }, [active, frames, speed, text]);

  return output || text;
};

const WeaponInspectModal = ({
  weapon,
  open,
  onClose,
}: {
  weapon: InspectWeapon | null;
  open: boolean;
  onClose: () => void;
}) => {
  const finalPrice = `${extractPrice(weapon?.price).toFixed(2)} €`;
  const titleText = useTerminalTypewriter(weapon?.title ?? "", open, 44);
  const priceText = useTerminalTypewriter(finalPrice, open, 28);
  const showStats = open && titleText === (weapon?.title ?? "") && priceText === finalPrice;

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && weapon && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] overflow-y-auto overflow-x-hidden bg-black"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.28),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(220,38,38,0.14),transparent_30%),linear-gradient(180deg,#020202_0%,#050505_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] opacity-15" />

          <button
            type="button"
            onClick={onClose}
            className="fixed right-4 top-4 z-30 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-gray-300 transition hover:border-red-500/40 hover:text-white sm:right-6 sm:top-6 sm:h-12 sm:w-12"
          >
            <X size={18} />
          </button>

          <div className="relative z-10 grid min-h-screen items-center gap-6 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:px-14">
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 1.5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full max-w-3xl"
              >
                <div className="absolute inset-0 rounded-[36px] bg-red-600/10 blur-[120px]" />
                <img
                  src={weapon.image_url ?? ""}
                  alt={weapon.title}
                  className="relative z-10 max-h-[42vh] w-full object-contain drop-shadow-[0_35px_60px_rgba(0,0,0,0.75)] sm:max-h-[55vh] lg:max-h-[70vh]"
                />
              </motion.div>
            </div>

            <div className="min-w-0 rounded-[24px] border border-red-500/20 bg-white/[0.03] p-5 backdrop-blur-xl shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:rounded-[36px] sm:p-8">
              <div className="flex min-w-0 items-center gap-3 text-red-400">
                <Crosshair size={18} />
                <span className="break-words text-[10px] font-bold uppercase tracking-[0.18em] sm:text-[11px] sm:tracking-[0.35em]">
                  СИСТЕМНА ДИАГНОСТИКА
                </span>
              </div>

              <div className="mt-8">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-green-300/70 sm:text-[11px] sm:tracking-[0.34em]">
                  [ ДЕКРИПТИРАНЕ НА ДАННИ... ]
                </div>
                <h3 className="mt-3 min-h-[72px] break-words font-mono text-2xl font-black uppercase tracking-[0.08em] text-green-300 sm:min-h-[96px] sm:text-4xl sm:tracking-[0.14em]">
                  {titleText}
                </h3>
              </div>

              <div className="mt-8">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-300/70 sm:text-[11px] sm:tracking-[0.34em]">
                  [ БАЗОВА ЦЕНА ]
                </div>
                <div className="mt-3 break-words font-mono text-2xl font-black uppercase tracking-[0.1em] text-red-400 sm:text-3xl sm:tracking-[0.18em]">
                  {priceText}
                </div>
              </div>

              <p className="mt-8 max-w-xl text-sm leading-7 text-gray-300">
                {weapon.description || "Криптираните бележки на оператора не са налични. Препоръчва се визуален преглед преди разгръщане."}
              </p>

              <AnimatePresence>
                {showStats && (
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 18 }}
                    className="mt-8 rounded-[24px] border border-white/10 bg-black/30 p-4 sm:mt-10 sm:rounded-[28px] sm:p-6"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 sm:text-[11px] sm:tracking-[0.34em]">
                      ТАКТИЧЕСКИ ПОКАЗАТЕЛИ
                    </div>
                    <div className="mt-5 flex items-center justify-center">
                      <div className="relative h-44 w-44 rounded-full border border-red-500/30 sm:h-56 sm:w-56">
                        <div className="absolute inset-5 rounded-full border border-red-500/20" />
                        <div className="absolute inset-10 rounded-full border border-red-500/15" />
                        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg,rgba(220,38,38,0.08),rgba(255,255,255,0.02),rgba(220,38,38,0.08))]" />
                        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-red-500/20" />
                        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-red-500/20" />
                        <div className="absolute inset-[22%] rotate-12 rounded-full border border-green-400/40 bg-green-400/10" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default WeaponInspectModal;
