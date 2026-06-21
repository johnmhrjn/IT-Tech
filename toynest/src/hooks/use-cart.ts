"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  slug: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CART_KEY = "toynest_cart";

function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function useCart(): CartStore {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(getCart());
  }, []);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        updated = [...prev, { ...item, quantity }];
      }
      saveCart(updated);
      return updated;
    });
    toast({ title: "Added to cart!", variant: "success" as never, description: item.name });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.productId !== productId);
      saveCart(updated);
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) => {
      const updated = prev.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      );
      saveCart(updated);
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    saveCart([]);
  }, []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount };
}
