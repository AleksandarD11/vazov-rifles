import { useEffect, useState } from "react";
import { Eye, Menu, ShoppingCart, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTacticalSounds } from "@/hooks/useTacticalSounds";
import { useCartStore } from "@/store/useCartStore";
import { useUiStore } from "@/store/useUiStore";

const navLinks = [
  { name: "НАЧАЛО", href: "#home" },
  { name: "АРСЕНАЛ", href: "#arsenal" },
  { name: "ЕКИПИРОВКА", href: "#equipment" },
  { name: "ТУНИНГ", href: "#tuning" },
  { name: "В ДЕЙСТВИЕ", href: "#action" },
  { name: "КОНТАКТИ", href: "#contacts" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const totalItems = useCartStore((s) => s.items.reduce((sum, item) => sum + item.qty, 0));
  const isNightVisionActive = useUiStore((s) => s.isNightVisionActive);
  const toggleNightVision = useUiStore((s) => s.toggleNightVision);
  const { playClickSound, playHoverSound, playNvgToggleSound } = useTacticalSounds();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOpenCart = () => {
    playClickSound();
    setCartOpen(true);
  };

  const handleToggleNightVision = () => {
    playNvgToggleSound();
    toggleNightVision();
  };

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-500 ${
        isScrolled
          ? "border-b border-white/10 bg-[#040404]/90 backdrop-blur-md shadow-2xl"
          : "bg-transparent"
      }`}
    >
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 xl:py-4">
        <button
          type="button"
          onClick={() => scrollTo("#home")}
          className="shrink-0 whitespace-nowrap text-left font-display text-xl font-black tracking-widest text-white transition-colors group sm:text-2xl"
        >
          <span>VAZOV </span>
          <span className="text-red-600 group-hover:text-red-500">RIFLES</span>
        </button>

        <div className="hidden items-center gap-5 min-[1400px]:flex 2xl:gap-6">
          {navLinks.map((link) => (
            <button
              key={link.name}
              type="button"
              onClick={() => scrollTo(link.href)}
              onMouseEnter={playHoverSound}
              className="whitespace-nowrap text-sm font-bold uppercase tracking-widest text-gray-300 transition-colors hover:text-white"
            >
              {link.name}
            </button>
          ))}

          <Link
            to="/gunsmith-3d"
            onMouseEnter={playHoverSound}
            className="whitespace-nowrap text-sm font-bold uppercase tracking-widest text-gray-300 transition-colors hover:text-white"
          >
            3D ОРЪЖЕЙНИК
          </Link>
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3 xl:gap-4">
          <button
            type="button"
            onClick={handleToggleNightVision}
            onMouseEnter={playHoverSound}
            className={`hidden min-h-[44px] items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] transition-all min-[1400px]:inline-flex ${
              isNightVisionActive
                ? "border-green-300/40 bg-green-500/15 text-green-100 shadow-[0_0_30px_rgba(74,222,128,0.28)]"
                : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-green-400/40 hover:text-white"
            }`}
            aria-label="Toggle night vision mode"
            aria-pressed={isNightVisionActive}
          >
            <Eye size={16} />
            NVG
          </button>

          <button
            type="button"
            onClick={handleOpenCart}
            onMouseEnter={playHoverSound}
            className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] p-3 text-gray-300 transition-all hover:border-red-500/50 hover:text-white"
            aria-label="Open cart"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </button>

          <Button
            onClick={handleOpenCart}
            onMouseEnter={playHoverSound}
            className="hidden min-h-[44px] whitespace-nowrap rounded-xl border border-red-500/50 bg-red-600 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-red-500 min-[1400px]:inline-flex 2xl:px-5 2xl:py-4 2xl:text-sm"
          >
            НАПРАВИ ПОРЪЧКА
          </Button>

          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-white min-[1400px]:hidden"
            onClick={() => setIsOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} className="text-red-500" /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <div
        className={`border-t border-white/10 bg-[#0a0a0a]/95 px-4 py-4 backdrop-blur-xl transition-all duration-300 sm:px-6 min-[1400px]:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {isOpen && (
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <button
                key={link.name}
                type="button"
                onClick={() => scrollTo(link.href)}
                onMouseEnter={playHoverSound}
                className="min-h-[44px] whitespace-normal break-words text-left text-sm font-bold uppercase leading-tight tracking-widest text-gray-300 transition-colors hover:text-white"
              >
                {link.name}
              </button>
            ))}

            <Link
              to="/gunsmith-3d"
              onClick={() => setIsOpen(false)}
              onMouseEnter={playHoverSound}
              className="min-h-[44px] whitespace-normal break-words text-sm font-bold uppercase leading-tight tracking-widest text-gray-300 transition-colors hover:text-white"
            >
              3D ОРЪЖЕЙНИК
            </Link>

            <button
              type="button"
              onClick={handleToggleNightVision}
              onMouseEnter={playHoverSound}
              className={`inline-flex min-h-[44px] w-fit items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] transition-all ${
                isNightVisionActive
                  ? "border-green-300/40 bg-green-500/15 text-green-100"
                  : "border-white/10 bg-white/[0.03] text-gray-300"
              }`}
              aria-label="Toggle night vision mode"
              aria-pressed={isNightVisionActive}
            >
              <Eye size={16} />
              NVG
            </button>

            <Button
              onClick={() => {
                setIsOpen(false);
                handleOpenCart();
              }}
              onMouseEnter={playHoverSound}
              className="min-h-[48px] w-full whitespace-normal rounded-xl border border-red-500/50 bg-red-600 py-4 text-sm font-bold uppercase leading-tight tracking-widest text-white hover:bg-red-500"
            >
              НАПРАВИ ПОРЪЧКА
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
