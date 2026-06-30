import { supabase } from "./supabase";
import type { Moto, GearItem, EventItem } from "./data";
import type { Order } from "./account";

// ---- DB мөр → TS төрөл map (snake_case → camelCase) ----

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapMoto(r: any): Moto {
  return {
    id: r.id, brand: r.brand, model: r.model, year: r.year, cc: r.cc, odo: r.odo,
    price: r.price, status: r.status, country: r.country, customs: r.customs,
    hp: r.hp, nm: r.nm, top: r.top_speed, weight: r.weight, cyl: r.cyl,
    desc: r.description ?? "", extras: r.extras ?? [], images: r.images ?? [],
    video: r.video ?? undefined, featured: r.featured,
  };
}
function mapGear(r: any): GearItem {
  return {
    id: r.id, name: r.name, category: r.category, brand: r.brand, meta: r.meta,
    price: r.price, oldPrice: r.old_price, rating: r.rating, reviews: r.reviews,
    sku: r.sku, desc: r.description ?? "", features: r.features ?? [],
    sizes: r.sizes?.length ? r.sizes : undefined,
    colors: r.colors?.length ? r.colors : undefined,
    bestSeller: r.best_seller,
  };
}
function mapEvent(r: any): EventItem {
  return { id: r.id, type: r.type, title: r.title, status: r.status, date: r.event_date, prize: r.prize };
}
function mapOrder(r: any): Order {
  return { id: r.id, date: r.order_date, item: r.item, qty: r.qty, total: r.total, status: r.status };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---- Motorcycles ----
export async function getMotos(): Promise<Moto[]> {
  const { data, error } = await supabase.from("motorcycles").select("*").order("id");
  if (error) throw error;
  return (data ?? []).map(mapMoto);
}
export async function getMoto(id: number): Promise<Moto | null> {
  const { data, error } = await supabase.from("motorcycles").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapMoto(data) : null;
}

// ---- Gear ----
export async function getGearAll(): Promise<GearItem[]> {
  const { data, error } = await supabase.from("gear").select("*").order("id");
  if (error) throw error;
  return (data ?? []).map(mapGear);
}
export async function getGearItem(id: number): Promise<GearItem | null> {
  const { data, error } = await supabase.from("gear").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapGear(data) : null;
}

// ---- Events ----
export async function getEvents(): Promise<EventItem[]> {
  const { data, error } = await supabase.from("events").select("*").order("id");
  if (error) throw error;
  return (data ?? []).map(mapEvent);
}

// ---- Settings (home backgrounds) ----
export async function getSettings(): Promise<Record<string, string>> {
  const { data } = await supabase.from("settings").select("*");
  const o: Record<string, string> = {};
  (data ?? []).forEach((r: { key: string; value: string }) => (o[r.key] = r.value));
  return o;
}

// ---- Orders ----
export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapOrder);
}
export async function getUserOrders(phone: string): Promise<Order[]> {
  const { data } = await supabase.from("orders").select("*").eq("user_phone", phone).order("created_at", { ascending: false });
  return (data ?? []).map(mapOrder);
}

// ---- Saved (Хадгалсан) ----
export async function getSavedItems(phone: string): Promise<{ gear: GearItem[]; motos: Moto[] }> {
  const { data } = await supabase.from("saved").select("*").eq("user_phone", phone).order("created_at", { ascending: false });
  const rows = data ?? [];
  const gearIds = rows.filter((r) => r.kind === "gear").map((r) => r.item_id);
  const motoIds = rows.filter((r) => r.kind === "moto").map((r) => r.item_id);
  const [g, m] = await Promise.all([
    gearIds.length ? supabase.from("gear").select("*").in("id", gearIds) : Promise.resolve({ data: [] }),
    motoIds.length ? supabase.from("motorcycles").select("*").in("id", motoIds) : Promise.resolve({ data: [] }),
  ]);
  return { gear: (g.data ?? []).map(mapGear), motos: (m.data ?? []).map(mapMoto) };
}
export async function getSavedIds(phone: string, kind: "gear" | "moto"): Promise<number[]> {
  const { data } = await supabase.from("saved").select("item_id").eq("user_phone", phone).eq("kind", kind);
  return (data ?? []).map((r) => r.item_id as number);
}

// ---- helpers (DB дээр суурилсан) ----
export function similarOf(m: Moto, all: Moto[], n = 3): Moto[] {
  return all.filter((x) => x.id !== m.id && x.brand === m.brand)
    .concat(all.filter((x) => x.id !== m.id && x.brand !== m.brand))
    .slice(0, n);
}
export function relatedOf(g: GearItem, all: GearItem[], n = 2): GearItem[] {
  return all.filter((x) => x.id !== g.id && x.category === g.category)
    .concat(all.filter((x) => x.id !== g.id && x.category !== g.category))
    .slice(0, n);
}
