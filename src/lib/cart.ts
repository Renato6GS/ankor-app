"use client";
import { useEffect, useState } from "react";

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
};

const KEY = "ankor.cart";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setItems(JSON.parse(raw));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, hydrated]);

  function add(item: Omit<CartItem, "quantity">) {
    setItems((prev) => {
      const existing = prev.find((p) => p.productId === item.productId);
      if (existing) {
        return prev.map((p) =>
          p.productId === item.productId
            ? { ...p, quantity: p.quantity + 1 }
            : p,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function remove(productId: number) {
    setItems((prev) => prev.filter((p) => p.productId !== productId));
  }

  function clear() {
    setItems([]);
  }

  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return { items, add, remove, clear, total, hydrated };
}
