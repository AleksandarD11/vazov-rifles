import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Youtube } from "lucide-react";
import PageShell from "./PageShell";

const inquiryTypes = [
  "Custom build",
  "Сервиз",
  "Наличности",
  "Gear / екипировка",
  "Консултация",
  "Друго",
];

const ContactPage = () => {
  const [accepted, setAccepted] = useState(false);
  const [status, setStatus] = useState<"idle" | "error" | "ready">("idle");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const required = ["name", "contact", "inquiryType", "message"];
    const hasMissingField = required.some((field) => !String(form.get(field) ?? "").trim());

    if (hasMissingField || !accepted) {
      setStatus("error");
      return;
    }

    // TODO: connect this form to a verified backend/email workflow before launch.
    setStatus("ready");
  };

  return (
    <PageShell>
      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-300/80">Contact</div>
            <h1 className="mt-4 text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
              Изпрати запитване
            </h1>
            <p className="mt-5 text-sm leading-7 text-gray-300 sm:text-base">
              Разкажете ни какво търсите: custom build, сервиз, наличности, gear или консултация.
              Ще върнем отговор според нуждите, бюджета и срока.
            </p>
            <div className="mt-7 flex gap-4 text-gray-400">
              <a href="https://www.instagram.com/vazovrifles/" target="_blank" rel="noreferrer" aria-label="Vazov Rifles Instagram" className="transition hover:text-red-300">
                <Instagram size={24} />
              </a>
              <a href="https://www.youtube.com/@VAZOVGROUP" target="_blank" rel="noreferrer" aria-label="Vazov Rifles YouTube" className="transition hover:text-red-300">
                <Youtube size={24} />
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.12em] text-gray-200">
                Name
                <input name="name" required className="min-h-[48px] rounded-xl border border-white/10 bg-black/40 px-4 text-sm normal-case tracking-normal text-white outline-none transition focus:border-red-400" />
              </label>
              <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.12em] text-gray-200">
                Email or Instagram
                <input name="contact" required className="min-h-[48px] rounded-xl border border-white/10 bg-black/40 px-4 text-sm normal-case tracking-normal text-white outline-none transition focus:border-red-400" />
              </label>
              <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.12em] text-gray-200">
                Inquiry type
                <select name="inquiryType" required className="min-h-[48px] rounded-xl border border-white/10 bg-black/40 px-4 text-sm normal-case tracking-normal text-white outline-none transition focus:border-red-400">
                  <option value="">Изберете</option>
                  {inquiryTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold uppercase tracking-[0.12em] text-gray-200">
                Budget, optional
                <input name="budget" className="min-h-[48px] rounded-xl border border-white/10 bg-black/40 px-4 text-sm normal-case tracking-normal text-white outline-none transition focus:border-red-400" />
              </label>
            </div>
            <label className="mt-4 grid gap-2 text-sm font-bold uppercase tracking-[0.12em] text-gray-200">
              Message
              <textarea name="message" required rows={6} className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm normal-case tracking-normal text-white outline-none transition focus:border-red-400" />
            </label>
            <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-gray-300">
              <input type="checkbox" required checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 h-4 w-4 accent-red-600" />
              <span>
                Съгласен/съгласна съм Vazov Rifles да обработи данните от запитването според{" "}
                <Link to="/privacy-policy" className="text-red-300 underline-offset-4 hover:underline">Политиката за поверителност</Link>.
              </span>
            </label>

            {status === "error" && (
              <p className="mt-4 rounded-xl border border-red-500/30 bg-red-600/10 p-3 text-sm text-red-100">
                Моля, попълнете задължителните полета и потвърдете съгласието.
              </p>
            )}
            {status === "ready" && (
              <p className="mt-4 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
                Формата е попълнена, но онлайн изпращането още не е активно. Моля, използвайте официалните социални канали за реално запитване.
              </p>
            )}

            <button type="submit" className="mt-5 min-h-[48px] w-full rounded-2xl border border-red-500/60 bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500">
              Изпрати запитване
            </button>
          </form>
        </div>
      </section>
    </PageShell>
  );
};

export default ContactPage;
