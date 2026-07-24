import { supabase } from "@/lib/db/supabase";
import type { Moto, GearItem, EventItem } from "@/lib/db/data";
import type { Order } from "@/lib/commerce/account";

// ---- DB мөр → TS төрөл map (snake_case → camelCase) ----

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapMoto(r: any): Moto {
  return {
    id: r.id, brand: r.brand, model: r.model, year: r.year, cc: r.cc, odo: r.odo,
    price: r.price, salePrice: r.sale_price ?? undefined, status: r.status, country: r.country, customs: r.customs,
    hp: r.hp, nm: r.nm, top: r.top_speed, weight: r.weight, cyl: r.cyl, gearbox: r.gearbox ?? "—",
    desc: r.description ?? "", extras: r.extras ?? [], images: r.images ?? [],
    video: r.video ?? undefined, featured: r.featured,
    descEn: r.description_en ?? undefined, extrasEn: r.extras_en ?? undefined,
  };
}
function mapGear(r: any): GearItem {
  return {
    id: r.id, name: r.name, category: r.category, brand: r.brand, meta: r.meta,
    price: r.price, oldPrice: r.old_price, rating: r.rating, reviews: r.reviews,
    sku: r.sku, desc: r.description ?? "", features: r.features ?? [],
    sizes: r.sizes?.length ? r.sizes : undefined,
    colors: r.colors?.length ? r.colors : undefined,
    images: r.images ?? [],
    bestSeller: r.best_seller,
    gender: r.gender ?? "unisex",
    nameEn: r.name_en ?? undefined, descEn: r.description_en ?? undefined,
    metaEn: r.meta_en ?? undefined, featuresEn: r.features_en ?? undefined,
  };
}
function mapEvent(r: any): EventItem {
  return {
    id: r.id, type: r.type, title: r.title, status: r.status, date: r.event_date, prize: r.prize,
    image: r.image ?? undefined, description: r.description ?? "", winner: r.winner ?? undefined,
    titleEn: r.title_en ?? undefined, descriptionEn: r.description_en ?? undefined, prizeEn: r.prize_en ?? undefined,
  };
}
function mapOrder(r: any): Order {
  return {
    id: r.id, date: r.order_date, item: r.item, qty: r.qty, total: r.total, status: r.status,
    paymentStatus: r.payment_status ?? undefined,
    shipCountry: r.ship_country ?? undefined, shipName: r.ship_name ?? undefined,
    shipPhone: r.ship_phone ?? undefined, shipAddress: r.ship_address ?? undefined,
    countryCode: r.country_code ?? undefined, deliveryMethod: r.delivery_method ?? undefined,
    trackingNumber: r.tracking_number ?? undefined,
  };
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
export async function getEvent(id: number): Promise<EventItem | null> {
  const { data } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  return data ? mapEvent(data) : null;
}

// ---- Event participants (оролцогчид) ----
export interface Participant { name: string; user_phone: string; created_at?: string }
export async function getParticipants(eventId: number): Promise<Participant[]> {
  const { data } = await supabase.from("event_participants").select("name,user_phone,created_at").eq("event_id", eventId).order("created_at");
  return (data ?? []) as Participant[];
}
export async function isJoined(eventId: number, phone: string): Promise<boolean> {
  const { data } = await supabase.from("event_participants").select("id").eq("event_id", eventId).eq("user_phone", phone).maybeSingle();
  return !!data;
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
  const orders = data ?? [];
  // захиалагчийн нэрийг profiles-аас холбох
  const phones = [...new Set(orders.map((o) => o.user_phone).filter(Boolean))];
  const names: Record<string, string> = {};
  if (phones.length) {
    const { data: profs } = await supabase.from("profiles").select("phone,name,first_name,last_name").in("phone", phones);
    (profs ?? []).forEach((p: { phone: string; name?: string; first_name?: string; last_name?: string }) => {
      names[p.phone] = [p.last_name, p.first_name].filter(Boolean).join(" ") || p.name || "";
    });
  }
  return orders.map((r) => ({ ...mapOrder(r), userPhone: r.user_phone ?? undefined, userName: names[r.user_phone] || undefined }));
}
export async function getUserOrders(phone: string): Promise<Order[]> {
  const { data } = await supabase.from("orders").select("*").eq("user_phone", phone).order("created_at", { ascending: false });
  return (data ?? []).map(mapOrder);
}

// ---- Order requests (Захиалгын хүсэлт) ----
export interface OrderRequest {
  id: string; category: string; detail: string; image?: string;
  status: string; quote?: string; date: string;
  name?: string; phone?: string; userPhone?: string;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRequest(r: any): OrderRequest {
  return {
    id: r.id, category: r.category, detail: r.detail, image: r.image ?? undefined,
    status: r.status, quote: r.quote ?? undefined,
    date: (r.created_at ?? "").slice(0, 10),
    name: r.name ?? undefined, phone: r.phone ?? undefined, userPhone: r.user_phone ?? undefined,
  };
}
export async function getOrderRequests(): Promise<OrderRequest[]> {
  const { data, error } = await supabase.from("order_requests").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRequest);
}
export async function getMyOrderRequests(phone: string): Promise<OrderRequest[]> {
  const { data } = await supabase.from("order_requests").select("*").eq("user_phone", phone).order("created_at", { ascending: false });
  return (data ?? []).map(mapRequest);
}

// ---- Tours (Аялал) + bookings ----
export interface Tour {
  id: number; title: string; description?: string; region?: string; image?: string;
  durationDays: number; startDate?: string; price: number; maxCapacity: number; booked: number;
  rentalAvailable: boolean; rentalMoto?: string; status: string; featured?: boolean;
  titleEn?: string; descriptionEn?: string; regionEn?: string;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTour(r: any): Tour {
  return {
    id: r.id, title: r.title, description: r.description ?? undefined, region: r.region ?? undefined,
    image: r.image ?? undefined, durationDays: r.duration_days, startDate: r.start_date ?? undefined,
    price: r.price, maxCapacity: r.max_capacity, booked: r.booked ?? 0,
    rentalAvailable: r.rental_available, rentalMoto: r.rental_moto ?? undefined,
    status: r.status, featured: r.featured ?? false,
    titleEn: r.title_en ?? undefined, descriptionEn: r.description_en ?? undefined, regionEn: r.region_en ?? undefined,
  };
}
export async function getTours(): Promise<Tour[]> {
  const { data, error } = await supabase.from("tours").select("*").order("start_date");
  if (error) throw error;
  return (data ?? []).map(mapTour);
}
export async function getTour(id: number): Promise<Tour | null> {
  const { data } = await supabase.from("tours").select("*").eq("id", id).maybeSingle();
  return data ? mapTour(data) : null;
}

// ---- Ride routes (аяллын маршрут — showcase, map pin) ----
export interface RideRoute {
  id: number; slug: string; sort: number;
  title: string; region?: string; summary?: string; distanceKm: number;
  duration?: string; difficulty?: string; road?: string; season?: string;
  startPlace?: string; destination?: string; coords?: string; mapX: number; mapY: number;
  gradient?: string; image?: string; imageAlt?: string;
  tags: string[]; stops: string[]; checklist: string[];
  titleEn?: string; regionEn?: string; summaryEn?: string;
  durationEn?: string; difficultyEn?: string; roadEn?: string; seasonEn?: string;
  imageAltEn?: string; tagsEn: string[]; stopsEn: string[]; checklistEn: string[];
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRideRoute(r: any): RideRoute {
  return {
    id: r.id, slug: r.slug, sort: r.sort ?? 0,
    title: r.title, region: r.region ?? undefined, summary: r.summary ?? undefined, distanceKm: r.distance_km ?? 0,
    duration: r.duration ?? undefined, difficulty: r.difficulty ?? undefined, road: r.road ?? undefined, season: r.season ?? undefined,
    startPlace: r.start_place ?? undefined, destination: r.destination ?? undefined, coords: r.coords ?? undefined,
    mapX: Number(r.map_x ?? 50), mapY: Number(r.map_y ?? 50),
    gradient: r.gradient ?? undefined, image: r.image ?? undefined, imageAlt: r.image_alt ?? undefined,
    tags: r.tags ?? [], stops: r.stops ?? [], checklist: r.checklist ?? [],
    titleEn: r.title_en ?? undefined, regionEn: r.region_en ?? undefined, summaryEn: r.summary_en ?? undefined,
    durationEn: r.duration_en ?? undefined, difficultyEn: r.difficulty_en ?? undefined, roadEn: r.road_en ?? undefined, seasonEn: r.season_en ?? undefined,
    imageAltEn: r.image_alt_en ?? undefined, tagsEn: r.tags_en ?? [], stopsEn: r.stops_en ?? [], checklistEn: r.checklist_en ?? [],
  };
}
export async function getRideRoutes(): Promise<RideRoute[]> {
  const { data, error } = await supabase.from("ride_routes").select("*").order("sort");
  if (error) throw error;
  return (data ?? []).map(mapRideRoute);
}

export interface TourBooking {
  id: string; tourId: number; tourTitle?: string; people: number;
  motoChoice: string; motoModel?: string; note?: string; total: number;
  status: string; date: string; name?: string; phone?: string; userPhone?: string;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTourBooking(r: any): TourBooking {
  return {
    id: r.id, tourId: r.tour_id, people: r.people, motoChoice: r.moto_choice,
    motoModel: r.moto_model ?? undefined, note: r.note ?? undefined, total: r.total,
    status: r.status, date: (r.created_at ?? "").slice(0, 10),
    name: r.name ?? undefined, phone: r.phone ?? undefined, userPhone: r.user_phone ?? undefined,
    tourTitle: r.tours?.title ?? undefined,
  };
}
export async function getTourBookings(): Promise<TourBooking[]> {
  const { data, error } = await supabase.from("tour_bookings").select("*, tours(title)").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapTourBooking);
}
export async function getMyTourBookings(phone: string): Promise<TourBooking[]> {
  const { data } = await supabase.from("tour_bookings").select("*, tours(title)").eq("user_phone", phone).order("created_at", { ascending: false });
  return (data ?? []).map(mapTourBooking);
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
