// Улс орны мэдээлэл — ISO 3166-1 alpha-2, олон улсын утасны код, бүс нутаг.
// Гадны багц (libphonenumber г.м) нэмэлгүй, төслийн хөнгөн зарчмаар локал dataset.
// Тугийг ISO кодоос regional-indicator тэмдэгтээр тооцоолно (hardcode хийхгүй).

export type CountryRegion =
  | "asia"
  | "europe"
  | "middle-east"
  | "north-america"
  | "south-america"
  | "oceania"
  | "africa";

export interface CountryOption {
  code: string;        // ISO 3166-1 alpha-2 (жишээ "MN")
  nameEn: string;      // Англи нэр
  nameMn: string;      // Монгол нэр (байхгүй бол англи нэрээрээ)
  callingCode: string; // Олон улсын утасны код (+-гүй, жишээ "976")
  region: CountryRegion;
  flag: string;        // Emoji туг (кодоос тооцсон)
}

// Хамгийн түгээмэл улсууд (эхэнд тусад нь харагдана). Бусад бүсэд мөн орно.
export const POPULAR_CODES = ["MN", "KR", "JP", "CN", "US", "DE", "RU", "KZ", "TR", "AU"];

export const REGION_ORDER: CountryRegion[] = [
  "asia", "europe", "middle-east", "north-america", "south-america", "oceania", "africa",
];

export const REGION_LABEL: Record<CountryRegion, string> = {
  "asia": "Ази",
  "europe": "Европ",
  "middle-east": "Ойрхи Дорнод",
  "north-america": "Хойд Америк",
  "south-america": "Өмнөд Америк",
  "oceania": "Номхон далай",
  "africa": "Африк",
};

// Монгол нэр — түгээмэл улсуудад. Байхгүй бол англи нэрээ ашиглана.
const MN_NAMES: Record<string, string> = {
  MN: "Монгол", KR: "Өмнөд Солонгос", KP: "Хойд Солонгос", JP: "Япон", CN: "Хятад",
  HK: "Хонг Конг", MO: "Макао", TW: "Тайвань", SG: "Сингапур", MY: "Малайз",
  TH: "Тайланд", VN: "Вьетнам", PH: "Филиппин", ID: "Индонез", BN: "Бруней",
  KH: "Камбож", LA: "Лаос", MM: "Мьянмар", TL: "Зүүн Тимор", IN: "Энэтхэг",
  PK: "Пакистан", BD: "Бангладеш", LK: "Шри Ланка", NP: "Балба", BT: "Бутан",
  MV: "Мальдив", AF: "Афганистан", KZ: "Казахстан", KG: "Кыргызстан", UZ: "Узбекистан",
  TJ: "Тажикистан", TM: "Туркменистан",
  GB: "Их Британи", IE: "Ирланд", DE: "Герман", FR: "Франц", IT: "Итали",
  ES: "Испани", PT: "Португал", NL: "Нидерланд", BE: "Бельги", LU: "Люксембург",
  CH: "Швейцарь", AT: "Австри", PL: "Польш", CZ: "Чех", SK: "Словак",
  HU: "Унгар", RO: "Румын", BG: "Болгар", GR: "Грек", HR: "Хорват",
  SI: "Словени", RS: "Серби", BA: "Босни Герцеговин", ME: "Монтенегро", MK: "Хойд Македон",
  AL: "Албани", XK: "Косово", DK: "Дани", NO: "Норвег", SE: "Швед",
  FI: "Финланд", IS: "Исланд", EE: "Эстони", LV: "Латви", LT: "Литва",
  UA: "Украйн", MD: "Молдав", BY: "Беларусь", RU: "Орос", CY: "Кипр",
  MT: "Мальта", LI: "Лихтенштейн", MC: "Монако", SM: "Сан Марино", AD: "Андорра",
  VA: "Ватикан",
  TR: "Турк", AE: "АНЭУ", SA: "Саудын Араб", QA: "Катар", KW: "Кувейт",
  BH: "Бахрейн", OM: "Оман", IL: "Израиль", JO: "Йордан", LB: "Ливан",
  IQ: "Ирак", IR: "Иран", YE: "Йемен", PS: "Палестин", SY: "Сири",
  US: "АНУ", CA: "Канад", MX: "Мексик", CR: "Коста Рика", PA: "Панам",
  GT: "Гватемал", BZ: "Белиз", SV: "Сальвадор", HN: "Гондурас", NI: "Никарагуа",
  CU: "Куба", JM: "Ямайка", DO: "Доминикан", HT: "Гаити", BS: "Багам",
  BB: "Барбадос", TT: "Тринидад Тобаго",
  BR: "Бразил", AR: "Аргентин", CL: "Чили", PE: "Перу", CO: "Колумб",
  VE: "Венесуэл", UY: "Уругвай", PY: "Парагвай", BO: "Боливи", EC: "Эквадор",
  GY: "Гайана", SR: "Суринам",
  AU: "Австрали", NZ: "Шинэ Зеланд", FJ: "Фижи", PG: "Папуа Шинэ Гвиней", WS: "Самоа",
  TO: "Тонга", VU: "Вануату", SB: "Соломоны арлууд", PW: "Палау", FM: "Микронез",
  MH: "Маршаллын арлууд", KI: "Кирибати", NR: "Науру", TV: "Тувалу",
  ZA: "Өмнөд Африк", EG: "Египет", MA: "Марокко", TN: "Тунис", DZ: "Алжир",
  LY: "Ливи", NG: "Нигери", KE: "Кени", ET: "Этиоп", GH: "Гана",
  TZ: "Танзани", UG: "Уганда", RW: "Руанда", SN: "Сенегал", CM: "Камерун",
  CI: "Кот д’Ивуар", AO: "Ангол", ZM: "Замби", ZW: "Зимбабве", MU: "Маврики",
  SC: "Сейшел", MG: "Мадагаскар", MZ: "Мозамбик", NA: "Намиби", BW: "Ботсван",
};

