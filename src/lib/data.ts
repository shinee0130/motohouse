// MOTO HOUSE — өгөгдөл (v1: hardcoded, дараа нь Supabase руу шилжих суурь)

export type MotoStatus = "Available" | "Reserved" | "Incoming";

// Статусын монгол label (хадгалах утга нь англиар, харуулахдаа монголоор)
export const MOTO_STATUS_LABEL: Record<MotoStatus, string> = {
  Available: "Бэлэн",
  Reserved: "Захиалагдсан",
  Incoming: "Замд яваа",
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
}

const ZX10R_IMAGES = [
  "/assets/motos/zx10r/front-right.webp",
  "/assets/motos/zx10r/right.webp",
  "/assets/motos/zx10r/front.webp",
  "/assets/motos/zx10r/rightback.webp",
  "/assets/motos/zx10r/dashboard.webp",
  "/assets/motos/zx10r/gauge.webp",
];

export const MOTOS: Moto[] = [
  { id: 1, brand: "Kawasaki", model: "Ninja ZX-10R", year: "2022 / 2024", cc: 998, odo: 15000, price: 60000000, status: "Available", country: "Япон", customs: "Гаальтай", hp: 203, nm: 114, top: 299, weight: 207, cyl: "Inline-4", desc: "Track-focused superbike. Carbon тоноглол, Akrapovic 2 full exhaust, AR exhaust, улаан wrap зэрэг тюнинг хийгдсэн flagship. Гаальтай, 15,000км яваа.", extras: ["Carbon details", "Akrapovic 2× full exhaust", "AR exhaust", "Улаан wrap (хуулга)", "Гэх мэт тоноглол"], images: ZX10R_IMAGES },
  { id: 2, brand: "Yamaha", model: "YZF-R7", year: "2021 / 2026", cc: 689, odo: 6100, price: 23000000, status: "Reserved", country: "Япон", customs: "Гаальтай", hp: 73, nm: 67, top: 210, weight: 188, cyl: "CP2 Twin", desc: "CP2 twin engine, агуу хяналт, өдөр тутам болон track-д тохиромжтой sport bike.", extras: ["Yoshimura slip-on", "Tail tidy", "Crash bobbins", "Frame slider"] },
  { id: 3, brand: "Kawasaki", model: "Ninja ZX-4R", year: "2025 / 2026", cc: 399, odo: 0, price: 25000000, status: "Incoming", country: "Япон", customs: "Гаальтай", hp: 80, nm: 39, top: 200, weight: 189, cyl: "Inline-4", desc: "400cc 4 cylinder, өндөр эргэлттэй inline-4, шинэ үеийн lightweight супер спорт.", extras: ["Quickshifter", "Fender eliminator", "Tank grips"] },
  { id: 4, brand: "Honda", model: "CBR650R", year: "2023 / 2024", cc: 649, odo: 9800, price: 32000000, status: "Available", country: "Япон", customs: "Гаальтай", hp: 94, nm: 64, top: 235, weight: 208, cyl: "Inline-4", desc: "Inline-4 middleweight, тав тухтай ergonomics, өдөр тутмын ride-д тохиромжтой.", extras: ["Two Brothers exhaust", "Tank grips", "Bar end mirrors"] },
  { id: 5, brand: "Ducati", model: "Panigale V2", year: "2022 / 2023", cc: 955, odo: 5400, price: 78000000, status: "Available", country: "Итали", customs: "Гаальтай", hp: 155, nm: 104, top: 270, weight: 200, cyl: "Superquadro Twin", desc: "Italian superbike, 955cc Superquadro twin, premium electronics, racing DNA.", extras: ["Termignoni exhaust", "Carbon fairing", "Rizoma mirrors", "Billet levers"] },
  { id: 6, brand: "BMW", model: "S 1000 RR", year: "2021 / 2022", cc: 999, odo: 12300, price: 72000000, status: "Reserved", country: "Герман", customs: "Гаальтай", hp: 207, nm: 113, top: 303, weight: 197, cyl: "Inline-4", desc: "German engineering, 999cc inline-4, ShiftCam, track-ready electronics package.", extras: ["Akrapovic titanium", "Carbon wheels", "M package", "Quickshifter Pro"] },
  { id: 7, brand: "Kawasaki", model: "Z900", year: "2023 / 2024", cc: 948, odo: 7600, price: 36000000, status: "Available", country: "Япон", customs: "Гаальтай", hp: 125, nm: 99, top: 240, weight: 212, cyl: "Inline-4", desc: "Naked streetfighter, 948cc inline-4, aggressive Sugomi дизайн, өдөр тутмын хүч.", extras: ["Akrapovic exhaust", "LED indicators", "Tail tidy"] },
  { id: 8, brand: "Yamaha", model: "MT-09", year: "2024 / 2025", cc: 889, odo: 2100, price: 38000000, status: "Incoming", country: "Япон", customs: "Гаальтай", hp: 119, nm: 93, top: 230, weight: 189, cyl: "CP3 Triple", desc: "CP3 triple, hyper-naked, торх шиг torque, шинэ үеийн electronics.", extras: ["Akrapovic GP exhaust", "Quickshifter", "Tail tidy", "Radiator guard"] },
  { id: 9, brand: "Honda", model: "CB650R", year: "2022 / 2023", cc: 649, odo: 11200, price: 30000000, status: "Available", country: "Япон", customs: "Гаальтай", hp: 94, nm: 63, top: 230, weight: 202, cyl: "Inline-4", desc: "Neo Sports Café naked, inline-4, цэвэрхэн minimal дизайн, тэнцвэртэй ride.", extras: ["SC Project exhaust", "Bar end mirrors", "Tank grips"] },
];

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
  bestSeller?: boolean;
}

