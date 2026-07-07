// Валютын ханш — үнэ бүр DB-д ₮ (MNT)-ээр хадгалагдана, харуулахдаа хөрвүүлнэ.
// open.er-api.com (key-гүй, өдөр бүр шинэчлэгддэг, MNT дэмждэг). USD base.

export type Currency = "MNT" | "USD" | "EUR";

// USD суурьтай ханш: 1 USD = rate нэгж. (MNT≈3563, EUR≈0.87)
export interface Rates {
  MNT: number; // 1 USD хэдэн төгрөг
  EUR: number; // 1 USD хэдэн евро
  updated: string; // хамгийн сүүлд шинэчлэгдсэн (UTC)
}

// API унтарсан үед сайт ажиллаж байхын тулд fallback (ойролцоо утга).
export const FALLBACK_RATES: Rates = { MNT: 3563, EUR: 0.9, updated: "fallback" };

// Server талд ханшийг татна (12 цаг тутам revalidate).
export async function getRates(): Promise<Rates> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 43200 },
    });
    if (!res.ok) return FALLBACK_RATES;
    const j = await res.json();
    if (j?.result !== "success" || !j?.rates?.MNT) return FALLBACK_RATES;
    return {
      MNT: j.rates.MNT,
      EUR: j.rates.EUR ?? FALLBACK_RATES.EUR,
      updated: j.time_last_update_utc ?? "",
    };
  } catch {
    return FALLBACK_RATES;
  }
}

// ₮ (MNT) утгыг сонгосон валют руу хөрвүүлж форматлана.
export function formatPrice(mnt: number, ccy: Currency, rates: Rates): string {
  if (ccy === "MNT") return Math.round(mnt).toLocaleString("en-US") + "₮";
  const usd = mnt / rates.MNT;
  if (ccy === "USD") return "$" + Math.round(usd).toLocaleString("en-US");
  // EUR
  const eur = usd * rates.EUR;
  return "€" + Math.round(eur).toLocaleString("en-US");
}
