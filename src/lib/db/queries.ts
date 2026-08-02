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
    imageColors: r.image_colors ?? {},
    bestSeller: r.best_seller,
    kind: r.kind === "part" ? "part" : "gear",
    gender: r.gender ?? "unisex",
    nameEn: r.name_en ?? undefined, descEn: r.description_en ?? undefined,
    metaEn: r.meta_en ?? undefined, featuresEn: r.features_en ?? undefined,
  };
}
function mapEvent(r: any): EventItem {
  return {
    id: r.id, type: r.type, title: r.title, status: r.status, date: r.event_date, prize: r.prize,
    image: r.image ?? undefined, description: r.description ?? "", winner: r.winner ?? undefined,
    location: r.location ?? undefined,
    titleEn: r.title_en ?? undefined, descriptionEn: r.description_en ?? undefined, prizeEn: r.prize_en ?? undefined,
  };
}
function mapOrder(r: any): Order {
  return {
    id: r.id, date: r.order_date, item: r.item, qty: r.qty, total: r.total, status: r.status,
    paymentStatus: r.payment_status ?? undefined,
    transactionId: r.transaction_id ?? undefined,
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

// ---- Event / Meeting галерей (зураг, видео) ----
export interface EventMedia {
  id: number; eventId: number; kind: "photo" | "video";
  url: string; thumb?: string; caption?: string; sort: number;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMedia(r: any): EventMedia {
  return {
    id: r.id, eventId: r.event_id, kind: r.kind === "video" ? "video" : "photo",
    url: r.url, thumb: r.thumb ?? undefined, caption: r.caption ?? undefined, sort: r.sort ?? 0,
  };
}
export async function getEventMedia(eventId: number): Promise<EventMedia[]> {
  const { data } = await supabase.from("event_media").select("*")
    .eq("event_id", eventId).order("sort").order("id");
  return (data ?? []).map(mapMedia);
}
// Жагсаалтын хуудсанд бүх уулзалтын медиаг нэг дор (тоо харуулахад).
export async function getEventMediaCounts(): Promise<Record<number, number>> {
  const { data } = await supabase.from("event_media").select("event_id");
  const o: Record<number, number> = {};
  (data ?? []).forEach((r: { event_id: number }) => { o[r.event_id] = (o[r.event_id] ?? 0) + 1; });
  return o;
}

// ---- Event / Meeting хамтрагч байгууллагууд ----
export interface EventPartner {
  id: number; eventId: number; name: string;
  role?: string; logo?: string; url?: string; sort: number;
}
export async function getEventPartners(eventId: number): Promise<EventPartner[]> {
  const { data } = await supabase.from("event_partners").select("*")
    .eq("event_id", eventId).order("sort").order("id");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => ({
    id: r.id, eventId: r.event_id, name: r.name,
    role: r.role ?? undefined, logo: r.logo ?? undefined, url: r.url ?? undefined, sort: r.sort ?? 0,
  }));
}

// Жагсаалтын хуудсанд бүх уулзалтын хамтрагчийг нэг дор (карт дээр логог нь харуулна).
export async function getEventPartnersMap(): Promise<Record<number, EventPartner[]>> {
  const { data } = await supabase.from("event_partners").select("*").order("sort").order("id");
  const o: Record<number, EventPartner[]> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (data ?? []).forEach((r: any) => {
    const p: EventPartner = {
      id: r.id, eventId: r.event_id, name: r.name,
      role: r.role ?? undefined, logo: r.logo ?? undefined, url: r.url ?? undefined, sort: r.sort ?? 0,
    };
    (o[p.eventId] ??= []).push(p);
  });
  return o;
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

// ---- Photographers (Зурагчид) ----
export interface PhotographerWork {
  id: number; photographerId: number; kind: string; url: string;
  thumb?: string; caption?: string; captionEn?: string; sort: number;
}
export interface PhotographerService { name: string; nameEn?: string; price?: number }
export interface Photographer {
  id: number; name: string; nameEn?: string; specialty?: string; specialtyEn?: string;
  tags: string[]; avatar?: string; bio?: string; bioEn?: string; price?: string;
  instagram?: string; facebook?: string; tiktok?: string; youtube?: string;
  services: PhotographerService[]; dailyLimit: number;
  sort: number; active: boolean; userId?: string; works?: PhotographerWork[];
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapWork(r: any): PhotographerWork {
  return { id: r.id, photographerId: r.photographer_id, kind: r.kind ?? "photo", url: r.url,
    thumb: r.thumb ?? undefined, caption: r.caption ?? undefined, captionEn: r.caption_en ?? undefined, sort: r.sort ?? 0 };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPhotographer(r: any): Photographer {
  return {
    id: r.id, name: r.name, nameEn: r.name_en ?? undefined, specialty: r.specialty ?? undefined, specialtyEn: r.specialty_en ?? undefined,
    tags: r.tags ?? [], avatar: r.avatar ?? undefined, bio: r.bio ?? undefined, bioEn: r.bio_en ?? undefined, price: r.price ?? undefined,
    instagram: r.instagram ?? undefined, facebook: r.facebook ?? undefined, tiktok: r.tiktok ?? undefined, youtube: r.youtube ?? undefined,
    services: Array.isArray(r.services) ? (r.services as PhotographerService[]) : [],
    dailyLimit: r.daily_limit ?? 3,
    sort: r.sort ?? 0, active: r.active ?? true, userId: r.user_id ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    works: r.photographer_works ? (r.photographer_works as any[]).map(mapWork).sort((a, b) => a.sort - b.sort) : undefined,
  };
}
// Нийтэд — зөвхөн идэвхтэй (RLS ч active-аар шүүнэ)
export async function getPhotographers(): Promise<Photographer[]> {
  const { data, error } = await supabase.from("photographers").select("*").eq("active", true).order("sort");
  if (error) throw error;
  return (data ?? []).map(mapPhotographer);
}
// Admin — бүгд
export async function getAllPhotographers(): Promise<Photographer[]> {
  const { data } = await supabase.from("photographers").select("*").order("sort");
  return (data ?? []).map(mapPhotographer);
}
// Дэлгэрэнгүй + портфолио (works)
export async function getPhotographer(id: number): Promise<Photographer | null> {
  const { data } = await supabase.from("photographers").select("*, photographer_works(*)").eq("id", id).maybeSingle();
  return data ? mapPhotographer(data) : null;
}
// Нэвтэрсэн зурагчны ӨӨРИЙН профайл (studio)
export async function getMyPhotographer(): Promise<Photographer | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("photographers").select("*, photographer_works(*)").eq("user_id", user.id).maybeSingle();
  return data ? mapPhotographer(data) : null;
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

// ---- Bonum төлбөрийн лог (зөвхөн админ уншина — RLS) ----
export type BonumEvent = {
  id: number;
  createdAt: string;
  type: string | null;
  status: string | null;
  transactionId: string | null;
  invoiceId: string | null;
  payload: unknown;
  notifyStatus: string | null; // имэйл мэдэгдлийн үр дүн (sent / skipped: … / error: …)
};
export async function getBonumEvents(limit = 200): Promise<BonumEvent[]> {
  const { data } = await supabase.from("bonum_events").select("*")
    .order("created_at", { ascending: false }).limit(limit);
  return (data ?? []).map((r) => ({
    id: r.id, createdAt: r.created_at, type: r.type, status: r.status,
    transactionId: r.transaction_id, invoiceId: r.invoice_id, payload: r.payload,
    notifyStatus: r.notify_status ?? null,
  }));
}

// ---- Мэдэгдэл (notifications) ----
// Мөрүүдийг DB-ийн trigger үүсгэдэг. RLS: хэрэглэгч зөвхөн өөрийнхөө
// мэдэгдлийг, админ бүгдийг харна — тиймээс энд шүүлт нэмэх шаардлагагүй.
export interface AppNotification {
  id: number; audience: "admin" | "user"; kind: string;
  title: string; body?: string; refTable?: string; refId?: string;
  readAt?: string; createdAt: string;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapNotification(r: any): AppNotification {
  return {
    id: r.id, audience: r.audience, kind: r.kind, title: r.title,
    body: r.body ?? undefined, refTable: r.ref_table ?? undefined, refId: r.ref_id ?? undefined,
    readAt: r.read_at ?? undefined, createdAt: r.created_at,
  };
}
export async function getNotifications(limit = 30): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications").select("*")
    .order("created_at", { ascending: false }).limit(limit);
  if (error) return []; // нэвтрээгүй үед RLS хоосон буцаана — хонх зүгээр л хоосон
  return (data ?? []).map(mapNotification);
}
export async function markNotificationRead(id: number) {
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
}
export async function markAllNotificationsRead(ids: number[]) {
  if (ids.length === 0) return;
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", ids);
}
