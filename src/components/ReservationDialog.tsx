import { useState } from "react";
import { format } from "date-fns";
import { bg } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const timeSlots = Array.from({ length: 30 }, (_, i) => {
  const h = Math.floor(i / 2) + 8;
  const m = i % 2 === 0 ? "00" : "30";
  const time = `${h.toString().padStart(2, "0")}:${m}`;
  return time;
}).filter((t) => t <= "23:00");

const ReservationDialog = ({ open, onOpenChange }: ReservationDialogProps) => {
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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-foreground">Резервирай маса</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd.MM.yyyy") : "Изберете дата"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-body text-muted-foreground mb-1 block">Час *</label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Час" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-body text-muted-foreground mb-1 block">Брой гости *</label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger>
                <SelectValue placeholder="Изберете" />
              </SelectTrigger>
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gold hover:bg-gold-dark text-primary font-body tracking-wider uppercase text-sm py-5"
          >
            {loading ? "Изпращане..." : "Потвърди резервация"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationDialog;
