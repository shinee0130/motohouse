"use client";

import { supabase } from "./supabase";
import type { Moto, GearItem, EventItem } from "./data";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ===== Motorcycles =====
function motoRow(m: Partial<Moto>): any {
  return {
    brand: m.brand, model: m.model, year: m.year, cc: m.cc, odo: m.odo, price: m.price,
    sale_price: m.salePrice ?? null,
    status: m.status, country: m.country, customs: m.customs, hp: m.hp, nm: m.nm,
    top_speed: m.top, weight: m.weight, cyl: m.cyl, gearbox: m.gearbox ?? null, description: m.desc,
    extras: m.extras ?? [], images: m.images ?? [], video: m.video ?? null,
    featured: m.featured ?? false,
  };
}
export async function createMoto(m: Partial<Moto>) {
  const { error } = await supabase.from("motorcycles").insert(motoRow(m));
  if (error) throw error;
}
export async function updateMoto(id: number, m: Partial<Moto>) {
  const { error } = await supabase.from("motorcycles").update(motoRow(m)).eq("id", id);
  if (error) throw error;
}
export async function deleteMoto(id: number) {
  const { error } = await supabase.from("motorcycles").delete().eq("id", id);
  if (error) throw error;
}

// ===== Gear =====
function gearRow(g: Partial<GearItem>): any {
  return {
    name: g.name, category: g.category, brand: g.brand, meta: g.meta,
    price: g.price, old_price: g.oldPrice, rating: g.rating, reviews: g.reviews,
    sku: g.sku, description: g.desc, features: g.features ?? [],
    sizes: g.sizes ?? [], colors: g.colors ?? [], images: g.images ?? [],
    best_seller: g.bestSeller ?? false,
  };
}
export async function createGear(g: Partial<GearItem>) {
  const { error } = await supabase.from("gear").insert(gearRow(g));
  if (error) throw error;
}
export async function updateGear(id: number, g: Partial<GearItem>) {
  const { error } = await supabase.from("gear").update(gearRow(g)).eq("id", id);
  if (error) throw error;
}
export async function deleteGear(id: number) {
  const { error } = await supabase.from("gear").delete().eq("id", id);
  if (error) throw error;
}

// ===== Events =====
function eventRow(e: Partial<EventItem>): any {
  return {
    type: e.type, title: e.title, status: e.status, event_date: e.date, prize: e.prize,
    image: e.image ?? null, description: e.description ?? "", winner: e.winner ?? null,
  };
}
export function uploadEvent(file: File): Promise<string> {
  return uploadTo("events", file);
}
// Оролцох / гарах
export async function joinEvent(eventId: number, phone: string, name: string) {
  await supabase.from("event_participants").upsert({ event_id: eventId, user_phone: phone, name }, { onConflict: "event_id,user_phone" });
}
export async function leaveEvent(eventId: number, phone: string) {
  await supabase.from("event_participants").delete().eq("event_id", eventId).eq("user_phone", phone);
}
export async function createEvent(e: Partial<EventItem>) {
  const { error } = await supabase.from("events").insert(eventRow(e));
  if (error) throw error;
}
export async function updateEvent(id: number, e: Partial<EventItem>) {
  const { error } = await supabase.from("events").update(eventRow(e)).eq("id", id);
  if (error) throw error;
}
export async function deleteEvent(id: number) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}

// ===== Orders =====
export async function updateOrderStatus(id: string, status: string) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}

// Хэрэглэгчийн захиалга үүсгэх (detail хуудаснаас)
export async function createOrder(o: { userPhone: string; item: string; total: number }): Promise<string> {
  const id = `MH-${Date.now().toString().slice(-6)}`;
  const d = new Date();
  const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  const { error } = await supabase.from("orders").insert({
    id, user_phone: o.userPhone, item: o.item, qty: 1, total: o.total,
    status: "Хүлээгдэж буй", order_date: date,
  });
  if (error) throw error;
  return id;
}

// ===== Service bookings (Засварын цаг захиалга) =====
export interface Booking {
  id: number; service_type: string; booking_date: string; booking_time: string;
  name: string; phone: string; moto_model?: string; note?: string;
  status: string; user_phone?: string; created_at?: string;
}
export async function createBooking(b: {
  service_type: string; booking_date: string; booking_time: string;
  name: string; phone: string; moto_model?: string; note?: string; user_phone?: string;
}) {
  const { error } = await supabase.from("service_bookings").insert({ ...b, status: "Шинэ" });
  if (error) throw error;
}
export async function getBookings(): Promise<Booking[]> {
  const { data } = await supabase.from("service_bookings").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Booking[];
}
export async function updateBookingStatus(id: number, status: string) {
  await supabase.from("service_bookings").update({ status }).eq("id", id);
}

// ===== Saved (Хадгалсан) =====
export async function setSaved(phone: string, kind: "gear" | "moto", itemId: number, on: boolean) {
  if (on) {
    await supabase.from("saved").upsert({ user_phone: phone, kind, item_id: itemId }, { onConflict: "user_phone,kind,item_id" });
  } else {
    await supabase.from("saved").delete().eq("user_phone", phone).eq("kind", kind).eq("item_id", itemId);
  }
}

// ===== Profiles (бүртгэлтэй хэрэглэгчид) =====
export interface Profile {
  id: string; phone: string; name: string; first_name?: string; last_name?: string;
  role: string; tier?: string; email?: string; created_at?: string;
}
// Admin: хэрэглэгчийн эрх (customer/admin) солих
export async function setUserRole(id: string, role: string) {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) throw error;
}
// Admin: хэрэглэгчийн түвшин (bronze/silver/gold/vip) солих
export async function setUserTier(id: string, tier: string) {
  const { error } = await supabase.from("profiles").update({ tier }).eq("id", id);
  if (error) throw error;
}
export async function upsertProfile(p: {
  id: string; phone: string; name: string; role: string;
  first_name?: string; last_name?: string; email?: string;
}) {
  await supabase.from("profiles").upsert(p, { onConflict: "id" });
}
export async function getProfiles(): Promise<Profile[]> {
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  return (data ?? []) as Profile[];
}

// ===== Settings (home backgrounds) =====
export async function getSettingsMap(): Promise<Record<string, string>> {
  const { data } = await supabase.from("settings").select("*");
  const o: Record<string, string> = {};
  (data ?? []).forEach((r: any) => (o[r.key] = r.value));
  return o;
}
export async function updateSetting(key: string, value: string) {
  await supabase.from("settings").upsert({ key, value }, { onConflict: "key" });
}
export async function uploadSiteImage(file: File, path: string): Promise<string> {
  const { error } = await supabase.storage.from("site").upload(path, file, { upsert: true, cacheControl: "3600" });
  if (error) throw error;
  const { data } = supabase.storage.from("site").getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

// Зураг/видео storage-д upload хийж public URL буцаана.
async function uploadTo(folder: string, file: File, ext?: string): Promise<string> {
  const e = ext || file.name.split(".").pop() || "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${e}`;
  const { error } = await supabase.storage.from("site").upload(path, file, { upsert: true, cacheControl: "3600", contentType: file.type || undefined });
  if (error) throw error;
  const { data } = supabase.storage.from("site").getPublicUrl(path);
  return data.publicUrl;
}
export function uploadMoto(file: File, kind: "img" | "video"): Promise<string> {
  return uploadTo("motos", file, kind === "video" ? (file.name.split(".").pop() || "mp4") : undefined);
}
export function uploadGear(file: File): Promise<string> {
  return uploadTo("gear", file);
}
/* eslint-enable @typescript-eslint/no-explicit-any */
