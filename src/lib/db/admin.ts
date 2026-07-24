"use client";

import { supabase, SUPABASE_URL, SUPABASE_KEY } from "@/lib/db/supabase";
import type { Moto, GearItem, EventItem } from "@/lib/db/data";
import type { Tour, RideRoute } from "@/lib/db/queries";

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
    description_en: m.descEn || null, extras_en: m.extrasEn ?? null,
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
    gender: g.gender || "unisex",
    name_en: g.nameEn || null, description_en: g.descEn || null,
    meta_en: g.metaEn || null, features_en: g.featuresEn ?? null,
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
    title_en: e.titleEn || null, description_en: e.descriptionEn || null, prize_en: e.prizeEn || null,
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
export async function updateOrderTracking(id: string, trackingNumber: string) {
  const { error } = await supabase.from("orders").update({ tracking_number: trackingNumber.trim() || null }).eq("id", id);
  if (error) throw error;
}

export async function updateOrderStatus(id: string, status: string) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}

// Хэрэглэгчийн захиалга үүсгэх (detail хуудаснаас)
export async function createOrder(o: {
  userPhone: string; item: string; total: number; transactionId?: string;
  shipCountry?: string; shipName?: string; shipPhone?: string; shipAddress?: string;
  countryCode?: string; deliveryMethod?: string;
}): Promise<string> {
  const id = `MH-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 5)}`;
  const d = new Date();
  const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  const { error } = await supabase.from("orders").insert({
    id, user_phone: o.userPhone, item: o.item, qty: 1, total: o.total,
    status: "Хүлээгдэж буй", order_date: date, transaction_id: o.transactionId || null,
    ship_country: o.shipCountry || null, ship_name: o.shipName || null,
    ship_phone: o.shipPhone || null, ship_address: o.shipAddress || null,
    country_code: o.countryCode || null, delivery_method: o.deliveryMethod || null,
  });
  if (error) throw error;
  return id;
}

// Bonum төлбөрийн invoice үүсгэх — bonum-invoice Edge Function дуудна.
// Дүнг сервер тал (edge function) DB-ийн захиалгаас авдаг тул энд дамжуулахгүй.
export async function createBonumInvoice(transactionId: string): Promise<{ followUpLink: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("Нэвтрэлт шаардлагатай. Дахин нэвтэрнэ үү.");
  const res = await fetch(`${SUPABASE_URL}/functions/v1/bonum-invoice`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ transactionId }),
  });
  let json: { followUpLink?: string; error?: string } = {};
  try { json = await res.json(); } catch {}
  if (!res.ok || !json.followUpLink) throw new Error(json.error || `Төлбөрийн хуудас үүсгэхэд алдаа (${res.status})`);
  return { followUpLink: json.followUpLink };
}

// ===== Order requests (Захиалгын хүсэлт — үнийн санал) =====
export async function createOrderRequest(r: {
  userPhone: string; name: string; phone: string; category: string; detail: string; image?: string;
}): Promise<string> {
  const id = `REQ-${Date.now().toString().slice(-6)}`;
  const { error } = await supabase.from("order_requests").insert({
    id, user_phone: r.userPhone, name: r.name, phone: r.phone,
    category: r.category, detail: r.detail, image: r.image || null, status: "Шинэ",
  });
  if (error) throw error;
  return id;
}
export async function updateOrderRequest(id: string, patch: { status?: string; quote?: string }) {
  const { error } = await supabase.from("order_requests").update(patch).eq("id", id);
  if (error) throw error;
}
export async function uploadRequestImage(file: File): Promise<string> {
  return uploadTo("requests", file);
}

// ===== Tours (Аялал) =====
function tourRow(t: Partial<Tour>): any {
  return {
    title: t.title, description: t.description ?? null, region: t.region ?? null, image: t.image ?? null,
    duration_days: t.durationDays ?? 1, start_date: t.startDate ?? null, price: t.price ?? 0,
    max_capacity: t.maxCapacity ?? 10, rental_available: t.rentalAvailable ?? true,
    rental_moto: t.rentalMoto ?? null, status: t.status ?? "Нээлттэй", featured: t.featured ?? false,
    title_en: t.titleEn || null, description_en: t.descriptionEn || null, region_en: t.regionEn || null,
  };
}
export async function createTour(t: Partial<Tour>) {
  const { error } = await supabase.from("tours").insert(tourRow(t));
  if (error) throw error;
}
export async function updateTour(id: number, t: Partial<Tour>) {
  const { error } = await supabase.from("tours").update(tourRow(t)).eq("id", id);
  if (error) throw error;
}
export async function deleteTour(id: number) {
  const { error } = await supabase.from("tours").delete().eq("id", id);
  if (error) throw error;
}
export async function uploadTourImage(file: File): Promise<string> {
  return uploadTo("tours", file);
}

