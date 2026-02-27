import { useState } from "react";
import { MapPin, Clock, Phone as PhoneIcon } from "lucide-react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const timeSlots = Array.from({ length: 30 }, (_, i) => {
  const h = Math.floor(i / 2) + 8;
  const m = i % 2 === 0 ? "00" : "30";
  return `${h.toString().padStart(2, "0")}:${m}`;
}).filter((t) => t <= "23:00");

const ContactSection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !date || !time || !guests) {
      toast({ title: "Моля, попълнете всички задължителни полета.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("reservations").insert({
      name: name.trim(),
      phone: phone.trim(),
      reservation_date: format(date, "yyyy-MM-dd"),
      reservation_time: time,
      guests: parseInt(guests),
      notes: notes.trim() || null,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Грешка при изпращане. Моля, опитайте отново.", variant: "destructive" });
      return;
    }

    toast({ title: "Резервацията е изпратена успешно!", description: "Ще се свържем с вас за потвърждение." });
    setName("");
    setPhone("");
    setDate(undefined);
    setTime("");
    setGuests("");
    setNotes("");
  };

  return (
    <section id="контакти" className="py-20 md:py-28 bg-background">
      <div className="container px-4">
        <div className="text-center mb-16">
          <p className="text-gold font-body tracking-[0.3em] uppercase text-sm mb-4">Контакти</p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Свържете се с нас
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-1">
                <MapPin className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">Адрес</h3>
                <p className="text-muted-foreground font-body">ж.к. Запад, ул. „Теменуга" 12, Пазарджик</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Clock className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">Работно време</h3>
                <p className="text-muted-foreground font-body">Пн – Нд: 08:30 – 23:00</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-1">
                <PhoneIcon className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1">Телефон</h3>
                <p className="text-muted-foreground font-body">+359 34 123 456</p>
                <p className="text-muted-foreground font-body">+359 88 765 4321</p>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="rounded-lg overflow-hidden border border-border h-56 bg-muted flex items-center justify-center">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2955.5!2d24.33!3d42.19!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDLCsDExJzI0LjAiTiAyNMKwMTknNDguMCJF!5e0!3m2!1sbg!2sbg!4v1600000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Местоположение на ресторант LUXOR"
              />
            </div>
          </div>

          {/* Reservation form */}
          <div className="bg-card rounded-lg p-6 md:p-8 border border-border">
            <h3 className="text-xl font-display font-semibold text-foreground mb-6">Резервирай маса</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-body text-muted-foreground mb-1 block">Име *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Вашето име" maxLength={100} />
              </div>
              <div>
                <label className="text-sm font-body text-muted-foreground mb-1 block">Телефон *</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+359 ..." maxLength={20} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-body text-muted-foreground mb-1 block">Дата *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "dd.MM.yyyy") : "Дата"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-sm font-body text-muted-foreground mb-1 block">Час *</label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger><SelectValue placeholder="Час" /></SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-body text-muted-foreground mb-1 block">Брой гости *</label>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger><SelectValue placeholder="Изберете" /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                      <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? "гост" : "гости"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-body text-muted-foreground mb-1 block">Допълнителни изисквания</label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Специални поводи, алергии..." maxLength={500} rows={3} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gold hover:bg-gold-dark text-primary font-body tracking-wider uppercase text-sm py-5">
                {loading ? "Изпращане..." : "Потвърди резервация"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