// [code, nameEn, callingCode, region]
const RAW: [string, string, string, CountryRegion][] = [
  // ===== Asia =====
  ["MN", "Mongolia", "976", "asia"],
  ["CN", "China", "86", "asia"],
  ["HK", "Hong Kong", "852", "asia"],
  ["MO", "Macao", "853", "asia"],
  ["TW", "Taiwan", "886", "asia"],
  ["JP", "Japan", "81", "asia"],
  ["KR", "South Korea", "82", "asia"],
  ["KP", "North Korea", "850", "asia"],
  ["SG", "Singapore", "65", "asia"],
  ["MY", "Malaysia", "60", "asia"],
  ["TH", "Thailand", "66", "asia"],
  ["VN", "Vietnam", "84", "asia"],
  ["PH", "Philippines", "63", "asia"],
  ["ID", "Indonesia", "62", "asia"],
  ["BN", "Brunei", "673", "asia"],
  ["KH", "Cambodia", "855", "asia"],
  ["LA", "Laos", "856", "asia"],
  ["MM", "Myanmar", "95", "asia"],
  ["TL", "Timor-Leste", "670", "asia"],
  ["IN", "India", "91", "asia"],
  ["PK", "Pakistan", "92", "asia"],
  ["BD", "Bangladesh", "880", "asia"],
  ["LK", "Sri Lanka", "94", "asia"],
  ["NP", "Nepal", "977", "asia"],
  ["BT", "Bhutan", "975", "asia"],
  ["MV", "Maldives", "960", "asia"],
  ["AF", "Afghanistan", "93", "asia"],
  ["KZ", "Kazakhstan", "7", "asia"],
  ["KG", "Kyrgyzstan", "996", "asia"],
  ["UZ", "Uzbekistan", "998", "asia"],
  ["TJ", "Tajikistan", "992", "asia"],
  ["TM", "Turkmenistan", "993", "asia"],
  // ===== Europe =====
  ["GB", "United Kingdom", "44", "europe"],
  ["IE", "Ireland", "353", "europe"],
  ["DE", "Germany", "49", "europe"],
  ["FR", "France", "33", "europe"],
  ["IT", "Italy", "39", "europe"],
  ["ES", "Spain", "34", "europe"],
  ["PT", "Portugal", "351", "europe"],
  ["NL", "Netherlands", "31", "europe"],
  ["BE", "Belgium", "32", "europe"],
  ["LU", "Luxembourg", "352", "europe"],
  ["CH", "Switzerland", "41", "europe"],
  ["AT", "Austria", "43", "europe"],
  ["PL", "Poland", "48", "europe"],
  ["CZ", "Czechia", "420", "europe"],
  ["SK", "Slovakia", "421", "europe"],
  ["HU", "Hungary", "36", "europe"],
  ["RO", "Romania", "40", "europe"],
  ["BG", "Bulgaria", "359", "europe"],
  ["GR", "Greece", "30", "europe"],
  ["HR", "Croatia", "385", "europe"],
  ["SI", "Slovenia", "386", "europe"],
  ["RS", "Serbia", "381", "europe"],
  ["BA", "Bosnia and Herzegovina", "387", "europe"],
  ["ME", "Montenegro", "382", "europe"],
  ["MK", "North Macedonia", "389", "europe"],
  ["AL", "Albania", "355", "europe"],
  ["XK", "Kosovo", "383", "europe"],
  ["DK", "Denmark", "45", "europe"],
  ["NO", "Norway", "47", "europe"],
  ["SE", "Sweden", "46", "europe"],
  ["FI", "Finland", "358", "europe"],
  ["IS", "Iceland", "354", "europe"],
  ["EE", "Estonia", "372", "europe"],
  ["LV", "Latvia", "371", "europe"],
  ["LT", "Lithuania", "370", "europe"],
  ["UA", "Ukraine", "380", "europe"],
  ["MD", "Moldova", "373", "europe"],
  ["BY", "Belarus", "375", "europe"],
  ["RU", "Russia", "7", "europe"],
  ["CY", "Cyprus", "357", "europe"],
  ["MT", "Malta", "356", "europe"],
  ["LI", "Liechtenstein", "423", "europe"],
  ["MC", "Monaco", "377", "europe"],
  ["SM", "San Marino", "378", "europe"],
  ["AD", "Andorra", "376", "europe"],
  ["VA", "Vatican City", "379", "europe"],
  // ===== Middle East =====
  ["TR", "Türkiye", "90", "middle-east"],
  ["AE", "United Arab Emirates", "971", "middle-east"],
  ["SA", "Saudi Arabia", "966", "middle-east"],
  ["QA", "Qatar", "974", "middle-east"],
  ["KW", "Kuwait", "965", "middle-east"],
  ["BH", "Bahrain", "973", "middle-east"],
  ["OM", "Oman", "968", "middle-east"],
  ["IL", "Israel", "972", "middle-east"],
  ["JO", "Jordan", "962", "middle-east"],
  ["LB", "Lebanon", "961", "middle-east"],
  ["IQ", "Iraq", "964", "middle-east"],
  ["IR", "Iran", "98", "middle-east"],
  ["YE", "Yemen", "967", "middle-east"],
  ["PS", "Palestine", "970", "middle-east"],
  ["SY", "Syria", "963", "middle-east"],
  // ===== North America =====
  ["US", "United States", "1", "north-america"],
  ["CA", "Canada", "1", "north-america"],
  ["MX", "Mexico", "52", "north-america"],
  ["CR", "Costa Rica", "506", "north-america"],
  ["PA", "Panama", "507", "north-america"],
  ["GT", "Guatemala", "502", "north-america"],
  ["BZ", "Belize", "501", "north-america"],
  ["SV", "El Salvador", "503", "north-america"],
  ["HN", "Honduras", "504", "north-america"],
  ["NI", "Nicaragua", "505", "north-america"],
  ["CU", "Cuba", "53", "north-america"],
  ["JM", "Jamaica", "1", "north-america"],
  ["DO", "Dominican Republic", "1", "north-america"],
  ["HT", "Haiti", "509", "north-america"],
  ["BS", "Bahamas", "1", "north-america"],
  ["BB", "Barbados", "1", "north-america"],
  ["TT", "Trinidad and Tobago", "1", "north-america"],
  ["AG", "Antigua and Barbuda", "1", "north-america"],
  ["DM", "Dominica", "1", "north-america"],
  ["GD", "Grenada", "1", "north-america"],
  ["KN", "Saint Kitts and Nevis", "1", "north-america"],
  ["LC", "Saint Lucia", "1", "north-america"],
  ["VC", "Saint Vincent and the Grenadines", "1", "north-america"],
  // ===== South America =====
  ["BR", "Brazil", "55", "south-america"],
  ["AR", "Argentina", "54", "south-america"],
  ["CL", "Chile", "56", "south-america"],
  ["PE", "Peru", "51", "south-america"],
  ["CO", "Colombia", "57", "south-america"],
  ["VE", "Venezuela", "58", "south-america"],
  ["UY", "Uruguay", "598", "south-america"],
  ["PY", "Paraguay", "595", "south-america"],
  ["BO", "Bolivia", "591", "south-america"],
  ["EC", "Ecuador", "593", "south-america"],
  ["GY", "Guyana", "592", "south-america"],
  ["SR", "Suriname", "597", "south-america"],
  // ===== Oceania =====
  ["AU", "Australia", "61", "oceania"],
  ["NZ", "New Zealand", "64", "oceania"],
  ["FJ", "Fiji", "679", "oceania"],
  ["PG", "Papua New Guinea", "675", "oceania"],
  ["WS", "Samoa", "685", "oceania"],
  ["TO", "Tonga", "676", "oceania"],
  ["VU", "Vanuatu", "678", "oceania"],
  ["SB", "Solomon Islands", "677", "oceania"],
  ["PW", "Palau", "680", "oceania"],
  ["FM", "Micronesia", "691", "oceania"],
  ["MH", "Marshall Islands", "692", "oceania"],
  ["KI", "Kiribati", "686", "oceania"],
  ["NR", "Nauru", "674", "oceania"],
  ["TV", "Tuvalu", "688", "oceania"],
  // ===== Africa =====
  ["ZA", "South Africa", "27", "africa"],
  ["EG", "Egypt", "20", "africa"],
  ["MA", "Morocco", "212", "africa"],
  ["TN", "Tunisia", "216", "africa"],
  ["DZ", "Algeria", "213", "africa"],
  ["LY", "Libya", "218", "africa"],
  ["NG", "Nigeria", "234", "africa"],
  ["KE", "Kenya", "254", "africa"],
  ["ET", "Ethiopia", "251", "africa"],
  ["GH", "Ghana", "233", "africa"],
  ["TZ", "Tanzania", "255", "africa"],
  ["UG", "Uganda", "256", "africa"],
  ["RW", "Rwanda", "250", "africa"],
  ["SN", "Senegal", "221", "africa"],
  ["CM", "Cameroon", "237", "africa"],
  ["CI", "Côte d’Ivoire", "225", "africa"],
  ["AO", "Angola", "244", "africa"],
  ["ZM", "Zambia", "260", "africa"],
  ["ZW", "Zimbabwe", "263", "africa"],
  ["MU", "Mauritius", "230", "africa"],
  ["SC", "Seychelles", "248", "africa"],
  ["MG", "Madagascar", "261", "africa"],
  ["MZ", "Mozambique", "258", "africa"],
  ["NA", "Namibia", "264", "africa"],
  ["BW", "Botswana", "267", "africa"],
  ["BJ", "Benin", "229", "africa"],
  ["BF", "Burkina Faso", "226", "africa"],
  ["BI", "Burundi", "257", "africa"],
  ["CV", "Cape Verde", "238", "africa"],
  ["CF", "Central African Republic", "236", "africa"],
  ["TD", "Chad", "235", "africa"],
  ["KM", "Comoros", "269", "africa"],
  ["CG", "Congo", "242", "africa"],
  ["CD", "DR Congo", "243", "africa"],
  ["DJ", "Djibouti", "253", "africa"],
  ["GQ", "Equatorial Guinea", "240", "africa"],
  ["ER", "Eritrea", "291", "africa"],
  ["SZ", "Eswatini", "268", "africa"],
  ["GA", "Gabon", "241", "africa"],
  ["GM", "Gambia", "220", "africa"],
  ["GN", "Guinea", "224", "africa"],
  ["GW", "Guinea-Bissau", "245", "africa"],
  ["LS", "Lesotho", "266", "africa"],
  ["LR", "Liberia", "231", "africa"],
  ["MW", "Malawi", "265", "africa"],
  ["ML", "Mali", "223", "africa"],
  ["MR", "Mauritania", "222", "africa"],
  ["NE", "Niger", "227", "africa"],
  ["ST", "São Tomé and Príncipe", "239", "africa"],
  ["SL", "Sierra Leone", "232", "africa"],
  ["SO", "Somalia", "252", "africa"],
  ["SS", "South Sudan", "211", "africa"],
  ["SD", "Sudan", "249", "africa"],
  ["TG", "Togo", "228", "africa"],
];

