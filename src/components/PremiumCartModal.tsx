import { useMemo, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Apple,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";
import { supabase } from "@/integrations/supabase/client";
import { useCartStore } from "@/store/useCartStore";

const emailRegex = /^\S+@\S+\.\S+$/;

const parseToPrice = (value: number) => value.toFixed(2);
const generateOrderNumber = () => `VZ-${Math.floor(100000 + Math.random() * 900000)}`;

const formatCardNumber = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const isWeaponItem = (title: string, details?: string) =>
  /rifle|ak|m4|mk18|replica|gun lab|weapon/i.test(title) || Boolean(details);

const getSlotSize = (title: string, details?: string) =>
  isWeaponItem(title, details) ? { cols: 4, rows: 2 } : { cols: 2, rows: 1 };

const layoutStash = (items: ReturnType<typeof useCartStore.getState>["items"]) => {
  const columns = 6;
  const occupancy: boolean[][] = [];

  const ensureRows = (count: number) => {
    while (occupancy.length < count) {
      occupancy.push(new Array(columns).fill(false));
    }
  };

  return items.map((item) => {
    const size = getSlotSize(item.title, item.details);
    let row = 0;
    let col = 0;
    let placed = false;

    while (!placed) {
      ensureRows(row + size.rows);
      for (let y = row; y <= row; y += 1) {
        for (let x = 0; x <= columns - size.cols; x += 1) {
          const canPlace = Array.from({ length: size.rows }).every((_, rowOffset) =>
            Array.from({ length: size.cols }).every((_, colOffset) => !occupancy[y + rowOffset][x + colOffset])
          );

          if (canPlace) {
            for (let rowOffset = 0; rowOffset < size.rows; rowOffset += 1) {
              for (let colOffset = 0; colOffset < size.cols; colOffset += 1) {
                occupancy[y + rowOffset][x + colOffset] = true;
              }
            }
            row = y;
            col = x;
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
      if (!placed) row += 1;
    }

    return { id: item.id, row, col, ...size };
  });
};

const PremiumCartModal = () => {
  const { items, isCartOpen, setCartOpen, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const stashRef = useRef<HTMLDivElement | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentType, setPaymentType] = useState<"cod" | "card">("cod");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.qty, 0), [items]);
  const totalQty = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);
  const stashLayout = useMemo(() => layoutStash(items), [items]);
  const stashHeight = useMemo(() => {
    const maxRows = stashLayout.reduce((max, item) => Math.max(max, item.row + item.rows), 0);
    return Math.max(420, maxRows * 92 + 22);
  }, [stashLayout]);
  const stashWeight = useMemo(() => {
    const seed = items.reduce((sum, item) => sum + item.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0), 0);
    return (5 + (seed % 10) + totalQty * 0.35).toFixed(1);
  }, [items, totalQty]);

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (fullName.trim().split(/\s+/).length < 2) nextErrors.fullName = "Моля, въведи име и фамилия.";
    if (!emailRegex.test(email.trim())) nextErrors.email = "Моля, въведи валиден имейл.";
    if (phone.replace(/\D/g, "").length < 8) nextErrors.phone = "Телефонът трябва да съдържа поне 8 цифри.";
    if (!address.trim()) nextErrors.address = "Полето Град / Адрес е задължително.";

    if (paymentType === "card") {
      if (cardNumber.replace(/\D/g, "").length !== 16) nextErrors.cardNumber = "Невалиден номер на карта.";
      const [mm, yy] = expiry.split("/");
      const month = Number(mm);
      if (!mm || !yy || month < 1 || month > 12 || yy.length !== 2) nextErrors.expiry = "Невалидна дата (MM/YY).";
      if (cvc.replace(/\D/g, "").length < 3) nextErrors.cvc = "Невалиден CVC код.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!items.length) return toast.error("Количката е празна.");
    if (!validate()) return;

    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 2000));

      const orderNumber = generateOrderNumber();
      const detailsLines = items.map(
        (item) => `- ${item.qty}x ${item.title} (${parseToPrice(item.price)} €)${item.details ? `\n${item.details}` : ""}`
      );
      const detailsForEmail = detailsLines.join("\n");
      const paymentMethodLabel = paymentType === "cod" ? "Наложен платеж" : "Карта / Дигитален портфейл";
      const totalFormatted = `${parseToPrice(total)} €`;
      const details = ["Поръчка от количка:", ...detailsLines, "", `Плащане: ${paymentMethodLabel}`].join("\n");

      const { error } = await supabase.from("orders").insert([
        {
          order_number: orderNumber,
          name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          total_price: totalFormatted,
          details,
          status: "pending",
          category: "Онлайн поръчка",
          is_manual: false,
        },
      ]);

      if (error) throw error;

      emailjs
        .send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            user_name: fullName.trim(),
            user_email: email.trim(),
            order_number: orderNumber,
            status: "ЧАКАЩА (ПРИЕТА)",
            details: detailsForEmail,
            total_price: totalFormatted,
            payment_method: paymentMethodLabel,
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        )
        .then(() => toast.success("Имейл известието е изпратено."))
        .catch(() => toast.error("Поръчката е запазена, но имейлът не се изпрати."));

      clearCart();
      setCartOpen(false);
      setFullName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setCardNumber("");
      setExpiry("");
      setCvc("");
      setErrors({});
      toast.success("Поръчката е изпратена успешно.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Възникна грешка при изпращане на поръчката.";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/80 p-4 backdrop-blur-2xl md:p-8"
          onClick={() => setCartOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.28 }}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto h-full max-w-7xl overflow-hidden rounded-[36px] border border-red-500/20 bg-[#070707]/95 shadow-[0_0_120px_rgba(239,68,68,0.16)]"
          >
            <div className="h-full overflow-y-auto">
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#070707]/95 px-6 py-5 backdrop-blur-xl md:px-10">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/30 bg-red-600/10 text-red-400">
                    <ShoppingCart size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.36em] text-red-300/70">The Tarkov Stash</div>
                    <h3 className="text-xl font-black uppercase tracking-[0.22em] text-white md:text-2xl">
                      Elite Cart ({totalQty})
                    </h3>
                  </div>
                </div>
                <button onClick={() => setCartOpen(false)} className="text-gray-400 transition-colors hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="grid gap-8 p-6 md:p-10 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-4">
                  <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 md:p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.36em] text-red-300/70">Inventory Grid</div>
                        <div className="mt-2 text-lg font-black uppercase tracking-[0.2em] text-white">Stash Layout</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-[0.32em] text-white/50">Drag Items</div>
                        <div className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-red-300">
                          Modular Slots
                        </div>
                      </div>
                    </div>

                    <div
                      ref={stashRef}
                      className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#020202]"
                      style={{ height: stashHeight }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:92px_92px]" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_35%)]" />

                      {items.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center p-10 text-center text-xs uppercase tracking-[0.3em] text-white/45">
                          Stash empty. Insert hardware to begin operation.
                        </div>
                      )}

                      {items.map((item) => {
                        const slot = stashLayout.find((entry) => entry.id === item.id);
                        if (!slot) return null;

                        const width = slot.cols * 92 - 12;
                        const height = slot.rows * 92 - 12;

                        return (
                          <motion.div
                            key={item.id}
                            drag
                            dragMomentum={false}
                            dragElastic={0.08}
                            dragConstraints={stashRef}
                            initial={{ x: slot.col * 92 + 6, y: slot.row * 92 + 6 }}
                            animate={{ x: slot.col * 92 + 6, y: slot.row * 92 + 6 }}
                            transition={{ type: "spring", stiffness: 220, damping: 24 }}
                            className="absolute"
                            style={{ width, height }}
                          >
                            <div className="flex h-full flex-col overflow-hidden rounded-[22px] border border-red-500/20 bg-[#080808]/95 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                              <div className="flex items-center justify-between border-b border-white/10 bg-red-600/10 px-4 py-2">
                                <span className="text-[10px] uppercase tracking-[0.26em] text-red-200/80">
                                  {isWeaponItem(item.title, item.details) ? "Primary Weapon" : "Accessory"}
                                </span>
                                <button type="button" onClick={() => removeFromCart(item.id)} className="text-gray-500 transition hover:text-red-400">
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              <div className="flex flex-1 gap-3 p-4">
                                <img
                                  src={item.image_url ?? ""}
                                  alt={item.title}
                                  className={`rounded-2xl border border-white/10 object-cover ${
                                    slot.rows > 1 ? "h-full w-[38%]" : "h-full w-20"
                                  }`}
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm font-black uppercase tracking-[0.14em] text-white">
                                    {item.title}
                                  </div>
                                  {item.details && (
                                    <p className="mt-2 line-clamp-4 whitespace-pre-line text-[11px] leading-5 text-gray-400">
                                      {item.details}
                                    </p>
                                  )}
                                  <div className="mt-auto pt-3">
                                    <div className="text-lg font-black uppercase tracking-[0.16em] text-red-400">
                                      {parseToPrice(item.price)} €
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => updateQuantity(item.id, item.qty - 1)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-gray-300 transition hover:border-red-500/40"
                                      >
                                        <Minus size={14} />
                                      </button>
                                      <span className="w-8 text-center text-sm font-black text-white">{item.qty}</span>
                                      <button
                                        type="button"
                                        onClick={() => updateQuantity(item.id, item.qty + 1)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-gray-300 transition hover:border-red-500/40"
                                      >
                                        <Plus size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[24px] border border-red-500/20 bg-red-600/10 px-5 py-4">
                        <div className="text-[10px] uppercase tracking-[0.34em] text-red-300/70">Stash Value</div>
                        <div className="mt-2 text-3xl font-black uppercase tracking-[0.2em] text-red-400">
                          {parseToPrice(total)} €
                        </div>
                      </div>
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-4">
                        <div className="text-[10px] uppercase tracking-[0.34em] text-white/45">Weight</div>
                        <div className="mt-2 text-3xl font-black uppercase tracking-[0.2em] text-white">
                          {stashWeight} kg
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-4 rounded-[30px] border border-white/10 bg-white/[0.03] p-6 md:p-7">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.34em] text-red-300/70">Checkout Node</div>
                    <h4 className="mt-2 text-2xl font-black uppercase tracking-[0.18em] text-white">
                      Finalize Order
                    </h4>
                  </div>

                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Име и Фамилия" className="w-full rounded-xl border border-white/10 bg-[#040404] p-4 text-white outline-none transition-all placeholder:text-gray-600 focus:border-red-500 focus:shadow-[0_0_20px_rgba(239,68,68,0.25)]" />
                  {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}

                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Имейл" className="w-full rounded-xl border border-white/10 bg-[#040404] p-4 text-white outline-none transition-all placeholder:text-gray-600 focus:border-red-500 focus:shadow-[0_0_20px_rgba(239,68,68,0.25)]" />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}

                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон" className="w-full rounded-xl border border-white/10 bg-[#040404] p-4 text-white outline-none transition-all placeholder:text-gray-600 focus:border-red-500 focus:shadow-[0_0_20px_rgba(239,68,68,0.25)]" />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}

                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Град / Адрес" className="w-full rounded-xl border border-white/10 bg-[#040404] p-4 text-white outline-none transition-all placeholder:text-gray-600 focus:border-red-500 focus:shadow-[0_0_20px_rgba(239,68,68,0.25)]" />
                  {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button type="button" onClick={() => setPaymentType("cod")} className={`rounded-xl border p-4 text-xs font-bold uppercase tracking-widest transition-all ${paymentType === "cod" ? "border-red-500 bg-red-600/10 text-red-400" : "border-white/10 bg-white/[0.02] text-gray-400"}`}>
                      Наложен платеж
                    </button>
                    <button type="button" onClick={() => setPaymentType("card")} className={`rounded-xl border p-4 text-xs font-bold uppercase tracking-widest transition-all ${paymentType === "card" ? "border-red-500 bg-red-600/10 text-red-400" : "border-white/10 bg-white/[0.02] text-gray-400"}`}>
                      Карта / Портфейл
                    </button>
                  </div>

                  {paymentType === "card" && (
                    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" className="flex h-14 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#040404] font-bold tracking-wide text-white transition-all hover:border-red-500/40">
                          <Apple size={18} /> Apple Pay
                        </button>
                        <button type="button" className="flex h-14 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#040404] font-bold tracking-wide text-white transition-all hover:border-red-500/40">
                          <Wallet size={18} /> Revolut Pay
                        </button>
                      </div>

                      <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-gray-600">
                        <div className="h-px flex-1 bg-white/10" />
                        OR
                        <div className="h-px flex-1 bg-white/10" />
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="relative">
                            <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} placeholder="Номер на карта" className="w-full rounded-xl border border-white/10 bg-[#040404] p-4 pl-10 text-white outline-none transition-all placeholder:text-gray-600 focus:border-red-500 focus:shadow-[0_0_20px_rgba(239,68,68,0.25)]" />
                          </div>
                          {errors.cardNumber && <p className="mt-1 text-xs text-red-500">{errors.cardNumber}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <input value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" className="w-full rounded-xl border border-white/10 bg-[#040404] p-4 text-white outline-none transition-all placeholder:text-gray-600 focus:border-red-500 focus:shadow-[0_0_20px_rgba(239,68,68,0.25)]" />
                            {errors.expiry && <p className="mt-1 text-xs text-red-500">{errors.expiry}</p>}
                          </div>
                          <div>
                            <input value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="CVC" className="w-full rounded-xl border border-white/10 bg-[#040404] p-4 text-white outline-none transition-all placeholder:text-gray-600 focus:border-red-500 focus:shadow-[0_0_20px_rgba(239,68,68,0.25)]" />
                            {errors.cvc && <p className="mt-1 text-xs text-red-500">{errors.cvc}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isProcessing || items.length === 0}
                    className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-red-500/50 bg-red-600 font-bold uppercase tracking-widest text-white shadow-[0_0_25px_rgba(239,68,68,0.35)] transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Обработка...
                      </>
                    ) : (
                      "Завърши поръчката"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default PremiumCartModal;
