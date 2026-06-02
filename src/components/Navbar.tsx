import { useEffect, useState } from "react";
import { Eye, Menu, ShoppingCart, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTacticalSounds } from "@/hooks/useTacticalSounds";
import { useCartStore } from "@/store/useCartStore";
import { useUiStore } from "@/store/useUiStore";

const navLinks = [
  { name: "Начало", to: "/#home" },
  { name: "Услуги", to: "/#services" },
  { name: "Наличности", to: "/inventory" },
  { name: "Custom", to: "/custom-builds" },
  { name: "Сервиз", to: "/service" },
  { name: "Контакт", to: "/contact" },
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
      className={`fixed left-0 top-0 z-50 w-full transition-all duration-500 ${
        isScrolled ? "border-b border-white/10 bg-[#040404]/90 shadow-2xl backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 xl:py-4">
        <Link
          to="/"
          className="inline-flex shrink-0 items-center rounded-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#040404]"
          aria-label="Vazov Rifles home"
        >
          <img
            src="/brand/vazov-header-logo-transparent.png"
            alt="Vazov Rifles logo"
            width={175}
            height={77}
            className="h-auto max-h-[64px] w-[125px] object-contain sm:w-[150px] lg:w-[175px]"
          />
        </Link>

        <div className="hidden items-center gap-5 min-[1400px]:flex 2xl:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              onMouseEnter={playHoverSound}
              className="whitespace-nowrap text-sm font-bold uppercase tracking-widest text-gray-300 transition-colors hover:text-white"
            >
              {link.name}
            </Link>
          ))}

          <Link
            to="/gunsmith-3d"
            onMouseEnter={playHoverSound}
            className="whitespace-nowrap text-sm font-bold uppercase tracking-widest text-gray-300 transition-colors hover:text-white"
          >
            3D конфигуратор
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
            asChild
            onMouseEnter={playHoverSound}
            className="hidden min-h-[44px] whitespace-nowrap rounded-xl border border-red-500/50 bg-red-600 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-red-500 min-[1400px]:inline-flex 2xl:px-5 2xl:py-4 2xl:text-sm"
          >
            <Link to="/contact">Запитване</Link>
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
            {[...navLinks, { name: "3D конфигуратор", to: "/gunsmith-3d" }].map((link) => (
              <Link
                key={link.name}
                to={link.to}
                onClick={() => setIsOpen(false)}
                onMouseEnter={playHoverSound}
                className="min-h-[44px] whitespace-normal break-words text-sm font-bold uppercase leading-tight tracking-widest text-gray-300 transition-colors hover:text-white"
              >
                {link.name}
              </Link>
            ))}

            <button
              type="button"
              onClick={handleToggleNightVision}
              onMouseEnter={playHoverSound}
              className={`inline-flex min-h-[44px] w-fit items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] transition-all ${
                isNightVisionActive ? "border-green-300/40 bg-green-500/15 text-green-100" : "border-white/10 bg-white/[0.03] text-gray-300"
              }`}
              aria-label="Toggle night vision mode"
              aria-pressed={isNightVisionActive}
            >
              <Eye size={16} />
              NVG
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
