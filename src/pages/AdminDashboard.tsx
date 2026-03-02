import { useState, useEffect } from "react";
import { 
  Crosshair, ShieldAlert, LogOut, Lock, KeyRound, Package, ImagePlus, Trash2, Upload, Pencil, 
  X, LayoutDashboard, ShoppingCart, PlusCircle, Settings, User, MapPin, Truck, 
  Plus, Minus, Save, CheckCircle2, Clock, XCircle, Wrench, Search, RefreshCw, Eye, Phone, Mail, Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import emailjs from '@emailjs/browser';

// --- ВАЛИДАТОРИ И ГЕНЕРАТОРИ ---
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePhone = (phone: string) => /^[\d\s\+\-\(\)]{8,15}$/.test(phone);
const generateOrderNumber = () => `VZ-${Math.floor(100000 + Math.random() * 900000)}`;

const AdminDashboard = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'create-order' | 'arsenal' | 'services' | 'gallery' | 'settings'>('dashboard');

  const [orders, setOrders] = useState<any[]>([]);
  const [arsenalItems, setArsenalItems] = useState<any[]>([]);
  const [servicesItems, setServicesItems] = useState<any[]>([]);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);

  // Търсачка, Рефреш и Детайли
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Форма за Арсенал
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Форма за Сервиз (Услуги)
  const [editServiceId, setEditServiceId] = useState<string | null>(null);
  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");

  // Форма за Сервиз (ГЛАВНА СНИМКА)
  const [serviceMainImageFile, setServiceMainImageFile] = useState<File | null>(null);
  const serviceMainImgSetting = settings.find(s => s.key === 'services_main_image');
  const serviceMainImgUrl = serviceMainImgSetting ? serviceMainImgSetting.value : '';

  // Форма за Галерия
  const [editGalleryId, setEditGalleryId] = useState<string | null>(null);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryImageFile, setGalleryImageFile] = useState<File | null>(null);
  const [currentGalleryImageUrl, setCurrentGalleryImageUrl] = useState("");

  // Форма за Ръчна Поръчка
  const initialOrderState = {
    name: '', phone: '', email: '', address: '', 
    shipping: 'Еконт Експрес', payment: 'Наложен платеж',
    items: [] as any[], status: 'completed'
  };
  const [newOrder, setNewOrder] = useState(initialOrderState);

  const fetchData = async () => {
    setIsRefreshing(true);
    const [ordersRes, arsenalRes, settingsRes, servicesRes, galleryRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("arsenal").select("*").order("created_at", { ascending: false }),
      supabase.from("site_settings").select("*"),
      supabase.from("services").select("*").order("created_at", { ascending: false }),
      supabase.from("gallery").select("*").order("created_at", { ascending: false })
    ]);
    if (ordersRes.data) setOrders(ordersRes.data);
    if (arsenalRes.data) setArsenalItems(arsenalRes.data);
    if (settingsRes.data) setSettings(settingsRes.data);
    if (servicesRes.data) setServicesItems(servicesRes.data);
    if (galleryRes.data) setGalleryItems(galleryRes.data);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchData();
    }
  }, [isAuthorized]);

  // --- ИМЕЙЛ СИСТЕМА (.env защитена) ---
  const sendEmailNotification = (
    email: string, status: string, orderNum: string, name: string, 
    details: string = "-", totalPrice: string = "-", shipping: string = "-", payment: string = "-"
  ) => {
    const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID; 
    const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID; 
    const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const statusMap: any = { 
      'pending': 'ЧАКАЩА (ПРИЕТА)', 
      'in-progress': 'В СЕРВИЗА', 
      'completed': 'ГОТОВА / ЗАВЪРШЕНА', 
      'cancelled': 'ОТКАЗАНА' 
    };

    const templateParams = {
      user_name: name,             
      user_email: email,           
      order_number: orderNum,       
      status: statusMap[status] || status, 
      details: details,             
      total_price: totalPrice,      
      shipping_method: shipping,    
      payment_method: payment       
    };

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then(() => toast.success(`Имейлът е изпратен успешно до ${email}!`, { icon: '📧' }))
      .catch((err) => {
        console.error("Грешка при имейл:", err);
        toast.error("Имейлът не успя да тръгне.");
      });
  };

  const updateOrderStatus = async (id: string, newStatus: string, email: string, orderNum: string, orderName: string, details: string, totalPrice: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    if (!error) {
      toast.success("Статусът е обновен!");
      if (email) {
        sendEmailNotification(email, newStatus, orderNum || 'N/A', orderName, details, totalPrice, "Еконт", "Наложен платеж");
      }
      fetchData();
      if (selectedOrder && selectedOrder.id === id) setSelectedOrder({...selectedOrder, status: newStatus});
    } else {
      toast.error("Грешка при обновяване на статуса.");
    }
  };

  // --- ЛОГИКА АРСЕНАЛ ---
  const startEdit = (item: any) => {
    setEditId(item.id); setTitle(item.title); setDescription(item.description || "");
    setPrice(item.price || ""); setCurrentImageUrl(item.image_url); setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEdit = () => {
    setEditId(null); setTitle(""); setDescription(""); setPrice(""); setCurrentImageUrl(""); setImageFile(null);
  };
  const handleSaveArsenal = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPrice = price.includes('€') ? price : `${price} €`;
    setIsUploading(true);
    const toastId = toast.loading(editId ? "Обновяване..." : "Качване...");
    
    try {
      let finalImageUrl = currentImageUrl;
      if (imageFile) {
        const fileName = `${Math.random()}.${imageFile.name.split('.').pop()}`;
        await supabase.storage.from('arsenal').upload(fileName, imageFile);
        finalImageUrl = supabase.storage.from('arsenal').getPublicUrl(fileName).data.publicUrl;
      }
      
      if (editId) {
        await supabase.from('arsenal').update({ title, description, price: cleanPrice, image_url: finalImageUrl }).eq('id', editId);
      } else {
        await supabase.from('arsenal').insert([{ title, description, price: cleanPrice, image_url: finalImageUrl }]);
      }
      
      toast.success(editId ? "Успешно обновено!" : "Успешно добавено!", { id: toastId });
      cancelEdit(); fetchData();
    } catch (error: any) { toast.error("Грешка: " + error.message, { id: toastId }); } 
    finally { setIsUploading(false); }
  };
  const handleDeleteArsenal = async (id: string) => {
    if (!window.confirm("Изтриване на продукта?")) return;
    await supabase.from('arsenal').delete().eq('id', id);
    toast.success("Изтрито!"); fetchData();
  };

  // --- ЛОГИКА СЕРВИЗ И ГЛАВНА СНИМКА ---
  const handleUploadServiceMainImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceMainImageFile) return toast.error("Избери снимка първо!");
    setIsUploading(true);
    const toastId = toast.loading("Качване на главната снимка...");
    
    try {
      const fileName = `service_main_${Math.random()}.${serviceMainImageFile.name.split('.').pop()}`;
      await supabase.storage.from('gallery').upload(fileName, serviceMainImageFile);
      const finalImageUrl = supabase.storage.from('gallery').getPublicUrl(fileName).data.publicUrl;

      const { data: existingSetting } = await supabase.from('site_settings').select('key').eq('key', 'services_main_image').single();
      
      if (existingSetting) {
        await supabase.from('site_settings').update({ value: finalImageUrl }).eq('key', 'services_main_image');
      } else {
        await supabase.from('site_settings').insert([{ key: 'services_main_image', value: finalImageUrl, description: 'Главна снимка за секция Сервиз' }]);
      }

      toast.success("Главната снимка е обновена!", { id: toastId });
      setServiceMainImageFile(null);
      fetchData();
    } catch (error: any) {
      toast.error("Грешка: " + error.message, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const startEditService = (item: any) => {
    setEditServiceId(item.id); setServiceTitle(item.title); setServiceDesc(item.description || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEditService = () => {
    setEditServiceId(null); setServiceTitle(""); setServiceDesc("");
  };
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    const toastId = toast.loading(editServiceId ? "Обновяване..." : "Запазване...");
    try {
      if (editServiceId) {
        await supabase.from('services').update({ title: serviceTitle, description: serviceDesc }).eq('id', editServiceId);
      } else {
        await supabase.from('services').insert([{ title: serviceTitle, description: serviceDesc }]);
      }
      toast.success("Готово!", { id: toastId });
      cancelEditService(); fetchData();
    } catch (error: any) { toast.error("Грешка: " + error.message, { id: toastId }); }
    finally { setIsUploading(false); }
  };
  const handleDeleteService = async (id: string) => {
    if (!window.confirm("Изтриване на услугата?")) return;
    await supabase.from('services').delete().eq('id', id);
    toast.success("Изтрито!"); fetchData();
  };

  // --- ЛОГИКА ГАЛЕРИЯ ---
  const startEditGallery = (item: any) => {
    setEditGalleryId(item.id); setGalleryTitle(item.title || ""); 
    setCurrentGalleryImageUrl(item.image_url); setGalleryImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEditGallery = () => {
    setEditGalleryId(null); setGalleryTitle(""); setCurrentGalleryImageUrl(""); setGalleryImageFile(null);
  };
  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    const toastId = toast.loading(editGalleryId ? "Обновяване..." : "Качване на снимка...");
    
    try {
      let finalImageUrl = currentGalleryImageUrl;
      if (galleryImageFile) {
        const fileName = `${Math.random()}.${galleryImageFile.name.split('.').pop()}`;
        await supabase.storage.from('gallery').upload(fileName, galleryImageFile);
        finalImageUrl = supabase.storage.from('gallery').getPublicUrl(fileName).data.publicUrl;
      }
      
      if (editGalleryId) {
        await supabase.from('gallery').update({ title: galleryTitle, image_url: finalImageUrl }).eq('id', editGalleryId);
      } else {
        await supabase.from('gallery').insert([{ title: galleryTitle, image_url: finalImageUrl }]);
      }
      
      toast.success("Успешно добавено в галерията!", { id: toastId });
      cancelEditGallery(); fetchData();
    } catch (error: any) { toast.error("Грешка: " + error.message, { id: toastId }); } 
    finally { setIsUploading(false); }
  };
  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm("Изтриване на снимката от галерията?")) return;
    await supabase.from('gallery').delete().eq('id', id);
    toast.success("Снимката е изтрита!"); fetchData();
  };

  // --- ЛОГИКА РЪЧНА ПОРЪЧКА ---
  const addToOrder = (product: any) => {
    setNewOrder(prev => {
      const exists = prev.items.find(i => i.id === product.id);
      if (exists) return { ...prev, items: prev.items.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i) };
      const basePrice = product.price ? product.price.replace(/[^0-9.]/g, '') : "0";
      return { ...prev, items: [...prev.items, { ...product, qty: 1, overridePrice: basePrice }] };
    });
  };

  const newOrderTotal = newOrder.items.reduce((acc, item) => acc + (parseFloat(item.overridePrice) || 0) * item.qty, 0);

  const submitNewOrder = async () => {
    if (!newOrder.name || newOrder.items.length === 0) return toast.error("Добави клиент и продукти!");
    if (!validatePhone(newOrder.phone)) return toast.error("Невалиден телефонен номер!");
    if (newOrder.email && !validateEmail(newOrder.email)) return toast.error("Невалиден имейл адрес!");

    const toastId = toast.loading("Създаване...");
    const details = newOrder.items.map(i => `- ${i.qty}x ${i.title} (${i.overridePrice} €)`).join('\n');
    const orderNum = generateOrderNumber(); 
    const finalPrice = `${newOrderTotal.toFixed(2)} €`;
    
    const { error } = await supabase.from('orders').insert([{
      order_number: orderNum,
      name: newOrder.name, 
      phone: newOrder.phone, 
      email: newOrder.email,
      address: newOrder.address,
      total_price: finalPrice, 
      details: `Ръчна поръчка:\n${details}`, 
      status: newOrder.status, 
      is_manual: true,
      category: 'Ръчна заявка'
    }]);

    if (!error) { 
      toast.success(`Поръчката е създадена! Номер: ${orderNum}`, { id: toastId }); 
      if (newOrder.email) {
        sendEmailNotification(newOrder.email, newOrder.status, orderNum, newOrder.name, `Ръчна поръчка:\n${details}`, finalPrice, newOrder.shipping, newOrder.payment);
      }
      setNewOrder(initialOrderState);
      setActiveTab('orders'); 
      fetchData(); 
    } else {
      toast.error(`Базата блокира: ${error.message}`, { id: toastId, duration: 10000 });
    }
  };

  const saveSettings = async () => {
    const toastId = toast.loading("Запазване...");
    const { error } = await supabase.from('site_settings').upsert(settings);
    if (!error) toast.success("Сайтът е обновен!", { id: toastId });
    else toast.error("Грешка!", { id: toastId });
  };

  const filteredOrders = orders.filter(o => 
    (o.name && o.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (o.phone && o.phone.includes(searchQuery)) ||
    (o.order_number && o.order_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (o.email && o.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#040404] flex items-center justify-center p-6 relative">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-amber-500 via-gold to-yellow-300"></div>
        <div className="max-w-md w-full bg-[#0a0a0a] border border-[#1a1a1a] p-10 rounded-xl shadow-[0_0_50px_rgba(212,175,55,0.05)] text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-[#111] border border-[#333] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Lock className="text-gold" size={36} />
          </div>
          <h1 className="text-3xl font-display font-bold text-white uppercase mb-2 tracking-widest">VAZOV OS</h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest mb-8">Оторизиран достъп</p>
          <form onSubmit={(e) => { e.preventDefault(); password.toUpperCase() === "VAZOV" ? setIsAuthorized(true) : toast.error("Грешен код!"); setPassword(""); }} className="space-y-6">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#040404] border border-[#1a1a1a] py-4 text-center text-white focus:border-gold outline-none rounded-md tracking-[0.5em] font-mono text-2xl uppercase transition-all focus:shadow-[0_0_15px_rgba(212,175,55,0.2)]" placeholder="•••••" autoFocus />
            <Button type="submit" className="w-full bg-gold text-black font-bold uppercase py-6 text-lg hover:bg-amber-400 transition-all">Вход в Системата</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#040404] text-gray-300 overflow-hidden font-sans">
      <aside className="w-72 bg-[#0a0a0a] border-r border-[#1a1a1a] hidden md:flex flex-col relative z-20">
        <div className="p-8 border-b border-[#1a1a1a] flex items-center gap-3">
          <ShieldAlert className="text-gold w-8 h-8"/>
          <span className="text-2xl font-display font-bold text-white uppercase tracking-widest">VAZOV OS</span>
        </div>
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto custom-scrollbar">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Табло' },
            { id: 'orders', icon: ShoppingCart, label: 'Поръчки' },
            { id: 'create-order', icon: PlusCircle, label: 'Нова Поръчка' },
            { id: 'arsenal', icon: Package, label: 'Арсенал Склад' },
            { id: 'services', icon: Wrench, label: 'Сервиз & Услуги' },
            { id: 'gallery', icon: ImagePlus, label: 'Галерия' },
            { id: 'settings', icon: Settings, label: 'CMS Настройки' }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-4 p-4 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === tab.id ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.3)] translate-x-1' : 'text-gray-500 hover:bg-[#111] hover:text-white'}`}>
              <tab.icon size={20} /> {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-[#1a1a1a]">
          <Button onClick={() => setIsAuthorized(false)} variant="ghost" className="w-full justify-start text-gray-500 hover:text-red-500 hover:bg-red-950/30 uppercase tracking-widest"><LogOut className="mr-3" size={18} /> Изход</Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-12 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-gold to-yellow-300"></div>

        <div className="md:hidden flex overflow-x-auto pb-4 mb-6 border-b border-[#1a1a1a] gap-2 custom-scrollbar">
          {['dashboard', 'orders', 'create-order', 'arsenal', 'services', 'gallery', 'settings'].map((tab) => (
             <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-5 py-3 uppercase text-xs font-bold whitespace-nowrap rounded-md transition-all ${activeTab === tab ? 'bg-gold text-black' : 'bg-[#111] text-gray-400'}`}>{tab.replace('-', ' ')}</button>
          ))}
        </div>

        <div className="flex justify-between items-center mb-8">
           <h2 className="text-3xl md:text-4xl font-display font-bold text-white uppercase">{activeTab.replace('-', ' ')}</h2>
           <Button onClick={fetchData} variant="outline" className={`border-[#333] text-gray-400 hover:text-gold ${isRefreshing ? 'animate-spin text-gold' : ''}`}>
             <RefreshCw size={20} />
           </Button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* ТАБЛО */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Чакащи', count: orders.filter(o=>o.status==='pending').length, color: 'border-amber-500', icon: Clock, iconColor: 'text-amber-500' },
                  { label: 'В сервиза', count: orders.filter(o=>o.status==='in-progress').length, color: 'border-blue-500', icon: Wrench, iconColor: 'text-blue-500' },
                  { label: 'Готови', count: orders.filter(o=>o.status==='completed').length, color: 'border-green-500', icon: CheckCircle2, iconColor: 'text-green-500' },
                  { label: 'Отказани', count: orders.filter(o=>o.status==='cancelled').length, color: 'border-red-500', icon: XCircle, iconColor: 'text-red-500' }
                ].map((stat, i) => (
                  <div key={i} className={`bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-xl border-t-4 ${stat.color} hover:bg-[#111] transition-colors`}>
                    <div className="flex justify-between items-start">
                      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">{stat.label}</h3>
                      <stat.icon className={stat.iconColor} size={20}/>
                    </div>
                    <p className="text-5xl font-display font-bold text-white mt-6">{stat.count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* НОВА ПОРЪЧКА */}
          {activeTab === 'create-order' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <p className="text-gray-500 text-sm uppercase tracking-widest">Създаване на ръчна заявка в системата</p>
                <Button onClick={() => setNewOrder(initialOrderState)} variant="outline" className="border-red-900/50 text-red-500 hover:bg-red-900/20 uppercase text-xs tracking-widest">Изчисти формата</Button>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                   <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-xl shadow-lg">
                      <h3 className="text-white font-bold uppercase mb-6 flex items-center gap-3 text-lg"><User className="text-gold"/> Данни за Клиента</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                         <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Име и Фамилия</label><input value={newOrder.name} onChange={e=>setNewOrder({...newOrder, name:e.target.value})} className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-gold outline-none transition-colors" /></div>
                         <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Телефон *</label><input value={newOrder.phone} onChange={e=>setNewOrder({...newOrder, phone:e.target.value})} className={`w-full bg-[#040404] border p-4 text-white rounded-lg outline-none transition-colors ${newOrder.phone && !validatePhone(newOrder.phone) ? 'border-red-500' : 'border-[#1a1a1a] focus:border-gold'}`} /></div>
                         <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Имейл</label><input value={newOrder.email} onChange={e=>setNewOrder({...newOrder, email:e.target.value})} className={`w-full bg-[#040404] border p-4 text-white rounded-lg outline-none transition-colors ${newOrder.email && !validateEmail(newOrder.email) ? 'border-red-500' : 'border-[#1a1a1a] focus:border-gold'}`} /></div>
                         <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Град / Адрес</label><input value={newOrder.address} onChange={e=>setNewOrder({...newOrder, address:e.target.value})} className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-gold outline-none transition-colors" /></div>
                      </div>
                   </div>
                   
                   <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-xl shadow-lg">
                      <h3 className="text-white font-bold uppercase mb-6 flex items-center gap-3 text-lg"><Package className="text-gold"/> Избор на Продукти</h3>
                      
                      {newOrder.items.length > 0 && (
                        <div className="space-y-3 mb-8 bg-[#040404] p-4 rounded-lg border border-[#1a1a1a]">
                           {newOrder.items.map(item => (
                             <div key={item.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[#0a0a0a] p-4 rounded-md border border-[#222]">
                                <span className="font-bold text-white uppercase text-sm">{item.title}</span>
                                <div className="flex items-center gap-6">
                                   <div className="flex items-center gap-3 bg-[#040404] px-3 py-1 rounded-md border border-[#333]">
                                      <button onClick={()=>setNewOrder({...newOrder, items: newOrder.items.map(i=>i.id===item.id?{...i, qty:Math.max(1, i.qty-1)}:i)})} className="text-gray-400 hover:text-white"><Minus size={14}/></button>
                                      <span className="text-white font-bold w-4 text-center">{item.qty}</span>
                                      <button onClick={()=>setNewOrder({...newOrder, items: newOrder.items.map(i=>i.id===item.id?{...i, qty:i.qty+1}:i)})} className="text-gray-400 hover:text-white"><Plus size={14}/></button>
                                   </div>
                                   <div className="flex items-center gap-2">
                                     <input value={item.overridePrice} onChange={e=>setNewOrder({...newOrder, items: newOrder.items.map(i=>i.id===item.id?{...i, overridePrice:e.target.value}:i)})} className="w-20 bg-[#040404] border border-[#333] text-center text-white font-mono rounded-md p-2 focus:border-gold outline-none" />
                                     <span className="text-gold font-bold">€</span>
                                   </div>
                                   <button onClick={()=>setNewOrder({...newOrder, items: newOrder.items.filter(i=>i.id!==item.id)})} className="text-red-500 hover:text-red-400 p-2"><Trash2 size={18}/></button>
                                </div>
                             </div>
                           ))}
                        </div>
                      )}

                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Налични в Арсенала</p>
                      <div className="grid sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                         {arsenalItems.map(item => (
                           <button key={item.id} onClick={()=>addToOrder(item)} className="flex items-center justify-between p-3 border border-[#1a1a1a] bg-[#040404] rounded-lg text-left hover:border-gold group transition-all">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <img src={item.image_url} className="w-10 h-10 object-cover rounded-md opacity-80 group-hover:opacity-100 transition-opacity" />
                                <div className="truncate pr-2">
                                  <p className="text-white text-xs font-bold uppercase truncate group-hover:text-gold transition-colors">{item.title}</p>
                                  <p className="text-gray-500 text-[10px] mt-1">{item.price}</p>
                                </div>
                              </div>
                              <PlusCircle size={18} className="text-gray-600 group-hover:text-gold flex-shrink-0"/>
                           </button>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-xl shadow-lg">
                      <h3 className="text-white font-bold uppercase mb-6 flex items-center gap-3 text-lg"><Truck className="text-gold"/> Доставка & Статус</h3>
                      <div className="space-y-5">
                         <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Метод на доставка</label><select value={newOrder.shipping} onChange={e=>setNewOrder({...newOrder, shipping:e.target.value})} className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-gold outline-none appearance-none"><option>Еконт Експрес</option><option>Спиди</option><option>Взимане от сервиза</option></select></div>
                         <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Плащане</label><select value={newOrder.payment} onChange={e=>setNewOrder({...newOrder, payment:e.target.value})} className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-gold outline-none appearance-none"><option>Наложен платеж</option><option>По банков път</option><option>В брой (на място)</option></select></div>
                         <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Статус</label><select value={newOrder.status} onChange={e=>setNewOrder({...newOrder, status:e.target.value})} className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-gold outline-none appearance-none"><option value="pending">Чакащо</option><option value="in-progress">В сервиза</option><option value="completed">Готово</option></select></div>
                      </div>
                   </div>

                   <div className="bg-gradient-to-br from-gold to-amber-600 p-8 rounded-xl text-black shadow-[0_10px_30px_rgba(212,175,55,0.2)]">
                      <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Обща Сума</h3>
                      <p className="text-5xl font-display font-bold mb-8">{newOrderTotal.toFixed(2)} €</p>
                      <Button onClick={submitNewOrder} className="w-full bg-black text-gold hover:bg-[#111] py-6 text-lg font-bold uppercase tracking-widest shadow-xl border border-transparent hover:border-gold transition-all">Създай Поръчка</Button>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* АРСЕНАЛ СКЛАД */}
          {activeTab === 'arsenal' && (
             <div className="space-y-8">
               <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-1 bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-xl h-fit sticky top-6 shadow-lg">
                    <h2 className="text-xl font-display text-white uppercase mb-8 flex items-center justify-between">
                      {editId ? <span className="flex items-center gap-3"><Pencil className="text-gold"/> Редакция</span> : <span className="flex items-center gap-3"><Upload className="text-gold"/> Нов Артикул</span>}
                      {editId && <button onClick={cancelEdit} className="text-gray-500 hover:text-white"><X size={20}/></button>}
                    </h2>
                    <form onSubmit={handleSaveArsenal} className="space-y-5">
                      <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Име/Модел</label><input required value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-gold outline-none" /></div>
                      <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Цена (€)</label><input value={price} onChange={e=>setPrice(e.target.value)} className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-gold outline-none" /></div>
                      <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Снимка</label><input type="file" accept="image/*" onChange={e=>setImageFile(e.target.files?e.target.files[0]:null)} className="w-full bg-[#040404] border border-[#1a1a1a] p-3 text-white text-sm rounded-lg file:bg-gold file:text-black file:border-0 file:rounded file:px-4 file:py-1 file:mr-4 file:font-bold file:cursor-pointer cursor-pointer" />
                        {editId && !imageFile && currentImageUrl && <img src={currentImageUrl} className="mt-4 h-24 w-full object-cover rounded-lg opacity-60 border border-[#333]" />}
                      </div>
                      <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Описание</label><textarea rows={4} value={description} onChange={e=>setDescription(e.target.value)} className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-gold outline-none resize-none" /></div>
                      <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={isUploading} className="flex-1 bg-gold text-black font-bold uppercase py-6 hover:bg-amber-500">{isUploading ? "Запис..." : (editId ? "Обнови" : "Качи в склада")}</Button>
                        {editId && <Button type="button" onClick={cancelEdit} variant="outline" className="border-[#333] py-6 text-gray-400 hover:bg-[#111]">Отказ</Button>}
                      </div>
                    </form>
                  </div>
                  <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
                    {arsenalItems.map(item => (
                       <div key={item.id} className={`bg-[#0a0a0a] border rounded-xl overflow-hidden flex flex-col group transition-all duration-300 ${editId === item.id ? 'border-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-[#1a1a1a] hover:border-[#333]'}`}>
                         <div className="h-56 overflow-hidden relative"><img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /></div>
                         <div className="p-5 flex-1 flex flex-col">
                           <div className="flex justify-between items-start mb-3"><h3 className="font-bold text-white uppercase tracking-wider">{item.title}</h3><span className="text-gold font-bold bg-[#111] px-2 py-1 rounded text-sm">{item.price}</span></div>
                           <p className="text-gray-500 text-xs line-clamp-2 mb-6 flex-1">{item.description}</p>
                           <div className="flex gap-2 mt-auto">
                             <Button onClick={()=>startEdit(item)} variant="outline" className="flex-1 border-[#333] text-gray-300 hover:text-gold hover:border-gold uppercase text-[10px] tracking-widest"><Pencil size={14} className="mr-2"/> Редакция</Button>
                             <Button onClick={()=>handleDeleteArsenal(item.id)} variant="outline" className="border-red-900/30 text-red-500 hover:bg-red-600 hover:text-white"><Trash2 size={16}/></Button>
                           </div>
                         </div>
                       </div>
                    ))}
                  </div>
               </div>
             </div>
          )}

          {/* СЕРВИЗ И УСЛУГИ */}
          {activeTab === 'services' && (
             <div className="space-y-8">
               
               {/* БЛОК ЗА ГЛАВНАТА СНИМКА В СЕРВИЗА */}
               <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-xl shadow-lg mb-8">
                  <h2 className="text-xl font-display text-white uppercase mb-4 flex items-center gap-3"><ImagePlus className="text-gold"/> Главна снимка на секцията (Вляво)</h2>
                  <form onSubmit={handleUploadServiceMainImage} className="flex flex-col sm:flex-row gap-4 items-center">
                     <input type="file" accept="image/*" onChange={e=>setServiceMainImageFile(e.target.files?e.target.files[0]:null)} className="flex-1 bg-[#040404] border border-[#1a1a1a] p-3 text-white text-sm rounded-lg file:bg-gold file:text-black file:border-0 file:rounded file:px-4 file:py-1 file:mr-4 file:font-bold file:cursor-pointer cursor-pointer" />
                     <Button type="submit" disabled={isUploading || !serviceMainImageFile} className="bg-gold text-black font-bold uppercase py-6 px-8 hover:bg-amber-500">{isUploading ? 'Качване...' : 'Обнови Снимката'}</Button>
                  </form>
                  {serviceMainImgUrl && <img src={serviceMainImgUrl} className="mt-6 h-48 w-full md:w-1/3 object-cover rounded-lg border border-[#333]" />}
               </div>

               {/* БЛОК ЗА УСЛУГИТЕ */}
               <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-1 bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-xl h-fit sticky top-6 shadow-lg">
                    <h2 className="text-xl font-display text-white uppercase mb-8 flex items-center justify-between">
                      {editServiceId ? <span className="flex items-center gap-3"><Pencil className="text-gold"/> Редакция</span> : <span className="flex items-center gap-3"><Upload className="text-gold"/> Нова Услуга</span>}
                      {editServiceId && <button onClick={cancelEditService} className="text-gray-500 hover:text-white"><X size={20}/></button>}
                    </h2>
                    <form onSubmit={handleSaveService} className="space-y-5">
                      <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Заглавие на услугата</label><input required value={serviceTitle} onChange={e=>setServiceTitle(e.target.value)} className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-gold outline-none" placeholder="напр. ПЪЛНА ПРОФИЛАКТИКА" /></div>
                      <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Описание</label><textarea rows={5} value={serviceDesc} onChange={e=>setServiceDesc(e.target.value)} className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-gold outline-none resize-none" placeholder="Кратко обяснение какво включва..." /></div>
                      <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={isUploading} className="flex-1 bg-gold text-black font-bold uppercase py-6 hover:bg-amber-500">{isUploading ? "Запис..." : (editServiceId ? "Обнови" : "Добави Услуга")}</Button>
                        {editServiceId && <Button type="button" onClick={cancelEditService} variant="outline" className="border-[#333] py-6 text-gray-400 hover:bg-[#111]">Отказ</Button>}
                      </div>
                    </form>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    {servicesItems.map(item => (
                       <div key={item.id} className={`bg-[#0a0a0a] border p-6 rounded-xl flex items-start gap-4 transition-all duration-300 ${editServiceId === item.id ? 'border-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-[#1a1a1a] hover:border-[#333]'}`}>
                         <Crosshair className="text-gold mt-1 flex-shrink-0" size={24}/>
                         <div className="flex-1">
                           <h3 className="font-bold text-white uppercase tracking-wider mb-2">{item.title}</h3>
                           <p className="text-gray-500 text-sm">{item.description}</p>
                         </div>
                         <div className="flex flex-col gap-2">
                           <Button onClick={()=>startEditService(item)} variant="outline" className="border-[#333] text-gray-300 hover:text-gold hover:border-gold"><Pencil size={14}/></Button>
                           <Button onClick={()=>handleDeleteService(item.id)} variant="outline" className="border-red-900/30 text-red-500 hover:bg-red-600 hover:text-white"><Trash2 size={16}/></Button>
                         </div>
                       </div>
                    ))}
                    {servicesItems.length === 0 && <p className="text-gray-500 uppercase tracking-widest text-xs p-8 text-center border border-[#1a1a1a] rounded-xl border-dashed">Няма добавени услуги в сервиза.</p>}
                  </div>
               </div>
             </div>
          )}

          {/* ГАЛЕРИЯ */}
          {activeTab === 'gallery' && (
             <div className="space-y-8">
               <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-1 bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-xl h-fit sticky top-6 shadow-lg">
                    <h2 className="text-xl font-display text-white uppercase mb-8 flex items-center justify-between">
                      {editGalleryId ? <span className="flex items-center gap-3"><Pencil className="text-gold"/> Редакция</span> : <span className="flex items-center gap-3"><Upload className="text-gold"/> Качи Снимка</span>}
                      {editGalleryId && <button onClick={cancelEditGallery} className="text-gray-500 hover:text-white"><X size={20}/></button>}
                    </h2>
                    <form onSubmit={handleSaveGallery} className="space-y-5">
                      <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Заглавие (Опционално)</label><input value={galleryTitle} onChange={e=>setGalleryTitle(e.target.value)} className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-gold outline-none" placeholder="напр. Airsoft Action 1" /></div>
                      <div><label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">Снимка от терена</label><input type="file" accept="image/*" onChange={e=>setGalleryImageFile(e.target.files?e.target.files[0]:null)} className="w-full bg-[#040404] border border-[#1a1a1a] p-3 text-white text-sm rounded-lg file:bg-gold file:text-black file:border-0 file:rounded file:px-4 file:py-1 file:mr-4 file:font-bold file:cursor-pointer cursor-pointer" />
                        {editGalleryId && !galleryImageFile && currentGalleryImageUrl && <img src={currentGalleryImageUrl} className="mt-4 h-32 w-full object-cover rounded-lg opacity-80 border border-[#333]" />}
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={isUploading} className="flex-1 bg-gold text-black font-bold uppercase py-6 hover:bg-amber-500">{isUploading ? "Качване..." : (editGalleryId ? "Обнови" : "Качи в Галерията")}</Button>
                        {editGalleryId && <Button type="button" onClick={cancelEditGallery} variant="outline" className="border-[#333] py-6 text-gray-400 hover:bg-[#111]">Отказ</Button>}
                      </div>
                    </form>
                  </div>
                  <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                    {galleryItems.map(item => (
                       <div key={item.id} className={`relative bg-[#0a0a0a] border rounded-xl overflow-hidden group transition-all duration-300 ${editGalleryId === item.id ? 'border-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-[#1a1a1a] hover:border-[#333]'}`}>
                         <div className="h-64 w-full"><img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" /></div>
                         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                           <h3 className="text-white font-bold uppercase text-sm mb-4">{item.title || 'Без заглавие'}</h3>
                           <div className="flex gap-2">
                             <Button onClick={()=>startEditGallery(item)} variant="outline" className="flex-1 border-[#333] bg-black/50 text-gray-300 hover:text-gold hover:border-gold text-xs"><Pencil size={14} className="mr-2"/> Редакция</Button>
                             <Button onClick={()=>handleDeleteGallery(item.id)} variant="outline" className="border-red-900/50 bg-black/50 text-red-500 hover:bg-red-600 hover:text-white"><Trash2 size={16}/></Button>
                           </div>
                         </div>
                       </div>
                    ))}
                    {galleryItems.length === 0 && <p className="col-span-2 text-gray-500 uppercase tracking-widest text-xs p-8 text-center border border-[#1a1a1a] rounded-xl border-dashed">Няма качени снимки в галерията.</p>}
                  </div>
               </div>
             </div>
          )}

          {/* CMS НАСТРОЙКИ */}
          {activeTab === 'settings' && (
             <div className="space-y-8">
               <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-8 max-w-3xl shadow-lg">
                 <p className="text-gray-500 text-sm mb-8 uppercase tracking-widest border-b border-[#1a1a1a] pb-6">Редактирай текстовете на публичния сайт в реално време.</p>
                 <div className="space-y-8">
                   {settings.map(setting => (
                     <div key={setting.key}>
                       <label className="text-[10px] text-gold uppercase font-bold tracking-widest mb-3 block flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gold"></div> {setting.description}</label>
                       {setting.value.length > 50 ? (
                         <textarea value={setting.value} onChange={e=>setSettings(settings.map(s=>s.key===setting.key?{...s, value:e.target.value}:s))} rows={3} className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-gold outline-none resize-none transition-colors" />
                       ) : (
                         <input value={setting.value} onChange={e=>setSettings(settings.map(s=>s.key===setting.key?{...s, value:e.target.value}:s))} className="w-full bg-[#040404] border border-[#1a1a1a] p-4 text-white rounded-lg focus:border-gold outline-none transition-colors" />
                       )}
                     </div>
                   ))}
                   <Button onClick={saveSettings} className="w-full bg-gold text-black font-bold uppercase tracking-widest py-8 hover:bg-amber-500 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all">
                     <Save className="mr-3" size={24}/> Запази промените по сайта
                   </Button>
                 </div>
               </div>
             </div>
          )}

          {/* ПОРЪЧКИ ТАБЛИЦА */}
          {activeTab === 'orders' && (
             <div className="space-y-8">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
                  <input type="text" placeholder="Търси по име, телефон, имейл или номер на поръчка (напр. VZ-123)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#1a1a1a] py-4 pl-12 pr-4 text-white rounded-xl focus:border-gold outline-none transition-colors" />
               </div>

               <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden shadow-lg">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left min-w-[1000px]">
                     <thead><tr className="bg-[#040404] text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-[#1a1a1a]"><th className="p-5">Номер</th><th className="p-5">Дата</th><th className="p-5">Клиент</th><th className="p-5">Стойност</th><th className="p-5 text-center">Статус</th><th className="p-5 text-center">Действие</th></tr></thead>
                     <tbody className="text-sm">
                       {filteredOrders.map((order) => (
                         <tr key={order.id} className="border-b border-[#1a1a1a] hover:bg-[#111] transition-colors">
                           <td className="p-5 text-gold font-mono font-bold">{order.order_number || '#N/A'}</td>
                           <td className="p-5 text-gray-500 text-xs font-mono">{new Date(order.created_at).toLocaleDateString("bg-BG")}</td>
                           <td className="p-5 text-white font-bold">{order.name} {order.is_manual && <span className="ml-2 bg-gold/10 text-gold border border-gold/30 text-[9px] px-2 py-1 rounded uppercase tracking-wider">Ръчна</span>}<div className="text-gray-500 text-xs font-normal mt-1">{order.phone}</div></td>
                           <td className="p-5 text-gray-300 font-bold">{order.total_price || '-'}</td>
                           <td className="p-5 flex justify-center">
                             <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value, order.email, order.order_number, order.name, order.details, order.total_price)} className="px-4 py-2 rounded-lg font-bold uppercase text-[10px] tracking-widest cursor-pointer outline-none border border-[#333] bg-[#040404] text-white focus:border-gold transition-colors">
                               <option value="pending">⏳ ЧАКАЩО</option><option value="in-progress">🔧 В СЕРВИЗА</option><option value="completed">✅ ГОТОВО</option><option value="cancelled">❌ ОТКАЗАНО</option>
                             </select>
                           </td>
                           <td className="p-5 text-center">
                              <Button onClick={() => setSelectedOrder(order)} variant="outline" className="border-gold/30 text-gold hover:bg-gold hover:text-black uppercase text-[10px] tracking-widest"><Eye size={14} className="mr-2"/> Детайли</Button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                   {filteredOrders.length === 0 && (
                     <div className="p-8 text-center text-gray-500 uppercase tracking-widest text-xs">Не са намерени поръчки.</div>
                   )}
                 </div>
               </div>
             </div>
          )}

        </div>
      </main>

      {/* МОДАЛ ЗА ДЕТАЙЛИ НА ПОРЪЧКА */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-[#0a0a0a] border border-gold/30 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-[0_0_50px_rgba(212,175,55,0.1)] relative">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white bg-[#111] p-2 rounded-full"><X size={24}/></button>
            <div className="p-8 border-b border-[#1a1a1a]">
              <div className="flex items-center gap-3 mb-2">
                 <Hash className="text-gold"/> <h2 className="text-3xl font-display font-bold text-white tracking-widest">{selectedOrder.order_number || 'НЯМА НОМЕР'}</h2>
              </div>
              <p className="text-gray-500 text-xs uppercase tracking-widest flex items-center gap-2"><Clock size={14}/> {new Date(selectedOrder.created_at).toLocaleString('bg-BG')}</p>
              {selectedOrder.is_manual && <span className="inline-block mt-3 bg-gold/10 text-gold border border-gold/30 text-[10px] px-3 py-1 rounded uppercase tracking-wider font-bold">Ръчно Създадена</span>}
            </div>
            <div className="p-8 space-y-8">
               <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[#1a1a1a] pb-2"><User size={14} className="text-gold"/> Клиент</h3>
                    <p className="text-white font-bold text-lg mb-1">{selectedOrder.name}</p>
                    <p className="text-gray-400 font-mono text-sm flex items-center gap-2 mt-2"><Phone size={14}/> {selectedOrder.phone}</p>
                    {selectedOrder.email && <p className="text-gray-400 font-mono text-sm flex items-center gap-2 mt-2"><Mail size={14}/> {selectedOrder.email}</p>}
                    <p className="text-gray-400 text-sm flex items-start gap-2 mt-2"><MapPin size={14} className="mt-1 flex-shrink-0"/> {selectedOrder.address || 'Няма адрес'}</p>
                  </div>
                  <div>
                    <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[#1a1a1a] pb-2"><Settings size={14} className="text-gold"/> Данни</h3>
                    <p className="text-gray-300 text-sm mb-2"><span className="text-gray-600">Категория:</span> {selectedOrder.category}</p>
                    <div className="mt-4">
                       <label className="text-[10px] text-gray-500 uppercase block mb-2">Промени Статус (Праща Имейл)</label>
                       <select value={selectedOrder.status} onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value, selectedOrder.email, selectedOrder.order_number, selectedOrder.name, selectedOrder.details, selectedOrder.total_price)} className="w-full px-4 py-3 rounded-lg font-bold uppercase text-[10px] tracking-widest cursor-pointer outline-none border border-[#333] bg-[#040404] text-white focus:border-gold">
                         <option value="pending">⏳ ЧАКАЩО</option><option value="in-progress">🔧 В СЕРВИЗА</option><option value="completed">✅ ГОТОВО</option><option value="cancelled">❌ ОТКАЗАНО</option>
                       </select>
                    </div>
                  </div>
               </div>
               <div>
                 <h3 className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-[#1a1a1a] pb-2"><Package size={14} className="text-gold"/> Детайли на поръчката</h3>
                 <div className="bg-[#040404] p-4 rounded-lg border border-[#1a1a1a] whitespace-pre-line text-gray-300 text-sm leading-relaxed font-mono">
                    {selectedOrder.details}
                 </div>
                 {selectedOrder.total_price && (
                   <div className="mt-4 text-right">
                     <span className="text-gray-500 text-[10px] uppercase tracking-widest mr-4">Обща Стойност:</span>
                     <span className="text-3xl font-bold text-gold">{selectedOrder.total_price}</span>
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