// Захиалгын төрөл + badge (өгөгдөл нь Supabase-ээс).

export interface Order {
  id: string;
  date: string;
  item: string;
  qty: number;
  total: number;
  status: "Хүлээгдэж буй" | "Баталгаажсан" | "Хүргэгдсэн" | "Цуцлагдсан";
  paymentStatus?: "unpaid" | "pending" | "paid" | "failed"; // Bonum төлбөрийн төлөв
  userPhone?: string; // захиалагчийн утас (admin талд)
  userName?: string;  // захиалагчийн нэр (profiles-аас)
  shipCountry?: string; // хүргэх улс (олон улсын захиалга)
  shipName?: string;    // хүлээн авагчийн нэр
  shipPhone?: string;   // хүлээн авагчийн утас
  shipAddress?: string; // бүтэн хаяг
}

export function orderBadge(status: Order["status"]): string {
  const base = "font:700 11px Montserrat;letter-spacing:.04em;padding:5px 11px;border-radius:6px;display:inline-block;";
  if (status === "Хүргэгдсэн") return base + "color:#22c55e;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.35);";
  if (status === "Баталгаажсан") return base + "color:#fff;background:#E10613;";
  if (status === "Цуцлагдсан") return base + "color:#ef4444;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.35);";
  return base + "color:#A3A3A3;background:#1a1a1d;border:1px solid #333;";
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
