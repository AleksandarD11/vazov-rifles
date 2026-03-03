import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Crosshair,
  ShieldAlert,
  LogOut,
  Lock,
  Package,
  ImagePlus,
  Trash2,
  Upload,
  Pencil,
  X,
  LayoutDashboard,
  ShoppingCart,
  PlusCircle,
  Settings,
  User,
  MapPin,
  Truck,
  Plus,
  Minus,
  Save,
  CheckCircle2,
  Clock,
  XCircle,
  Wrench,
  Search,
  RefreshCw,
  Eye,
  Phone,
  Mail,
  Hash,
  Users,
  ClipboardList,
  Command,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";

// --- ВАЛИДАТОРИ И ГЕНЕРАТОРИ ---
const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone: string) =>
  /^[\d\s\+\-\(\)]{8,15}$/.test(phone);
const generateOrderNumber = () =>
  `VZ-${Math.floor(100000 + Math.random() * 900000)}`;

// --- tiny utils ---
const cn = (...a: Array<string | false | null | undefined>) =>
  a.filter(Boolean).join(" ");

const nowFileName = (prefix: string, file: File) => {
  const ext = file.name.split(".").pop() || "png";
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`;
};

const toCSV = (rows: any[]) => {
  // ✅ FIX: без replaceAll (някои TS конфигурации мрънкат)
  const esc = (v: any) => `"${String(v ?? "").replace(/"/g, `""`)}"`;
  const headers = [
    "order_number",
    "created_at",
    "name",
    "phone",
    "email",
    "address",
    "category",
    "status",
    "total_price",
    "is_manual",
    "details",
  ];
  const lines = [
    headers.map(esc).join(","),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
  ];
  return lines.join("\n");
};

type Tab =
  | "dashboard"
  | "orders"
  | "create-order"
  | "arsenal"
  | "services"
  | "gallery"
  | "settings"
  | "users"
  | "audit";

type AdminUserRow = {
  id: string;
  email: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  confirmed_at: string | null;
  roles: string[];
  banned_until: string | null;
};

type AuditRow = {
  id: string;
  created_at: string;
  actor_user_id: string | null;
  actor_email: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  meta: any;
};

