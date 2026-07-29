"use client";

import { useEffect, useMemo, useState } from "react";
import { sx } from "@/lib/ui/sx";
import { fmt } from "@/lib/db/data";
import { getBonumEvents, getOrders, type BonumEvent } from "@/lib/db/queries";
import type { Order } from "@/lib/commerce/account";

// Bonum-ын webhook callback бүрийг эндээс хардаг. Төлбөр яагаад амжилтгүй
// болсныг мэдэх цорын ганц газар — Bonum шалтгаанаа зөвхөн энэ хариунд явуулдаг.

type Filter = "all" | "SUCCESS" | "FAILED";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Бүгд" },
  { key: "SUCCESS", label: "Амжилттай" },
  { key: "FAILED", label: "Амжилтгүй" },
];

function statusBadge(status: string | null): string {
  const base = "font:700 11px Montserrat;letter-spacing:.04em;padding:5px 11px;border-radius:6px;display:inline-block;";
  if (status === "SUCCESS") return base + "color:#22c55e;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.35);";
  if (status === "FAILED") return base + "color:#ef4444;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.35);";
  return base + "color:#8A8F98;background:#1a1a1d;border:1px solid #333;";
}

// Bonum шалтгаанаа тогтмол нэрээр явуулдаггүй тул магадлалтай талбаруудыг шүүнэ.
function reasonOf(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  const body = (p.body && typeof p.body === "object" ? p.body : {}) as Record<string, unknown>;
  for (const src of [body, p]) {
    for (const k of ["reason", "message", "description", "errorMessage", "statusMessage", "error"]) {
      const v = src[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return null;
}

function timeOf(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function AdminPayments() {
  const [events, setEvents] = useState<BonumEvent[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<number | null>(null);

  async function refresh() {
    const [e, o] = await Promise.all([getBonumEvents(), getOrders()]);
    setEvents(e);
    setOrders(o);
    setLoaded(true);
  }
  useEffect(() => { refresh(); }, []);

  // transaction_id → захиалга (аль барааны төлбөр байсныг харуулна)
  const byTx = useMemo(() => {
    const m = new Map<string, Order>();
    for (const o of orders) if (o.transactionId) m.set(o.transactionId, o);
    return m;
  }, [orders]);

  const shown = useMemo(
    () => (filter === "all" ? events : events.filter((e) => e.status === filter)),
    [events, filter],
  );

  const ok = events.filter((e) => e.status === "SUCCESS").length;
  const bad = events.filter((e) => e.status === "FAILED").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={sx("font:700 18px Montserrat;color:#fff;")}>Төлбөрийн лог · Bonum ({events.length})</div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div style={sx("font:600 12px Montserrat;color:#22c55e;")}>Амжилттай: {ok}</div>
          <div style={sx("font:600 12px Montserrat;color:#ef4444;")}>Амжилтгүй: {bad}</div>
        </div>
      </div>

      <div style={sx("background:#0e0e10;border:1px solid #262626;border-radius:12px;padding:13px 15px;font:400 12px Roboto;color:#8A8F98;line-height:1.6;")}>
        Bonum төлбөрийн хариу бүрийг энд бүтнээр нь хадгална. Мөр дээр дарж түүхий хариуг харна.
        Бичиж эхэлсэн огноо: <b style={sx("color:#C8C8C8;")}>2026-07-29</b> — түүнээс өмнөх захиалгын
        шалтгаан хадгалагдаагүй.
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={sx(`cursor:pointer;font:700 12px Montserrat;padding:8px 16px;border-radius:999px;${filter === f.key ? "background:#E10613;border:1px solid #E10613;color:#fff;" : "background:#111113;border:1px solid #333;color:#C8C8C8;"}`)}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
        {shown.map((e) => {
          const order = e.transactionId ? byTx.get(e.transactionId) : undefined;
          const reason = reasonOf(e.payload);
          const isOpen = open === e.id;
          return (
            <div key={e.id} style={sx("border-bottom:1px solid #1c1c1f;")}>
              <div
                onClick={() => setOpen(isOpen ? null : e.id)}
                style={sx("display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:15px 18px;cursor:pointer;")}
              >
                <div style={{ minWidth: 180, flex: 1 }}>
                  <div style={sx("font:700 15px Montserrat;color:#fff;")}>
                    {order ? order.item : e.transactionId || "—"}
                  </div>
                  <div style={sx("font:400 11px 'JetBrains Mono';color:#6b7280;margin-top:4px;word-break:break-all;")}>
                    {timeOf(e.createdAt)} · {e.type || "—"}
                    {e.transactionId ? ` · ${e.transactionId}` : ""}
                  </div>
                  {reason && (
                    <div style={sx("font:500 12px Roboto;color:#f59e0b;margin-top:6px;")}>⚠ {reason}</div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  {order && <span style={sx("font:700 14px Montserrat;color:#fff;")}>{fmt(order.total)}</span>}
                  <span style={sx(statusBadge(e.status))}>{e.status || "—"}</span>
                  <span style={sx("font:700 12px Montserrat;color:#8A8F98;")}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>
              {isOpen && (
                <pre style={sx("margin:0 18px 16px;background:#050505;border:1px solid #262626;border-radius:10px;padding:13px;overflow-x:auto;font:400 11px 'JetBrains Mono';color:#C8C8C8;line-height:1.6;")}>
                  {JSON.stringify(e.payload, null, 2)}
                </pre>
              )}
            </div>
          );
        })}
        {loaded && shown.length === 0 && (
          <div style={sx("padding:26px 18px;font:400 13px Roboto;color:#8A8F98;")}>
            {events.length === 0
              ? "Одоогоор бичлэг алга. Дараагийн төлбөрийн оролдлогоос эхлэн энд харагдана."
              : "Энэ шүүлтэд тохирох бичлэг алга."}
          </div>
        )}
        {!loaded && <div style={sx("padding:26px 18px;font:400 13px Roboto;color:#8A8F98;")}>Ачаалж байна…</div>}
      </div>
    </div>
  );
}
