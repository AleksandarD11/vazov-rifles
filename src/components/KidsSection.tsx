import { Crosshair } from "lucide-react";

const KidsSection = () => {
  return (
    <section id="тунинг" className="py-24 px-6 max-w-7xl mx-auto animate-on-scroll">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        
        {/* Снимка на работилница / тунинг */}
        <div className="rounded-lg overflow-hidden border border-[#1a1a1a] relative group">
          <img 
            src="/images/custom-upgrade.png" 
            alt="VAZOV RIFLES Custom Workshop - Airsoft Tuning and Assembly" 
            className="w-full h-[500px] object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0" 
          />
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/50 transition-colors duration-500 rounded-lg pointer-events-none"></div>
        </div>
        
        {/* Текст за сервиза */}
        <div>
          <span className="text-gold text-xs uppercase tracking-widest font-bold block mb-4">Сервиз & Custom Проекти</span>
          <h2 className="text-4xl md:text-5xl font-display mb-6 text-white uppercase tracking-wider">Изведи играта си на следващото ниво</h2>
          <p className="text-gray-400 font-light mb-8 leading-relaxed">
            Забрави за фабричните ограничения. В нашата работилница превръщаме стандартните реплики във високоточни машини за победа. От базово смазване до инсталация на сложна електроника – ние знаем какво правим.
          </p>
          
          <ul className="space-y-4 text-sm text-gray-300 font-light">
            <li className="flex items-start gap-4 p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-md hover:border-gold/30 transition-colors group">
              <Crosshair size={24} className="text-gold shrink-0 mt-0.5 group-hover:rotate-90 transition-transform duration-500" /> 
              <div>
                <strong className="block text-white mb-1 uppercase tracking-wider text-xs font-bold">Пълна профилактика</strong>
                Почистване, смазване и шимване на скоростната кутия за максимален живот и тиха работа.
              </div>
            </li>
            <li className="flex items-start gap-4 p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-md hover:border-gold/30 transition-colors group">
              <Crosshair size={24} className="text-gold shrink-0 mt-0.5 group-hover:rotate-90 transition-transform duration-500" /> 
              <div>
                <strong className="block text-white mb-1 uppercase tracking-wider text-xs font-bold">Електроника & MOSFET</strong>
                Инсталация на GATE, Perun и други системи за мигновена реакция на спусъка.
              </div>
            </li>
            <li className="flex items-start gap-4 p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-md hover:border-gold/30 transition-colors group">
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