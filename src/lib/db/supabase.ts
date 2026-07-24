import { createClient } from "@supabase/supabase-js";

// NEXT_PUBLIC_* түлхүүрүүд нь нийтийн (browser bundle-д ордог, RLS-ээр хамгаалагдсан).
// Vercel дээр env тохируулаагүй ч ажиллахын тулд fallback default-той.
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ejdvftjtotahcummzlpn.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_9RCkeFjig-YglvXYM_-a2A_276Qiljg";

// Нийтийн client — унших + auth. (Зураг upload нь admin-upload Edge Function-оор.)
export const supabase = createClient(URL, KEY);

// Storage upload-д зориулж (supabase-js storage client нэвтэрсэн token-ыг зөв
// дамжуулдаггүй тул REST API руу гараар илгээхэд ашиглана).
export const SUPABASE_URL = URL;
export const SUPABASE_KEY = KEY;
