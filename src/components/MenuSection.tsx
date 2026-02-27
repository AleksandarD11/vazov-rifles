import { Button } from "@/components/ui/button";

const dishes = [
  {
    title: 'Сьомга „Велюте"',
    description: "Нежно филе от сьомга с кремообразен велюте сос, аспержи и микро зеленчуци",
    image: "/images/menu-salmon.jpg",
  },
  {
    title: "Запеканка с шунка",
    description: "Класическа запеканка с пушена шунка, сирене Ементал и бешамелов сос",
    image: "/images/menu-casserole.jpg",
  },
  {
    title: "Пица Пеперони",
    description: "Хрупкава тънка коричка, сос от домати Сан Марцано, моцарела и пикантен пеперони",
    image: "/images/menu-pizza.jpg",
  },
  {
    title: "Рибай стек",
    description: "Зряло говеждо рибай, печени зеленчуци, розмарин и билково масло",
    image: "/images/menu-steak.jpg",
  },
];

const MenuSection = () => {
  return (
    <section id="меню" className="py-20 md:py-28 bg-background">
      <div className="container px-4">
        <div className="text-center mb-16">
          <p className="text-gold font-body tracking-[0.3em] uppercase text-sm mb-4">Нашето меню</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Кулинарни изкушения
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dishes.map((dish) => (
            <div
              key={dish.title}
              className="bg-card rounded-lg overflow-hidden border border-border hover:border-gold/40 transition-all group hover:shadow-lg"
            >
              <div className="overflow-hidden h-56">
                <img
                  src={dish.image}
                  alt={dish.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">{dish.title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{dish.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            className="border-gold text-gold hover:bg-gold hover:text-primary font-body tracking-wider uppercase text-xs px-8"
          >
            Разгледай цялото меню
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
