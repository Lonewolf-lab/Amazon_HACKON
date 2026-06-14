"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* Global shopping cart — persisted to localStorage so a shopper's cart
   survives page reloads and navigation. Shared by the marketplace cards,
   the product detail page, the navbar cart button, and the cart drawer. */

export type CartItem = {
  id: string; // marketplace listing id (ASIN.. or RET-..)
  name: string;
  price: number; // second-life price (per unit)
  original: number; // MRP (per unit)
  grade: string;
  category: string;
  asin?: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number; // total units
  subtotal: number; // price * qty summed
  savings: number; // (original - price) * qty summed
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "relife_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted cart once on mount (client only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Persist on every change (after the initial hydrate).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota errors */
    }
  }, [items, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "qty">, qty: number = 1) => {
      setItems((prev) => {
        const existing = prev.find((p) => p.id === item.id);
        if (existing) {
          return prev.map((p) =>
            p.id === item.id ? { ...p, qty: p.qty + qty } : p
          );
        }
        return [...prev, { ...item, qty }];
      });
      setIsOpen(true); // slide the cart open whenever something is added
    },
    []
  );

  const removeItem = useCallback(
    (id: string) => setItems((prev) => prev.filter((p) => p.id !== id)),
    []
  );

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((p) => p.id !== id)
        : prev.map((p) => (p.id === id ? { ...p, qty } : p))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const { count, subtotal, savings } = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    let savings = 0;
    for (const it of items) {
      count += it.qty;
      subtotal += it.price * it.qty;
      savings += Math.max(0, it.original - it.price) * it.qty;
    }
    return { count, subtotal, savings };
  }, [items]);

  const value: CartContextValue = {
    items,
    count,
    subtotal,
    savings,
    isOpen,
    addItem,
    removeItem,
    setQty,
    clear,
    open,
    close,
    toggle,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
