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
