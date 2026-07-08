import { createClient } from "@supabase/supabase-js";

// NEXT_PUBLIC_* түлхүүрүүд нь нийтийн (browser bundle-д ордог, RLS-ээр хамгаалагдсан — secret БИШ).
// Vercel дээр env тохируулаагүй ч ажиллахын тулд fallback default-той.
// ⚠️ Legacy anon JWT key ашиглана — шинэ sb_publishable_ key нь storage-api-д
// authenticated session-ыг зөв дамжуулдаггүй (upload anon болж RLS-д унадаг) байсныг зассан.
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ejdvftjtotahcummzlpn.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqZHZmdGp0b3RhaGN1bW16bHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MTY1MDQsImV4cCI6MjA5ODM5MjUwNH0.O9XBD796mEKoHupDMucmKfc8E01cyP6iWIqs_mBFop4";
// Хэрэв env-д publishable (sb_publishable_) байвал үл тоомсорлож anon JWT-г ашиглана.
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const KEY = envKey && !envKey.startsWith("sb_publishable_") ? envKey : ANON_KEY;

// Нийтийн (anon/publishable) client — унших + (demo) бичих.
export const supabase = createClient(URL, KEY);

// Storage upload-д зориулж (supabase-js storage client нэвтэрсэн token-ыг зөв
// дамжуулдаггүй тул REST API руу гараар илгээхэд ашиглана).
export const SUPABASE_URL = URL;
export const SUPABASE_KEY = KEY;