// ISO кодоос emoji туг (A→🇦 ... regional indicator).
export function flagOf(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "🏳️";
  const cc = code.toUpperCase();
  return String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export const COUNTRIES: CountryOption[] = RAW.map(([code, nameEn, callingCode, region]) => ({
  code,
  nameEn,
  nameMn: MN_NAMES[code] ?? nameEn,
  callingCode,
  region,
  flag: flagOf(code),
}));

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

export function countryByCode(code?: string | null): CountryOption | undefined {
  return code ? BY_CODE.get(code.toUpperCase()) : undefined;
}

export const DEFAULT_COUNTRY = "MN";

// Нэр / ISO код / утасны кодоор хайх (MN, EN нэр 2уланд).
export function searchCountries(query: string): CountryOption[] {
  const q = query.trim().toLowerCase().replace(/^\+/, "");
  if (!q) return COUNTRIES;
  return COUNTRIES.filter((c) =>
    c.nameEn.toLowerCase().includes(q) ||
    c.nameMn.toLowerCase().includes(q) ||
    c.code.toLowerCase().includes(q) ||
    c.callingCode.includes(q) ||
    `+${c.callingCode}`.includes(q),
  );
}

export const POPULAR_COUNTRIES: CountryOption[] = POPULAR_CODES
  .map((c) => BY_CODE.get(c))
  .filter((c): c is CountryOption => Boolean(c));

export function countriesByRegion(region: CountryRegion): CountryOption[] {
  return COUNTRIES.filter((c) => c.region === region).sort((a, b) => a.nameEn.localeCompare(b.nameEn));
}
