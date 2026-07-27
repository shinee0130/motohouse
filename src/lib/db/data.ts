// MOTO HOUSE — өгөгдөл (v1: hardcoded, дараа нь Supabase руу шилжих суурь)

export type MotoStatus = "Available" | "Reserved" | "Incoming" | "Sold";

// Статусын монгол label (хадгалах утга нь англиар, харуулахдаа монголоор)
export const MOTO_STATUS_LABEL: Record<MotoStatus, string> = {
  Available: "Бэлэн",
  Reserved: "Захиалагдсан",
  Incoming: "Замд яваа",
  Sold: "Зарагдсан",
};
export function statusLabel(s: string): string {
  return (MOTO_STATUS_LABEL as Record<string, string>)[s] ?? s;
}

export interface Moto {
  id: number;
  brand: string;
  model: string;
  year: string;
  cc: number;
  odo: number;
  price: number;
  salePrice?: number; // хямдарсан үнэ (байвал price дээр зураас, энэ нь идэвхтэй)
  status: MotoStatus;
  country: string;
  customs: string;
  hp: number;
  nm: number;
  top: number;
  weight: number;
  cyl: string;
  gearbox?: string;
  desc: string;
  extras: string[];
  images?: string[]; // бодит зураг (байвал placeholder-ийн оронд)
  video?: string; // видео URL
  featured?: boolean;
  descEn?: string; // англи хувилбар (хоосон бол desc)
  extrasEn?: string[];
}

export interface GearItem {
  id: number;
  name: string;
  category: string;
  brand: string;
  meta: string;
  price: number;
  oldPrice: number;
  rating: number;
  reviews: number;
  sku: string;
  desc: string;
  features: string[];
  sizes?: string[]; // зөвхөн хувцас/каск (apparel)
  colors?: string[];
  images?: string[];
  bestSeller?: boolean;
  gender?: string; // "unisex" | "women" | "men" — хэнд зориулсан (ангилал биш, шүүлт)
  nameEn?: string; // англи хувилбарууд (хоосон бол монголоор)
  descEn?: string;
  metaEn?: string;
  featuresEn?: string[];
}

export const SERVICES: string[] = [
  "Тос солих", "Дугуй солих", "Батерей солих", "Тормозны засвар", "Гинжний засвар",
  "Оношилгоо", "Яндан суурилуулах", "Ерөнхий засвар", "Custom тюнинг", "Импортын зөвлөгөө",
];

// Сэлбэгт тооцох ангиллууд — бусад нь хэрэгсэл (rider gear).
// Монголоор хадгална (EN горимд dict-ээр орчуулна).
export const PARTS_CATS = [
  "Яндан", "Тос (масло)", "Тосны шүүр", "Агаарын шүүр",
  "Батерей", "Лаа", "Дугуй", "Дугуйн гэр",
  "Гинж", "Гинжний од", "Тормозны сэвч", "Тормозны диск",
  "Тормозны шингэн", "Хөргөлтийн шингэн", "Гэрэл", "Холхивч",
  "Тросс / кабель", "Бусад сэлбэг",
];
export const isPart = (g: GearItem) => PARTS_CATS.includes(g.category);

// Хэнд зориулсан — ангилал БИШ, тусдаа шүүлт.
export const GENDERS: { v: string; mn: string; en: string }[] = [
  { v: "unisex", mn: "Унисекс", en: "Unisex" },
  { v: "women", mn: "Эмэгтэй", en: "Women" },
  { v: "men", mn: "Эрэгтэй", en: "Men" },
];

export interface EventItem {
  id: number;
  type: string;
  title: string;
  status: string;
  date: string;
  prize: string;
  image?: string;
  description?: string;
  winner?: string;
  titleEn?: string; // англи хувилбарууд
  descriptionEn?: string;
  prizeEn?: string;
}

// ===== Зураг авалт (photoshoot) =====
// Зурагчид одоо DB-д (photographers хүснэгт, queries.ts::getPhotographers).
// Үйлчилгээний төрлүүд нь тогтмол багц хэвээр:
export const PHOTO_SERVICES: string[] = [
  "Мотоциклын зураг", "Reel бичлэг", "Видео шут", "Экшн бичлэг", "Студи зураг",
];

// ---- helpers ----

export function fmt(n: number): string {
  return n.toLocaleString("en-US") + "₮";
}

export function badge(status: string): string {
  if (status === "Available")
    return "font:700 11px Montserrat;letter-spacing:.08em;color:#fff;background:#E10613;padding:6px 12px;border-radius:6px;";
  if (status === "Winner" || status === "Ongoing")
    return "font:700 11px Montserrat;letter-spacing:.08em;color:#fff;background:#FF1E1E;padding:6px 12px;border-radius:6px;";
  return "font:700 11px Montserrat;letter-spacing:.08em;color:#A3A3A3;background:rgba(0,0,0,.55);border:1px solid #333;padding:6px 12px;border-radius:6px;";
}

