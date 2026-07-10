// Checkout — хаягийн бүтэц (улс тус бүрээр), утасны E.164, validation, хаяг угсрах.
// Бүх label нь монгол түлхүүр — t()-ээр орчуулна (dict.ts дээр EN хувилбартай).

import { COUNTRIES, countryByCode, type CountryOption } from "./countries";

export type DeliveryMethod = "delivery" | "pickup";

export interface AddressValue {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal?: string;
  district?: string;
  subdistrict?: string;
  note?: string;
}

export type AddrFieldKey = keyof AddressValue;

export interface AddrField {
  key: AddrFieldKey;
  label: string;       // MN t()-key
  required: boolean;
  placeholder?: string; // MN t()-key
  postalFormat?: RegExp; // postal талбарт формат шалгах
  autocomplete?: boolean; // address autocomplete холбогдох талбар (line1)
}

// Улс тус бүрийн хаягийн бүтэц. Байхгүй улсад generic хэлбэр.
export function addressSchema(code?: string): AddrField[] {
  switch ((code || "").toUpperCase()) {
    case "MN":
      return [
        { key: "city", label: "Хот / Аймаг", required: true },
        { key: "district", label: "Дүүрэг / Сум", required: true },
        { key: "subdistrict", label: "Хороо / Баг", required: true },
        { key: "line1", label: "Гудамж, байр, тоот", required: true, autocomplete: true },
        { key: "line2", label: "Орц, давхар, хаалганы код", required: false },
        { key: "note", label: "Нэмэлт тайлбар", required: false },
      ];
    case "US":
      return [
        { key: "line1", label: "Гэрийн хаяг (гудамж)", required: true, autocomplete: true },
        { key: "line2", label: "Байр, өрөө, тоот", required: false },
        { key: "city", label: "Хот", required: true },
        { key: "state", label: "Муж", required: true },
        { key: "postal", label: "ZIP код", required: true, postalFormat: /^\d{5}(-\d{4})?$/ },
      ];
    case "JP":
      return [
        { key: "postal", label: "Шуудангийн код", required: true, postalFormat: /^\d{3}-?\d{4}$/ },
        { key: "state", label: "Префектур", required: true },
        { key: "city", label: "Хот / Дүүрэг", required: true },
        { key: "line1", label: "Гудамжны хаяг", required: true, autocomplete: true },
        { key: "line2", label: "Барилга / Байр", required: false },
      ];
    case "KR":
      return [
        { key: "postal", label: "Шуудангийн код", required: true, postalFormat: /^\d{5}$/ },
        { key: "state", label: "Аймаг / Хот", required: true },
        { key: "district", label: "Дүүрэг", required: true },
        { key: "line1", label: "Замын хаяг", required: true, autocomplete: true },
        { key: "line2", label: "Барилга / Орц", required: false },
      ];
    default:
      return [
        { key: "line1", label: "Хаягийн мөр 1", required: true, autocomplete: true },
        { key: "line2", label: "Хаягийн мөр 2", required: false },
        { key: "city", label: "Хот", required: true },
        { key: "state", label: "Муж / Аймаг / Бүс", required: false },
        { key: "postal", label: "Шуудангийн код", required: true },
        { key: "note", label: "Нэмэлт тайлбар", required: false },
      ];
  }
}

// Validation — талбар бүрийн MN алдааны түлхүүр буцаана (component нь t()-лнэ).
export function validateAddress(code: string | undefined, v: AddressValue): Partial<Record<AddrFieldKey, string>> {
  const errs: Partial<Record<AddrFieldKey, string>> = {};
  for (const f of addressSchema(code)) {
    const raw = (v[f.key] || "").trim();
    if (f.required && !raw) { errs[f.key] = "Заавал бөглөнө үү"; continue; }
    if (raw && f.postalFormat && !f.postalFormat.test(raw)) errs[f.key] = "Шуудангийн код буруу байна.";
  }
  return errs;
}

// Хаягийг admin-д харагдах нэг текст болгож угсарна (талбарын дараалал хадгална).
export function composeAddress(country: CountryOption | undefined, v: AddressValue): string {
  const order: AddrFieldKey[] = ["line1", "line2", "subdistrict", "district", "city", "state", "postal"];
  const parts = order.map((k) => (v[k] || "").trim()).filter(Boolean);
  let out = parts.join(", ");
  const note = (v.note || "").trim();
  if (note) out += (out ? "\n" : "") + note;
  return out;
}

// ===== Утас (E.164) =====

// Зөвхөн цифр үлдээх (эхний + хасна).
export function digitsOnly(s: string): string {
  return (s || "").replace(/[^\d]/g, "");
}

// callingCode + үндэсний дугаар → +<code><national> (E.164).
export function toE164(callingCode: string, national: string): string {
  const nat = digitsOnly(national);
  if (!nat) return "";
  return `+${digitsOnly(callingCode)}${nat}`;
}

// E.164 дугаарыг задалж (боломжтой бол улсын кодоор) callingCode + national болгоно.
export function splitE164(e164: string, fallbackCalling: string): { callingCode: string; national: string } {
  const raw = (e164 || "").trim();
  if (raw.startsWith("+")) {
    const all = digitsOnly(raw);
    // Хамгийн урт таарсан улсын кодыг ол (1..4 орон)
    const sorted = [...new Set(COUNTRIES.map((c) => c.callingCode))].sort((a, b) => b.length - a.length);
    for (const cc of sorted) {
      if (all.startsWith(cc)) return { callingCode: cc, national: all.slice(cc.length) };
    }
    return { callingCode: fallbackCalling, national: all };
  }
  return { callingCode: fallbackCalling, national: digitsOnly(raw) };
}

// Энгийн хүчинтэй эсэх шалгалт — үндэсний дугаар 4–15 цифр (E.164 нийт ≤15).
export function isValidPhone(callingCode: string, national: string): boolean {
  const nat = digitsOnly(national);
  const total = digitsOnly(callingCode).length + nat.length;
  return nat.length >= 4 && total >= 7 && total <= 15;
}

// Улсын анхны утасны кодыг өг.
export function callingCodeOf(code: string): string {
  return countryByCode(code)?.callingCode ?? "";
}
