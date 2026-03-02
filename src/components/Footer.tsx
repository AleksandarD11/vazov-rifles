import { Instagram, Facebook, Youtube, MapPin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-[#1a1a1a] bg-[#040404] px-6 relative overflow-hidden">
      {/* Лек червен акцент най-отгоре на футъра */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-50"></div>
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Лого и права */}
        <div className="text-center md:text-left">
          <h1 className="text-gold text-2xl font-display font-bold uppercase tracking-widest mb-2">Vazov Rifles</h1>
          <p className="text-gray-600 text-xs tracking-widest uppercase">© {new Date().getFullYear()} Vazov Rifles. Всички права запазени.</p>
        </div>
        
        {/* Социални мрежи - Инстаграмът е най-важен тук */}
        <div className="flex gap-6 text-gray-500">
          <a href="https://www.instagram.com/vazovrifles/" target="_blank" rel="noreferrer" className="hover:text-gold hover:-translate-y-1 transition-all duration-300">
            <Instagram size={24} />
          </a>
          <a href="#" className="hover:text-gold hover:-translate-y-1 transition-all duration-300">
            <Facebook size={24} />
          </a>
          <a href="https://www.youtube.com/@VAZOVGROUP" className="hover:text-gold hover:-translate-y-1 transition-all duration-300">
            <Youtube size={24} />
          </a>
        </div>
        
        {/* Кратък контакт */}
        <div className="text-center md:text-right flex flex-col items-center md:items-end gap-2">
          <p className="text-gray-500 text-xs uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
            <MapPin size={14} className="text-gold" /> София, България
          </p>
          <p className="text-gray-500 text-xs uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
            <Mail size={14} className="text-gold" /> hq@vazovrifles.bg
          </p>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;