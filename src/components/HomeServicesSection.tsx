import { ArrowRight, Boxes, ShieldCheck, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: ShieldCheck,
    title: "Custom Builds",
    text: "Индивидуални airsoft конфигурации според стил на игра, визия и бюджет.",
    cta: "Виж custom build-ове",
    to: "/custom-builds",
  },
  {
    icon: Wrench,
    title: "Сервиз и поддръжка",
    text: "Диагностика, профилактика и поддръжка на airsoft реплики след предварителна консултация.",
    cta: "Заяви сервиз",
    to: "/service",
  },
  {
    icon: Boxes,
    title: "Gear & наличности",
    text: "Подбрана екипировка за airsoft и milsim: наличности, препоръки и setup идеи.",
    cta: "Изпрати запитване",
    to: "/contact",
  },
];

const HomeServicesSection = () => {
  return (
    <section id="services" className="relative overflow-hidden border-t border-white/5 bg-[#050505] py-14 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-300/80">Vazov Rifles</div>
          <h2 className="mt-4 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
            Услуги и запитвания
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article key={service.title} className="flex min-w-0 flex-col rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl sm:p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/30 bg-red-600/10 text-red-300">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-xl font-black uppercase tracking-[0.1em] text-white">{service.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-gray-300">{service.text}</p>
                <Link to={service.to} className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-red-500/50 bg-red-600 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-red-500">
                  {service.cta}
                  <ArrowRight size={15} />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeServicesSection;
