import { NextResponse, type NextRequest } from "next/server";

// Байршлаар анхдагч хэл/валют — ЗӨВХӨН эхний зочлолтод (cookie байхгүй үед).
// Хэрэглэгч гараар сонгосон бол cookie үлддэг тул энд хэзээ ч дарж бичихгүй.
// (Next.js 16: middleware → proxy болж нэр өөрчлөгдсөн)

const LANG_COOKIE = "motohouse_lang";
const CCY_COOKIE = "motohouse_ccy";
const YEAR = 60 * 60 * 24 * 365;

// Европ (EU/EEA + ойролцоо) — € анхдагч. Бусад гадаад улс → $.
const EUROPE = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
  "SE", "GB", "CH", "NO", "IS", "LI",
]);

function pickDefaults(country: string | null, acceptLang: string | null) {
  const c = (country || "").toUpperCase();
  // Хэл: Монгол улс эсвэл browser mn → MN; бусад → EN
  const prefersMn = c === "MN" || (acceptLang || "").toLowerCase().startsWith("mn");
  const lang = prefersMn ? "mn" : "en";
  // Валют: Монгол эсвэл байршил тодорхойгүй → ₮ (нутгийн зах зээл), Европ → €, бусад гадаад → $
  const ccy = !c || c === "MN" ? "MNT" : EUROPE.has(c) ? "EUR" : "USD";
  return { lang, ccy };
}

export function proxy(request: NextRequest) {
  const res = NextResponse.next();
  const hasLang = request.cookies.has(LANG_COOKIE);
  const hasCcy = request.cookies.has(CCY_COOKIE);
  if (hasLang && hasCcy) return res; // аль хэдийн сонголттой — хөндөхгүй

  const country = request.headers.get("x-vercel-ip-country");
  const acceptLang = request.headers.get("accept-language");
  const { lang, ccy } = pickDefaults(country, acceptLang);

  const opts = { path: "/", maxAge: YEAR, sameSite: "lax" as const };
  if (!hasLang) res.cookies.set(LANG_COOKIE, lang, opts);
  if (!hasCcy) res.cookies.set(CCY_COOKIE, ccy, opts);
  return res;
}

export const config = {
  // Статик болон API-аас бусад бүх хуудсанд ажиллана
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\.).*)"],
};
