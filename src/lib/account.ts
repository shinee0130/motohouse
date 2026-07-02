// Захиалгын төрөл + badge (өгөгдөл нь Supabase-ээс).

export interface Order {
  id: string;
  date: string;
  item: string;
  qty: number;
  total: number;
  status: "Хүлээгдэж буй" | "Баталгаажсан" | "Хүргэгдсэн" | "Цуцлагдсан";
  userPhone?: string; // захиалагчийн утас (admin талд)
  userName?: string;  // захиалагчийн нэр (profiles-аас)
}

export function orderBadge(status: Order["status"]): string {
  const base = "font:700 11px Montserrat;letter-spacing:.04em;padding:5px 11px;border-radius:6px;display:inline-block;";
  if (status === "Хүргэгдсэн") return base + "color:#22c55e;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.35);";
  if (status === "Баталгаажсан") return base + "color:#fff;background:#E10613;";
  if (status === "Цуцлагдсан") return base + "color:#ef4444;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.35);";
  return base + "color:#A3A3A3;background:#1a1a1d;border:1px solid #333;";
}
