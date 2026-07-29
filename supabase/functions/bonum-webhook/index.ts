import { createClient } from "jsr:@supabase/supabase-js@2";

// Bonum webhook — төлбөр төлөгдмөгц Bonum POST хийнэ. x-checksum-v2-г HMAC-SHA256-аар
// баталгаажуулж, захиалгын payment_status-ыг шинэчлэнэ. service_role-оор (RLS тойрно).
// Барааны захиалга (orders): ЗӨВХӨН payment_status/paid_at — хүргэлтийн status-ыг хөндөхгүй.
// Зураг авалт (photo_bookings): урьдчилгаа төлөгдөхөд захиалга "Баталгаажсан" болно.
// Төлбөр орсны дараа дэлгүүрийн хаяг руу имэйл мэдэгдэл явуулна.
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

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const mnt = (n: unknown) => `${Number(n ?? 0).toLocaleString("en-US")}₮`;

function row(label: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  return `<tr><td style="padding:6px 14px 6px 0;color:#6b7280;font-size:13px;white-space:nowrap">${esc(label)}</td>`
    + `<td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600">${esc(value)}</td></tr>`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function orderEmail(rows: any[]): { subject: string; html: string } {
  const total = rows.reduce((s, r) => s + Number(r.total || 0), 0);
  const ids = rows.map((r) => r.id).join(", ");
  const first = rows[0] ?? {};
  const items = rows
    .map((r) => `<li style="margin:4px 0;color:#111827;font-size:14px">${esc(r.item)} × ${esc(r.qty)} — <b>${mnt(r.total)}</b></li>`)
    .join("");
  const delivery = first.delivery_method === "pickup"
    ? "Дэлгүүрээс очиж авна"
    : `Хүргэлт${first.ship_country ? ` · ${first.ship_country}` : ""}`;
  const html = `
<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f4f4f5;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#E10613;padding:16px 22px">
      <div style="color:#fff;font-size:12px;letter-spacing:.14em;font-weight:700">MOTO HOUSE</div>
      <div style="color:#fff;font-size:19px;font-weight:800;margin-top:3px">Төлбөр төлөгдлөө</div>
    </div>
    <div style="padding:20px 22px">
      <div style="font-size:26px;font-weight:800;color:#111827">${mnt(total)}</div>
      <ul style="padding-left:18px;margin:12px 0 16px">${items}</ul>
      <table style="border-collapse:collapse;width:100%">
        ${row("Захиалга", ids)}
        ${row("Захиалагч", first.ship_name)}
        ${row("Утас", first.ship_phone || first.user_phone)}
        ${row("Хүргэлт", delivery)}
        ${row("Хаяг", first.ship_address)}
      </table>
      <a href="https://www.motohouse.mn/admin/orders"
         style="display:inline-block;margin-top:18px;background:#E10613;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:11px 20px;border-radius:9px">
        Админ дээр нээх
      </a>
    </div>
  </div>
</div>`;
  return { subject: `💰 Төлбөр орлоо — ${mnt(total)} · ${ids}`, html };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function photoEmail(rows: any[]): { subject: string; html: string } {
  const b = rows[0] ?? {};
  const html = `
<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f4f4f5;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#E10613;padding:16px 22px">
      <div style="color:#fff;font-size:12px;letter-spacing:.14em;font-weight:700">MOTO HOUSE</div>
      <div style="color:#fff;font-size:19px;font-weight:800;margin-top:3px">Зураг авалт баталгаажлаа</div>
    </div>
    <div style="padding:20px 22px">
      <div style="font-size:26px;font-weight:800;color:#111827">${mnt(b.deposit)}<span style="font-size:14px;font-weight:500;color:#6b7280"> урьдчилгаа</span></div>
      <table style="border-collapse:collapse;width:100%;margin-top:12px">
        ${row("Зурагчин", b.photographer)}
        ${row("Үйлчилгээ", b.service_type)}
        ${row("Огноо", b.booking_date)}
        ${row("Захиалагч", b.name)}
        ${row("Утас", b.phone)}
        ${row("Мотоцикл", b.moto_model)}
        ${row("Нийт үнэ", b.price ? mnt(b.price) : "")}
        ${row("Тэмдэглэл", b.note)}
      </table>
      <a href="https://www.motohouse.mn/admin/photo"
         style="display:inline-block;margin-top:18px;background:#E10613;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:11px 20px;border-radius:9px">
        Админ дээр нээх
      </a>
    </div>
  </div>
</div>`;
  return { subject: `📸 Зураг авалт баталгаажлаа — ${esc(b.booking_date)} · ${esc(b.photographer)}`, html };
}

// Имэйл илгээх. Алдаа гарсан ч ШИДЭХГҮЙ — Bonum-д 200 ack өгөх нь чухал.
// Буцаах утга нь bonum_events.notify_status руу бичигдэнэ (админд харагдана).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendNotify(kind: "order" | "photo", rows: any[]): Promise<string> {
  const key = Deno.env.get("RESEND_API_KEY");
  const to = (Deno.env.get("ORDER_NOTIFY_TO") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!key) return "skipped: RESEND_API_KEY тавиагүй";
  if (to.length === 0) return "skipped: ORDER_NOTIFY_TO тавиагүй";
  if (rows.length === 0) return "skipped: мөр олдсонгүй";

  const from = Deno.env.get("ORDER_NOTIFY_FROM") ?? "MOTO HOUSE <noreply@motohouse.mn>";
  const { subject, html } = kind === "photo" ? photoEmail(rows) : orderEmail(rows);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) return `error ${res.status}: ${(await res.text()).slice(0, 180)}`;
    return "sent";
  } catch (e) {
    return `error: ${String(e).slice(0, 180)}`;
  }
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
  let eventId: number | null = null;
  {
    const { data, error } = await admin.from("bonum_events")
      .insert({ type, status, transaction_id: txId, invoice_id: invId, payload: msg })
      .select("id").single();
    if (error) console.error("bonum-webhook: event хадгалж чадсангүй", error.message);
    eventId = data?.id ?? null;
  }

  if (type === "PAYMENT" && txId) {
    if (status === "SUCCESS") {
      const paidAt = new Date().toISOString();
      // Барааны захиалга — зөвхөн төлбөрийн төлөв
      const o = await admin.from("orders")
        .update({ payment_status: "paid", paid_at: paidAt }).eq("transaction_id", txId).select("*");
      // Зураг авалт — төлбөр ормогц захиалга баталгаажна
      const p = await admin.from("photo_bookings")
        .update({ payment_status: "paid", paid_at: paidAt, status: "Баталгаажсан" }).eq("transaction_id", txId).select("*");

      let orders = o.data ?? [];
      let photos = p.data ?? [];

      // Хэрэглэгч "Дахин төлөх" дарсны дараа ХУУЧИН төлбөрийн хуудсаа гүйцээж
      // болно. Тэр үед мөрийн transaction_id аль хэдийн шинэчлэгдсэн байх тул
      // яг таарахгүй. Мөнгө орсон атал төлөгдөөгүй гэж үлдэхээс сэргийлж
      // анхны хэсгээр нь (…-rXXX-гүй) хайж дахин оролдоно.
      if (orders.length === 0 && photos.length === 0) {
        const base = txId.replace(/(-r[a-z0-9]+)+$/i, "");
        console.error("bonum-webhook: SUCCESS яг таарсангүй, угтвараар хайж байна —", base);
        const o2 = await admin.from("orders").update({ payment_status: "paid", paid_at: paidAt })
          .like("transaction_id", `${base}%`).neq("payment_status", "paid").select("*");
        const p2 = await admin.from("photo_bookings").update({ payment_status: "paid", paid_at: paidAt, status: "Баталгаажсан" })
          .like("transaction_id", `${base}%`).neq("payment_status", "paid").select("*");
        orders = o2.data ?? [];
        photos = p2.data ?? [];
      }

      // Мэдэгдэл — амжилтгүй болсон ч webhook-ийг унагаахгүй.
      let notify = "skipped: төлөгдсөн мөр олдсонгүй";
      if (orders.length > 0) notify = await sendNotify("order", orders);
      else if (photos.length > 0) notify = await sendNotify("photo", photos);
      if (eventId) await admin.from("bonum_events").update({ notify_status: notify }).eq("id", eventId);
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
