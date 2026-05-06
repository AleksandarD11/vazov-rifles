import { useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Crosshair } from "lucide-react";
import emailjs from '@emailjs/browser';

// --- ВАЛИДАТОРИ И ГЕНЕРАТОРИ ---
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone: string) => /^[\d\s+()-]{8,15}$/.test(phone);
const generateOrderNumber = () => `VZ-${Math.floor(100000 + Math.random() * 900000)}`;

type ReservationDialogProps = {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function ReservationDialog({ children, open, onOpenChange }: ReservationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", category: "", details: "" });

  // --- ИМЕЙЛ СИСТЕМА (НАПРАВЕНА ASYNC) ---
  const sendClientEmail = async (email: string, orderNum: string, name: string, category: string, details: string) => {
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const templateParams = {
      user_name: name,
      user_email: email,
      order_number: orderNum,
      status: "ЧАКАЩА (ПРИЕТА)",
      details: `Заявена услуга: ${category}\nДопълнително описание: ${details}`,
      total_price: "Ще бъде уточнена след преглед", 
      shipping_method: "Ще бъде уточнен",
      payment_method: "При връщане / Наложен платеж"
    };

    try {
      // ЧАКАМЕ ИМЕЙЛЪТ ДА СЕ ИЗПРАТИ ПРЕДИ ДА ПРОДЪЛЖИМ
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      console.log("Имейлът е изпратен успешно!");
    } catch (err) {
      console.error("Грешка при изпращане на имейл:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ВАЛИДАЦИЯ
    if (!validatePhone(formData.phone)) return toast.error("Моля, въведете валиден телефонен номер!");
    if (formData.email && !validateEmail(formData.email)) return toast.error("Моля, въведете валиден имейл адрес!");
    if (!formData.category) return toast.error("Моля, изберете услуга!");

    setLoading(true);
    const toastId = toast.loading("Изпращане на заявката...");
    const orderNum = generateOrderNumber();

    const payload = {
      order_number: orderNum,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      category: formData.category,
      details: `Клиентска заявка от сайта:\nУслуга: ${formData.category}\nОписание: ${formData.details}`,
      status: 'pending',
      is_manual: false
    };

    const { error } = await supabase.from('orders').insert([payload]);

    if (!error) {
      toast.success(`Успешно! Вашата заявка е приета. Номер: ${orderNum}`, { id: toastId, duration: 5000 });
      
      // ПРАЩАМЕ ИМЕЙЛ НА КЛИЕНТА (С AWAIT)
      if (formData.email) {
        await sendClientEmail(formData.email, orderNum, formData.name, formData.category, formData.details);
      }

      // ЧАК СЛЕД КАТО ИМЕЙЛЪТ Е ПРАТЕН, ИЗЧИСТВАМЕ И ЗАТВАРЯМЕ ФОРМАТА
      setFormData({ name: "", phone: "", email: "", category: "", details: "" });
      if (onOpenChange) onOpenChange(false);
    } else {
      toast.error("Възникна грешка при изпращането.", { id: toastId });
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#0a0a0a] border border-gold/30 text-white shadow-[0_0_50px_rgba(212,175,55,0.15)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold uppercase tracking-widest text-center flex flex-col items-center gap-4 mb-4">
            <Crosshair className="text-gold" size={36}/>
            Заявка за Сервиз
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input required placeholder="Име и Фамилия *" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="bg-[#040404] border-[#1a1a1a] focus:border-gold text-white p-6" />
          
          <Input required placeholder="Телефонен номер *" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className={`bg-[#040404] border p-6 text-white outline-none transition-colors ${formData.phone && !validatePhone(formData.phone) ? 'border-red-500' : 'border-[#1a1a1a] focus:border-gold'}`} />
          
          <Input required placeholder="Имейл адрес (за известия) *" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className={`bg-[#040404] border p-6 text-white outline-none transition-colors ${formData.email && !validateEmail(formData.email) ? 'border-red-500' : 'border-[#1a1a1a] focus:border-gold'}`} />
          
          <Select onValueChange={(val) => setFormData({...formData, category: val})}>
            <SelectTrigger className="bg-[#040404] border-[#1a1a1a] focus:border-gold text-gray-400 p-6">
              <SelectValue placeholder="Изберете услуга *" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0a0a] border-gold text-white">
              <SelectItem value="Ремонт">Ремонт / Диагностика</SelectItem>
              <SelectItem value="Тунинг">Цялостен Тунинг</SelectItem>
              <SelectItem value="Поддръжка">Профилактика / Смазване</SelectItem>
              <SelectItem value="Къстъм проект">Къстъм Проект</SelectItem>
            </SelectContent>
          </Select>
          
          <Textarea required placeholder="Опишете проблема или какво желаете да направим..." value={formData.details} onChange={e=>setFormData({...formData, details: e.target.value})} className="bg-[#040404] border-[#1a1a1a] focus:border-gold text-white p-4 min-h-[120px]" />
          
          <Button type="submit" disabled={loading} className="w-full bg-gold text-black hover:bg-amber-400 py-6 text-lg font-bold uppercase tracking-widest transition-all">
            {loading ? "Изпращане..." : "Изпрати Заявката"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
