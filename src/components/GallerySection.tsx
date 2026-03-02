import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const GallerySection = () => {
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
      if (data) setImages(data);
    };
    fetchGallery();
  }, []);

  return (
    <section className="py-20 bg-[#040404]">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Заглавие */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <span className="text-[#e63946] text-xs font-bold tracking-widest uppercase">Галерия</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mt-4 uppercase tracking-widest">В действие</h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-sm">
            Кадри от терена и детайли от нашите Custom проекти. Последвайте ни в Instagram за още.
          </p>
        </div>

        {/* Мрежа със снимките */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {images.map((img) => (
            <div key={img.id} className="relative group overflow-hidden rounded-xl border border-[#1a1a1a] aspect-video sm:aspect-auto sm:h-[400px]">
              <img 
                src={img.image_url} 
                alt={img.title || "Vazov Rifles Action"} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 md:p-8">
                <h3 className="text-white font-display font-bold text-xl md:text-2xl uppercase tracking-widest border-l-4 border-[#e63946] pl-4">
                  {img.title || "Vazov Rifles"}
                </h3>
              </div>
            </div>
          ))}

          {images.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed border-[#1a1a1a] rounded-xl">
              <p className="text-gray-500 uppercase tracking-widest text-sm">Няма качени снимки все още.</p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default GallerySection;