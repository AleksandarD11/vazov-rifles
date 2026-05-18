import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Колко време отнема сервизът?",
    answer: "Зависи от сложността на проекта и наличността на частите. След заявка получаваш конкретна информация за следващите стъпки.",
  },
  {
    question: "Работите ли с части на клиента?",
    answer: "Да, когато частите са подходящи за конкретната реплика. Преди монтаж се уточнява съвместимостта и очакваният резултат.",
  },
  {
    question: "Може ли да се направи custom конфигурация?",
    answer: "Да. Описваш целта на сетъпа, а ние предлагаме конфигурация според стил на игра, бюджет и наличност.",
  },
  {
    question: "Има ли гаранция след сервиз?",
    answer: "Всеки проект се уточнява индивидуално. След заявка получаваш ясна информация какво включва услугата и как се тества сетъпът.",
  },
  {
    question: "Как става доставката?",
    answer: "Доставката и предаването се уточняват при потвърждение на поръчката, според адреса и типа продукт или услуга.",
  },
  {
    question: "Как да направя поръчка?",
    answer: "Избери продукт или услуга, добави детайли към заявката и изпрати контакт. След това ще получиш консултация и оферта.",
  },
];

const FAQSection = () => {
  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-[#050505] py-14 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-red-300/80">
            <HelpCircle size={14} />
            FAQ
          </div>
          <h2 className="mt-5 break-words text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
            Често задавани въпроси
          </h2>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-2">
          {faqs.map((item) => (
            <details key={item.question} className="group min-w-0 rounded-3xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl open:border-red-500/30 open:bg-red-600/10 sm:p-6">
              <summary className="cursor-pointer list-none text-base font-black uppercase leading-tight tracking-[0.08em] text-white marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.question}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-red-300 transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-4 text-sm leading-7 text-gray-300">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
