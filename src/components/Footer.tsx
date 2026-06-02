import { Crosshair, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { useIntelStore } from "@/store/useIntelStore";
import { AIRSOFT_DISCLAIMER } from "@/lib/site";

const legalLinks = [
  { label: "Общи условия", to: "/terms" },
  { label: "Политика за поверителност", to: "/privacy-policy" },
  { label: "Връщане и рекламации", to: "/returns" },
  { label: "Доставка и плащане", to: "/delivery-payment" },
  { label: "Гаранция", to: "/warranty" },
  { label: "Условия за сервиз", to: "/service-terms" },
  { label: "Условия за custom поръчки", to: "/custom-order-terms" },
];

const Footer = () => {
  const markIntelFound = useIntelStore((state) => state.markIntelFound);
  const foundIds = useIntelStore((state) => state.foundIds);

  return (
    <footer className="relative overflow-hidden border-t border-[#1a1a1a] bg-[#040404] px-4 py-10 sm:px-6 sm:py-12">
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50" />
      <button
        type="button"
        onClick={() => markIntelFound("footer-cache")}
        className={`absolute right-5 top-5 transition ${foundIds.includes("footer-cache") ? "text-red-300 opacity-90" : "text-red-500/30 opacity-20 hover:opacity-70"}`}
        aria-label="Recover footer intel"
      >
        <Crosshair size={14} />
      </button>

      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_1fr_1fr]">
        <div>
          <h2 className="mb-3 text-2xl font-display font-bold uppercase tracking-widest text-red-500">
            Vazov Rifles
          </h2>
          <p className="max-w-xl text-sm leading-7 text-gray-400">{AIRSOFT_DISCLAIMER}</p>
          <p className="mt-4 text-xs uppercase leading-relaxed tracking-widest text-gray-600">
            © {new Date().getFullYear()} Vazov Rifles. All rights reserved.
          </p>
        </div>

        <nav aria-label="Footer legal links" className="grid gap-2 text-sm text-gray-400">
          {legalLinks.map((link) => (
            <Link key={link.to} to={link.to} className="transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-4 lg:items-end">
          <Link to="/contact" className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-red-500/50 bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-red-500 sm:w-fit">
            Контакт
          </Link>
          <div className="flex gap-4 text-gray-500">
            <a href="https://www.instagram.com/vazovrifles/" target="_blank" rel="noreferrer" aria-label="Vazov Rifles Instagram" className="transition-all duration-300 hover:-translate-y-1 hover:text-red-500">
              <Instagram size={24} />
            </a>
            <a href="https://www.youtube.com/@VAZOVGROUP" target="_blank" rel="noreferrer" aria-label="Vazov Rifles YouTube" className="transition-all duration-300 hover:-translate-y-1 hover:text-red-500">
              <Youtube size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