const AdminDashboard = () => {
  // ✅ Auth + admin guard
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  // Data
  const [orders, setOrders] = useState<any[]>([]);
  const [arsenalItems, setArsenalItems] = useState<any[]>([]);
  const [servicesItems, setServicesItems] = useState<any[]>([]);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditRow[]>([]);

  // Users
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSearch, setUsersSearch] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const roleOptions = ["admin", "manager", "editor", "staff", "user"];

  // UI
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const commandInputRef = useRef<HTMLInputElement | null>(null);

  // Arsenal form
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Services form
  const [editServiceId, setEditServiceId] = useState<string | null>(null);
  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");

  // Services main image + preview
  const [serviceMainImageFile, setServiceMainImageFile] = useState<File | null>(
    null
  );
  const [serviceMainPreviewUrl, setServiceMainPreviewUrl] =
    useState<string>("");

  const serviceMainImgSetting = settings.find(
    (s) => s.key === "services_main_image"
  );
  const serviceMainImgUrl = serviceMainImgSetting
    ? serviceMainImgSetting.value
    : "";

  useEffect(() => {
    return () => {
      if (serviceMainPreviewUrl) URL.revokeObjectURL(serviceMainPreviewUrl);
    };
  }, [serviceMainPreviewUrl]);

  // Gallery form
  const [editGalleryId, setEditGalleryId] = useState<string | null>(null);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryImageFile, setGalleryImageFile] = useState<File | null>(null);
  const [currentGalleryImageUrl, setCurrentGalleryImageUrl] = useState("");

  // Manual order
  const initialOrderState = {
    name: "",
    phone: "",
    email: "",
    address: "",
    shipping: "Еконт Експрес",
    payment: "Наложен платеж",
    items: [] as any[],
    status: "completed",
  };
  const [newOrder, setNewOrder] = useState(initialOrderState);

  // --- RBAC helper
  const verifyAdmin = async (userId: string) => {
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (error) {
      console.error("has_role error:", error);
      toast.error("Проблем при проверка на права (has_role).");
      return false;
    }

    return data === true;
  };

  // --- Audit helper (client-side log for normal CRUD)
  const audit = async (
    action: string,
    entity: string,
    entityId?: string | null,
    meta: Record<string, any> = {}
  ) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const actor = sessionData.session?.user;
      await supabase.from("audit_logs").insert([
        {
          actor_user_id: actor?.id ?? null,
          actor_email: actor?.email ?? null,
          action,
          entity,
          entity_id: entityId ?? null,
          meta,
        },
      ]);
    } catch {
      // silent
    }
  };

  // ✅ Helper: call Edge Function with explicit Bearer token
  const callAdminUsers = async (payload: any) => {
    const { data: sess, error: sessErr } = await supabase.auth.getSession();
    if (sessErr) throw new Error(sessErr.message);

    const token = sess.session?.access_token;
    if (!token) throw new Error("Няма активна Supabase сесия. Влез пак.");

    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!baseUrl || !anon) {
      throw new Error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY");
    }

    const url = `${String(baseUrl).replace(/\/$/, "")}/functions/v1/admin-users`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anon,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body?.error || body?.message || `HTTP ${res.status}`);
    }

    return body;
  };

  // --- Command palette
  const commandItems = useMemo(() => {
    const items = [
      {
        label: "Отиди: Табло",
        run: () => setActiveTab("dashboard"),
        icon: LayoutDashboard,
      },
      {
        label: "Отиди: Поръчки",
        run: () => setActiveTab("orders"),
        icon: ShoppingCart,
      },
      {
        label: "Отиди: Нова поръчка",
        run: () => setActiveTab("create-order"),
        icon: PlusCircle,
      },
      {
        label: "Отиди: Арсенал",
        run: () => setActiveTab("arsenal"),
        icon: Package,
      },
      {
        label: "Отиди: Сервиз & Услуги",
        run: () => setActiveTab("services"),
        icon: Wrench,
      },
      {
        label: "Отиди: Галерия",
        run: () => setActiveTab("gallery"),
        icon: ImagePlus,
      },
      {
        label: "Отиди: CMS Настройки",
        run: () => setActiveTab("settings"),
        icon: Settings,
      },
      {
        label: "Отиди: Потребители & Роли",
        run: () => setActiveTab("users"),
        icon: Users,
      },
      {
        label: "Отиди: Audit Log",
        run: () => setActiveTab("audit"),
        icon: ClipboardList,
      },
      { label: "Рефреш всички данни", run: () => fetchData(), icon: RefreshCw },
      {
        label: "Export поръчки (CSV)",
        run: () => exportOrdersCSV(),
        icon: Download,
      },
    ];
    const q = commandQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [commandQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setCommandOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (commandOpen) {
      setTimeout(() => commandInputRef.current?.focus(), 0);
    } else {
      setCommandQuery("");
    }
  }, [commandOpen]);

  // --- Auth
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (error) {
        toast.error("Грешен имейл или парола.");
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        toast.error("Няма user в сесията.");
        return;
      }

      const ok = await verifyAdmin(userId);
      if (!ok) {
        toast.error("Нямаш admin права за този панел.");
        await supabase.auth.signOut();
        setIsAuthorized(false);
        return;
      }

      toast.success("Успешен вход ✅");
      setIsAuthorized(true);
      setAuthPassword("");
      await audit("auth.login", "admin_panel", null, {});
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await audit("auth.logout", "admin_panel", null, {});
    await supabase.auth.signOut();
    setIsAuthorized(false);
    setAuthEmail("");
    setAuthPassword("");
    setActiveTab("dashboard");
  };

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (cancelled) return;

      if (session?.user) {
        const ok = await verifyAdmin(session.user.id);
        if (cancelled) return;

        if (ok) {
          setIsAuthorized(true);
          setAuthEmail(session.user.email ?? "");
        } else {
          await supabase.auth.signOut();
          setIsAuthorized(false);
        }
      } else {
        setIsAuthorized(false);
      }

      setAuthChecked(true);
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          setIsAuthorized(false);
          setAuthChecked(true);
          return;
        }

        const ok = await verifyAdmin(session.user.id);
        if (ok) {
          setIsAuthorized(true);
          setAuthEmail(session.user.email ?? "");
        } else {
          await supabase.auth.signOut();
          setIsAuthorized(false);
        }
        setAuthChecked(true);
      }
    );

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- Fetching
  const fetchAudit = async () => {
    const { data } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) setAuditLogs(data as any);
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const body = await callAdminUsers({
        action: "list_users",
        page: 1,
        perPage: 100,
      });

      setUsers((body?.users ?? []) as AdminUserRow[]);
    } catch (e: any) {
      console.error(e);
      toast.error(`Не мога да заредя потребителите: ${e?.message || e}`);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchData = async () => {
    setIsRefreshing(true);
    const [ordersRes, arsenalRes, settingsRes, servicesRes, galleryRes] =
      await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("arsenal")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("site_settings").select("*"),
        supabase
          .from("services")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("gallery")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

    if (ordersRes.data) setOrders(ordersRes.data);
    if (arsenalRes.data) setArsenalItems(arsenalRes.data);
    if (settingsRes.data) setSettings(settingsRes.data);
    if (servicesRes.data) setServicesItems(servicesRes.data);
    if (galleryRes.data) setGalleryItems(galleryRes.data);

    await fetchAudit();

    setIsRefreshing(false);
  };

  useEffect(() => {
    if (!isAuthorized) return;

    fetchData();

    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        async () => {
          const { data } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });
          if (data) setOrders(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthorized]);

  useEffect(() => {
    if (!isAuthorized) return;
    if (activeTab === "users") fetchUsers();
    if (activeTab === "audit") fetchAudit();
  }, [activeTab, isAuthorized]);

  // --- Email system
  const sendEmailNotification = (
    email: string,
    status: string,
    orderNum: string,
    name: string,
    details: string = "-",
    totalPrice: string = "-",
    shipping: string = "-",
    payment: string = "-"
  ) => {
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const statusMap: any = {
      pending: "ЧАКАЩА (ПРИЕТА)",
      "in-progress": "В СЕРВИЗА",
      completed: "ГОТОВА / ЗАВЪРШЕНА",
      cancelled: "ОТКАЗАНА",
    };

    const templateParams = {
      user_name: name,
      user_email: email,
      order_number: orderNum,
      status: statusMap[status] || status,
      details,
      total_price: totalPrice,
      shipping_method: shipping,
      payment_method: payment,
    };

    emailjs
      .send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then(() =>
        toast.success(`Имейлът е изпратен успешно до ${email}!`, { icon: "📧" })
      )
      .catch((err) => {
        console.error("Грешка при имейл:", err);
        toast.error("Имейлът не успя да тръгне.");
      });
  };

  const updateOrderStatus = async (
    id: string,
    newStatus: string,
    email: string,
    orderNum: string,
    orderName: string,
    details: string,
    totalPrice: string
  ) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      toast.success("Статусът е обновен!");
      await audit("order.status.update", "orders", id, { status: newStatus });

      if (email) {
        sendEmailNotification(
          email,
          newStatus,
          orderNum || "N/A",
          orderName,
          details,
          totalPrice,
          "Еконт",
          "Наложен платеж"
        );
      }

      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setOrders(data);

      if (selectedOrder && selectedOrder.id === id)
        setSelectedOrder({ ...selectedOrder, status: newStatus });

      await fetchAudit();
    } else {
      toast.error("Грешка при обновяване на статуса.");
    }
  };

  // --- Upload helper
  const uploadToBucket = async (
    bucket: "arsenal" | "gallery",
    file: File,
    prefix: string
  ) => {
    const fileName = nowFileName(prefix, file);
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });
    if (uploadError) throw uploadError;
    return supabase.storage.from(bucket).getPublicUrl(fileName).data.publicUrl;
  };

  // --- Arsenal
  const startEdit = (item: any) => {
    setEditId(item.id);
    setTitle(item.title);
    setDescription(item.description || "");
    setPrice(item.price || "");
    setCurrentImageUrl(item.image_url);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setCurrentImageUrl("");
    setImageFile(null);
  };

  const handleSaveArsenal = async (e: FormEvent) => {
    e.preventDefault();
    const cleanPrice = price.includes("€") ? price : `${price} €`;
    setIsUploading(true);
    const toastId = toast.loading(editId ? "Обновяване..." : "Качване...");

    try {
      let finalImageUrl = currentImageUrl;
      if (imageFile) finalImageUrl = await uploadToBucket("arsenal", imageFile, "arsenal");

      if (editId) {
        const { error } = await supabase
          .from("arsenal")
          .update({ title, description, price: cleanPrice, image_url: finalImageUrl })
          .eq("id", editId);
        if (error) throw error;
        await audit("arsenal.update", "arsenal", editId, { title });
      } else {
        const { data, error } = await supabase
          .from("arsenal")
          .insert([{ title, description, price: cleanPrice, image_url: finalImageUrl }])
          .select("*")
          .single();
        if (error) throw error;
        await audit("arsenal.create", "arsenal", data?.id ?? null, { title });
      }

      toast.success(editId ? "Успешно обновено!" : "Успешно добавено!", { id: toastId });
      cancelEdit();
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error("Грешка: " + (error?.message || "Unknown error"), { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteArsenal = async (id: string) => {
    if (!window.confirm("Изтриване на продукта?")) return;
    const { error } = await supabase.from("arsenal").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await audit("arsenal.delete", "arsenal", id, {});
    toast.success("Изтрито!");
    fetchData();
  };

  // --- Services main image
  const handleUploadServiceMainImage = async (e: FormEvent) => {
    e.preventDefault();
    if (!serviceMainImageFile) return toast.error("Избери снимка първо!");
    setIsUploading(true);
    const toastId = toast.loading("Качване на главната снимка...");

    try {
      const finalImageUrl = await uploadToBucket("gallery", serviceMainImageFile, "service_main");

      const { data: existingSetting, error: selErr } = await supabase
        .from("site_settings")
        .select("key")
        .eq("key", "services_main_image")
        .maybeSingle();

      if (selErr) throw selErr;

      if (existingSetting) {
        const { error } = await supabase
          .from("site_settings")
          .update({ value: finalImageUrl })
          .eq("key", "services_main_image");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert([{ key: "services_main_image", value: finalImageUrl, description: "Главна снимка за секция Сервиз" }]);
        if (error) throw error;
      }

      await audit("site_settings.services_main_image.update", "site_settings", "services_main_image", {});
      toast.success("Главната снимка е обновена!", { id: toastId });

      if (serviceMainPreviewUrl) URL.revokeObjectURL(serviceMainPreviewUrl);
      setServiceMainPreviewUrl(finalImageUrl);
      setServiceMainImageFile(null);

      fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error("Грешка: " + (error?.message || "Unknown error"), { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  // --- Services CRUD
  const startEditService = (item: any) => {
    setEditServiceId(item.id);
    setServiceTitle(item.title);
    setServiceDesc(item.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cancelEditService = () => {
    setEditServiceId(null);
    setServiceTitle("");
    setServiceDesc("");
  };
  const handleSaveService = async (e: FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    const toastId = toast.loading(editServiceId ? "Обновяване..." : "Запазване...");
    try {
      if (editServiceId) {
        const { error } = await supabase
          .from("services")
          .update({ title: serviceTitle, description: serviceDesc })
          .eq("id", editServiceId);
        if (error) throw error;
        await audit("services.update", "services", editServiceId, { title: serviceTitle });
      } else {
        const { data, error } = await supabase
          .from("services")
          .insert([{ title: serviceTitle, description: serviceDesc }])
          .select("*")
          .single();
        if (error) throw error;
        await audit("services.create", "services", data?.id ?? null, { title: serviceTitle });
      }
      toast.success("Готово!", { id: toastId });
      cancelEditService();
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error("Грешка: " + (error?.message || "Unknown error"), { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };
  const handleDeleteService = async (id: string) => {
    if (!window.confirm("Изтриване на услугата?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await audit("services.delete", "services", id, {});
    toast.success("Изтрито!");
    fetchData();
  };

  // --- Gallery
  const startEditGallery = (item: any) => {
    setEditGalleryId(item.id);
    setGalleryTitle(item.title || "");
    setCurrentGalleryImageUrl(item.image_url);
    setGalleryImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cancelEditGallery = () => {
    setEditGalleryId(null);
    setGalleryTitle("");
    setCurrentGalleryImageUrl("");
    setGalleryImageFile(null);
  };
  const handleSaveGallery = async (e: FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    const toastId = toast.loading(editGalleryId ? "Обновяване..." : "Качване на снимка...");
    try {
      let finalImageUrl = currentGalleryImageUrl;
      if (galleryImageFile) finalImageUrl = await uploadToBucket("gallery", galleryImageFile, "gallery");

      if (editGalleryId) {
        const { error } = await supabase
          .from("gallery")
          .update({ title: galleryTitle, image_url: finalImageUrl })
          .eq("id", editGalleryId);
        if (error) throw error;
        await audit("gallery.update", "gallery", editGalleryId, { title: galleryTitle });
      } else {
        const { data, error } = await supabase
          .from("gallery")
          .insert([{ title: galleryTitle, image_url: finalImageUrl }])
          .select("*")
          .single();
        if (error) throw error;
        await audit("gallery.create", "gallery", data?.id ?? null, { title: galleryTitle });
      }

      toast.success("Успешно добавено в галерията!", { id: toastId });
      cancelEditGallery();
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error("Грешка: " + (error?.message || "Unknown error"), { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };
  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm("Изтриване на снимката от галерията?")) return;
    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await audit("gallery.delete", "gallery", id, {});
    toast.success("Снимката е изтрита!");
    fetchData();
  };

  // --- Manual Order
  const addToOrder = (product: any) => {
    setNewOrder((prev) => {
      const exists = prev.items.find((i) => i.id === product.id);
      if (exists)
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.id === product.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      const basePrice = product.price
        ? String(product.price).replace(/[^0-9.]/g, "")
        : "0";
      return {
        ...prev,
        items: [...prev.items, { ...product, qty: 1, overridePrice: basePrice }],
      };
    });
  };

  const newOrderTotal = newOrder.items.reduce(
    (acc, item) => acc + (parseFloat(item.overridePrice) || 0) * item.qty,
    0
  );

  const submitNewOrder = async () => {
    if (!newOrder.name || newOrder.items.length === 0)
      return toast.error("Добави клиент и продукти!");
    if (!validatePhone(newOrder.phone))
      return toast.error("Невалиден телефонен номер!");
    if (newOrder.email && !validateEmail(newOrder.email))
      return toast.error("Невалиден имейл адрес!");

    const toastId = toast.loading("Създаване...");
    const details = newOrder.items
      .map((i) => `- ${i.qty}x ${i.title} (${i.overridePrice} €)`)
      .join("\n");
    const orderNum = generateOrderNumber();
    const finalPrice = `${newOrderTotal.toFixed(2)} €`;

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          order_number: orderNum,
          name: newOrder.name,
          phone: newOrder.phone,
          email: newOrder.email,
          address: newOrder.address,
          total_price: finalPrice,
          details: `Ръчна поръчка:\n${details}`,
          status: newOrder.status,
          is_manual: true,
          category: "Ръчна заявка",
        },
      ])
      .select("*")
      .single();

    if (!error) {
      toast.success(`Поръчката е създадена! Номер: ${orderNum}`, { id: toastId });
      await audit("orders.manual.create", "orders", data?.id ?? null, { order_number: orderNum });

      if (newOrder.email) {
        sendEmailNotification(
          newOrder.email,
          newOrder.status,
          orderNum,
          newOrder.name,
          `Ръчна поръчка:\n${details}`,
          finalPrice,
          newOrder.shipping,
          newOrder.payment
        );
      }
      setNewOrder(initialOrderState);
      setActiveTab("orders");
      fetchData();
    } else {
      toast.error(`Базата блокира: ${error.message}`, { id: toastId, duration: 10000 });
    }
  };

  const saveSettings = async () => {
    const toastId = toast.loading("Запазване...");
    const { error } = await supabase.from("site_settings").upsert(settings);
    if (!error) {
      toast.success("Сайтът е обновен!", { id: toastId });
      await audit("site_settings.upsert", "site_settings", null, {});
      fetchAudit();
    } else {
      toast.error("Грешка!", { id: toastId });
    }
  };

  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          (o.name && o.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (o.phone && o.phone.includes(searchQuery)) ||
          (o.order_number &&
            o.order_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (o.email && o.email.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    [orders, searchQuery]
  );

  const exportOrdersCSV = () => {
    const csv = toCSV(filteredOrders);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Експорт готов ✅");
  };

  // --- Users actions (Edge function)
  const inviteUser = async () => {
    if (!inviteEmail || !validateEmail(inviteEmail))
      return toast.error("Невалиден имейл.");
    setUsersLoading(true);
    try {
      await callAdminUsers({ action: "invite_user", email: inviteEmail });
      toast.success("Покана изпратена ✅");
      setInviteEmail("");
      await fetchUsers();
      await fetchAudit();
    } catch (e: any) {
      console.error(e);
      toast.error(`Неуспешна покана: ${e?.message || e}`);
    } finally {
      setUsersLoading(false);
    }
  };

  const createUser = async () => {
    if (!createEmail || !validateEmail(createEmail))
      return toast.error("Невалиден имейл.");
    if (!createPassword || createPassword.length < 8)
      return toast.error("Паролата трябва да е поне 8 символа.");
    setUsersLoading(true);
    try {
      await callAdminUsers({
        action: "create_user",
        email: createEmail,
        password: createPassword,
      });
      toast.success("User създаден ✅");
      setCreateEmail("");
      setCreatePassword("");
      await fetchUsers();
      await fetchAudit();
    } catch (e: any) {
      console.error(e);
      toast.error(`Неуспешно създаване: ${e?.message || e}`);
    } finally {
      setUsersLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm("Сигурен ли си? Това ще изтрие user-а от Auth.")) return;
    setUsersLoading(true);
    try {
      await callAdminUsers({ action: "delete_user", userId });
      toast.success("User изтрит ✅");
      await fetchUsers();
      await fetchAudit();
    } catch (e: any) {
      console.error(e);
      toast.error(`Неуспешно изтриване: ${e?.message || e}`);
    } finally {
      setUsersLoading(false);
    }
  };

  const setRole = async (userId: string, role: string) => {
    setUsersLoading(true);
    try {
      await callAdminUsers({ action: "set_role", userId, role });
      toast.success("Роля обновена ✅");
      await fetchUsers();
      await fetchAudit();
    } catch (e: any) {
      console.error(e);
      toast.error(`Неуспешна смяна на роля: ${e?.message || e}`);
    } finally {
      setUsersLoading(false);
    }
  };

  // --- Login screen
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#040404] flex items-center justify-center p-6 relative">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-amber-500 via-[#d4af37] to-yellow-300" />
        <div className="max-w-md w-full bg-[#0a0a0a] border border-[#1a1a1a] p-10 rounded-xl shadow-[0_0_50px_rgba(212,175,55,0.05)] text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-[#111] border border-[#333] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Lock className="text-[#d4af37]" size={36} />
          </div>
          <h1 className="text-3xl font-bold text-white uppercase mb-2 tracking-widest">
            VAZOV OS
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest mb-8">
            Admin Access
          </p>

          {!authChecked ? (
            <div className="text-gray-500 uppercase tracking-widest text-xs">
              Проверка на сесия...
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full bg-[#040404] border border-[#1a1a1a] py-4 px-4 text-center text-white focus:border-[#d4af37] outline-none rounded-md transition-all focus:shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                placeholder="Имейл"
                autoComplete="email"
                required
              />
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full bg-[#040404] border border-[#1a1a1a] py-4 px-4 text-center text-white focus:border-[#d4af37] outline-none rounded-md transition-all focus:shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                placeholder="Парола"
                autoComplete="current-password"
                required
              />
              <Button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#d4af37] text-black font-bold uppercase py-6 text-lg hover:bg-amber-400 transition-all"
              >
                {authLoading ? "Влизане..." : "Вход"}
              </Button>
              <div className="text-gray-600 text-[11px] uppercase tracking-widest mt-3 flex items-center justify-center gap-2">
                <Command size={14} /> Ctrl/⌘ + K за Command Palette (след вход)
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- UI blocks
  const StatCard = ({ label, count, icon: Icon, accent }: any) => (
    <div
      className={cn(
        "bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-xl border-t-4 hover:bg-[#111] transition-colors",
        accent
      )}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">
          {label}
        </h3>
        <Icon size={20} />
      </div>
      <p className="text-5xl font-bold text-white mt-6">{count}</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#040404] text-gray-300 overflow-hidden font-sans">
      {/* Command Palette */}
      {commandOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-start justify-center p-6">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#333] rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)]">
            <div className="p-4 border-b border-[#1a1a1a] flex items-center gap-3">
              <Command className="text-[#d4af37]" />
              <input
                ref={commandInputRef}
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder="Търси действие... (Enter за изпълнение)"
                className="flex-1 bg-[#040404] border border-[#1a1a1a] px-4 py-3 rounded-xl outline-none text-white focus:border-[#d4af37]"
              />
              <Button
                variant="outline"
                className="border-[#333] text-gray-400"
                onClick={() => setCommandOpen(false)}
              >
                Esc
              </Button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {commandItems.map((it, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    it.run();
                    setCommandOpen(false);
                    setCommandQuery("");
                  }}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#111] border-b border-[#111]"
                >
                  <it.icon className="text-[#d4af37]" size={18} />
                  <span className="text-white font-bold uppercase tracking-widest text-xs">
                    {it.label}
                  </span>
                </button>
              ))}
              {commandItems.length === 0 && (
                <div className="p-6 text-gray-500 uppercase tracking-widest text-xs">
                  Няма резултати.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-72 bg-[#0a0a0a] border-r border-[#1a1a1a] hidden md:flex flex-col relative z-20">
        <div className="p-8 border-b border-[#1a1a1a] flex items-center gap-3">
          <ShieldAlert className="text-[#d4af37] w-8 h-8" />
          <span className="text-2xl font-bold text-white uppercase tracking-widest">
            VAZOV OS
          </span>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Табло" },
            { id: "orders", icon: ShoppingCart, label: "Поръчки" },
            { id: "create-order", icon: PlusCircle, label: "Нова Поръчка" },
            { id: "arsenal", icon: Package, label: "Арсенал" },
            { id: "services", icon: Wrench, label: "Сервиз & Услуги" },
            { id: "gallery", icon: ImagePlus, label: "Галерия" },
            { id: "settings", icon: Settings, label: "CMS" },
            { id: "users", icon: Users, label: "Потребители" },
            { id: "audit", icon: ClipboardList, label: "Audit Log" },
          ].map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300",
                activeTab === tab.id
                  ? "bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)] translate-x-1"
                  : "text-gray-500 hover:bg-[#111] hover:text-white"
              )}
            >
              <tab.icon size={20} /> {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-[#1a1a1a] space-y-3">
          <Button
            onClick={() => setCommandOpen(true)}
            variant="outline"
            className="w-full justify-start border-[#333] text-gray-300 hover:text-[#d4af37]"
          >
            <Command className="mr-3" size={18} /> Command (Ctrl+K)
          </Button>

          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-gray-500 hover:text-red-500 hover:bg-red-950/30 uppercase tracking-widest"
          >
            <LogOut className="mr-3" size={18} /> Изход
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-[#d4af37] to-yellow-300" />

        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white uppercase">
              {activeTab.replace("-", " ")}
            </h2>
            <p className="text-gray-500 text-xs uppercase tracking-widest mt-2">
              Realtime active • Audit enabled • Users via Edge Function
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "orders" && (
              <Button
                variant="outline"
                className="border-[#333] text-gray-300"
                onClick={exportOrdersCSV}
              >
                <Download size={18} className="mr-2" /> CSV
              </Button>
            )}

            <Button
              onClick={fetchData}
              variant="outline"
              className={cn("border-[#333] text-gray-300", isRefreshing && "animate-pulse")}
            >
              <RefreshCw size={18} className={cn(isRefreshing && "animate-spin")} />
            </Button>

            <Button
              onClick={() => setCommandOpen(true)}
              className="bg-[#d4af37] text-black font-bold hover:bg-amber-400"
            >
              <Command size={18} className="mr-2" /> Ctrl+K
            </Button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  label="Чакащи"
                  count={orders.filter((o) => o.status === "pending").length}
                  icon={Clock}
                  accent="border-amber-500"
                />
                <StatCard
                  label="В сервиза"
                  count={orders.filter((o) => o.status === "in-progress").length}
                  icon={Wrench}
                  accent="border-blue-500"
                />
                <StatCard
                  label="Готови"
                  count={orders.filter((o) => o.status === "completed").length}
                  icon={CheckCircle2}
                  accent="border-green-500"
                />
                <StatCard
                  label="Отказани"
                  count={orders.filter((o) => o.status === "cancelled").length}
                  icon={XCircle}
                  accent="border-red-500"
                />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
                  <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                    <ClipboardList size={16} className="text-[#d4af37]" /> Последна активност
                  </h3>
                  <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-2">
                    {auditLogs.slice(0, 20).map((l) => (
                      <div
                        key={l.id}
                        className="bg-[#040404] border border-[#1a1a1a] rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <div className="text-white font-bold text-xs uppercase tracking-widest">
                              {l.action}
                            </div>
                            <div className="text-gray-500 text-xs mt-1">
                              {l.actor_email || "unknown"} • {l.entity}
                              {l.entity_id ? `:${l.entity_id}` : ""}
                            </div>
                          </div>
                          <div className="text-gray-500 text-[11px] font-mono">
                            {new Date(l.created_at).toLocaleString("bg-BG")}
                          </div>
                        </div>
                      </div>
                    ))}
                    {auditLogs.length === 0 && (
                      <div className="text-gray-500 uppercase tracking-widest text-xs">
                        Няма логове.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
                  <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                    <Eye size={16} className="text-[#d4af37]" /> Quick View: последни поръчки
                  </h3>
                  <div className="space-y-3">
                    {orders.slice(0, 6).map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          setActiveTab("orders");
                          setSelectedOrder(o);
                        }}
                        className="w-full text-left bg-[#040404] border border-[#1a1a1a] rounded-lg p-4 hover:bg-[#111]"
                      >
                        <div className="flex justify-between">
                          <div className="text-white font-bold">
                            {o.order_number || "#N/A"} • {o.name}
                          </div>
                          <div className="text-[#d4af37] font-mono">
                            {o.total_price || "-"}
                          </div>
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          {new Date(o.created_at).toLocaleString("bg-BG")} • {o.status}
                        </div>
                      </button>
                    ))}
                    {orders.length === 0 && (
                      <div className="text-gray-500 uppercase tracking-widest text-xs">
                        Няма поръчки.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USERS */}
          {activeTab === "users" && (
            <div className="space-y-8">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
                  <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                    <Users size={16} className="text-[#d4af37]" /> Покани / Създай служител
                  </h3>

                  <div className="space-y-5">
                    <div className="bg-[#040404] border border-[#1a1a1a] rounded-lg p-4">
                      <div className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">
                        Invite user (email)
                      </div>
                      <input
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="email@domain.com"
                        className="w-full bg-black/30 border border-[#333] rounded-lg px-4 py-3 text-white outline-none focus:border-[#d4af37]"
                      />
                      <Button
                        onClick={inviteUser}
                        disabled={usersLoading}
                        className="w-full mt-3 bg-[#d4af37] text-black font-bold hover:bg-amber-400"
                      >
                        Изпрати покана
                      </Button>
                    </div>

                    <div className="bg-[#040404] border border-[#1a1a1a] rounded-lg p-4">
                      <div className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">
                        Create user (email+password)
                      </div>
                      <input
                        value={createEmail}
                        onChange={(e) => setCreateEmail(e.target.value)}
                        placeholder="email@domain.com"
                        className="w-full bg-black/30 border border-[#333] rounded-lg px-4 py-3 text-white outline-none focus:border-[#d4af37] mb-2"
                      />
                      <input
                        value={createPassword}
                        onChange={(e) => setCreatePassword(e.target.value)}
                        placeholder="парола (8+)"
                        type="password"
                        className="w-full bg-black/30 border border-[#333] rounded-lg px-4 py-3 text-white outline-none focus:border-[#d4af37]"
                      />
                      <Button
                        onClick={createUser}
                        disabled={usersLoading}
                        className="w-full mt-3 bg-[#111] text-[#d4af37] border border-[#d4af37]/30 font-bold hover:bg-black"
                      >
                        Създай user
                      </Button>
                    </div>

                    <div className="text-gray-600 text-[11px] uppercase tracking-widest">
                      ⚠️ Roles се записват в <span className="text-gray-400">public.user_roles</span>.
                      <br />
                      User management е през Edge Function (service role).
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                    <h3 className="text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                      <Users size={16} className="text-[#d4af37]" /> Потребители
                    </h3>
                    <div className="flex items-center gap-2">
                      <input
                        value={usersSearch}
                        onChange={(e) => setUsersSearch(e.target.value)}
                        placeholder="Търси по email..."
                        className="bg-[#040404] border border-[#1a1a1a] rounded-lg px-4 py-2 text-white outline-none focus:border-[#d4af37]"
                      />
                      <Button
                        variant="outline"
                        className="border-[#333] text-gray-300"
                        onClick={fetchUsers}
                      >
                        <RefreshCw size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                      <thead>
                        <tr className="bg-[#040404] text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-[#1a1a1a]">
                          <th className="p-4">Email</th>
                          <th className="p-4">Role</th>
                          <th className="p-4">Created</th>
                          <th className="p-4">Last Sign In</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(usersSearch
                          ? users.filter((u) =>
                              (u.email ?? "")
                                .toLowerCase()
                                .includes(usersSearch.toLowerCase())
                            )
                          : users
                        ).map((u) => (
                          <tr key={u.id} className="border-b border-[#1a1a1a] hover:bg-[#111]">
                            <td className="p-4">
                              <div className="text-white font-bold">{u.email || "—"}</div>
                              <div className="text-gray-500 text-xs font-mono">{u.id}</div>
                            </td>
                            <td className="p-4">
                              <select
                                value={u.roles?.[0] ?? "user"}
                                onChange={(e) => setRole(u.id, e.target.value)}
                                className="px-3 py-2 rounded-lg font-bold uppercase text-[10px] tracking-widest cursor-pointer outline-none border border-[#333] bg-[#040404] text-white focus:border-[#d4af37]"
                              >
                                {roleOptions.map((r) => (
                                  <option key={r} value={r}>
                                    {r}
                                  </option>
                                ))}
                              </select>
                              <div className="text-gray-500 text-[10px] mt-2 uppercase tracking-widest">
                                {u.confirmed_at ? "confirmed" : "unconfirmed"}
                              </div>
                            </td>
                            <td className="p-4 text-gray-400 text-xs font-mono">
                              {u.created_at ? new Date(u.created_at).toLocaleString("bg-BG") : "—"}
                            </td>
                            <td className="p-4 text-gray-400 text-xs font-mono">
                              {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("bg-BG") : "—"}
                            </td>
                            <td className="p-4 text-center">
                              <Button
                                onClick={() => {
                                  navigator.clipboard.writeText(u.id);
                                  toast.success("User ID копиран ✅");
                                }}
                                variant="outline"
                                className="border-[#333] text-gray-300 mr-2"
                              >
                                Copy ID
                              </Button>
                              <Button
                                onClick={() => deleteUser(u.id)}
                                variant="outline"
                                className="border-red-900/30 text-red-500 hover:bg-red-600 hover:text-white"
                                disabled={usersLoading}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {usersLoading && (
                      <div className="p-6 text-gray-500 uppercase tracking-widest text-xs">
                        Зареждане...
                      </div>
                    )}
                    {!usersLoading && users.length === 0 && (
                      <div className="p-6 text-gray-500 uppercase tracking-widest text-xs">
                        Няма users или Edge Function не връща данни.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AUDIT */}
          {activeTab === "audit" && (
            <div className="space-y-6">
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                    <ClipboardList size={16} className="text-[#d4af37]" /> Audit Log
                  </h3>
                  <Button
                    variant="outline"
                    className="border-[#333] text-gray-300"
                    onClick={fetchAudit}
                  >
                    <RefreshCw size={16} />
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[900px]">
                    <thead>
                      <tr className="bg-[#040404] text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-[#1a1a1a]">
                        <th className="p-4">Time</th>
                        <th className="p-4">Actor</th>
                        <th className="p-4">Action</th>
                        <th className="p-4">Entity</th>
                        <th className="p-4">Meta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((l) => (
                        <tr key={l.id} className="border-b border-[#1a1a1a] hover:bg-[#111]">
                          <td className="p-4 text-gray-400 text-xs font-mono">
                            {new Date(l.created_at).toLocaleString("bg-BG")}
                          </td>
                          <td className="p-4 text-gray-300 text-xs">
                            <div className="font-bold">{l.actor_email || "—"}</div>
                            <div className="text-gray-500 font-mono">{l.actor_user_id || ""}</div>
                          </td>
                          <td className="p-4 text-white text-xs font-bold uppercase tracking-widest">
                            {l.action}
                          </td>
                          <td className="p-4 text-gray-300 text-xs font-mono">
                            {l.entity}
                            {l.entity_id ? `:${l.entity_id}` : ""}
                          </td>
                          <td className="p-4 text-gray-400 text-xs font-mono max-w-[420px] overflow-hidden text-ellipsis">
                            {JSON.stringify(l.meta ?? {})}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {auditLogs.length === 0 && (
                    <div className="p-6 text-gray-500 uppercase tracking-widest text-xs">
                      Няма логове.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-8">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Търси по име, телефон, имейл или номер (VZ-123)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] py-4 pl-12 pr-4 text-white rounded-xl focus:border-[#d4af37] outline-none transition-colors"
                />
              </div>

              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[1000px]">
                    <thead>
                      <tr className="bg-[#040404] text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-[#1a1a1a]">
                        <th className="p-5">Номер</th>
                        <th className="p-5">Дата</th>
                        <th className="p-5">Клиент</th>
                        <th className="p-5">Стойност</th>
                        <th className="p-5 text-center">Статус</th>
                        <th className="p-5 text-center">Действие</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-[#1a1a1a] hover:bg-[#111] transition-colors"
                        >
                          <td className="p-5 text-[#d4af37] font-mono font-bold">
                            {order.order_number || "#N/A"}
                          </td>
                          <td className="p-5 text-gray-500 text-xs font-mono">
                            {new Date(order.created_at).toLocaleDateString("bg-BG")}
                          </td>
                          <td className="p-5 text-white font-bold">
                            {order.name}
                            {order.is_manual && (
                              <span className="ml-2 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 text-[9px] px-2 py-1 rounded uppercase tracking-wider">
                                Ръчна
                              </span>
                            )}
                            <div className="text-gray-500 text-xs font-normal mt-1">{order.phone}</div>
                          </td>
                          <td className="p-5 text-gray-300 font-bold">{order.total_price || "-"}</td>
                          <td className="p-5 flex justify-center">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(
                                  order.id,
                                  e.target.value,
                                  order.email,
                                  order.order_number,
                                  order.name,
                                  order.details,
                                  order.total_price
                                )
                              }
                              className="px-4 py-2 rounded-lg font-bold uppercase text-[10px] tracking-widest cursor-pointer outline-none border border-[#333] bg-[#040404] text-white focus:border-[#d4af37] transition-colors"
                            >
                              <option value="pending">⏳ ЧАКАЩО</option>
                              <option value="in-progress">🔧 В СЕРВИЗА</option>
                              <option value="completed">✅ ГОТОВО</option>
                              <option value="cancelled">❌ ОТКАЗАНО</option>
                            </select>
                          </td>
                          <td className="p-5 text-center">
                            <Button
                              onClick={() => setSelectedOrder(order)}
                              variant="outline"
                              className="border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37] hover:text-black uppercase text-[10px] tracking-widest"
                            >
                              <Eye size={14} className="mr-2" /> Детайли
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredOrders.length === 0 && (
                    <div className="p-8 text-center text-gray-500 uppercase tracking-widest text-xs">
                      Не са намерени поръчки.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CREATE ORDER */}
          {activeTab === "create-order" && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <p className="text-gray-500 text-sm uppercase tracking-widest">
                  Създаване на ръчна заявка в системата
                </p>
                <Button
                  onClick={() => setNewOrder(initialOrderState)}
                  variant="outline"
                  className="border-red-900/50 text-red-500 hover:bg-red-900/20 uppercase text-xs tracking-widest"
                >
                  Изчисти формата
                </Button>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-xl shadow-lg">
                    <h3 className="text-white font-bold uppercase mb-6 flex items-center gap-3 text-lg">
                      <User className="text-[#d4af37]" /> Данни за Клиента
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                          Име и Фамилия
                        </label>
                        <input
                          value={newOrder.name}
                          onChange={(e) =>
                            setNewOrder({ ...newOrder, name: e.target.value })
                          }
                          className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-[#d4af37] outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                          Телефон *
                        </label>
                        <input
                          value={newOrder.phone}
                          onChange={(e) =>
                            setNewOrder({ ...newOrder, phone: e.target.value })
                          }
                          className={cn(
                            "w-full bg-[#040404] border p-4 text-white rounded-lg outline-none transition-colors",
                            newOrder.phone && !validatePhone(newOrder.phone)
                              ? "border-red-500"
                              : "border-[#1a1a1a] focus:border-[#d4af37]"
                          )}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                          Имейл
                        </label>
                        <input
                          value={newOrder.email}
                          onChange={(e) =>
                            setNewOrder({ ...newOrder, email: e.target.value })
                          }
                          className={cn(
                            "w-full bg-[#040404] border p-4 text-white rounded-lg outline-none transition-colors",
                            newOrder.email && !validateEmail(newOrder.email)
                              ? "border-red-500"
                              : "border-[#1a1a1a] focus:border-[#d4af37]"
                          )}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                          Град / Адрес
                        </label>
                        <input
                          value={newOrder.address}
                          onChange={(e) =>
                            setNewOrder({ ...newOrder, address: e.target.value })
                          }
                          className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-[#d4af37] outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-xl shadow-lg">
                    <h3 className="text-white font-bold uppercase mb-6 flex items-center gap-3 text-lg">
                      <Package className="text-[#d4af37]" /> Избор на Продукти
                    </h3>

                    {newOrder.items.length > 0 && (
                      <div className="space-y-3 mb-8 bg-[#040404] p-4 rounded-lg border border-[#1a1a1a]">
                        {newOrder.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#0a0a0a] p-4 rounded-md border border-[#222]"
                          >
                            <span className="font-bold text-white uppercase text-sm">
                              {item.title}
                            </span>
                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-3 bg-[#040404] px-3 py-1 rounded-md border border-[#333]">
                                <button
                                  onClick={() =>
                                    setNewOrder({
                                      ...newOrder,
                                      items: newOrder.items.map((i) =>
                                        i.id === item.id
                                          ? { ...i, qty: Math.max(1, i.qty - 1) }
                                          : i
                                      ),
                                    })
                                  }
                                  className="text-gray-400 hover:text-white"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="text-white font-bold w-4 text-center">
                                  {item.qty}
                                </span>
                                <button
                                  onClick={() =>
                                    setNewOrder({
                                      ...newOrder,
                                      items: newOrder.items.map((i) =>
                                        i.id === item.id ? { ...i, qty: i.qty + 1 } : i
                                      ),
                                    })
                                  }
                                  className="text-gray-400 hover:text-white"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  value={item.overridePrice}
                                  onChange={(e) =>
                                    setNewOrder({
                                      ...newOrder,
                                      items: newOrder.items.map((i) =>
                                        i.id === item.id
                                          ? { ...i, overridePrice: e.target.value }
                                          : i
                                      ),
                                    })
                                  }
                                  className="w-20 bg-[#040404] border border-[#333] text-center text-white font-mono rounded-md p-2 focus:border-[#d4af37] outline-none"
                                />
                                <span className="text-[#d4af37] font-bold">€</span>
                              </div>
                              <button
                                onClick={() =>
                                  setNewOrder({
                                    ...newOrder,
                                    items: newOrder.items.filter((i) => i.id !== item.id),
                                  })
                                }
                                className="text-red-500 hover:text-red-400 p-2"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">
                      Налични в Арсенала
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {arsenalItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => addToOrder(item)}
                          className="flex items-center justify-between p-3 border border-[#1a1a1a] bg-[#040404] rounded-lg text-left hover:border-[#d4af37] group transition-all"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <img
                              src={item.image_url}
                              className="w-10 h-10 object-cover rounded-md opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="truncate pr-2">
                              <p className="text-white text-xs font-bold uppercase truncate group-hover:text-[#d4af37] transition-colors">
                                {item.title}
                              </p>
                              <p className="text-gray-500 text-[10px] mt-1">{item.price}</p>
                            </div>
                          </div>
                          <PlusCircle
                            size={18}
                            className="text-gray-600 group-hover:text-[#d4af37] flex-shrink-0"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-xl shadow-lg">
                    <h3 className="text-white font-bold uppercase mb-6 flex items-center gap-3 text-lg">
                      <Truck className="text-[#d4af37]" /> Доставка & Статус
                    </h3>
                    <div className="space-y-5">
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                          Метод на доставка
                        </label>
                        <select
                          value={newOrder.shipping}
                          onChange={(e) =>
                            setNewOrder({ ...newOrder, shipping: e.target.value })
                          }
                          className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-[#d4af37] outline-none appearance-none"
                        >
                          <option>Еконт Експрес</option>
                          <option>Спиди</option>
                          <option>Взимане от сервиза</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                          Плащане
                        </label>
                        <select
                          value={newOrder.payment}
                          onChange={(e) =>
                            setNewOrder({ ...newOrder, payment: e.target.value })
                          }
                          className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-[#d4af37] outline-none appearance-none"
                        >
                          <option>Наложен платеж</option>
                          <option>По банков път</option>
                          <option>В брой (на място)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                          Статус
                        </label>
                        <select
                          value={newOrder.status}
                          onChange={(e) =>
                            setNewOrder({ ...newOrder, status: e.target.value })
                          }
                          className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-[#d4af37] outline-none appearance-none"
                        >
                          <option value="pending">Чакащо</option>
                          <option value="in-progress">В сервиза</option>
                          <option value="completed">Готово</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#d4af37] to-amber-600 p-8 rounded-xl text-black shadow-[0_10px_30px_rgba(212,175,55,0.2)]">
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">
                      Обща Сума
                    </h3>
                    <p className="text-5xl font-bold mb-8">
                      {newOrderTotal.toFixed(2)} €
                    </p>
                    <Button
                      onClick={submitNewOrder}
                      className="w-full bg-black text-[#d4af37] hover:bg-[#111] py-6 text-lg font-bold uppercase tracking-widest shadow-xl border border-transparent hover:border-[#d4af37] transition-all"
                    >
                      Създай Поръчка
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SERVICES */}
          {activeTab === "services" && (
            <div className="space-y-8">
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-xl shadow-lg mb-8">
                <h2 className="text-xl font-bold text-white uppercase mb-4 flex items-center gap-3">
                  <ImagePlus className="text-[#d4af37]" /> Главна снимка на секцията (Вляво)
                </h2>
                <form
                  onSubmit={handleUploadServiceMainImage}
                  className="flex flex-col sm:flex-row gap-4 items-center"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setServiceMainImageFile(f);
                      if (serviceMainPreviewUrl) URL.revokeObjectURL(serviceMainPreviewUrl);
                      setServiceMainPreviewUrl(f ? URL.createObjectURL(f) : "");
                    }}
                    className="flex-1 bg-[#040404] border border-[#1a1a1a] p-3 text-white text-sm rounded-lg file:bg-[#d4af37] file:text-black file:border-0 file:rounded file:px-4 file:py-1 file:mr-4 file:font-bold file:cursor-pointer cursor-pointer"
                  />
                  <Button
                    type="submit"
                    disabled={isUploading || !serviceMainImageFile}
                    className="bg-[#d4af37] text-black font-bold uppercase py-6 px-8 hover:bg-amber-500"
                  >
                    {isUploading ? "Качване..." : "Обнови Снимката"}
                  </Button>
                </form>
                {(serviceMainPreviewUrl || serviceMainImgUrl) && (
                  <img
                    src={serviceMainPreviewUrl || serviceMainImgUrl}
                    className="mt-6 h-48 w-full md:w-1/3 object-cover rounded-lg border border-[#333]"
                  />
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-xl h-fit sticky top-6 shadow-lg">
                  <h2 className="text-xl font-bold text-white uppercase mb-8 flex items-center justify-between">
                    {editServiceId ? (
                      <span className="flex items-center gap-3">
                        <Pencil className="text-[#d4af37]" /> Редакция
                      </span>
                    ) : (
                      <span className="flex items-center gap-3">
                        <Upload className="text-[#d4af37]" /> Нова Услуга
                      </span>
                    )}
                    {editServiceId && (
                      <button
                        onClick={cancelEditService}
                        className="text-gray-500 hover:text-white"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </h2>
                  <form onSubmit={handleSaveService} className="space-y-5">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                        Заглавие
                      </label>
                      <input
                        required
                        value={serviceTitle}
                        onChange={(e) => setServiceTitle(e.target.value)}
                        className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-[#d4af37] outline-none"
                        placeholder="напр. ПЪЛНА ПРОФИЛАКТИКА"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                        Описание
                      </label>
                      <textarea
                        rows={5}
                        value={serviceDesc}
                        onChange={(e) => setServiceDesc(e.target.value)}
                        className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-[#d4af37] outline-none resize-none"
                        placeholder="Кратко обяснение..."
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        disabled={isUploading}
                        className="flex-1 bg-[#d4af37] text-black font-bold uppercase py-6 hover:bg-amber-500"
                      >
                        {isUploading ? "Запис..." : editServiceId ? "Обнови" : "Добави"}
                      </Button>
                      {editServiceId && (
                        <Button
                          type="button"
                          onClick={cancelEditService}
                          variant="outline"
                          className="border-[#333] py-6 text-gray-400 hover:bg-[#111]"
                        >
                          Отказ
                        </Button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="md:col-span-2 space-y-4">
                  {servicesItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "bg-[#0a0a0a] border p-6 rounded-xl flex items-start gap-4 transition-all duration-300",
                        editServiceId === item.id
                          ? "border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                          : "border-[#1a1a1a] hover:border-[#333]"
                      )}
                    >
                      <Crosshair className="text-[#d4af37] mt-1 flex-shrink-0" size={24} />
                      <div className="flex-1">
                        <h3 className="font-bold text-white uppercase tracking-wider mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-500 text-sm">{item.description}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => startEditService(item)}
                          variant="outline"
                          className="border-[#333] text-gray-300 hover:text-[#d4af37] hover:border-[#d4af37]"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          onClick={() => handleDeleteService(item.id)}
                          variant="outline"
                          className="border-red-900/30 text-red-500 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {servicesItems.length === 0 && (
                    <p className="text-gray-500 uppercase tracking-widest text-xs p-8 text-center border border-[#1a1a1a] rounded-xl border-dashed">
                      Няма добавени услуги.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* GALLERY */}
          {activeTab === "gallery" && (
            <div className="space-y-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-xl h-fit sticky top-6 shadow-lg">
                  <h2 className="text-xl font-bold text-white uppercase mb-8 flex items-center justify-between">
                    {editGalleryId ? (
                      <span className="flex items-center gap-3">
                        <Pencil className="text-[#d4af37]" /> Редакция
                      </span>
                    ) : (
                      <span className="flex items-center gap-3">
                        <Upload className="text-[#d4af37]" /> Качи Снимка
                      </span>
                    )}
                    {editGalleryId && (
                      <button
                        onClick={cancelEditGallery}
                        className="text-gray-500 hover:text-white"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </h2>
                  <form onSubmit={handleSaveGallery} className="space-y-5">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                        Заглавие
                      </label>
                      <input
                        value={galleryTitle}
                        onChange={(e) => setGalleryTitle(e.target.value)}
                        className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-[#d4af37] outline-none"
                        placeholder="напр. Airsoft Action"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                        Снимка
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setGalleryImageFile(e.target.files ? e.target.files[0] : null)
                        }
                        className="w-full bg-[#040404] border border-[#1a1a1a] p-3 text-white text-sm rounded-lg file:bg-[#d4af37] file:text-black file:border-0 file:rounded file:px-4 file:py-1 file:mr-4 file:font-bold file:cursor-pointer cursor-pointer"
                      />
                      {editGalleryId && !galleryImageFile && currentGalleryImageUrl && (
                        <img
                          src={currentGalleryImageUrl}
                          className="mt-4 h-32 w-full object-cover rounded-lg opacity-80 border border-[#333]"
                        />
                      )}
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        disabled={isUploading}
                        className="flex-1 bg-[#d4af37] text-black font-bold uppercase py-6 hover:bg-amber-500"
                      >
                        {isUploading ? "Качване..." : editGalleryId ? "Обнови" : "Качи"}
                      </Button>
                      {editGalleryId && (
                        <Button
                          type="button"
                          onClick={cancelEditGallery}
                          variant="outline"
                          className="border-[#333] py-6 text-gray-400 hover:bg-[#111]"
                        >
                          Отказ
                        </Button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                  {galleryItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "relative bg-[#0a0a0a] border rounded-xl overflow-hidden group transition-all duration-300",
                        editGalleryId === item.id
                          ? "border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                          : "border-[#1a1a1a] hover:border-[#333]"
                      )}
                    >
                      <div className="h-64 w-full">
                        <img
                          src={item.image_url}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <h3 className="text-white font-bold uppercase text-sm mb-4">
                          {item.title || "Без заглавие"}
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => startEditGallery(item)}
                            variant="outline"
                            className="flex-1 border-[#333] bg-black/50 text-gray-300 hover:text-[#d4af37] hover:border-[#d4af37] text-xs"
                          >
                            <Pencil size={14} className="mr-2" /> Редакция
                          </Button>
                          <Button
                            onClick={() => handleDeleteGallery(item.id)}
                            variant="outline"
                            className="border-red-900/50 bg-black/50 text-red-500 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {galleryItems.length === 0 && (
                    <p className="col-span-2 text-gray-500 uppercase tracking-widest text-xs p-8 text-center border border-[#1a1a1a] rounded-xl border-dashed">
                      Няма качени снимки.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-8">
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-8 max-w-3xl shadow-lg">
                <p className="text-gray-500 text-sm mb-8 uppercase tracking-widest border-b border-[#1a1a1a] pb-6">
                  Редактирай текстовете на публичния сайт в реално време.
                </p>

                <div className="space-y-8">
                  {settings.map((setting) => (
                    <div key={setting.key}>
                      <label className="text-[10px] text-[#d4af37] uppercase font-bold tracking-widest mb-3 block flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />{" "}
                        {setting.description}
                      </label>
                      {String(setting.value).length > 50 ? (
                        <textarea
                          value={setting.value}
                          onChange={(e) =>
                            setSettings(
                              settings.map((s) =>
                                s.key === setting.key
                                  ? { ...s, value: e.target.value }
                                  : s
                              )
                            )
                          }
                          rows={3}
                          className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-[#d4af37] outline-none resize-none transition-colors"
                        />
                      ) : (
                        <input
                          value={setting.value}
                          onChange={(e) =>
                            setSettings(
                              settings.map((s) =>
                                s.key === setting.key
                                  ? { ...s, value: e.target.value }
                                  : s
                              )
                            )
                          }
                          className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-[#d4af37] outline-none transition-colors"
                        />
                      )}
                    </div>
                  ))}

                  <Button
                    onClick={saveSettings}
                    className="w-full bg-[#d4af37] text-black font-bold uppercase tracking-widest py-8 hover:bg-amber-500 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all"
                  >
                    <Save className="mr-3" size={24} /> Запази промените
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ARSENAL */}
          {activeTab === "arsenal" && (
            <div className="space-y-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-xl h-fit sticky top-6 shadow-lg">
                  <h2 className="text-xl font-bold text-white uppercase mb-8 flex items-center justify-between">
                    {editId ? (
                      <span className="flex items-center gap-3">
                        <Pencil className="text-[#d4af37]" /> Редакция
                      </span>
                    ) : (
                      <span className="flex items-center gap-3">
                        <Upload className="text-[#d4af37]" /> Нов Артикул
                      </span>
                    )}
                    {editId && (
                      <button
                        onClick={cancelEdit}
                        className="text-gray-500 hover:text-white"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </h2>
                  <form onSubmit={handleSaveArsenal} className="space-y-5">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                        Име/Модел
                      </label>
                      <input
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-[#d4af37] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                        Цена (€)
                      </label>
                      <input
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-[#d4af37] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                        Снимка
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setImageFile(e.target.files ? e.target.files[0] : null)
                        }
                        className="w-full bg-[#040404] border border-[#1a1a1a] p-3 text-white text-sm rounded-lg file:bg-[#d4af37] file:text-black file:border-0 file:rounded file:px-4 file:py-1 file:mr-4 file:font-bold file:cursor-pointer cursor-pointer"
                      />
                      {editId && !imageFile && currentImageUrl && (
                        <img
                          src={currentImageUrl}
                          className="mt-4 h-24 w-full object-cover rounded-lg opacity-60 border border-[#333]"
                        />
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                        Описание
                      </label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-[#d4af37] outline-none resize-none"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        disabled={isUploading}
                        className="flex-1 bg-[#d4af37] text-black font-bold uppercase py-6 hover:bg-amber-500"
                      >
                        {isUploading ? "Запис..." : editId ? "Обнови" : "Качи"}
                      </Button>
                      {editId && (
                        <Button
                          type="button"
                          onClick={cancelEdit}
                          variant="outline"
                          className="border-[#333] py-6 text-gray-400 hover:bg-[#111]"
                        >
                          Отказ
                        </Button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
                  {arsenalItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "bg-[#0a0a0a] border rounded-xl overflow-hidden flex flex-col group transition-all duration-300",
                        editId === item.id
                          ? "border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                          : "border-[#1a1a1a] hover:border-[#333]"
                      )}
                    >
                      <div className="h-56 overflow-hidden relative">
                        <img
                          src={item.image_url}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-white uppercase tracking-wider">
                            {item.title}
                          </h3>
                          <span className="text-[#d4af37] font-bold bg-[#111] px-2 py-1 rounded text-sm">
                            {item.price}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs line-clamp-2 mb-6 flex-1">
                          {item.description}
                        </p>
                        <div className="flex gap-2 mt-auto">
                          <Button
                            onClick={() => startEdit(item)}
                            variant="outline"
                            className="flex-1 border-[#333] text-gray-300 hover:text-[#d4af37] hover:border-[#d4af37] uppercase text-[10px] tracking-widest"
                          >
                            <Pencil size={14} className="mr-2" /> Редакция
                          </Button>
                          <Button
                            onClick={() => handleDeleteArsenal(item.id)}
                            variant="outline"
                            className="border-red-900/30 text-red-500 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {arsenalItems.length === 0 && (
                    <p className="text-gray-500 uppercase tracking-widest text-xs p-8 text-center border border-[#1a1a1a] rounded-xl border-dashed">
                      Няма артикули.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-[#0a0a0a] border border-[#d4af37]/30 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-[0_0_50px_rgba(212,175,55,0.1)] relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white bg-[#111] p-2 rounded-full"
            >
              <X size={24} />
            </button>
            <div className="p-8 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-3 mb-2">
                <Hash className="text-[#d4af37]" />
                <h2 className="text-3xl font-bold text-white tracking-widest">
                  {selectedOrder.order_number || "НЯМА НОМЕР"}
                </h2>
              </div>
              <p className="text-gray-500 text-xs uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} />{" "}
                {new Date(selectedOrder.created_at).toLocaleString("bg-BG")}
              </p>
              {selectedOrder.is_manual && (
                <span className="inline-block mt-3 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 text-[10px] px-3 py-1 rounded uppercase tracking-wider font-bold">
                  Ръчно Създадена
                </span>
              )}
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[#1a1a1a] pb-2">
                    <User size={14} className="text-[#d4af37]" /> Клиент
                  </h3>
                  <p className="text-white font-bold text-lg mb-1">{selectedOrder.name}</p>
                  <p className="text-gray-400 font-mono text-sm flex items-center gap-2 mt-2">
                    <Phone size={14} /> {selectedOrder.phone}
                  </p>
                  {selectedOrder.email && (
                    <p className="text-gray-400 font-mono text-sm flex items-center gap-2 mt-2">
                      <Mail size={14} /> {selectedOrder.email}
                    </p>
                  )}
                  <p className="text-gray-400 text-sm flex items-start gap-2 mt-2">
                    <MapPin size={14} className="mt-1 flex-shrink-0" />{" "}
                    {selectedOrder.address || "Няма адрес"}
                  </p>
                </div>
                <div>
                  <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[#1a1a1a] pb-2">
                    <Settings size={14} className="text-[#d4af37]" /> Данни
                  </h3>
                  <p className="text-gray-300 text-sm mb-2">
                    <span className="text-gray-600">Категория:</span>{" "}
                    {selectedOrder.category}
                  </p>
                  <div className="mt-4">
                    <label className="text-[10px] text-gray-500 uppercase block mb-2">
                      Промени Статус (Праща Имейл)
                    </label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) =>
                        updateOrderStatus(
                          selectedOrder.id,
                          e.target.value,
                          selectedOrder.email,
                          selectedOrder.order_number,
                          selectedOrder.name,
                          selectedOrder.details,
                          selectedOrder.total_price
                        )
                      }
                      className="w-full px-4 py-3 rounded-lg font-bold uppercase text-[10px] tracking-widest cursor-pointer outline-none border border-[#333] bg-[#040404] text-white focus:border-[#d4af37]"
                    >
                      <option value="pending">⏳ ЧАКАЩО</option>
                      <option value="in-progress">🔧 В СЕРВИЗА</option>
                      <option value="completed">✅ ГОТОВО</option>
                      <option value="cancelled">❌ ОТКАЗАНО</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[#1a1a1a] pb-2">
                  <Package size={14} className="text-[#d4af37]" /> Детайли
                </h3>
                <div className="bg-[#040404] p-4 rounded-lg border border-[#1a1a1a] whitespace-pre-line text-gray-300 text-sm leading-relaxed font-mono">
                  {selectedOrder.details}
                </div>
                {selectedOrder.total_price && (
                  <div className="mt-4 text-right">
                    <span className="text-gray-500 text-[10px] uppercase tracking-widest mr-4">
                      Обща Стойност:
                    </span>
                    <span className="text-3xl font-bold text-[#d4af37]">
                      {selectedOrder.total_price}
                    </span>
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