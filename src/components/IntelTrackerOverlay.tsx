import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, LockOpen, ShieldAlert } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useIntelStore } from "@/store/useIntelStore";

const IntelTrackerOverlay = () => {
  const { pathname } = useLocation();
  const foundIntel = useIntelStore((state) => state.foundIntel);
  const [showUnlock, setShowUnlock] = useState(false);

  useEffect(() => {
    if (foundIntel === 3) {
      setShowUnlock(true);
    }
  }, [foundIntel]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <div className="fixed bottom-4 right-4 z-[9998] rounded-2xl border border-red-500/20 bg-[#040404]/88 px-4 py-3 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/30 bg-red-600/10 text-red-400">
            <Crosshair size={16} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.34em] text-red-300/70">
              Classified Intel Recovered
            </div>
            <div className="text-sm font-black uppercase tracking-[0.22em] text-white">
              {foundIntel}/3
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showUnlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden bg-black/92 px-4"
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(239,68,68,0.08)_45%,rgba(239,68,68,0.18)_50%,rgba(239,68,68,0.08)_55%,transparent_100%)] animate-pulse" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="relative w-full max-w-2xl rounded-[32px] border border-red-500/30 bg-[#050505]/96 p-8 text-center shadow-[0_0_120px_rgba(220,38,38,0.16)] backdrop-blur-2xl"
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:22px_22px] opacity-20" />
              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-600/10 text-red-400">
                  <LockOpen size={28} />
                </div>
                <div className="mt-5 text-[11px] uppercase tracking-[0.42em] text-red-300/70">
                  System Breach Confirmed
                </div>
                <h3 className="mt-4 text-4xl font-black uppercase tracking-[0.24em] text-white">
                  ACCESS GRANTED
                </h3>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-300">
                  All hidden intel caches have been recovered. Command has authorized the ghost cell promotion package.
                </p>

                <div className="mt-8 rounded-[24px] border border-red-500/30 bg-red-600/10 p-5">
                  <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.36em] text-red-300/80">
                    <ShieldAlert size={14} />
                    Tactical Promo Code
                  </div>
                  <div className="mt-3 text-2xl font-black uppercase tracking-[0.28em] text-white">
                    VAZOV-GHOST-10
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowUnlock(false)}
                  className="mt-8 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-bold uppercase tracking-[0.22em] text-white transition hover:border-red-500/40 hover:bg-red-600/10"
                >
                  Continue Operation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default IntelTrackerOverlay;
