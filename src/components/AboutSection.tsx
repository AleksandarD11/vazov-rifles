import { UtensilsCrossed, Users, Baby, LayoutGrid } from "lucide-react";

const stats = [
  { icon: UtensilsCrossed, value: "50+", label: "Ястия" },
  { icon: Users, value: "167", label: "Места" },
  { icon: Baby, value: "2", label: "Детски къта" },
  { icon: LayoutGrid, value: "34", label: "Маси" },
];

const AboutSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-gold font-body tracking-[0.3em] uppercase text-sm mb-4">За нас</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
            Топла атмосфера и изискана кухня
          </h2>
          <p className="text-muted-foreground font-body leading-relaxed text-lg">
            В ресторант LUXOR вярваме, че изключителната кухня заслужава изключителна обстановка.
            Нашият екип от талантливи готвачи създава кулинарни шедьоври от най-свежите сезонни продукти,
            а уютната атмосфера допълва всяко ваше преживяване.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-lg p-6 md:p-8 text-center border border-border hover:border-gold/40 transition-colors group"
            >
              <stat.icon className="w-8 h-8 text-gold mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground font-body tracking-wider uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
