import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, LogOut, RefreshCw, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type Reservation = Tables<"reservations">;

const statusLabels: Record<string, string> = {
  pending: "Чакаща",
  confirmed: "Потвърдена",
  cancelled: "Отказана",
};

const statusVariants: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState<Date>();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReservations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("reservation_date", { ascending: false })
      .order("reservation_time", { ascending: false });

    if (error) {
      toast({ title: "Грешка при зареждане на резервациите.", variant: "destructive" });
    } else {
      setReservations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Check auth
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/admin/login");
        return;
      }
      supabase.from("user_roles").select("role").eq("user_id", user.id).then(({ data: roles }) => {
        if (!roles?.some((r) => r.role === "admin")) {
          navigate("/admin/login");
          return;
        }
        fetchReservations();
      });
    });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Грешка при обновяване.", variant: "destructive" });
    } else {
      toast({ title: `Статусът е променен на „${statusLabels[status]}".` });
      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (filterDate && r.reservation_date !== format(filterDate, "yyyy-MM-dd")) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !r.phone.includes(q)) return false;
      }
      return true;
    });
  }, [reservations, filterStatus, filterDate, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary border-b border-gold/20 sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <span className="text-xl font-display font-bold tracking-[0.15em] text-gold">LUXOR</span>
            <span className="text-primary-foreground/50 font-body text-sm hidden sm:inline">Админ панел</span>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground/70 hover:text-gold hover:bg-primary">
            <LogOut className="w-4 h-4 mr-2" /> Изход
          </Button>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground">Резервации</h1>
          <Button variant="outline" onClick={fetchReservations} className="border-border text-foreground">
            <RefreshCw className="w-4 h-4 mr-2" /> Обнови
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Търси по име или телефон..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всички</SelectItem>
              <SelectItem value="pending">Чакащи</SelectItem>
              <SelectItem value="confirmed">Потвърдени</SelectItem>
              <SelectItem value="cancelled">Отказани</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !filterDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filterDate ? format(filterDate, "dd.MM.yyyy") : "Филтър по дата"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={filterDate} onSelect={setFilterDate} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>

          {filterDate && (
            <Button variant="ghost" onClick={() => setFilterDate(undefined)} className="text-muted-foreground text-sm">
              Изчисти дата
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Общо", count: reservations.length, color: "text-foreground" },
            { label: "Чакащи", count: reservations.filter((r) => r.status === "pending").length, color: "text-amber-600" },
            { label: "Потвърдени", count: reservations.filter((r) => r.status === "confirmed").length, color: "text-emerald-600" },
            { label: "Отказани", count: reservations.filter((r) => r.status === "cancelled").length, color: "text-red-600" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-lg p-4 border border-border text-center">
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-body">Име</TableHead>
                <TableHead className="font-body">Телефон</TableHead>
                <TableHead className="font-body">Дата</TableHead>
                <TableHead className="font-body">Час</TableHead>
                <TableHead className="font-body">Гости</TableHead>
                <TableHead className="font-body">Бележки</TableHead>
                <TableHead className="font-body">Статус</TableHead>
                <TableHead className="font-body">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground font-body">Зареждане...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground font-body">Няма намерени резервации.</TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-body font-medium">{r.name}</TableCell>
                    <TableCell className="font-body">{r.phone}</TableCell>
                    <TableCell className="font-body">{r.reservation_date}</TableCell>
                    <TableCell className="font-body">{r.reservation_time}</TableCell>
                    <TableCell className="font-body">{r.guests}</TableCell>
                    <TableCell className="font-body text-sm max-w-[200px] truncate">{r.notes || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("font-body text-xs border", statusVariants[r.status] || "")}>
                        {statusLabels[r.status] || r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select value={r.status} onValueChange={(val) => updateStatus(r.id, val)}>
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Чакаща</SelectItem>
                          <SelectItem value="confirmed">Потвърдена</SelectItem>
                          <SelectItem value="cancelled">Отказана</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground font-body mt-4">
          Показани: {filtered.length} от {reservations.length} резервации
        </p>
      </main>
    </div>
  );
};

export default AdminDashboard;
