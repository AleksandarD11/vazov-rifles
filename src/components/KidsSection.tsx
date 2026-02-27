import { Check } from "lucide-react";

const features = [
  "Безплатна зона за деца до 5 години",
  "Платена зона за деца от 3 до 13 години",
  "Професионални аниматори",
  "Безопасна и забавна среда",
];

const KidsSection = () => {
  return (
    <section id="детски-кът" className="py-20 md:py-28 bg-secondary">
      <div className="container px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-lg overflow-hidden">
            <img
              src="/images/kids-area.jpg"
              alt="Детски кът в ресторант LUXOR"
              className="w-full h-80 md:h-[500px] object-cover rounded-lg"
              loading="lazy"
            />
          </div>

          <div>
            <p className="text-gold font-body tracking-[0.3em] uppercase text-sm mb-4">Детски кът</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
              Забавление за малчуганите
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed mb-8 text-lg">
              Докато вие се наслаждавате на кулинарните изкушения, вашите деца ще се забавляват
              в нашите два специално оборудвани детски къта. Осигурете спокойствие на себе си
              и незабравимо преживяване на малките.
            </p>

            <ul className="space-y-4">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-gold" />
                  </div>
                  <span className="text-foreground font-body">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KidsSection;
