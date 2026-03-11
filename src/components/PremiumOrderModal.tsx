import { motion, AnimatePresence } from "framer-motion";
import { X, Crosshair, Phone, User, Mail, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createPortal } from "react-dom";

interface PremiumOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumOrderModal({ isOpen, onClose }: PremiumOrderModalProps) {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", details: "" });
  const [mounted, setMounted] = useState(false);

  // Това гарантира, че порталът ще се рендира само след като сайтът е зареден
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      return toast.error("Моля, попълнете задължителните полета (Име и Телефон).");
    }
    
    toast.success("Запитването е изпратено успешно! Ще се свържем с вас скоро.");
    setFormData({ name: "", phone: "", email: "", details: "" });
    onClose();
  };

  // Ако компонентът не е маунтнат, не рендираме нищо
  if (!mounted) return null;

  // Използваме createPortal, за да "извадим" модала извън Navbar-а
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          {/* Тъмен стъклен фон, който покрива ЦЕЛИЯ екран */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Самият прозорец */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-red-600/30 rounded-3xl shadow-[0_0_80px_rgba(220,38,38,0.2)] flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Хедър на модала */}
            <div className="p-6 border-b border-[#1a1a1a] flex justify-between items-center bg-gradient-to-r from-[#111] to-[#040404]">
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Crosshair className="text-red-600" /> Запитване
              </h3>
              <button 
                onClick={onClose} 
                className="text-gray-500 hover:text-red-500 bg-[#040404] border border-[#222] p-2 rounded-xl transition-all hover:border-red-500/50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Скролируема форма вътре */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="order-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Име */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
                    <User size={14} className="text-red-500" /> Име и Фамилия *
                  </label>
                  <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-xl focus:border-red-600 focus:bg-[#0a0a0a] focus:shadow-[0_0_15px_rgba(220,38,38,0.1)] outline-none transition-all"
                    placeholder="Въведете вашите имена"
                  />
                </div>

                {/* Телефон & Имейл (на 2 колони) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
                      <Phone size={14} className="text-red-500" /> Телефон *
                    </label>
                    <input 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-xl focus:border-red-600 focus:bg-[#0a0a0a] outline-none transition-all"
                      placeholder="08XX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
                      <Mail size={14} className="text-red-500" /> Имейл адрес
                    </label>
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-xl focus:border-red-600 focus:bg-[#0a0a0a] outline-none transition-all"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                {/* Детайли */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2 flex items-center gap-2">
                    <MessageSquare size={14} className="text-red-500" /> Какво да направим?
                  </label>
                  <textarea 
                    rows={4}
                    value={formData.details}
                    onChange={(e) => setFormData({...formData, details: e.target.value})}
                    className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-xl focus:border-red-600 focus:bg-[#0a0a0a] outline-none resize-none transition-all leading-relaxed"
                    placeholder="Опишете накратко от какво имате нужда (напр. тунинг на M4, поръчка на екипировка...)"
                  />
                </div>
              </form>
            </div>

            {/* Бутони (Залепени най-отдолу) */}
            <div className="p-6 border-t border-[#1a1a1a] flex gap-4 bg-[#0a0a0a]">
              <Button 
                type="button" 
                onClick={onClose} 
                variant="outline" 
                className="flex-1 border-[#333] text-gray-400 hover:text-white hover:bg-[#111] py-6 rounded-xl"
              >
                Отказ
              </Button>
              <Button 
                type="submit" 
                form="order-form"
                className="flex-[2] bg-red-600 text-white font-bold uppercase tracking-widest py-6 hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)] rounded-xl"
              >
                <Send size={18} className="mr-2" /> Изпрати
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body // Тук е магията - пращаме го директно в body-то на сайта!
  );
}