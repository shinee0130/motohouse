// Захиалгын хүсэлтийн мэдэгдэл — и-мэйлээр.
//   kind="new"   → админ руу "шинэ хүсэлт ирлээ"
//   kind="quote" → захиалагч руу "танд үнийн санал ирлээ"
//
// Мэдэгдлийн бичлэг нь DB-ийн trigger-ээр notifications хүснэгтэд аль хэдийн
// орсон байдаг. Энэ функц нь зөвхөн И-МЭЙЛ давхарга. RESEND_API_KEY тавиагүй
// бол алдаа шидэлгүй "skipped" гэж буцаана — сайт эвдрэхгүй.
//
// Дараа апп гарахад: notifications хүснэгтийг уншиж push илгээх хэсгийг
// энэ функц дотор эсвэл тусад нь нэмнэ. DB тал өөрчлөгдөхгүй.

import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const j = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

const SITE = "https://motohouse.mn";
const WRAP = (title: string, inner: string) => `<div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:#0B0B0D;color:#e8e8e8;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#111113;border:1px solid #262626;border-radius:14px;padding:22px">
    <div style="font:700 12px/1 system-ui;letter-spacing:.18em;color:#E10613">MOTO HOUSE</div>
    <h1 style="font-size:19px;margin:12px 0 14px;color:#fff">${esc(title)}</h1>
    ${inner}
  </div>
</div>`;

const row = (k: string, v: string) =>
  `<tr><td style="padding:6px 0;color:#8A8F98;font-size:13px;white-space:nowrap">${esc(k)}</td>
       <td style="padding:6px 0 6px 14px;color:#e8e8e8;font-size:13px">${esc(v)}</td></tr>`;

async function send(to: string[], subject: string, html: string): Promise<string> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return "skipped: RESEND_API_KEY тавиагүй";
  if (to.length === 0) return "skipped: хүлээн авагч алга";
  const from = Deno.env.get("ORDER_NOTIFY_FROM") ?? "MOTO HOUSE <noreply@motohouse.mn>";
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
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return j({ error: "method not allowed" }, 405);

  let body: { kind?: string; requestId?: string };
  try { body = await req.json(); } catch { return j({ error: "bad json" }, 400); }

  const kind = body.kind;
  const requestId = String(body.requestId ?? "").trim();
  if (kind !== "new" && kind !== "quote") return j({ error: "kind must be new|quote" }, 400);
  if (!requestId) return j({ error: "requestId required" }, 400);

  const url = Deno.env.get("SUPABASE_URL");
  const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !svc) return j({ error: "not configured" }, 503);
  const admin = createClient(url, svc);

  // Хүсэлтийг DB-ээс уншина — клиентээс ирсэн утгад найдахгүй.
  const { data: r, error } = await admin
    .from("order_requests")
    .select("id, category, detail, quote, name, phone, email, created_at")
    .eq("id", requestId)
    .maybeSingle();
  if (error) return j({ error: error.message }, 500);
  if (!r) return j({ error: "request not found" }, 404);

  if (kind === "new") {
    const to = (Deno.env.get("ORDER_NOTIFY_TO") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const html = WRAP("Шинэ захиалгын хүсэлт", `
      <table style="border-collapse:collapse;width:100%">
        ${row("Ангилал", r.category ?? "-")}
        ${row("Захиалагч", `${r.name ?? "Зочин"}${r.phone ? " · " + r.phone : ""}`)}
        ${r.email ? row("И-мэйл", r.email) : ""}
        ${row("Дугаар", r.id)}
      </table>
      <div style="margin-top:14px;background:#0B0B0D;border:1px solid #262626;border-radius:10px;padding:12px;
                  font-size:13px;line-height:1.6;white-space:pre-wrap">${esc(r.detail ?? "")}</div>
      <a href="${SITE}/admin/requests" style="display:inline-block;margin-top:16px;background:#E10613;color:#fff;
         text-decoration:none;font-weight:700;font-size:13px;padding:11px 18px;border-radius:9px">Админ дээр нээх</a>`);
    return j({ ok: true, status: await send(to, `🛎️ Шинэ хүсэлт — ${r.category ?? "Бусад"}`, html) });
  }

  // kind === "quote" — захиалагч руу
  const to = String(r.email ?? "").trim();
  if (!to) return j({ ok: true, status: "skipped: захиалагчийн и-мэйл алга" });
  const html = WRAP("Таны хүсэлтэд үнийн санал ирлээ", `
    <div style="color:#8A8F98;font-size:13px">${esc(r.category ?? "")} · ${esc(r.id)}</div>
    <div style="margin-top:14px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.3);
                border-radius:10px;padding:14px;font-size:14px;line-height:1.6;white-space:pre-wrap;color:#fff">${esc(r.quote ?? "")}</div>
    <div style="margin-top:14px;color:#8A8F98;font-size:13px;line-height:1.6">Таны хүсэлт:</div>
    <div style="margin-top:6px;background:#0B0B0D;border:1px solid #262626;border-radius:10px;padding:12px;
                font-size:13px;line-height:1.6;white-space:pre-wrap">${esc(r.detail ?? "")}</div>
    <a href="${SITE}/account/requests" style="display:inline-block;margin-top:16px;background:#E10613;color:#fff;
       text-decoration:none;font-weight:700;font-size:13px;padding:11px 18px;border-radius:9px">Хүсэлтээ харах</a>
    <div style="margin-top:16px;color:#6b7280;font-size:12px">Асуух зүйл байвал энэ и-мэйлд хариулах эсвэл +976 9011-7748 руу залгаарай.</div>`);
  return j({ ok: true, status: await send([to], "MOTO HOUSE — таны хүсэлтэд үнийн санал ирлээ", html) });
});
