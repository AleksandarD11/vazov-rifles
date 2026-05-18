import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert, LogOut, Lock, Package, ImagePlus, Trash2, Upload, Pencil, X,
  LayoutDashboard, ShoppingCart, PlusCircle, Settings, User, MapPin, Plus, Minus,
  Save, CheckCircle2, Clock, Wrench, Search, RefreshCw, Eye, Phone, Mail, Hash,
  ClipboardList, Command, Download, Shield, type LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";

// --- ТИПОВЕ ЗА TYPESCRIPT (СПИРАТ ГРЕШКИТЕ ВЪВ VS CODE) ---
interface ProductItem {
  id: string;
  title: string;
  description?: string;
  price?: string;
  image_url?: string;
  created_at?: string;
  qty?: number; // За поръчките
  overridePrice?: string; // За поръчките
}

interface OrderItem {
  id: string;
  order_number: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  total_price?: string;
  status: string;
  details?: string;
  is_manual?: boolean;
  category?: string;
  created_at: string;
}

interface AuditRow {
  id: string;
  created_at: string;
  actor_user_id: string | null;
  actor_email: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  meta: Record<string, unknown>;
}

interface SiteSetting {
  key: string;
  value: string;
  description: string;
}

type Tab = "dashboard" | "orders" | "create-order" | "arsenal" | "equipment" | "services" | "gallery" | "settings" | "audit";
type AdminNavTab = { id: Tab; icon: LucideIcon; label: string };

const PRODUCT_FIELDS = "id,title,description,price,image_url,created_at";
const ORDER_FIELDS = "id,order_number,name,phone,email,address,total_price,status,details,is_manual,category,created_at";
const SITE_SETTING_FIELDS = "key,value,description";
const AUDIT_FIELDS = "id,created_at,actor_user_id,actor_email,action,entity,entity_id,meta";

