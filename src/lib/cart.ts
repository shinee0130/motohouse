"use client";

// Сагс — localStorage дээр хадгална (нэвтрэлтгүй ч ажиллана, захиалахад нэвтэрнэ).

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image?: string;
  meta?: string; // хэмжээ/өнгө г.м
  qty: number;
}

const KEY = "mh_cart";
export const CART_EVENT = "mh_cart_change";

function emit() {
  try { window.dispatchEvent(new Event(CART_EVENT)); } catch {}
}

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch { return []; }
}

function save(items: CartItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  emit();
}

export function addToCart(item: Omit<CartItem, "qty">, qty = 1) {
  const items = getCart();
  // ижил бараа + ижил meta бол тоог нэмнэ
  const found = items.find((x) => x.id === item.id && x.meta === item.meta);
  if (found) found.qty += qty;
  else items.push({ ...item, qty });
  save(items);
}

export function setCartQty(id: number, meta: string | undefined, qty: number) {
  let items = getCart();
  if (qty <= 0) items = items.filter((x) => !(x.id === id && x.meta === meta));
  else items = items.map((x) => (x.id === id && x.meta === meta ? { ...x, qty } : x));
  save(items);
}

export function removeFromCart(id: number, meta: string | undefined) {
  save(getCart().filter((x) => !(x.id === id && x.meta === meta)));
}

export function clearCart() {
  save([]);
}

export function cartCount(): number {
  return getCart().reduce((s, x) => s + x.qty, 0);
}

export function cartTotal(): number {
  return getCart().reduce((s, x) => s + x.price * x.qty, 0);
}
