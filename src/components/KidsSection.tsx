import { Crosshair } from "lucide-react";

const KidsSection = () => {
  return (
    <section id="тунинг" className="mx-auto max-w-7xl animate-on-scroll px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        
        {/* Снимка на работилница / тунинг */}
        <div className="rounded-lg overflow-hidden border border-[#1a1a1a] relative group">
          <img 
            src="/images/custom-upgrade.png" 
            alt="VAZOV RIFLES Custom Workshop - Airsoft Tuning and Assembly" 
            className="h-[320px] w-full object-cover grayscale transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0 sm:h-[420px] lg:h-[500px]" 
          />
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/50 transition-colors duration-500 rounded-lg pointer-events-none"></div>
        </div>
        
        {/* Текст за сервиза */}
        <div>
          <span className="text-gold text-xs uppercase tracking-widest font-bold block mb-4">Сервиз & Custom Проекти</span>
          <h2 className="mb-6 break-words font-display text-3xl uppercase tracking-wide text-white sm:text-4xl lg:text-5xl lg:tracking-wider">Изведи играта си на следващото ниво</h2>
          <p className="mb-8 text-sm font-light leading-relaxed text-gray-400 sm:text-base">
            Забрави за фабричните ограничения. В нашата работилница превръщаме стандартните реплики във високоточни машини за победа. От базово смазване до инсталация на сложна електроника – ние знаем какво правим.
          </p>
          
          <ul className="space-y-4 text-sm text-gray-300 font-light">
            <li className="group flex min-w-0 items-start gap-4 rounded-md border border-[#1a1a1a] bg-[#0a0a0a] p-4 transition-colors hover:border-gold/30">
              <Crosshair size={24} className="text-gold shrink-0 mt-0.5 group-hover:rotate-90 transition-transform duration-500" /> 
              <div>
                <strong className="block text-white mb-1 uppercase tracking-wider text-xs font-bold">Пълна профилактика</strong>
                Почистване, смазване и шимване на скоростната кутия за максимален живот и тиха работа.
              </div>
            </li>
            <li className="group flex min-w-0 items-start gap-4 rounded-md border border-[#1a1a1a] bg-[#0a0a0a] p-4 transition-colors hover:border-gold/30">
              <Crosshair size={24} className="text-gold shrink-0 mt-0.5 group-hover:rotate-90 transition-transform duration-500" /> 
              <div>
                <strong className="block text-white mb-1 uppercase tracking-wider text-xs font-bold">Електроника & MOSFET</strong>
                Инсталация на GATE, Perun и други системи за мигновена реакция на спусъка.
              </div>
            </li>
            <li className="group flex min-w-0 items-start gap-4 rounded-md border border-[#1a1a1a] bg-[#0a0a0a] p-4 transition-colors hover:border-gold/30">
              <Crosshair size={24} className="text-gold shrink-0 mt-0.5 group-hover:rotate-90 transition-transform duration-500" /> 
              <div>
                <strong className="block text-white mb-1 uppercase tracking-wider text-xs font-bold">Прецизност и Обсег</strong>
                Смяна на цеви, R-hop и Flat-hop модификации за снайперска точност.
              </div>
            </li>
          </ul>
        </div>
        
      </div>
    </section>
  );
};

export default KidsSection;