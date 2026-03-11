import { create } from "zustand";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image_url?: string;
  details?: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, "qty">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  isCartOpen: false,
  setCartOpen: (open) => set({ isCartOpen: open }),
  addToCart: (item) =>
    set((state) => {
      const existing = state.items.find((x) => x.id === item.id);
      if (existing) {
        return {
          items: state.items.map((x) =>
            x.id === item.id ? { ...x, qty: x.qty + 1 } : x
          ),
        };
      }
      return { items: [...state.items, { ...item, qty: 1 }] };
    }),
  removeFromCart: (id) =>
    set((state) => ({ items: state.items.filter((x) => x.id !== id) })),
  updateQuantity: (id, qty) =>
    set((state) => {
      if (qty <= 0) {
        return { items: state.items.filter((x) => x.id !== id) };
      }
      return {
        items: state.items.map((x) => (x.id === id ? { ...x, qty } : x)),
      };
    }),
  clearCart: () => set({ items: [] }),
}));
