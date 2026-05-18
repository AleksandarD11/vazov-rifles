import { Crosshair, Facebook, Instagram, Mail, MapPin, Youtube } from "lucide-react";
import { useIntelStore } from "@/store/useIntelStore";

const Footer = () => {
  const markIntelFound = useIntelStore((state) => state.markIntelFound);
  const foundIds = useIntelStore((state) => state.foundIds);

  return (
    <footer className="relative overflow-hidden border-t border-[#1a1a1a] bg-[#040404] px-4 py-10 sm:px-6 sm:py-12">
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>
      <button
        type="button"
        onClick={() => markIntelFound("footer-cache")}
        className={`absolute right-5 top-5 transition ${foundIds.includes("footer-cache") ? "text-red-300 opacity-90" : "text-red-500/30 opacity-20 hover:opacity-70"}`}
        aria-label="Recover footer intel"
      >
        <Crosshair size={14} />
      </button>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 lg:flex-row">
        <div className="text-center md:text-left">
          <h1 className="mb-2 text-2xl font-display font-bold uppercase tracking-widest text-red-500">
            Vazov Rifles
          </h1>
          <p className="text-xs uppercase leading-relaxed tracking-widest text-gray-600">
            © {new Date().getFullYear()} Vazov Rifles. All rights reserved.
          </p>
        </div>

        <div className="flex gap-4 text-gray-500 sm:gap-6">
          <a href="https://www.instagram.com/vazovrifles/" target="_blank" rel="noreferrer" className="transition-all duration-300 hover:-translate-y-1 hover:text-red-500">
            <Instagram size={24} />
          </a>
          <a href="#" className="transition-all duration-300 hover:-translate-y-1 hover:text-red-500">
            <Facebook size={24} />
          </a>
          <a href="https://www.youtube.com/@VAZOVGROUP" className="transition-all duration-300 hover:-translate-y-1 hover:text-red-500">
            <Youtube size={24} />
          </a>
        </div>

        <div className="flex min-w-0 flex-col items-center gap-2 text-center lg:items-end lg:text-right">
          <p className="flex min-w-0 items-center gap-2 break-words text-xs uppercase tracking-widest text-gray-500 transition-colors hover:text-white">
            <MapPin size={14} className="text-red-500" /> Sofia, Bulgaria
          </p>
          <p className="flex min-w-0 items-center gap-2 break-words text-xs uppercase tracking-widest text-gray-500 transition-colors hover:text-white">
            <Mail size={14} className="text-red-500" /> hq@vazovrifles.bg
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
