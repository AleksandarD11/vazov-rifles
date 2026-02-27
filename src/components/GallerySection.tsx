const images = [
  { src: "/images/gallery-1.jpg", alt: "Частна зала за вечеря" },
  { src: "/images/gallery-2.jpg", alt: "Тераса на ресторанта" },
  { src: "/images/gallery-3.jpg", alt: "Бар зона" },
  { src: "/images/gallery-4.jpg", alt: "Празнична подредба" },
  { src: "/images/hero.jpg", alt: "Основна зала" },
];

const GallerySection = () => {
  return (
    <section id="галерия" className="py-20 md:py-28 bg-secondary">
      <div className="container px-4">
        <div className="text-center mb-16">
          <p className="text-gold font-body tracking-[0.3em] uppercase text-sm mb-4">Галерия</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Нашата атмосфера
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {images.map((img, i) => (
            <div
              key={i}
              className={`overflow-hidden rounded-lg ${i === 0 ? "md:row-span-2" : ""}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className={`w-full object-cover hover:scale-105 transition-transform duration-500 ${i === 0 ? "h-64 md:h-full" : "h-48 md:h-64"}`}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
