import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type GalleryImage = {
  id: string;
  title: string | null;
  image_url: string | null;
};

const GallerySection = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { data, error } = await supabase
          .from("gallery")
          .select("id,title,image_url")
          .order("created_at", { ascending: false })
          .limit(9);

        if (error) throw error;
        setImages(data ?? []);
      } catch (error) {
        console.error("Public gallery failed to load", error);
        setImages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGallery();
  }, []);

  return (
    <section className="bg-[#040404] py-14 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#e63946]">Галерия</span>
          <h2 className="mt-4 break-words font-display text-3xl font-bold uppercase tracking-wider text-white sm:text-4xl lg:text-5xl lg:tracking-widest">
            В действие
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-400">
            Кадри от терена и детайли от нашите custom проекти. За актуални конфигурации изпрати запитване.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {isLoading &&
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="aspect-video animate-pulse rounded-xl border border-[#1a1a1a] bg-white/[0.06] lg:aspect-auto lg:h-[360px] xl:h-[400px]"
              />
            ))}

          {!isLoading &&
            images.map((img) => (
              <div key={img.id} className="group relative aspect-video min-w-0 overflow-hidden rounded-xl border border-[#1a1a1a] lg:aspect-auto lg:h-[360px] xl:h-[400px]">
                <img
                  src={img.image_url ?? ""}
                  alt={img.title || "Vazov Rifles Action"}
                  className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-100"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:p-8">
                  <h3 className="border-l-4 border-[#e63946] pl-4 font-display text-lg font-bold uppercase tracking-wider text-white md:text-2xl md:tracking-widest">
                    {img.title || "Vazov Rifles"}
                  </h3>
                </div>
              </div>
            ))}

          {!isLoading && images.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-[#1a1a1a] py-12 text-center sm:py-20">
              <p className="px-6 text-sm uppercase tracking-widest text-gray-500">
                Галерията се подготвя. За актуални custom проекти изпрати запитване през контактите.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
