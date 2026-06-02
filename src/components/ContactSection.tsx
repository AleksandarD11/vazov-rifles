import { Link } from "react-router-dom";
import { ArrowRight, Instagram, Mail, Youtube } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="relative overflow-hidden border-t border-[#1a1a1a] bg-[#0a0a0a] py-14 sm:py-20 lg:py-24">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/[0.035] p-6 text-center backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-red-500/20 bg-red-600/10 px-4 py-2 text-[10px] uppercase leading-tight tracking-[0.2em] text-red-300 sm:text-[11px] sm:tracking-[0.34em]">
            <Mail size={14} />
            Contact
          </div>
          <h2 className="mt-6 break-words text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
            Изпрати запитване
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-300 sm:text-base">
            Разкажете ни какво търсите: custom build, сервиз, наличности, gear или консултация. Формата включва тип запитване, бюджет и съгласие за поверителност.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/contact" className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-red-500/60 bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500 sm:w-auto">
              Отвори формата
              <ArrowRight size={16} />
            </Link>
            <div className="flex gap-4 text-gray-400">
              <a href="https://www.instagram.com/vazovrifles/" target="_blank" rel="noreferrer" aria-label="Vazov Rifles Instagram" className="transition hover:text-red-300">
                <Instagram size={24} />
              </a>
              <a href="https://www.youtube.com/@VAZOVGROUP" target="_blank" rel="noreferrer" aria-label="Vazov Rifles YouTube" className="transition hover:text-red-300">
                <Youtube size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
