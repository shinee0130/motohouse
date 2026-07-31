// Зургийг Next-ийн оновчлогчоор дамжуулна.
//
// Supabase Storage дээрх эх файлууд 1000×1000 – 2000×2000, 200–500 KB байдаг
// атал сайт дээр 46–400 px-ээр л харагддаг. Шууд татвал /gear хуудас ~10 MB
// болно. Эндүүрээр дамжуулбал Vercel нь хэрэгтэй хэмжээнд нь жижигрүүлж,
// WebP/AVIF болгож, CDN дээр кэшлэнэ.
//
// `<img>` таг хэвээр — зөвхөн src/srcSet солигдоно, layout хөндөгдөхгүй.

// next.config.ts дахь imageSizes + deviceSizes-ийн нийлбэр. Эдгээрээс өөр
// өргөнөөр хүсвэл оновчлогч 400 буцаадаг тул хамгийн ойрын дээшээгээр авна.
const WIDTHS = [32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];

// 2048/3840 нь бараг хэрэгцээгүй атлаа хувиргахад удаан, үнэтэй. Hero зураг
// 3840-ээр хүсэхэд оновчлогч timeout болж 500 буцааж байсан тул таслав.
const MAX_W = 1920;
const snap = (w: number) => WIDTHS.find((x) => x >= Math.min(w, MAX_W)) ?? MAX_W;

// Оновчлох боломжтой эсэх — зөвхөн next.config.ts-д зөвшөөрсөн алсын хост.
// Локал зам, data: URL, бусад хост хэвээрээ үлдэнэ.
function eligible(src: string): boolean {
  return /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\//.test(src);
}

function url(src: string, w: number, q: number): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${snap(w)}&q=${q}`;
}

/**
 * `<img {...imgSrc(url, 170)} alt="…" />`
 * @param cssWidth Дэлгэц дээр эзлэх өргөн (CSS px). Retina-д зориулж 2x-ийг
 *                 srcSet-ээр нэмж өгнө — хөтөч өөрөө хэрэгтэйг нь сонгоно.
 */
export function imgSrc(src: string | undefined | null, cssWidth: number, quality = 75):
  { src: string; srcSet?: string } | { src: undefined } {
  if (!src) return { src: undefined };
  if (!eligible(src)) return { src };
  return {
    src: url(src, cssWidth, quality),
    srcSet: `${url(src, cssWidth, quality)} 1x, ${url(src, cssWidth * 2, quality)} 2x`,
  };
}
