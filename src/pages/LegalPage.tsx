import { Link } from "react-router-dom";
import { AIRSOFT_DISCLAIMER, LEGAL_DRAFT_NOTE } from "@/lib/site";
import PageShell from "./PageShell";

type LegalPageProps = {
  title: string;
  intro: string;
  sections: Array<{ heading: string; body: string[] }>;
};

const placeholders = ["[Име на фирма / търговец]", "[ЕИК]", "[Адрес]", "[Имейл]", "[Телефон]", "[Домейн]"];

const LegalPage = ({ title, intro, sections }: LegalPageProps) => {
  return (
    <PageShell>
      <section className="border-b border-white/10 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-4xl">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-300/80">
            Legal draft
          </div>
          <h1 className="mt-4 text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-sm leading-7 text-gray-300 sm:text-base">{intro}</p>
          <div className="mt-6 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-7 text-amber-100">
            {LEGAL_DRAFT_NOTE}
          </div>
          <div className="mt-4 rounded-2xl border border-red-500/25 bg-red-600/10 p-4 text-sm leading-7 text-red-50">
            {AIRSOFT_DISCLAIMER}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto grid max-w-4xl gap-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <h2 className="text-lg font-black uppercase tracking-[0.12em] text-white">
              Данни за търговеца
            </h2>
            <div className="mt-4 grid gap-2 text-sm leading-7 text-gray-300 sm:grid-cols-2">
              {placeholders.map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
                  {item}
                </div>
              ))}
            </div>
          </div>

          {sections.map((section) => (
            <article key={section.heading} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <h2 className="text-lg font-black uppercase tracking-[0.12em] text-white">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-gray-300">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}

          <Link
            to="/contact"
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-red-500/60 bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500 sm:w-fit"
          >
            Изпрати запитване
          </Link>
        </div>
      </section>
    </PageShell>
  );
};

export default LegalPage;
