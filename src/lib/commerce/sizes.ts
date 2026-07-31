const SIZE_CM: Record<string, string> = {
  XS: "76-82",
  S: "82-88",
  M: "88-96",
  L: "96-104",
  XL: "104-112",
  XXL: "112-120",
  "3XL": "120-128",
};

// Хэмжээний заавар цонхонд дараалалтай гаргах.
export const SIZE_TABLE = Object.entries(SIZE_CM).map(([size, cm]) => ({ size, cm }));

// Universal chest-circumference guide for the admin/catalog size picker.
export function sizeLabel(size: string): string {
  const cm = SIZE_CM[size.trim().toUpperCase()];
  return cm ? `${size} (${cm} cm)` : size;
}

export function sizeCm(size: string): string | undefined {
  return SIZE_CM[size.trim().toUpperCase()];
}

// Үсгэн хэмжээ (XS…3XL) мөн эсэх. Админ дээр гараар нэмсэн "56 cm" зэрэг
// хэмжээг үсгэн хэмжээнээс тусад нь бүлэглэхэд хэрэглэнэ.
export function isLetterSize(size: string): boolean {
  return size.trim().toUpperCase() in SIZE_CM;
}

// Үсгэн бус хэмжээний бүлгийн гарчиг. Каск дээр "55-56 cm", гутал дээр "42"
// гэх мэт өөр систем ордог тул агуулгаас нь таана — бүгдийг "см" гэвэл
// гутлын EU дугаарыг буруу нэрлэнэ.
export function extraSizeLabel(sizes: string[]): string {
  if (sizes.length === 0) return "";
  if (sizes.every((s) => /cm|см/i.test(s))) return "Хэмжээ (см)";
  if (sizes.every((s) => /^\d{2}(\.5)?$/.test(s.trim()))) return "Хэмжээ (EU)";
  return "Бусад хэмжээ";
}
