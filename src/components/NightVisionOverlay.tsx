import { AnimatePresence, motion } from "framer-motion";
import { useUiStore } from "@/store/useUiStore";

const NightVisionOverlay = () => {
  const isNightVisionActive = useUiStore((state) => state.isNightVisionActive);

  return (
    <>
      <style>
        {`
          @keyframes nvg-scan-drift {
            0% { transform: translateY(-35%); }
            100% { transform: translateY(35%); }
          }
          @keyframes nvg-flicker {
            0%, 100% { opacity: 0.16; }
            25% { opacity: 0.22; }
            50% { opacity: 0.18; }
            75% { opacity: 0.24; }
          }
          @keyframes nvg-grain-shift {
            0% { transform: translate3d(0, 0, 0) scale(1); }
            25% { transform: translate3d(-1%, 1%, 0) scale(1.02); }
            50% { transform: translate3d(1%, -1%, 0) scale(1.01); }
            75% { transform: translate3d(1%, 1%, 0) scale(1.03); }
            100% { transform: translate3d(0, 0, 0) scale(1); }
          }
        `}
      </style>

      <AnimatePresence>
        {isNightVisionActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0 bg-green-500/10 mix-blend-screen"
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, rgba(120,255,120,0.12) 0%, rgba(56,189,82,0.1) 28%, rgba(9,20,11,0.08) 58%, rgba(0,0,0,0.2) 100%)",
                filter: "saturate(1.15)",
              }}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.18 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute -inset-[12%] mix-blend-soft-light"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cg fill='%23d9ffd9' fill-opacity='.18'%3E%3Ccircle cx='12' cy='24' r='1'/%3E%3Ccircle cx='96' cy='42' r='1.2'/%3E%3Ccircle cx='144' cy='16' r='0.9'/%3E%3Ccircle cx='54' cy='96' r='1'/%3E%3Ccircle cx='168' cy='128' r='1.1'/%3E%3Ccircle cx='28' cy='146' r='0.8'/%3E%3Ccircle cx='120' cy='88' r='0.9'/%3E%3Ccircle cx='82' cy='164' r='1.1'/%3E%3C/g%3E%3C/svg%3E\")",
                backgroundSize: "180px 180px",
                animation: "nvg-grain-shift 0.22s steps(2) infinite",
              }}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.16 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(180deg, rgba(190,255,190,0.08) 0px, rgba(190,255,190,0.08) 1px, transparent 3px, transparent 6px)",
                animation: "nvg-flicker 0.16s linear infinite",
              }}
            />

            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute inset-x-0 top-[-40%] h-[180%] opacity-20"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 0%, rgba(134,239,172,0.22) 40%, transparent 65%)",
                  animation: "nvg-scan-drift 6s linear infinite",
                }}
              />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 shadow-[inset_0_0_160px_rgba(0,0,0,0.82)]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NightVisionOverlay;