// --- ВАЛИДАТОРИ И ГЕНЕРАТОРИ ---
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone: string) => /^[\d\s+()-]{8,15}$/.test(phone);
const generateOrderNumber = () => `VZ-${Math.floor(100000 + Math.random() * 900000)}`;
const cn = (...a: Array<string | false | null | undefined>) => a.filter(Boolean).join(" ");
const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Unexpected error";
};
const nowFileName = (prefix: string, file: File) => {
  const ext = file.name.split(".").pop() || "png";
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`;
};

const toCSV = (rows: OrderItem[]) => {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, `""`)}"`;
  const headers: Array<keyof OrderItem> = ["order_number", "created_at", "name", "phone", "email", "address", "category", "status", "total_price", "is_manual", "details"];
  const lines = [headers.map(esc).join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))];
  return lines.join("\n");
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  // Data
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [arsenalItems, setArsenalItems] = useState<ProductItem[]>([]);
  const [equipmentItems, setEquipmentItems] = useState<ProductItem[]>([]);
  const [servicesItems, setServicesItems] = useState<ProductItem[]>([]);
  const [galleryItems, setGalleryItems] = useState<ProductItem[]>([]);
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditRow[]>([]);

  // UI
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const commandInputRef = useRef<HTMLInputElement | null>(null);

  // Generic Form State (Arsenal, Equipment, Services, Gallery)
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Services main image
  const [serviceMainImageFile, setServiceMainImageFile] = useState<File | null>(null);
  const [serviceMainPreviewUrl, setServiceMainPreviewUrl] = useState<string>("");
  const serviceMainImgSetting = settings.find((s) => s.key === "services_main_image");
  const serviceMainImgUrl = serviceMainImgSetting ? serviceMainImgSetting.value : "";

  // Manual order state
  const initialOrderState = { name: "", phone: "", email: "", address: "", shipping: "Еконт Експрес", payment: "Наложен платеж", items: [] as ProductItem[], status: "completed" };
  const [newOrder, setNewOrder] = useState(initialOrderState);

  const verifyAdmin = async (userId: string) => {
    const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    return data === true;
  };

  const audit = async (action: string, entity: string, entityId?: string | null, meta: Record<string, unknown> = {}) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const actor = sessionData.session?.user;
      await supabase.from("audit_logs").insert([{ actor_user_id: actor?.id ?? null, actor_email: actor?.email ?? null, action, entity, entity_id: entityId ?? null, meta }]);
    } catch {
      // Audit logging should not block the admin action.
    }
  };

  // --- Commands ---
  const commandItems = useMemo(() => {
    const items = [
      { label: "Отиди: Табло", run: () => setActiveTab("dashboard"), icon: LayoutDashboard },
      { label: "Отиди: Поръчки", run: () => setActiveTab("orders"), icon: ShoppingCart },
      { label: "Отиди: Нова поръчка", run: () => setActiveTab("create-order"), icon: PlusCircle },
      { label: "Отиди: Арсенал", run: () => setActiveTab("arsenal"), icon: Package },
      { label: "Отиди: Екипировка", run: () => setActiveTab("equipment"), icon: Shield },
      { label: "Отиди: Сервиз & Услуги", run: () => setActiveTab("services"), icon: Wrench },
      { label: "Отиди: Галерия", run: () => setActiveTab("gallery"), icon: ImagePlus },
      { label: "Отиди: CMS Настройки", run: () => setActiveTab("settings"), icon: Settings },
      { label: "Отиди: Audit Log", run: () => setActiveTab("audit"), icon: ClipboardList },
      { label: "Рефреш данни", run: () => fetchData(), icon: RefreshCw },
      { label: "Експорт (CSV)", run: () => exportOrdersCSV(), icon: Download },
    ];
    if (!commandQuery) return items;
    return items.filter((i) => i.label.toLowerCase().includes(commandQuery.toLowerCase()));
  }, [commandQuery]); 

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCommandOpen((v) => !v); }
      if (e.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => { if (commandOpen) setTimeout(() => commandInputRef.current?.focus(), 0); else setCommandQuery(""); }, [commandOpen]);

  // --- Auth ---
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault(); setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
      if (error) return toast.error("Грешен имейл или парола.");
      if (!data.user) return toast.error("Грешка при вход.");
      const ok = await verifyAdmin(data.user.id);
      if (!ok) { toast.error("Нямаш admin права."); await supabase.auth.signOut(); setIsAuthorized(false); return; }
      toast.success("Успешен вход ✅"); setIsAuthorized(true); setAuthPassword(""); await audit("auth.login", "admin_panel");
    } finally { setAuthLoading(false); }
  };

  const handleLogout = async () => {
    await audit("auth.logout", "admin_panel");
    await supabase.auth.signOut();
    setActiveTab("dashboard");
    navigate("/admin/login", { replace: true });
  };

  useEffect(() => {
    let cancelled = false;
    let resolved = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const finishAuthCheck = () => {
      if (!cancelled) setAuthChecked(true);
    };

    const clearAuthState = () => {
      if (cancelled) return;
      setIsAuthorized(false);
      setAuthEmail("");
    };

    const safeSignOut = async () => {
      try {
        await supabase.auth.signOut();
      } catch {
        // Best-effort cleanup during auth recovery.
      }
    };

    const init = async () => {
      timeoutId = setTimeout(() => {
        if (resolved || cancelled) return;
        resolved = true;
        clearAuthState();
        finishAuthCheck();
        void safeSignOut();
      }, 2000);

      try {
        const { data, error } = await supabase.auth.getSession();
        if (cancelled || resolved) return;

        if (error || !data.session?.user) {
          resolved = true;
          clearAuthState();
          await safeSignOut();
          return;
        }

        const ok = await verifyAdmin(data.session.user.id);
        if (cancelled || resolved) return;

        if (ok) {
          resolved = true;
          setIsAuthorized(true);
          setAuthEmail(data.session.user.email ?? "");
        } else {
          resolved = true;
          clearAuthState();
          await safeSignOut();
        }
      } catch {
        if (cancelled || resolved) return;
        resolved = true;
        clearAuthState();
        await safeSignOut();
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        finishAuthCheck();
      }
    };

    void init();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (!session?.user) {
          clearAuthState();
          return;
        }

        const ok = await verifyAdmin(session.user.id);
        if (ok) {
          setIsAuthorized(true);
          setAuthEmail(session.user.email ?? "");
        } else {
          clearAuthState();
          await safeSignOut();
        }
      } catch {
        clearAuthState();
        await safeSignOut();
      } finally {
        finishAuthCheck();
      }
    });

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- Fetching ---
  const fetchAudit = async () => {
    const { data } = await supabase.from("audit_logs").select(AUDIT_FIELDS).order("created_at", { ascending: false }).limit(200);
    if (data) setAuditLogs(data as AuditRow[]);
  };

  const fetchData = async () => {
    setIsRefreshing(true);
    const [ordersRes, arsenalRes, equipmentRes, settingsRes, servicesRes, galleryRes] = await Promise.all([
        supabase.from("orders").select(ORDER_FIELDS).order("created_at", { ascending: false }),
        supabase.from("arsenal").select(PRODUCT_FIELDS).order("created_at", { ascending: false }),
        supabase.from("equipment").select(PRODUCT_FIELDS).order("created_at", { ascending: false }),
        supabase.from("site_settings").select(SITE_SETTING_FIELDS),
        supabase.from("services").select(PRODUCT_FIELDS).order("created_at", { ascending: false }),
        supabase.from("gallery").select("id,title,image_url,created_at").order("created_at", { ascending: false }),
      ]);
    if (ordersRes.data) setOrders(ordersRes.data as OrderItem[]);
    if (arsenalRes.data) setArsenalItems(arsenalRes.data as ProductItem[]);
    if (equipmentRes.data) setEquipmentItems(equipmentRes.data as ProductItem[]);
    if (settingsRes.data) setSettings(settingsRes.data as SiteSetting[]);
    if (servicesRes.data) setServicesItems(servicesRes.data as ProductItem[]);
    if (galleryRes.data) setGalleryItems(galleryRes.data as ProductItem[]);
    await fetchAudit(); setIsRefreshing(false);
  };

  useEffect(() => {
    if (!isAuthorized) return;
    fetchData();
    const channel = supabase.channel("admin-orders-rt").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, async () => {
        const { data } = await supabase.from("orders").select(ORDER_FIELDS).order("created_at", { ascending: false });
        if (data) setOrders(data as OrderItem[]);
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAuthorized]);

  // --- Email System ---
  const sendEmailNotification = (email: string, status: string, orderNum: string, name: string, details: string = "-", totalPrice: string = "-", shipping: string = "-", payment: string = "-") => {
    const statusMap: Record<string, string> = { pending: "ЧАКАЩА (ПРИЕТА)", "in-progress": "В СЕРВИЗА", completed: "ГОТОВА / ЗАВЪРШЕНА", cancelled: "ОТКАЗАНА" };
    emailjs.send(import.meta.env.VITE_EMAILJS_SERVICE_ID, import.meta.env.VITE_EMAILJS_TEMPLATE_ID, { user_name: name, user_email: email, order_number: orderNum, status: statusMap[status] || status, details, total_price: totalPrice, shipping_method: shipping, payment_method: payment }, import.meta.env.VITE_EMAILJS_PUBLIC_KEY)
      .then(() => toast.success(`Имейл до ${email} изпратен!`)).catch(() => toast.error("Грешка при имейл."));
  };

  const updateOrderStatus = async (id: string, newStatus: string, email?: string, orderNum?: string, orderName?: string, details?: string, totalPrice?: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    if (!error) {
      const statusBgMap: Record<string, string> = {
        pending: "ЧАКАЩА (ПРИЕТА)",
        "in-progress": "В СЕРВИЗА",
        completed: "ГОТОВА / ЗАВЪРШЕНА",
        cancelled: "ОТКАЗАНА",
      };
      const mappedStatus = statusBgMap[newStatus] || newStatus;

      toast.success("Статусът е обновен!"); await audit("order.status.update", "orders", id, { status: newStatus });
      if (email) sendEmailNotification(email, mappedStatus, orderNum || "N/A", orderName || "Клиент", details, totalPrice, "-", "-");
      fetchData(); if (selectedOrder && selectedOrder.id === id) setSelectedOrder({ ...selectedOrder, status: newStatus });
    } else toast.error("Грешка при обновяване на статуса.");
  };

  // --- Generic CRUD Handlers ---
  const uploadToBucket = async (bucket: "arsenal" | "gallery", file: File, prefix: string) => {
    const fileName = nowFileName(prefix, file);
    const { error } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(fileName).data.publicUrl;
  };

  const startEdit = (item: ProductItem) => {
    setEditId(item.id); setTitle(item.title || ""); setDescription(item.description || ""); setPrice(item.price || ""); setCurrentImageUrl(item.image_url || ""); setImageFile(null); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const cancelEdit = () => { setEditId(null); setTitle(""); setDescription(""); setPrice(""); setCurrentImageUrl(""); setImageFile(null); };

  const handleSaveEntity = async (e: FormEvent, table: "arsenal" | "equipment" | "services" | "gallery") => {
    e.preventDefault(); setIsUploading(true); const tId = toast.loading("Запазване...");
    const cleanPrice = price.includes("€") ? price : `${price} €`;
    try {
      let finalUrl = currentImageUrl;
      if (imageFile) {
        const bucket = (table === "gallery" || table === "services") ? "gallery" : "arsenal";
        finalUrl = await uploadToBucket(bucket, imageFile, table);
      }
      const payload: Record<string, string> = { title };
      if (table !== "gallery") payload.description = description;
      if (table === "arsenal" || table === "equipment") payload.price = cleanPrice;
      if (table !== "services") payload.image_url = finalUrl;

      if (editId) {
        await supabase.from(table).update(payload).eq("id", editId);
        await audit(`${table}.update`, table, editId, { title });
      } else {
        const { data } = await supabase.from(table).insert([payload]).select("id").single();
        await audit(`${table}.create`, table, data?.id, { title });
      }
      toast.success("Успешно запазено!", { id: tId }); cancelEdit(); fetchData();
    } catch (err: unknown) { toast.error(getErrorMessage(err), { id: tId }); } finally { setIsUploading(false); }
  };

  const handleDeleteEntity = async (id: string, table: string) => {
    if (!window.confirm("Сигурен ли си, че искаш да го изтриеш?")) return;
    await supabase.from(table).delete().eq("id", id);
    await audit(`${table}.delete`, table, id);
    toast.success("Успешно изтрито!"); fetchData();
  };

  const handleUploadServiceMainImage = async (e: FormEvent) => {
    e.preventDefault(); if (!serviceMainImageFile) return toast.error("Избери снимка първо!"); setIsUploading(true); const tId = toast.loading("Качване...");
    try {
      const finalUrl = await uploadToBucket("gallery", serviceMainImageFile, "service_main");
      const { data } = await supabase.from("site_settings").select("key").eq("key", "services_main_image").maybeSingle();
      if (data) await supabase.from("site_settings").update({ value: finalUrl }).eq("key", "services_main_image");
      else await supabase.from("site_settings").insert([{ key: "services_main_image", value: finalUrl, description: "Главна снимка Сервиз" }]);
      toast.success("Обновена!", { id: tId }); setServiceMainPreviewUrl(finalUrl); setServiceMainImageFile(null); fetchData();
    } catch (err: unknown) { toast.error(getErrorMessage(err), { id: tId }); } finally { setIsUploading(false); }
  };
  const handleSettingImageUpload = async (file: File, settingKey: string) => {
    setIsUploading(true);
    const tId = toast.loading("Качване...");
    try {
      const finalUrl = await uploadToBucket("gallery", file, `setting_${settingKey}`);
      const currentSetting = settings.find((s) => s.key === settingKey);
      const { error } = await supabase.from("site_settings").upsert([{
        key: settingKey,
        value: finalUrl,
        description: currentSetting?.description || settingKey,
      }]);
      if (error) throw error;

      setSettings((prev) => prev.map((s) => s.key === settingKey ? { ...s, value: finalUrl } : s));
      toast.success("Обновена!", { id: tId });
      fetchData();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err), { id: tId });
    } finally {
      setIsUploading(false);
    }
  };
  // --- Manual Order ---
  const addToOrder = (product: ProductItem) => {
    setNewOrder((prev) => {
      const ex = prev.items.find((i) => i.id === product.id);
      if (ex) return { ...prev, items: prev.items.map((i) => i.id === product.id ? { ...i, qty: (i.qty || 1) + 1 } : i) };
      const bp = product.price ? String(product.price).replace(/[^0-9.]/g, "") : "0";
      return { ...prev, items: [...prev.items, { ...product, qty: 1, overridePrice: bp }] };
    });
  };

  const newOrderTotal: number = newOrder.items.reduce((acc: number, item: ProductItem) => acc + (parseFloat(String(item.overridePrice).replace(/[^0-9.-]+/g, "")) || 0) * (Number(item.qty) || 1), 0);

  const submitNewOrder = async () => {
    if (!newOrder.name || !newOrder.items.length) return toast.error("Добави клиент и продукти!");
    if (!validatePhone(newOrder.phone)) return toast.error("Невалиден телефонен номер!");
    const tId = toast.loading("Създаване...");
    const details = newOrder.items.map((i) => `- ${i.qty}x ${i.title} (${i.overridePrice} €)`).join("\n");
    const orderNum = generateOrderNumber();
    const finalPrice = `${Number(newOrderTotal).toFixed(2)} €`;

    const { data, error } = await supabase.from("orders").insert([{ order_number: orderNum, name: newOrder.name, phone: newOrder.phone, email: newOrder.email, address: newOrder.address, total_price: finalPrice, details: `Ръчна поръчка:\n${details}`, status: newOrder.status, is_manual: true, category: "Ръчна заявка" }]).select("id").single();
    if (!error) {
      toast.success(`Създадена! Номер: ${orderNum}`, { id: tId }); await audit("orders.manual.create", "orders", data?.id);
      if (newOrder.email) sendEmailNotification(newOrder.email, newOrder.status, orderNum, newOrder.name, `Ръчна поръчка:\n${details}`, finalPrice, newOrder.shipping, newOrder.payment);
      setNewOrder(initialOrderState); setActiveTab("orders"); fetchData();
    } else toast.error(`Грешка: ${error.message}`, { id: tId });
  };

  const saveSettings = async () => {
    const tId = toast.loading("Запазване...");
    try {
      const { error } = await supabase.from("site_settings").upsert(settings);
      if (error) throw error;

      toast.success("Сайтът е обновен!", { id: tId });
      fetchData();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err), { id: tId, duration: 5000 });
    }
  };

  const filteredOrders = useMemo(() => orders.filter((o) => (o.name && o.name.toLowerCase().includes(searchQuery.toLowerCase())) || (o.phone && o.phone.includes(searchQuery)) || (o.order_number && o.order_number.toLowerCase().includes(searchQuery.toLowerCase()))), [orders, searchQuery]);

  const exportOrdersCSV = () => {
    const csv = toCSV(filteredOrders); const blob = new Blob([csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  // --- UI Login ---
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#040404] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-[#040404] to-[#040404] pointer-events-none"></div>
        <div className="max-w-md w-full bg-[#0a0a0a] border border-[#1a1a1a] p-10 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.1)] text-center relative z-10 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-[#111] border border-[#333] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Lock className="text-red-500" size={36} />
          </div>
          <h1 className="text-3xl font-bold text-white uppercase mb-2 tracking-widest">VAZOV OS</h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest mb-8">Admin Access</p>
          {!authChecked ? <div className="text-gray-500 uppercase tracking-widest text-xs animate-pulse">Проверка на сесия...</div> : (
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full bg-[#040404] border border-[#1a1a1a] py-4 px-4 text-center text-white focus:border-red-500 outline-none rounded-xl transition-all focus:shadow-[0_0_15px_rgba(220,38,38,0.2)]" placeholder="Имейл" required />
              <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full bg-[#040404] border border-[#1a1a1a] py-4 px-4 text-center text-white focus:border-red-500 outline-none rounded-xl transition-all focus:shadow-[0_0_15px_rgba(220,38,38,0.2)]" placeholder="Парола" required />
              <Button type="submit" disabled={authLoading} className="w-full bg-red-600 text-white font-bold uppercase py-6 text-lg hover:bg-red-500 transition-all rounded-xl">Вход</Button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const StatCard = ({ label, count, icon: Icon, accent }: { label: string, count: string | number, icon: LucideIcon, accent: string }) => (
    <div className={cn("bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-3xl border-t-4 hover:bg-[#111] transition-all shadow-lg", accent)}>
      <div className="flex justify-between items-start"><h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">{label}</h3><Icon size={24} className="text-gray-400" /></div>
      <p className="text-5xl font-bold text-white mt-6">{count}</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#040404] text-gray-300 overflow-hidden font-sans selection:bg-red-500/30 selection:text-white">
      {/* Command Palette */}
      {commandOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-start justify-center p-6 animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#333] rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)] mt-[10vh]">
            <div className="p-5 border-b border-[#1a1a1a] flex items-center gap-4 bg-[#111]">
              <Command className="text-red-500" /><input ref={commandInputRef} value={commandQuery} onChange={(e) => setCommandQuery(e.target.value)} placeholder="Търси таб или команда..." className="flex-1 bg-transparent text-lg outline-none text-white placeholder:text-gray-600" /><div className="text-[10px] text-gray-500 border border-[#333] px-2 py-1 rounded bg-[#040404]">ESC</div>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2 custom-scrollbar">
              {commandItems.map((it, idx) => (<button key={idx} onClick={() => { it.run(); setCommandOpen(false); setCommandQuery(""); }} className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#1a1a1a] rounded-xl group transition-all"><div className="bg-[#040404] p-2 rounded-lg border border-[#222] group-hover:border-red-500/50 group-hover:text-red-500 transition-colors"><it.icon size={18} /></div><span className="text-gray-300 font-bold uppercase tracking-widest text-xs group-hover:text-white">{it.label}</span></button>))}
              {commandItems.length === 0 && <div className="p-6 text-gray-500 uppercase tracking-widest text-xs text-center">Няма резултати.</div>}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-72 bg-[#0a0a0a] border-r border-[#1a1a1a] hidden md:flex flex-col relative z-20">
        <div className="p-8 border-b border-[#1a1a1a] flex items-center gap-3">
          <ShieldAlert className="text-red-500 w-8 h-8" />
          <span className="text-2xl font-bold text-white uppercase tracking-widest">VAZOV OS</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-4 px-4 mt-2">Главно Меню</div>
          {([ { id: "dashboard", icon: LayoutDashboard, label: "Табло" }, { id: "orders", icon: ShoppingCart, label: "Поръчки" }, { id: "create-order", icon: PlusCircle, label: "Нова Поръчка" } ] satisfies AdminNavTab[]).map((tab) => (
            <button key={tab.id} onClick={() => {setActiveTab(tab.id as Tab); cancelEdit();}} className={cn("w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all", activeTab === tab.id ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] translate-x-1" : "text-gray-500 hover:bg-[#111] hover:text-white")}><tab.icon size={20} /> {tab.label}</button>
          ))}
          <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-4 mt-8 px-4">Сайт Управление</div>
          {([ { id: "arsenal", icon: Package, label: "Арсенал" }, { id: "equipment", icon: Shield, label: "Екипировка" }, { id: "services", icon: Wrench, label: "Сервиз & Услуги" }, { id: "gallery", icon: ImagePlus, label: "Галерия" }, { id: "settings", icon: Settings, label: "CMS Настройки" }, { id: "audit", icon: ClipboardList, label: "Дневник (Audit)" } ] satisfies AdminNavTab[]).map((tab) => (
            <button key={tab.id} onClick={() => {setActiveTab(tab.id as Tab); cancelEdit();}} className={cn("w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all", activeTab === tab.id ? "bg-[#1a1a1a] text-white border border-[#333]" : "text-gray-500 hover:bg-[#111] hover:text-white")}><tab.icon size={20} className={activeTab===tab.id?"text-red-500":""} /> {tab.label}</button>
          ))}
        </nav>
        <div className="p-6 border-t border-[#1a1a1a] bg-[#040404]">
          <Button onClick={() => setCommandOpen(true)} variant="outline" className="w-full justify-start border-[#333] text-gray-300 hover:text-red-500 mb-3 bg-[#111]"><Command className="mr-3" size={18} /> Command (Ctrl+K)</Button>
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-gray-500 hover:text-red-500 hover:bg-red-900/10 uppercase tracking-widest"><LogOut className="mr-3" size={18} /> Изход</Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-900 opacity-50" />
        
        <div className="p-6 md:p-12 max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
                {activeTab.replace("-", " ")}
                {activeTab === 'dashboard' && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>}
              </h2>
              <p className="text-gray-500 text-xs uppercase tracking-widest mt-2">Fast UI • Fully Typed • CMS</p>
            </div>
            <div className="flex items-center gap-3 bg-[#0a0a0a] p-2 rounded-2xl border border-[#1a1a1a]">
              {activeTab === "orders" && <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={exportOrdersCSV}><Download size={18} className="mr-2" /> Експорт CSV</Button>}
              <Button onClick={fetchData} variant="ghost" className={cn("text-gray-400 hover:text-white rounded-xl", isRefreshing && "animate-pulse text-red-500")}><RefreshCw size={18} className={cn(isRefreshing && "animate-spin")} /></Button>
              <Button onClick={() => setCommandOpen(true)} className="bg-red-600 text-white font-bold hover:bg-red-500 rounded-xl"><Command size={18} className="mr-2" /> Ctrl+K</Button>
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Чакащи Заявки" count={orders.filter((o) => o.status === "pending").length} icon={Clock} accent="border-t-amber-500" />
                  <StatCard label="В Сервиза" count={orders.filter((o) => o.status === "in-progress").length} icon={Wrench} accent="border-t-blue-500" />
                  <StatCard label="Успешно Готови" count={orders.filter((o) => o.status === "completed").length} icon={CheckCircle2} accent="border-t-green-500" />
                  <StatCard label="Общ Приход" count={`${orders.filter(o=>o.status==='completed').reduce((a,b)=>a+(parseFloat(String(b.total_price).replace(/[^0-9.]/g,''))||0),0).toLocaleString('bg-BG')} €`} icon={Package} accent="border-t-red-600" />
                </div>
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-8 shadow-xl">
                    <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2"><Eye size={16} className="text-red-500" /> Последни Поръчки</h3>
                    <div className="space-y-4">
                      {orders.slice(0, 6).map((o) => (
                        <button key={o.id} onClick={() => { setActiveTab("orders"); setSelectedOrder(o); }} className="w-full text-left bg-[#040404] border border-[#111] hover:border-[#333] rounded-2xl p-5 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={cn("w-2 h-10 rounded-full", o.status === 'completed' ? 'bg-green-500' : o.status === 'in-progress' ? 'bg-blue-500' : o.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500')}></div>
                            <div><div className="text-white font-bold text-lg group-hover:text-red-500 transition-colors">{o.name}</div><div className="text-gray-500 text-xs font-mono">{o.order_number || "#N/A"} • {new Date(o.created_at).toLocaleDateString("bg-BG")}</div></div>
                          </div>
                          <div className="sm:text-right"><div className="text-red-500 font-bold text-xl">{o.total_price || "-"}</div><div className="text-gray-500 text-[10px] uppercase tracking-widest">{o.status}</div></div>
                        </button>
                      ))}
                      {orders.length === 0 && <div className="text-gray-600 border border-dashed border-[#222] p-10 text-center rounded-2xl text-xs uppercase tracking-widest">Няма поръчки.</div>}
                    </div>
                  </div>
                  <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-8 shadow-xl">
                    <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2"><ClipboardList size={16} className="text-red-500" /> Дневник (Activity)</h3>
                    <div className="relative border-l border-[#333] ml-2 space-y-6 pb-4">
                      {auditLogs.slice(0, 8).map((l) => (
                        <div key={l.id} className="relative pl-6">
                          <div className="absolute w-2 h-2 bg-red-500 rounded-full -left-[4.5px] top-1.5 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                          <div className="text-white font-bold text-[10px] uppercase tracking-widest bg-red-500/10 text-red-500 inline-block px-2 py-0.5 rounded border border-red-500/20 mb-1">{l.action}</div>
                          <div className="text-gray-400 text-xs leading-relaxed"><span className="text-gray-300">{l.actor_email || "System"}</span> • {l.entity}</div>
                          <div className="text-gray-600 text-[9px] font-mono mt-1">{new Date(l.created_at).toLocaleString("bg-BG")}</div>
                        </div>
                      ))}
                      {auditLogs.length === 0 && <div className="pl-6 text-gray-600 text-xs">Няма логове.</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ORDERS TABLE */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="relative w-full md:w-96 mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="text" placeholder="Търси по име, телефон или номер..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#1a1a1a] py-4 pl-12 pr-4 text-white rounded-2xl focus:border-red-500 outline-none transition-all shadow-lg" />
                </div>
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px] border-collapse">
                      <thead><tr className="bg-[#111] border-b border-[#222]"><th className="p-5 text-gray-400 text-[10px] font-bold uppercase tracking-widest">Номер & Дата</th><th className="p-5 text-gray-400 text-[10px] font-bold uppercase tracking-widest">Клиент</th><th className="p-5 text-gray-400 text-[10px] font-bold uppercase tracking-widest text-right">Стойност</th><th className="p-5 text-gray-400 text-[10px] font-bold uppercase tracking-widest text-center">Статус</th><th className="p-5 text-center"></th></tr></thead>
                      <tbody className="divide-y divide-[#1a1a1a]">
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-[#040404] transition-colors group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                            <td className="p-5"><div className="text-red-500 font-mono font-bold text-base">{order.order_number || "—"}</div><div className="text-gray-500 text-[10px] font-mono mt-1">{new Date(order.created_at).toLocaleString("bg-BG")}</div></td>
                            <td className="p-5"><div className="text-white font-bold text-sm mb-1">{order.name} {order.is_manual && <span className="ml-2 bg-red-500/10 text-red-500 border border-red-500/30 text-[8px] px-2 py-0.5 rounded uppercase tracking-widest">Ръчна</span>}</div><div className="text-gray-500 text-xs">{order.phone}</div></td>
                            <td className="p-5 text-right text-white font-bold text-lg">{order.total_price || "—"}</td>
                            <td className="p-5 text-center" onClick={(e) => e.stopPropagation()}><select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value, order.email, order.order_number, order.name, order.details, order.total_price)} className={cn("px-4 py-2 rounded-xl font-bold uppercase text-[9px] tracking-widest cursor-pointer outline-none border appearance-none text-center transition-colors", order.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/30' : order.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' : order.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30')}><option value="pending">Чакащо</option><option value="in-progress">В Сервиза</option><option value="completed">Готово</option><option value="cancelled">Отказ</option></select></td>
                            <td className="p-5 text-center"><div className="p-2 rounded-lg bg-[#111] text-gray-400 group-hover:bg-red-600 group-hover:text-white transition-colors inline-block"><Eye size={16} /></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredOrders.length === 0 && <div className="p-16 text-center text-gray-500 uppercase tracking-widest text-xs">Не са намерени поръчки.</div>}
                  </div>
                </div>
              </div>
            )}

            {/* CREATE ORDER */}
            {activeTab === "create-order" && (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-3xl shadow-xl">
                    <h3 className="text-white font-bold uppercase tracking-widest mb-6 flex items-center gap-3 text-sm"><User className="text-red-500" size={18}/> Данни за Клиента</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Име и Фамилия</label><input value={newOrder.name} onChange={(e) => setNewOrder({ ...newOrder, name: e.target.value })} className="w-full bg-[#040404] border border-[#222] p-4 text-white rounded-xl focus:border-red-500 outline-none transition-all" /></div>
                      <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Телефон *</label><input value={newOrder.phone} onChange={(e) => setNewOrder({ ...newOrder, phone: e.target.value })} className={cn("w-full bg-[#040404] border p-4 text-white rounded-xl outline-none transition-all", newOrder.phone && !validatePhone(newOrder.phone) ? "border-red-500" : "border-[#222] focus:border-red-500")} /></div>
                      <div className="md:col-span-2"><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Имейл</label><input value={newOrder.email} onChange={(e) => setNewOrder({ ...newOrder, email: e.target.value })} className={cn("w-full bg-[#040404] border p-4 text-white rounded-xl outline-none transition-all", newOrder.email && !validateEmail(newOrder.email) ? "border-red-500" : "border-[#222] focus:border-red-500")} /></div>
                    </div>
                  </div>

                  <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-3xl shadow-xl">
                    <h3 className="text-white font-bold uppercase tracking-widest mb-6 flex items-center gap-3 text-sm"><Package className="text-red-500" size={18}/> Добави Продукти (Склад)</h3>
                    <div className="grid sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar border border-[#1a1a1a] bg-[#040404] p-4 rounded-2xl">
                      {[...arsenalItems, ...equipmentItems].map((item) => (
                        <button key={item.id} onClick={() => addToOrder(item)} className="flex items-center justify-between p-3 border border-[#222] bg-[#0a0a0a] rounded-xl text-left hover:border-red-500 group transition-all">
                          <div className="flex items-center gap-4 overflow-hidden">
                            <img src={item.image_url} className="w-12 h-12 object-cover rounded-lg opacity-70 group-hover:opacity-100 transition-opacity" />
                            <div className="truncate pr-2">
                              <p className="text-white text-xs font-bold uppercase tracking-wide truncate group-hover:text-red-500 transition-colors">{item.title}</p>
                              <p className="text-gray-500 text-[10px] mt-1 font-mono">{item.price}</p>
                            </div>
                          </div>
                          <PlusCircle size={20} className="text-gray-600 group-hover:text-red-500 flex-shrink-0" />
                        </button>
                      ))}
                      {arsenalItems.length === 0 && equipmentItems.length === 0 && <div className="col-span-2 text-center py-10 text-gray-600 text-xs">Складът е празен.</div>}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 relative">
                  <div className="bg-[#040404] border border-[#1a1a1a] rounded-3xl p-8 shadow-2xl sticky top-8">
                    <div className="text-center mb-8 border-b border-dashed border-[#333] pb-6">
                      <h4 className="text-white font-bold text-xl uppercase tracking-widest">Касова Бележка</h4>
                      <p className="text-gray-500 text-xs font-mono mt-2">VAZOV OS POS</p>
                    </div>

                    <div className="space-y-4 mb-8 min-h-[150px]">
                      {newOrder.items.length === 0 ? <div className="text-center text-gray-600 text-xs uppercase tracking-widest italic py-10">Няма артикули</div> : (
                        newOrder.items.map((item, idx) => (
                          <div key={idx} className="flex flex-col gap-2 bg-[#0a0a0a] p-4 rounded-xl border border-[#111]">
                            <div className="text-white font-bold text-xs uppercase tracking-wide truncate">{item.title}</div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 bg-[#040404] px-2 py-1 rounded-lg border border-[#222]">
                                <button onClick={() => setNewOrder({ ...newOrder, items: newOrder.items.map((i) => i.id === item.id ? { ...i, qty: Math.max(1, (i.qty || 1) - 1) } : i) })} className="text-gray-500 hover:text-white"><Minus size={14} /></button>
                                <span className="text-red-500 font-bold w-4 text-center">{item.qty || 1}</span>
                                <button onClick={() => setNewOrder({ ...newOrder, items: newOrder.items.map((i) => i.id === item.id ? { ...i, qty: (i.qty || 1) + 1 } : i) })} className="text-gray-500 hover:text-white"><Plus size={14} /></button>
                              </div>
                              <div className="flex items-center gap-2">
                                <input value={item.overridePrice} onChange={(e) => setNewOrder({ ...newOrder, items: newOrder.items.map((i) => i.id === item.id ? { ...i, overridePrice: e.target.value } : i) })} className="w-16 bg-transparent border-b border-[#333] text-right text-white font-mono focus:border-red-500 outline-none" />€
                                <button onClick={() => setNewOrder({ ...newOrder, items: newOrder.items.filter((i) => i.id !== item.id) })} className="text-gray-600 hover:text-red-500 ml-2"><Trash2 size={16} /></button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-4 border-t border-dashed border-[#333] pt-6 mb-8">
                      <select value={newOrder.shipping} onChange={(e) => setNewOrder({ ...newOrder, shipping: e.target.value })} className="w-full bg-[#111] border border-[#222] p-3 text-gray-300 text-xs rounded-xl focus:border-red-500 outline-none appearance-none"><option>Еконт Експрес</option><option>Спиди</option><option>Взимане на място</option></select>
                      <select value={newOrder.payment} onChange={(e) => setNewOrder({ ...newOrder, payment: e.target.value })} className="w-full bg-[#111] border border-[#222] p-3 text-gray-300 text-xs rounded-xl focus:border-red-500 outline-none appearance-none"><option>Наложен платеж</option><option>Банков път</option><option>В брой</option></select>
                    </div>

                    <div className="flex justify-between items-end mb-8 bg-red-600/10 p-4 rounded-2xl border border-red-500/20">
                      <span className="text-red-500 text-xs font-bold uppercase tracking-widest">Общо:</span>
                      <span className="text-3xl font-bold text-red-500">{Number(newOrderTotal).toFixed(2)} €</span>
                    </div>

                    <Button onClick={submitNewOrder} className="w-full bg-red-600 text-white font-bold uppercase py-7 rounded-xl hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] text-lg">Потвърди</Button>
                    <Button onClick={() => setNewOrder(initialOrderState)} variant="ghost" className="w-full mt-3 text-gray-500 hover:text-red-500">Изчисти всичко</Button>
                  </div>
                </div>
              </div>
            )}

            {/* DYNAMIC CRUD TABS */}
            {["arsenal", "equipment", "services", "gallery"].includes(activeTab) && (() => {
              const table = activeTab as "arsenal" | "equipment" | "services" | "gallery";
              const items = table === "arsenal" ? arsenalItems : table === "equipment" ? equipmentItems : table === "services" ? servicesItems : galleryItems;
              
              return (
                <div className="space-y-8">
                  {table === "services" && (
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-3xl shadow-xl mb-8 flex flex-col md:flex-row items-center gap-8">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-white uppercase mb-2 flex items-center gap-3"><ImagePlus className="text-red-500"/> Главна снимка на сервиза</h2>
                        <p className="text-gray-500 text-xs mb-6 uppercase tracking-widest">Тази снимка стои вляво от списъка с услуги в сайта.</p>
                        <form onSubmit={handleUploadServiceMainImage} className="flex gap-4">
                          <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0] || null; setServiceMainImageFile(f); if (serviceMainPreviewUrl) URL.revokeObjectURL(serviceMainPreviewUrl); setServiceMainPreviewUrl(f ? URL.createObjectURL(f) : ""); }} className="flex-1 bg-[#040404] border border-[#1a1a1a] p-3 text-white text-sm rounded-xl file:bg-red-600 file:text-white file:border-0 file:rounded-lg file:px-4 file:py-1 file:mr-4 file:font-bold cursor-pointer" />
                          <Button type="submit" disabled={!serviceMainImageFile || isUploading} className="bg-red-600 text-white font-bold px-8 rounded-xl hover:bg-red-500">Качи</Button>
                        </form>
                      </div>
                      <div className="w-full md:w-1/3 aspect-video rounded-2xl overflow-hidden border border-[#222] bg-[#040404]">
                        {(serviceMainPreviewUrl || serviceMainImgUrl) ? <img src={serviceMainPreviewUrl || serviceMainImgUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600"><ImagePlus size={40}/></div>}
                      </div>
                    </div>
                  )}

                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-3xl shadow-xl h-fit sticky top-8">
                      <h2 className="text-xl font-bold text-white uppercase mb-8 flex items-center justify-between border-b border-[#1a1a1a] pb-6">
                        <span className="flex items-center gap-3 text-red-500">{editId ? <Pencil size={20}/> : <Upload size={20}/>} {editId ? "Редакция" : "Добави Нов"}</span>
                        {editId && <button onClick={cancelEdit} className="text-gray-500 hover:text-white bg-[#111] p-2 rounded-full"><X size={16}/></button>}
                      </h2>
                      <form onSubmit={(e) => handleSaveEntity(e, table)} className="space-y-6">
                        <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Заглавие / Име</label><input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-xl focus:border-red-500 outline-none transition-colors" /></div>
                        {table !== "gallery" && <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Описание</label><textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-xl focus:border-red-500 outline-none resize-none transition-colors" /></div>}
                        {(table === "arsenal" || table === "equipment") && <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Цена (€)</label><input value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-xl focus:border-red-500 outline-none transition-colors" /></div>}
                        {table !== "services" && <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Снимка</label><input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full bg-[#040404] border border-[#1a1a1a] p-3 text-white text-sm rounded-xl file:bg-red-600 file:text-white file:border-0 file:rounded-lg file:px-4 file:py-1 file:mr-4 file:font-bold cursor-pointer" />{editId && currentImageUrl && !imageFile && <img src={currentImageUrl} className="mt-4 h-32 w-full object-cover rounded-xl opacity-70 border border-[#333]"/>}</div>}
                        <Button type="submit" disabled={isUploading} className="w-full bg-red-600 text-white font-bold uppercase py-6 rounded-xl hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]">{isUploading ? "Запис..." : "Запази Данните"}</Button>
                      </form>
                    </div>
                    
                    <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6 items-start">
                      {items.map((item) => (
                        <div key={item.id} className={cn("bg-[#0a0a0a] border rounded-3xl overflow-hidden flex flex-col group transition-all duration-500 shadow-lg", editId === item.id ? "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.15)]" : "border-[#1a1a1a] hover:border-[#333]")}>
                          {table !== "services" && <div className="h-56 overflow-hidden relative bg-black"><img src={item.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-700"/></div>}
                          <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-3"><h3 className="font-bold text-white uppercase tracking-wider text-lg">{item.title}</h3>{(table === "arsenal" || table === "equipment") && <span className="text-red-500 font-bold bg-[#111] px-3 py-1 rounded-lg border border-[#222] text-sm">{item.price}</span>}</div>
                            {table !== "gallery" && <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">{item.description}</p>}
                            <div className="flex gap-3 mt-auto pt-4 border-t border-[#1a1a1a]">
                              <Button onClick={() => startEdit(item)} variant="outline" className="flex-1 border-[#333] bg-[#040404] text-gray-300 hover:text-red-500 hover:border-red-500 rounded-xl"><Pencil size={14} className="mr-2"/> Редакция</Button>
                              <Button onClick={() => handleDeleteEntity(item.id, table)} variant="outline" className="border-red-900/30 bg-[#040404] text-red-500 hover:bg-red-600 hover:text-white rounded-xl"><Trash2 size={16}/></Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {items.length === 0 && <div className="col-span-2 p-16 text-center text-gray-500 border border-dashed border-[#222] rounded-3xl uppercase tracking-widest text-sm">Базата данни е празна.</div>}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SETTINGS */}
            {activeTab === "settings" && (
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-10 max-w-4xl mx-auto shadow-2xl">
                <div className="flex items-center gap-4 mb-8 border-b border-[#1a1a1a] pb-6">
                  <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20"><Settings className="text-red-500" size={24}/></div>
                  <div><h2 className="text-2xl font-bold text-white uppercase tracking-widest">CMS Настройки</h2><p className="text-gray-500 text-xs mt-1 uppercase tracking-widest">Динамични текстове на публичния сайт</p></div>
                </div>
                <div className="space-y-8">
                  {settings.map((s) => (
                    <div key={s.key} className="bg-[#040404] border border-[#111] p-6 rounded-2xl">
                      <label className="text-[10px] text-red-500 uppercase font-bold tracking-widest mb-4 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]" /> {s.description}</label>
                      {/(image|bg)/i.test(s.key) ? (
                        <div className="space-y-4">
                          <label className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-red-600/10 border border-red-500/40 text-red-400 hover:text-white hover:bg-red-600/20 cursor-pointer transition-all shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                            <Upload size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">{isUploading ? "Качване..." : "Качи ново изображение"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleSettingImageUpload(file, s.key);
                                e.currentTarget.value = "";
                              }}
                            />
                          </label>
                          <div className="w-full rounded-xl border border-[#222] bg-[#0a0a0a] p-2">
                            {s.value ? (
                              <img src={s.value} alt={s.key} className="w-full h-40 object-cover rounded-lg" />
                            ) : (
                              <div className="w-full h-40 rounded-lg bg-black/40 flex items-center justify-center text-gray-600 text-xs uppercase tracking-widest">Няма зададено изображение</div>
                            )}
                          </div>
                        </div>
                      ) : String(s.value).length > 50 ? <textarea value={s.value} onChange={(e) => setSettings(settings.map((x) => x.key === s.key ? { ...x, value: e.target.value } : x))} rows={4} className="w-full bg-[#0a0a0a] border border-[#222] p-4 text-gray-300 rounded-xl focus:border-red-500 outline-none resize-none transition-all leading-relaxed" /> : <input value={s.value} onChange={(e) => setSettings(settings.map((x) => x.key === s.key ? { ...x, value: e.target.value } : x))} className="w-full bg-[#0a0a0a] border border-[#222] p-4 text-gray-300 rounded-xl focus:border-red-500 outline-none transition-all" />}
                    </div>
                  ))}
                  <Button onClick={saveSettings} className="w-full bg-red-600 text-white font-bold uppercase tracking-widest py-7 rounded-2xl hover:bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)] text-lg mt-4"><Save className="mr-3" size={24} /> Синхронизирай със сайта</Button>
                </div>
              </div>
            )}

            {/* AUDIT */}
            {activeTab === "audit" && (
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-8 shadow-xl">
                 <div className="flex justify-between items-center mb-8 border-b border-[#1a1a1a] pb-6">
                    <div><h3 className="text-2xl font-bold text-white uppercase tracking-widest flex items-center gap-3"><ClipboardList className="text-red-500" /> Системен Дневник</h3><p className="text-gray-500 text-xs mt-2 uppercase tracking-widest">Всички действия в панела се записват тук.</p></div>
                    <Button onClick={fetchAudit} variant="outline" className="border-[#333] text-gray-300 rounded-xl hover:text-white"><RefreshCw size={16} className="mr-2"/> Обнови</Button>
                 </div>
                 <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[900px] border-collapse">
                    <thead><tr className="bg-[#040404] text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-[#222]"><th className="p-5">Време</th><th className="p-5">Действие</th><th className="p-5">Обект</th><th className="p-5">Метаданни</th></tr></thead>
                    <tbody className="divide-y divide-[#1a1a1a]">
                      {auditLogs.map((l) => (
                        <tr key={l.id} className="hover:bg-[#111] transition-colors">
                          <td className="p-5 text-gray-400 text-xs font-mono">{new Date(l.created_at).toLocaleString("bg-BG")}</td>
                          <td className="p-5 text-red-500 text-xs font-bold uppercase tracking-widest"><div className="bg-red-500/10 border border-red-500/20 inline-block px-3 py-1 rounded-lg">{l.action}</div></td>
                          <td className="p-5 text-gray-300 text-xs font-mono">{l.entity} {l.entity_id ? <span className="text-gray-500 block mt-1">ID: {l.entity_id}</span> : ""}</td>
                          <td className="p-5 text-gray-500 text-[10px] font-mono max-w-xs truncate">{JSON.stringify(l.meta)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-[0_0_100px_rgba(220,38,38,0.15)] relative">
            <div className="sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-[#1a1a1a] p-6 md:p-8 flex justify-between items-center z-10">
              <div>
                <div className="flex items-center gap-3 mb-1"><Hash className="text-red-500" size={24}/><h2 className="text-2xl md:text-3xl font-bold text-white tracking-widest">{selectedOrder.order_number || "БЕЗ НОМЕР"}</h2></div>
                <div className="flex items-center gap-3 text-xs font-mono text-gray-500"><span>{new Date(selectedOrder.created_at).toLocaleString("bg-BG")}</span>{selectedOrder.is_manual && <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded border border-red-500/30 uppercase tracking-widest font-bold">Ръчна</span>}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-3 bg-[#111] hover:bg-red-500/20 hover:text-red-500 text-gray-400 rounded-xl transition-colors"><X size={24} /></button>
            </div>
            <div className="p-6 md:p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#040404] border border-[#1a1a1a] p-6 rounded-3xl shadow-lg">
                  <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><User size={14} className="text-red-500" /> Клиент</h3>
                  <p className="text-white font-bold text-xl mb-4">{selectedOrder.name}</p>
                  <div className="space-y-3">
                    <p className="text-gray-300 font-mono text-sm flex items-center gap-3 bg-[#0a0a0a] p-3 rounded-xl border border-[#111]"><Phone size={16} className="text-red-500"/> {selectedOrder.phone}</p>
                    {selectedOrder.email && <p className="text-gray-300 font-mono text-sm flex items-center gap-3 bg-[#0a0a0a] p-3 rounded-xl border border-[#111]"><Mail size={16} className="text-red-500"/> {selectedOrder.email}</p>}
                    <p className="text-gray-300 text-sm flex items-start gap-3 bg-[#0a0a0a] p-3 rounded-xl border border-[#111]"><MapPin size={16} className="text-red-500 shrink-0 mt-0.5"/> {selectedOrder.address || "Не е посочен адрес"}</p>
                  </div>
                </div>
                <div className="bg-[#040404] border border-[#1a1a1a] p-6 rounded-3xl shadow-lg flex flex-col">
                  <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Settings size={14} className="text-red-500" /> Управление</h3>
                  <div className="mb-6"><span className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Категория на поръчката:</span><span className="bg-[#0a0a0a] text-gray-300 px-4 py-2 rounded-xl border border-[#111] text-sm font-bold tracking-wide inline-block">{selectedOrder.category || "Неизвестна"}</span></div>
                  <div className="mt-auto">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Промени Статус (Изпраща имейл)</label>
                    <select value={selectedOrder.status} onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value, selectedOrder.email, selectedOrder.order_number, selectedOrder.name, selectedOrder.details, selectedOrder.total_price)} className="w-full bg-[#111] border border-red-500/30 text-red-500 p-4 rounded-2xl focus:border-red-500 focus:bg-[#0a0a0a] outline-none font-bold uppercase tracking-widest cursor-pointer appearance-none text-center shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                      <option value="pending" className="text-white">⏳ ЧАКАЩО</option><option value="in-progress" className="text-white">🔧 В СЕРВИЗА</option><option value="completed" className="text-white">✅ ГОТОВО</option><option value="cancelled" className="text-white">❌ ОТКАЗАНО</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-[#040404] border border-[#1a1a1a] p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 text-[#111] select-none pointer-events-none"><Package size={200} className="-mr-10 -mt-10" /></div>
                <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10"><Package size={14} className="text-red-500" /> Детайли на проекта</h3>
                <div className="bg-[#0a0a0a]/80 backdrop-blur-sm p-6 rounded-2xl border border-[#111] whitespace-pre-line text-gray-300 text-sm leading-relaxed font-mono relative z-10">{selectedOrder.details}</div>
                {selectedOrder.total_price && (
                  <div className="mt-8 flex justify-end items-end gap-4 border-t border-[#111] pt-6 relative z-10">
                    <span className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">Крайна Стойност:</span>
                    <span className="text-4xl md:text-5xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{selectedOrder.total_price}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
