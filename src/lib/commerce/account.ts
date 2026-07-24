// Захиалгын төрөл + badge (өгөгдөл нь Supabase-ээс).

export interface Order {
  id: string;
  date: string;
  item: string;
  qty: number;
  total: number;
  status: "Хүлээгдэж буй" | "Баталгаажсан" | "Хүргэлтэнд гарсан" | "Хүргэгдсэн" | "Цуцлагдсан";
  paymentStatus?: "unpaid" | "pending" | "paid" | "failed"; // Bonum төлбөрийн төлөв
  userPhone?: string; // захиалагчийн утас (admin талд)
  userName?: string;  // захиалагчийн нэр (profiles-аас)
  shipCountry?: string; // хүргэх улс (олон улсын захиалга)
  shipName?: string;    // хүлээн авагчийн нэр
  shipPhone?: string;   // хүлээн авагчийн утас
  shipAddress?: string; // бүтэн хаяг
  countryCode?: string;    // ISO код (MN = дотоод)
  deliveryMethod?: string; // delivery | pickup
  trackingNumber?: string; // олон улсын тээврийн код (admin оруулна)
}

export function orderBadge(status: Order["status"]): string {
  const base = "font:700 11px Montserrat;letter-spacing:.04em;padding:5px 11px;border-radius:6px;display:inline-block;";
  if (status === "Хүргэгдсэн") return base + "color:#22c55e;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.35);";
  if (status === "Хүргэлтэнд гарсан") return base + "color:#60a5fa;background:rgba(96,165,250,.12);border:1px solid rgba(96,165,250,.35);";
  if (status === "Баталгаажсан") return base + "color:#fff;background:#E10613;";
  if (status === "Цуцлагдсан") return base + "color:#ef4444;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.35);";
  return base + "color:#A3A3A3;background:#1a1a1d;border:1px solid #333;";
}

// ===== Захиалгын явцын timeline =====
// Захиалгын төрлөөс (дотоод/гадаад/очиж авах) хамаарч алхмууд өөр байна.

export interface OrderStep {
  label: string;   // MN t()-түлхүүр
  done: boolean;   // болсон алхам
  current: boolean; // одоо явагдаж буй алхам
}

export function isInternational(o: Order): boolean {
  if (o.deliveryMethod === "pickup") return false;
  if (o.countryCode) return o.countryCode.toUpperCase() !== "MN";
  return !!o.shipCountry && !/^(mongolia|монгол)/i.test(o.shipCountry.trim());
}

// status-ийн эрэмбэ (Цуцлагдсан-г тусад нь харуулна)
const STATUS_RANK: Record<string, number> = {
  "Хүлээгдэж буй": 0, "Баталгаажсан": 1, "Хүргэлтэнд гарсан": 2, "Хүргэгдсэн": 3,
};

export function orderSteps(o: Order): OrderStep[] {
  const paid = o.paymentStatus === "paid";
  const rank = STATUS_RANK[o.status] ?? 0;
  const pickup = o.deliveryMethod === "pickup";
  const intl = isInternational(o);

  const shipLabel = pickup ? "Дэлгүүрт бэлэн болсон" : intl ? "Олон улсын тээвэрт гарсан" : "Хүргэлтэнд гарсан";
  const doneLabel = pickup ? "Олгогдсон" : "Хүргэгдсэн";

  // Алхам бүрийн "болсон" нөхцөл (progress = төлбөр 1 алхам + статусын 3 алхам)
  const defs: { label: string; done: boolean }[] = [
    { label: "Төлбөр төлөгдсөн", done: paid },
    { label: "Захиалга баталгаажсан", done: rank >= 1 },
    { label: shipLabel, done: rank >= 2 },
    { label: doneLabel, done: rank >= 3 },
  ];

  // current = хамгийн эхний болоогүй алхам
  const firstPending = defs.findIndex((d) => !d.done);
  return defs.map((d, i) => ({ ...d, current: i === firstPending }));
}

// Төлбөрийн төлөв → монгол шошго + badge загвар
export type PaymentStatus = NonNullable<Order["paymentStatus"]>;

export function paymentLabel(ps?: Order["paymentStatus"]): string {
  if (ps === "paid") return "Төлсөн";
  if (ps === "pending") return "Төлбөр хүлээгдэж буй";
  if (ps === "failed") return "Төлбөр амжилтгүй";
  return "Төлөгдөөгүй";
}

export function paymentBadge(ps?: Order["paymentStatus"]): string {
  const base = "font:700 11px Montserrat;letter-spacing:.04em;padding:5px 11px;border-radius:6px;display:inline-block;";
  if (ps === "paid") return base + "color:#22c55e;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.35);";
  if (ps === "pending") return base + "color:#f59e0b;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.35);";
  if (ps === "failed") return base + "color:#ef4444;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.35);";
  return base + "color:#8A8F98;background:#1a1a1d;border:1px solid #333;";
}
