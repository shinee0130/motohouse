// Барааны өнгөний палитр — админ болон дэлгүүрийн хуудас ХОЁУЛАА үүнийг
// хэрэглэнэ. Ингэснээр админ дээр сонгосон өнгө хэрэглэгчид яг ижилхэн
// дугуй хэлбэрээр харагдана.

export const GEAR_COLORS: { name: string; hex: string }[] = [
  { name: "Хар", hex: "#111114" },
  { name: "Цагаан", hex: "#f5f5f5" },
  { name: "Саарал", hex: "#6b7280" },
  { name: "Мөнгөлөг", hex: "#c0c0c0" },
  { name: "Улаан", hex: "#E10613" },
  { name: "Цэнхэр", hex: "#2563eb" },
  { name: "Хөх", hex: "#1e3a8a" },
  { name: "Ногоон", hex: "#16a34a" },
  { name: "Шар", hex: "#eab308" },
  { name: "Улбар шар", hex: "#f97316" },
  { name: "Ягаан", hex: "#ec4899" },
  { name: "Нил ягаан", hex: "#7c3aed" },
  { name: "Хүрэн", hex: "#92400e" },
  { name: "Алтан", hex: "#d4af37" },
];

// Палитрт байхгүй өнгө (админ дээр гараар нэмсэн, жнь "Хар/Улаан") бол undefined.
export function colorHex(name: string): string | undefined {
  return GEAR_COLORS.find((c) => c.name === name.trim())?.hex;
}

// Цайвар дэвсгэр дээр хар галочка хэрэгтэй — эс бол цагаан дээр цагаан харагдахгүй.
export function checkOn(hex: string | undefined): string {
  if (!hex) return "#fff";
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#111" : "#fff";
}
