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
      <div className="w-full flex justify-between items-center px-6 py-4">
        <button
          type="button"
          onClick={() => scrollTo("#home")}
          className="shrink-0 whitespace-nowrap text-left text-2xl font-display font-black tracking-widest text-white transition-colors group"
        >
          <span>VAZOV </span>
          <span className="text-red-600 group-hover:text-red-500">RIFLES</span>
        </button>

        <div className="hidden md:flex items-center gap-6">
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
            to="/gun-lab"
            onMouseEnter={playHoverSound}
            className="whitespace-nowrap text-sm font-bold uppercase tracking-widest text-red-400 transition-colors hover:text-white"
          >
            GUN LAB
          </Link>

          <Link
            to="/gunsmith-3d"
            onMouseEnter={playHoverSound}
            className="whitespace-nowrap text-sm font-bold uppercase tracking-widest text-gray-300 transition-colors hover:text-white"
          >
            3D ОРЪЖЕЙНИК
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleToggleNightVision}
            onMouseEnter={playHoverSound}
            className={`hidden md:inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] transition-all ${
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
            className="relative inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] p-3 text-gray-300 transition-all hover:border-red-500/50 hover:text-white"
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
            className="hidden md:inline-flex whitespace-nowrap rounded-xl border border-red-500/50 bg-red-600 px-6 py-5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-red-500"
          >
            НАПРАВИ ПОРЪЧКА
          </Button>

          <button
            type="button"
            className="text-white md:hidden"
            onClick={() => setIsOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} className="text-red-500" /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden border-t border-white/10 bg-[#0a0a0a]/95 px-6 py-4 backdrop-blur-xl transition-all duration-300 ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {isOpen && (
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.name}
                type="button"
                onClick={() => scrollTo(link.href)}
                onMouseEnter={playHoverSound}
                className="whitespace-nowrap text-left text-sm font-bold uppercase tracking-widest text-gray-300 transition-colors hover:text-white"
              >
                {link.name}
              </button>
            ))}

            <Link
              to="/gun-lab"
              onClick={() => setIsOpen(false)}
              onMouseEnter={playHoverSound}
              className="whitespace-nowrap text-sm font-bold uppercase tracking-widest text-red-400 transition-colors hover:text-white"
            >
              GUN LAB
            </Link>

            <Link
              to="/gunsmith-3d"
              onClick={() => setIsOpen(false)}
              onMouseEnter={playHoverSound}
              className="whitespace-nowrap text-sm font-bold uppercase tracking-widest text-gray-300 transition-colors hover:text-white"
            >
              3D ОРЪЖЕЙНИК
            </Link>

            <button
              type="button"
              onClick={handleToggleNightVision}
              onMouseEnter={playHoverSound}
              className={`inline-flex w-fit items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] transition-all ${
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
              className="w-full whitespace-nowrap rounded-xl border border-red-500/50 bg-red-600 py-5 text-sm font-bold uppercase tracking-widest text-white hover:bg-red-500"
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
