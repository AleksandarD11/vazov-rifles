import { ArrowRight, CheckCircle2, ClipboardList, MessageSquare, PackageCheck, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const steps = [
  { icon: MessageSquare, title: "Изпращаш запитване" },
  { icon: ClipboardList, title: "Уточняваме нуждите" },
  { icon: Wrench, title: "Получаваш оферта" },
  { icon: CheckCircle2, title: "Потвърждаваш" },
  { icon: PackageCheck, title: "Подготвяме / сервизираме / изпращаме" },
];

const HowItWorksSection = () => {
  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-[#070707] py-14 sm:py-16 lg:py-24">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-red-300/80">
            Order Flow
          </div>
          <h2 className="mt-5 break-words text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
            Как работим
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
            Не започваме custom build или сервиз без предварително уточнение и потвърждение.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="relative min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-500/30 bg-red-600/10 text-red-300">
                    <Icon size={22} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.22em] text-white/30">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="break-words text-base font-black uppercase leading-tight tracking-[0.08em] text-white">
                  {step.title}
                </h3>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            to="/contact"
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-red-500/60 bg-red-600 px-6 py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_0_28px_rgba(239,68,68,0.25)] transition hover:bg-red-500 sm:w-auto"
          >
            Започни запитване
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
