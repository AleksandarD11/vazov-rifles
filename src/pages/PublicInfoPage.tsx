import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Wrench, Boxes } from "lucide-react";
import PageShell from "./PageShell";

type PublicInfoPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  cards: Array<{ title: string; text: string }>;
  ctaLabel?: string;
  ctaTo?: string;
};

const iconMap = [ShieldCheck, Wrench, Boxes];

const PublicInfoPage = ({ eyebrow, title, intro, cards, ctaLabel = "Изпрати запитване", ctaTo = "/contact" }: PublicInfoPageProps) => {
  return (
    <PageShell>
      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-300/80">{eyebrow}</div>
            <h1 className="mt-4 text-3xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-5 text-sm leading-7 text-gray-300 sm:text-base">{intro}</p>
            <Link
              to={ctaTo}
              className="mt-7 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-red-500/60 bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500 sm:w-fit"
            >
              {ctaLabel}
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {cards.map((card, index) => {
              const Icon = iconMap[index % iconMap.length];
              return (
                <article key={card.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/30 bg-red-600/10 text-red-300">
                    <Icon size={22} />
                  </div>
                  <h2 className="mt-5 text-lg font-black uppercase tracking-[0.1em] text-white">{card.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-gray-300">{card.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default PublicInfoPage;
