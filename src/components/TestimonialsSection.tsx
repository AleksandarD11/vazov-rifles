import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Николай П.",
    role: "MILSIM Team Leader",
    text: "След тунинга на Vazov Rifles, репликата ми стреля като лазер. Безкомпромисно качество!",
  },
  {
    name: "Виктор Р.",
    role: "DMR Specialist",
    text: "Хронометърът показа стабилност изстрел след изстрел. Разликата е огромна още от първата игра.",
  },
  {
    name: "Георги С.",
    role: "CQB Operator",
    text: "Сервизът и настройката на HPA системата са на ниво, което рядко се вижда. Премиум изпълнение.",
  },
  {
    name: "Алекс М.",
    role: "Sniper Build Owner",
    text: "Прецизност, надеждност и бърза реакция от екипа. Получих точно това, което обещаха.",
  },
  {
    name: "Стефан К.",
    role: "Weekend Competitor",
    text: "Всеки детайл е изпипан. Репликата е тиха, стабилна и много по-ефективна на терен.",
  },
  {
    name: "Даниел Т.",
    role: "Field Organizer",
    text: "Професионализъм от първия разговор до финалния тест. Това е elite стандарт без компромиси.",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-28 bg-[#040404] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(239,68,68,0.1),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(239,68,68,0.08),transparent_35%)] pointer-events-none" />
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-12"
        >
          <p className="text-red-500 text-xs font-bold uppercase tracking-[0.24em] mb-4">Elite Reviews</p>
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
            Отзиви от Играчи на Високо Ниво
          </h2>
          <p className="text-gray-400 text-base leading-relaxed">
            Реални резултати от полеви тестове, състезания и тежки сценарии. Когато се иска върхова надеждност, изборът е един.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {reviews.map((review, idx) => (
            <motion.article
              key={review.name + idx}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="bg-white/[0.02] border border-white/5 rounded-3xl p-7 shadow-[0_0_35px_rgba(239,68,68,0.08)] hover:shadow-[0_0_45px_rgba(239,68,68,0.14)] hover:border-red-500/30 transition-all"
            >
              <div className="flex items-center gap-1 mb-4 text-red-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="fill-red-500" />
                ))}
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">"{review.text}"</p>
              <div className="border-t border-white/10 pt-4">
                <p className="text-white font-bold uppercase tracking-wider text-sm">{review.name}</p>
                <p className="text-gray-500 text-xs uppercase tracking-[0.18em] mt-1">{review.role}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
