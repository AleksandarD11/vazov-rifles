import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReservationDialog from "./ReservationDialog"; // Засега го оставяме така, после ще го прекръстим на OrderDialog

const navLinks = [
  { label: "Начало", href: "#начало" },
  { label: "Арсенал", href: "#арсенал" },
  { label: "Тунинг", href: "#тунинг" },
  { label: "В действие", href: "#в-действие" },
  { label: "Контакти", href: "#контакти" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#e63946]/20">
        <div className="container flex items-center justify-between h-16 md:h-20">
          <a href="#начало" className="text-2xl md:text-3xl font-display font-bold tracking-[0.2em] text-[#e63946] uppercase">
            Vazov Rifles
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-body font-bold tracking-widest text-gray-300 uppercase px-4 py-2 rounded-md transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-[#e63946]/10 hover:text-[#e63946]"
              >
                {link.label}
              </a>
            ))}
            <Button
              variant="outline"
              className="ml-4 border-[#e63946] text-[#e63946] bg-transparent font-body tracking-widest uppercase text-xs px-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-[#e63946] hover:text-white hover:shadow-[0_0_15px_rgba(230,57,70,0.5)]"
              onClick={() => setDialogOpen(true)}
            >
              Направи поръчка
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-gray-300 hover:text-[#e63946] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0a0a0a] border-t border-[#e63946]/20 py-4">
            <div className="container flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-body tracking-widest text-gray-300 uppercase px-4 py-2 rounded-md transition-all duration-300 ease-out hover:bg-[#e63946]/10 hover:text-[#e63946] w-fit"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Button
                variant="outline"
                className="mt-2 border-[#e63946] text-[#e63946] bg-transparent font-body tracking-widest uppercase text-xs px-6 transition-all duration-300 ease-out hover:bg-[#e63946] hover:text-white hover:shadow-[0_0_15px_rgba(230,57,70,0.5)] w-fit"
                onClick={() => {
                  setDialogOpen(true);
                  setMobileOpen(false);
                }}
              >
                Направи поръчка
              </Button>
            </div>
          </div>
        )}
      </nav>

      <ReservationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};

export default Navbar;