// ===== Ride routes (аяллын маршрут) =====
function routeRow(r: Partial<RideRoute>): any {
  return {
    slug: r.slug, sort: r.sort ?? 0,
    title: r.title, region: r.region ?? null, summary: r.summary ?? null, distance_km: r.distanceKm ?? 0,
    duration: r.duration ?? null, difficulty: r.difficulty ?? null, road: r.road ?? null, season: r.season ?? null,
    start_place: r.startPlace ?? null, destination: r.destination ?? null, coords: r.coords ?? null,
    map_x: r.mapX ?? 50, map_y: r.mapY ?? 50,
    gradient: r.gradient ?? null, image: r.image ?? null, image_alt: r.imageAlt ?? null,
    tags: r.tags ?? [], stops: r.stops ?? [], checklist: r.checklist ?? [],
    title_en: r.titleEn || null, region_en: r.regionEn || null, summary_en: r.summaryEn || null,
    duration_en: r.durationEn || null, difficulty_en: r.difficultyEn || null, road_en: r.roadEn || null, season_en: r.seasonEn || null,
    image_alt_en: r.imageAltEn || null, tags_en: r.tagsEn ?? [], stops_en: r.stopsEn ?? [], checklist_en: r.checklistEn ?? [],
  };
}
export async function createRideRoute(r: Partial<RideRoute>) {
  const { error } = await supabase.from("ride_routes").insert(routeRow(r));
  if (error) throw error;
}
export async function updateRideRoute(id: number, r: Partial<RideRoute>) {
  const { error } = await supabase.from("ride_routes").update(routeRow(r)).eq("id", id);
  if (error) throw error;
}
export async function deleteRideRoute(id: number) {
  const { error } = await supabase.from("ride_routes").delete().eq("id", id);
  if (error) throw error;
}
export async function uploadRouteImage(file: File): Promise<string> {
  return uploadTo("routes", file);
}
// Хэрэглэгчийн аяллын booking. Багтаамж хэтэрвэл DB trigger алдаа өгнө → "TOUR_FULL".
export async function createTourBooking(b: {
  tourId: number; userPhone: string; name: string; phone: string;
  people: number; motoChoice: string; motoModel?: string; note?: string; total: number;
}): Promise<string> {
  const id = `TB-${Date.now().toString().slice(-6)}`;
  const { error } = await supabase.from("tour_bookings").insert({
    id, tour_id: b.tourId, user_phone: b.userPhone, name: b.name, phone: b.phone,
    people: b.people, moto_choice: b.motoChoice, moto_model: b.motoModel || null,
    note: b.note || null, total: b.total, status: "Шинэ",
  });
  if (error) {
    if ((error.message || "").includes("TOUR_FULL")) throw new Error("TOUR_FULL");
    throw error;
  }
  return id;
}
export async function updateTourBookingStatus(id: string, status: string) {
  const { error } = await supabase.from("tour_bookings").update({ status }).eq("id", id);
  if (error) throw error;
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

// ===== Зураг авалт захиалга (photo_bookings) =====
export interface PhotoBooking {
  id: number; photographer: string; service_type: string; booking_date: string; booking_time: string;
  name: string; phone: string; moto_model?: string; note?: string;
  status: string; user_phone?: string; created_at?: string;
}
export async function createPhotoBooking(b: {
  photographer: string; service_type: string; booking_date: string; booking_time: string;
  name: string; phone: string; moto_model?: string; note?: string; user_phone?: string;
}) {
  const { error } = await supabase.from("photo_bookings").insert({ ...b, status: "Шинэ" });
  if (error) throw error;
}
export async function getPhotoBookings(): Promise<PhotoBooking[]> {
  const { data } = await supabase.from("photo_bookings").select("*").order("created_at", { ascending: false });
  return (data ?? []) as PhotoBooking[];
}
export async function updatePhotoBookingStatus(id: number, status: string) {
  await supabase.from("photo_bookings").update({ status }).eq("id", id);
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
  role: string; tier?: string; spent?: number; email?: string; created_at?: string;
}
// Admin: хэрэглэгчийн эрх (customer/admin) солих
export async function setUserRole(id: string, role: string) {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
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
  const profs = (data ?? []) as Profile[];
  // Хэрэглэгч тус бүрийн нийт худалдан авалт (цуцлагдаагүй захиалга)
  const { data: orders } = await supabase.from("orders").select("user_phone,total,status");
  const spent: Record<string, number> = {};
  (orders ?? []).forEach((o: { user_phone: string; total: number; status: string }) => {
    if (o.status !== "Цуцлагдсан") spent[o.user_phone] = (spent[o.user_phone] ?? 0) + (o.total ?? 0);
  });
  return profs.map((p) => ({ ...p, spent: spent[p.phone] ?? 0 }));
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
// Storage-д зураг байршуулах — `admin-upload` Edge Function-оор дамжуулна.
// (Энэ project-ийн storage-api нь client-ийн нэвтрэлтийг зөв танихгүй тул
//  upload шууд RLS-д унадаг байсан. Edge function caller-ийг admin эсэхийг
//  шалгаад service_role-оор байршуулж, эвдэрсэн замыг тойрдог.) public URL буцаана.
async function rawUpload(path: string, file: File): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("Нэвтрэлт хүчингүй байна. Дахин нэвтэрнэ үү.");
  const form = new FormData();
  form.append("path", path);
  form.append("file", file);
  const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_KEY },
    body: form,
  });
  let json: { url?: string; error?: string } = {};
  try { json = await res.json(); } catch {}
  if (!res.ok || !json.url) throw new Error(json.error || `Upload failed (${res.status})`);
  return json.url;
}

export async function uploadSiteImage(file: File, path: string): Promise<string> {
  const url = await rawUpload(path, file);
  return `${url}?v=${Date.now()}`;
}

// Зураг/видео storage-д upload хийж public URL буцаана.
async function uploadTo(folder: string, file: File, ext?: string): Promise<string> {
  const e = ext || file.name.split(".").pop() || "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${e}`;
  return rawUpload(path, file);
}
export function uploadMoto(file: File, kind: "img" | "video"): Promise<string> {
  return uploadTo("motos", file, kind === "video" ? (file.name.split(".").pop() || "mp4") : undefined);
}
export function uploadGear(file: File): Promise<string> {
  return uploadTo("gear", file);
}
/* eslint-enable @typescript-eslint/no-explicit-any */
