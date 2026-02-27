import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary py-10 border-t border-gold/20">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-2xl font-display font-bold tracking-[0.2em] text-gold mb-1">LUXOR</p>
            <p className="text-sm text-primary-foreground/60 font-body">
              © {new Date().getFullYear()} Ресторант LUXOR. Всички права запазени.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center text-gold/70 hover:bg-gold hover:text-primary transition-colors" aria-label="Facebook">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center text-gold/70 hover:bg-gold hover:text-primary transition-colors" aria-label="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center text-gold/70 hover:bg-gold hover:text-primary transition-colors" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </a>
          </div>

          <div>
            <a href="#" className="text-sm text-primary-foreground/60 font-body hover:text-gold transition-colors">
              Политика за поверителност
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
