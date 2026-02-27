import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReservationDialog from "./ReservationDialog";

const navLinks = [
  { label: "Начало", href: "#начало" },
  { label: "Меню", href: "#меню" },
  { label: "Галерия", href: "#галерия" },
  { label: "Детски кът", href: "#детски-кът" },
  { label: "Контакти", href: "#контакти" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-gold/20">
        <div className="container flex items-center justify-between h-16 md:h-20">
          <a href="#начало" className="text-2xl md:text-3xl font-display font-bold tracking-[0.2em] text-gold">
            LUXOR
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-body font-medium tracking-wider text-primary-foreground/80 hover:text-gold transition-colors uppercase"
              >
                {link.label}
              </a>
            ))}
            <Button
              variant="outline"
              className="border-gold text-gold hover:bg-gold hover:text-primary font-body tracking-wider uppercase text-xs px-6"
              onClick={() => setDialogOpen(true)}
            >
              Резервирай маса
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-primary-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-primary border-t border-gold/20 py-4">
            <div className="container flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-body tracking-wider text-primary-foreground/80 hover:text-gold transition-colors uppercase py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Button
                variant="outline"
                className="border-gold text-gold hover:bg-gold hover:text-primary font-body tracking-wider uppercase text-xs w-fit"
                onClick={() => {
                  setDialogOpen(true);
                  setMobileOpen(false);
                }}
              >
                Резервирай маса
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
