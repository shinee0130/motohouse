import { createClient } from "jsr:@supabase/supabase-js@2";

// Checkout дуудна → Bonum invoice үүсгэж followUpLink буцаана.
// Дүнг клиентээс АВАХГҮЙ — DB дэх захиалгын нийлбэрээс авна (аюулгүй).
// kind="order" (барааны захиалга, default) | "photo" (зураг авалтын урьдчилгаа).
//
// Bonum-ын тохиргоо ЗААВАЛ Edge Function secret-ээр ирнэ. Урьд нь энд тестийн
// түлхүүр fallback болж суусан байсан — secret дутуу үед чимээгүйхэн
// testapi.bonum.mn руу явчихдаг, хэрэглэгч жинхэнэ төлбөрөө хийж чадахгүй
// 30 минутын дараа л FAILED болдог байв. Одоо дутуу бол шууд алдаа өгнө.
const REQUIRED = ["BONUM_API_BASE", "BONUM_SECRET_KEY", "BONUM_TERMINAL_ID"] as const;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const j = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    const missing = REQUIRED.filter((k) => !Deno.env.get(k));
    if (missing.length > 0) {
      console.error("bonum-invoice: тохиргоо дутуу —", missing.join(", "));
      return j({ error: "payment not configured", missing }, 503);
    }
    const API_BASE = Deno.env.get("BONUM_API_BASE")!.replace(/\/+$/, "");
    const SECRET = Deno.env.get("BONUM_SECRET_KEY")!;
    const TERMINAL = Deno.env.get("BONUM_TERMINAL_ID")!;
    const SITE = Deno.env.get("SITE_URL") ?? "https://www.motohouse.mn";

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const token = (req.headers.get("Authorization") || "").replace("Bearer ", "").trim();
    const { data: { user }, error: uErr } = await admin.auth.getUser(token);
    if (uErr || !user) return j({ error: "unauthorized" }, 401);
    const { data: prof } = await admin.from("profiles").select("phone").eq("id", user.id).maybeSingle();
    const phone = prof?.phone;
    if (!phone) return j({ error: "no profile phone" }, 400);

    const { transactionId, kind } = await req.json();
    if (!transactionId) return j({ error: "missing transactionId" }, 400);

    // Дүнг DB-ээс (тухайн хэрэглэгчийн, төлөөгүй)
    let amount = 0;
    let callback = `${SITE}/account/orders`;

    if (kind === "photo") {
      // Зураг авалт — урьдчилгааг (deposit) төлнө
      const { data: rows } = await admin.from("photo_bookings").select("deposit, price")
        .eq("transaction_id", transactionId).eq("user_phone", phone).neq("payment_status", "paid");
      if (!rows || rows.length === 0) return j({ error: "no photo bookings for transaction" }, 404);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      amount = rows.reduce((s: number, r: any) => s + Number(r.deposit ?? r.price ?? 0), 0);
      callback = `${SITE}/photo`;
    } else {
      const { data: orders } = await admin.from("orders").select("total")
        .eq("transaction_id", transactionId).eq("user_phone", phone).neq("payment_status", "paid");
      if (!orders || orders.length === 0) return j({ error: "no orders for transaction" }, 404);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      amount = orders.reduce((s: number, o: any) => s + Number(o.total || 0), 0);
    }

    amount = Math.round(amount);
    if (amount <= 0) return j({ error: "invalid amount" }, 400);

    // Bonum auth
    const authRes = await fetch(`${API_BASE}/bonum-gateway/ecommerce/auth/create`, { headers: { Authorization: `AppSecret ${SECRET}`, "X-TERMINAL-ID": TERMINAL } });
    const authJson = await authRes.json();
    const accessToken = authJson.accessToken;
    if (!accessToken) return j({ error: "bonum auth failed", detail: authJson }, 502);

    // Invoice үүсгэх
    const invRes = await fetch(`${API_BASE}/bonum-gateway/ecommerce/invoices`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", "Accept-Language": "mn" },
      body: JSON.stringify({ amount, callback, transactionId, expiresIn: 1800 }),
    });
    const invJson = await invRes.json();
    if (!invJson.followUpLink) return j({ error: "bonum invoice failed", detail: invJson }, 502);

    const table = kind === "photo" ? "photo_bookings" : "orders";
    await admin.from(table).update({ bonum_invoice_id: invJson.invoiceId, payment_status: "pending" })
      .eq("transaction_id", transactionId).eq("user_phone", phone).neq("payment_status", "paid");
    return j({ followUpLink: invJson.followUpLink, amount });
  } catch (e) {
    return j({ error: String(e) }, 500);
  }
});
