import { createClient } from "jsr:@supabase/supabase-js@2";

// Bonum webhook — төлбөр төлөгдмөгц Bonum POST хийнэ. x-checksum-v2-г HMAC-SHA256-аар
// баталгаажуулж, захиалгын payment_status-ыг шинэчлэнэ. service_role-оор (RLS тойрно).
// Барааны захиалга (orders): ЗӨВХӨН payment_status/paid_at — хүргэлтийн status-ыг хөндөхгүй.
// Зураг авалт (photo_bookings): урьдчилгаа төлөгдөхөд захиалга "Баталгаажсан" болно.
//
// Checksum түлхүүр ЗААВАЛ secret-ээр ирнэ. Урьд нь тестийн түлхүүр fallback болж
// суусан байсан — prod-ын secret тавихаа мартвал чимээгүйхэн тестийн түлхүүрээр
// шалгаад бүх жинхэнэ callback-ийг "invalid checksum" болгож хаячихна.

async function hmacHex(body: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  const CHECKSUM_KEY = Deno.env.get("BONUM_CHECKSUM_KEY");
  if (!CHECKSUM_KEY) {
    console.error("bonum-webhook: BONUM_CHECKSUM_KEY secret тавиагүй байна");
    return new Response(JSON.stringify({ ok: false, error: "webhook not configured" }), { status: 503, headers: { "Content-Type": "application/json" } });
  }

  const raw = await req.text();
  const got = req.headers.get("x-checksum-v2") || "";
  const expected = await hmacHex(raw, CHECKSUM_KEY);
  if (got.toLowerCase() !== expected.toLowerCase()) {
    console.error("bonum-webhook: checksum таарахгүй байна");
    return new Response(JSON.stringify({ ok: false, error: "invalid checksum" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let msg: any = {};
  try { msg = JSON.parse(raw); } catch { return new Response(JSON.stringify({ ok: false, error: "bad json" }), { status: 400 }); }

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const type = msg.type;
  const status = msg.status;
  const txId = msg.body?.transactionId;
  const invId = msg.body?.invoiceId;

  // Bonum-ын бүх callback-ийг түүхэнд үлдээнэ — амжилтгүй болсон ШАЛТГААНЫГ
  // хойно нь харах цорын ганц эх сурвалж (Bonum-ын хариу энд бүтнээрээ ирдэг).
  try {
    await admin.from("bonum_events").insert({ type, status, transaction_id: txId, invoice_id: invId, payload: msg });
  } catch (e) {
    console.error("bonum-webhook: event хадгалж чадсангүй", String(e));
  }

  if (type === "PAYMENT" && txId) {
    if (status === "SUCCESS") {
      const paidAt = new Date().toISOString();
      // Барааны захиалга — зөвхөн төлбөрийн төлөв
      const o = await admin.from("orders")
        .update({ payment_status: "paid", paid_at: paidAt }).eq("transaction_id", txId).select("id");
      // Зураг авалт — төлбөр ормогц захиалга баталгаажна
      const p = await admin.from("photo_bookings")
        .update({ payment_status: "paid", paid_at: paidAt, status: "Баталгаажсан" }).eq("transaction_id", txId).select("id");

      // Хэрэглэгч "Дахин төлөх" дарсны дараа ХУУЧИН төлбөрийн хуудсаа гүйцээж
      // болно. Тэр үед мөрийн transaction_id аль хэдийн шинэчлэгдсэн байх тул
      // яг таарахгүй. Мөнгө орсон атал төлөгдөөгүй гэж үлдэхээс сэргийлж
      // анхны хэсгээр нь (…-rXXX-гүй) хайж дахин оролдоно.
      if ((o.data?.length ?? 0) === 0 && (p.data?.length ?? 0) === 0) {
        const base = txId.replace(/-r[a-z0-9]+$/i, "");
        console.error("bonum-webhook: SUCCESS яг таарсангүй, угтвараар хайж байна —", base);
        await admin.from("orders").update({ payment_status: "paid", paid_at: paidAt })
          .like("transaction_id", `${base}%`).neq("payment_status", "paid");
        await admin.from("photo_bookings").update({ payment_status: "paid", paid_at: paidAt, status: "Баталгаажсан" })
          .like("transaction_id", `${base}%`).neq("payment_status", "paid");
      }
    } else if (status === "FAILED") {
      // FAILED-ийг ЗӨВХӨН яг таарсан үед бичнэ — хуучин оролдлогын хоцорсон
      // FAILED нь шинэ оролдлогын төлөвийг дарж болохгүй.
      await admin.from("orders").update({ payment_status: "failed" }).eq("transaction_id", txId);
      await admin.from("photo_bookings").update({ payment_status: "failed" }).eq("transaction_id", txId);
    }
  }
  // Bonum-д 200 буцааж ack өгнө
  return new Response(JSON.stringify({ ok: true, type, status, invoiceId: invId }), { status: 200, headers: { "Content-Type": "application/json" } });
});