export const GEAR: GearItem[] = [
  {
    id: 1, name: "NEXX X.WST3", category: "Helmet", brand: "NEXX", meta: "ECE 22.06 · Carbon shell",
    price: 2900000, oldPrice: 3400000, rating: 5, reviews: 42, sku: "NX-WST3-CB", bestSeller: true,
    desc: "Carbon shell бүхий хөнгөн full-face каск. ECE 22.06 стандарт, агааржуулалт сайтай, урт замын аялалд тав тухтай.",
    features: ["X-Matrix Carbon бүрхүүл", "ECE 22.06 баталгаа", "Pinlock бэлэн visor", "Хурдан салгагддаг доторлогоо", "Жин: 1,350г ±50г"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"], colors: ["Хар", "Цагаан", "Саарал"],
  },
  {
    id: 2, name: "Shoei GT-Air 3", category: "Helmet", brand: "Shoei", meta: "Touring · Sun visor",
    price: 2400000, oldPrice: 2750000, rating: 5, reviews: 58, sku: "SH-GTA3-MB", bestSeller: true,
    desc: "Touring-д зориулсан дотоод нарны visor-той каск. Чимээ багатай, агааржуулалт сайн, өдөр тутмын ride-д тохиромжтой.",
    features: ["Дотоод нарны visor", "AIM шилэн утаслаг бүрхүүл", "Pinlock EVO линз", "Сайжруулсан агааржуулалт", "Bluetooth-д бэлэн"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"], colors: ["Matte хар", "Цагаан", "Цэнхэр"],
  },
  {
    id: 3, name: "Alpinestars GP Pro", category: "Jacket", brand: "Alpinestars", meta: "Leather · CE armor",
    price: 1800000, oldPrice: 2200000, rating: 4, reviews: 37, sku: "AS-GPPRO-BK",
    desc: "Арьсан sport хүрэм, CE баталгаатай хамгаалалттай. Track болон замын ride-д тохиромжтой, agressive fit.",
    features: ["Premium үхрийн арьс", "CE Level 2 мөр/тохой хамгаалалт", "Нурууны хамгаалалт суулгах боломжтой", "Агааржуулалтын панель", "Стрейч оруулга"],
    sizes: ["S", "M", "L", "XL", "XXL", "3XL"], colors: ["Хар", "Хар/Улаан", "Хар/Цагаан"],
  },
  {
    id: 4, name: "Dainese Carbon 4", category: "Gloves", brand: "Dainese", meta: "Carbon knuckle · Long",
    price: 550000, oldPrice: 690000, rating: 5, reviews: 64, sku: "DN-CRB4-LB",
    desc: "Carbon knuckle хамгаалалттай урт ханцуйтай бээлий. Sport ride-д зориулсан, мэдрэмж сайтай.",
    features: ["Carbon knuckle хамгаалалт", "Ямаан арьсан алга", "Touchscreen хуруу", "Урт ханцуй cuff", "CE баталгаа"],
    sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Хар", "Хар/Улаан"],
  },
  {
    id: 5, name: "Akrapovic Slip-On", category: "Exhaust", brand: "Akrapovic", meta: "Тохирно: CB650R / CBR650R",
    price: 4200000, oldPrice: 4900000, rating: 5, reviews: 51, sku: "AK-SLP-CB650",
    desc: "Titanium slip-on яндан. Жин хөнгөрүүлж, гүн дуу авиа өгнө. CB650R / CBR650R-д тохирно.",
    features: ["Titanium хоолой", "Carbon төгсгөл", "Жин ~2.1кг хөнгөн", "Гар угсралт боломжтой", "Тохирно: Honda CB650R / CBR650R"],
  },
  {
    id: 6, name: "Yuasa AGM Battery", category: "Battery", brand: "Yuasa", meta: "Maintenance-free · 12V",
    price: 320000, oldPrice: 390000, rating: 4, reviews: 23, sku: "YS-AGM-12V",
    desc: "Maintenance-free AGM батерей. Урт насжилттай, өндөр гүйдэлтэй, ихэнх sport мотоциклд тохирно.",
    features: ["AGM технологи", "12V · өндөр CCA", "Maintenance-free", "Алдагдалгүй битүү", "2 жилийн баталгаа"],
  },
  {
    id: 7, name: "Michelin Power 6", category: "Tire", brand: "Michelin", meta: "Sport · 120/70 · 180/55",
    price: 980000, oldPrice: 1150000, rating: 5, reviews: 45, sku: "MC-PW6-SET",
    desc: "Sport замын дугуй (хос). Нойтон/хуурай замд барьцалт сайтай, хурдан халдаг.",
    features: ["2CT+ хольц", "Нойтон замд барьцалт сайн", "Урд: 120/70 ZR17", "Хойд: 180/55 ZR17", "Хос (урд+хойд)"],
  },
  {
    id: 8, name: "Sena 50S Intercom", category: "Intercom", brand: "Sena", meta: "Mesh 2.0 · Bluetooth 5",
    price: 1250000, oldPrice: 1490000, rating: 5, reviews: 39, sku: "SN-50S-DUO",
    desc: "Mesh 2.0 интерком. Бүлгээрээ ярих, дуудлага, хөгжим — урт батерейтай.",
    features: ["Mesh Intercom 2.0", "Bluetooth 5.0", "Дуут команд", "Хурдан цэнэглэлт", "Усны хамгаалалт IP67"],
    colors: ["Хар"],
  },
];

export const SERVICES: string[] = [
  "Тос солих", "Дугуй солих", "Батерей солих", "Тормозны засвар", "Гинжний засвар",
  "Оношилгоо", "Яндан суурилуулах", "Ерөнхий засвар", "Custom тюнинг", "Импортын зөвлөгөө",
];

export interface EventItem {
  id: number;
  type: string;
  title: string;
  status: string;
  date: string;
  prize: string;
}

export const EVENTS: EventItem[] = [
  { id: 1, type: "GIVEAWAY", title: "NEXX Helmet Giveaway", status: "Ongoing", date: "2026.06.10 – 06.30", prize: "NEXX X.WST3" },
  { id: 2, type: "RACE", title: "MOTO HOUSE Track Day", status: "Upcoming", date: "2026.07.15", prize: "Trophy + Gear" },
  { id: 3, type: "RIDE EVENT", title: "Summer Group Ride", status: "Upcoming", date: "2026.07.05", prize: "Free service" },
  { id: 4, type: "GIVEAWAY", title: "Akrapovic Exhaust Draw", status: "Winner", date: "2026.05.20", prize: "Winner announced" },
];

export const PARTNERS = [
  { name: "Ard", src: "/assets/logo-ard.jpg" },
  { name: "Sono", src: "/assets/logo-sono.png" },
  { name: "Payon", src: "/assets/logo-payon.png" },
  { name: "Pocket", src: "/assets/logo-pocket.png" },
  { name: "Storepay", src: "/assets/logo-storepay.png" },
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

export function getMoto(id: number): Moto {
  return MOTOS.find((m) => m.id === id) ?? MOTOS[0];
}

export function similarMotos(m: Moto): Moto[] {
  return MOTOS.filter((x) => x.id !== m.id && x.brand === m.brand)
    .concat(MOTOS.filter((x) => x.id !== m.id && x.brand !== m.brand))
    .slice(0, 3);
}

export function getGear(id: number): GearItem | undefined {
  return GEAR.find((g) => g.id === id);
}

// "Хамт авах" — ижил ангиллын бараа, дутвал бусдаар нөхнө.
export function relatedGear(g: GearItem, n = 2): GearItem[] {
  return GEAR.filter((x) => x.id !== g.id && x.category === g.category)
    .concat(GEAR.filter((x) => x.id !== g.id && x.category !== g.category))
    .slice(0, n);
}

// "Танд таалагдаж магадгүй" — бусад бараа
export function moreGear(g: GearItem, n = 6): GearItem[] {
  return GEAR.filter((x) => x.id !== g.id).slice(0, n);
}
