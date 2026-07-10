"use client";

import { useEffect, useMemo, useState } from "react";
import { sx } from "@/lib/sx";
import { Select } from "@/components/Select";
import { fmt } from "@/lib/data";
import { orderBadge, paymentBadge, paymentLabel, type Order } from "@/lib/account";
import { getOrders } from "@/lib/queries";
import { updateOrderStatus } from "@/lib/admin";

const STATUSES: Order["status"][] = ["Хүлээгдэж буй", "Баталгаажсан", "Хүргэгдсэн", "Цуцлагдсан"];
type Filter = "all" | "undelivered" | "delivered";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Бүгд" },
  { key: "undelivered", label: "Хүргэгдээгүй" },
  { key: "delivered", label: "Хүргэгдсэн" },
];
type PayFilter = "all" | "paid" | "unpaid";
const PAY_FILTERS: { key: PayFilter; label: string }[] = [
  { key: "all", label: "Төлбөр: бүгд" },
  { key: "paid", label: "Төлсөн" },
  { key: "unpaid", label: "Төлөгдөөгүй" },
];

export default function AdminOrders() {
  const [list, setList] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [payFilter, setPayFilter] = useState<PayFilter>("all");

  async function refresh() { setList(await getOrders()); setLoaded(true); }
  useEffect(() => { refresh(); }, []);

  async function changeStatus(id: string, status: Order["status"]) {
    setList((l) => l.map((o) => (o.id === id ? { ...o, status } : o))); // шуурхай UI
    await updateOrderStatus(id, status);
  }
  async function markDelivered(id: string) { await changeStatus(id, "Хүргэгдсэн"); }

  const shown = useMemo(() => {
    let l = list;
    if (filter === "delivered") l = l.filter((o) => o.status === "Хүргэгдсэн");
    else if (filter === "undelivered") l = l.filter((o) => o.status !== "Хүргэгдсэн" && o.status !== "Цуцлагдсан");
    if (payFilter === "paid") l = l.filter((o) => o.paymentStatus === "paid");
    else if (payFilter === "unpaid") l = l.filter((o) => o.paymentStatus !== "paid");
    return l;
  }, [list, filter, payFilter]);

  const undeliveredCount = list.filter((o) => o.status !== "Хүргэгдсэн" && o.status !== "Цуцлагдсан").length;
  const paidCount = list.filter((o) => o.paymentStatus === "paid").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={sx("font:700 18px Montserrat;color:#fff;")}>Захиалга ({list.length})</div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div style={sx("font:600 12px Montserrat;color:#22c55e;")}>Төлсөн: {paidCount}</div>
          <div style={sx("font:600 12px Montserrat;color:#f59e0b;")}>Хүргэгдээгүй: {undeliveredCount}</div>
        </div>
      </div>

      {/* хүргэлтийн шүүлт */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FILTERS.map((ff) => (
          <button key={ff.key} onClick={() => setFilter(ff.key)}
            style={sx(`cursor:pointer;font:700 12px Montserrat;padding:8px 16px;border-radius:999px;${filter === ff.key ? "background:#E10613;border:1px solid #E10613;color:#fff;" : "background:#111113;border:1px solid #333;color:#C8C8C8;"}`)}>
            {ff.label}
          </button>
        ))}
      </div>

      {/* төлбөрийн шүүлт */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {PAY_FILTERS.map((ff) => (
          <button key={ff.key} onClick={() => setPayFilter(ff.key)}
            style={sx(`cursor:pointer;font:700 12px Montserrat;padding:8px 16px;border-radius:999px;${payFilter === ff.key ? "background:#22c55e;border:1px solid #22c55e;color:#04120a;" : "background:#111113;border:1px solid #333;color:#C8C8C8;"}`)}>
            {ff.label}
          </button>
        ))}
      </div>

      <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
        {shown.map((o) => {
          const delivered = o.status === "Хүргэгдсэн";
          return (
            <div key={o.id} style={sx("display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:16px 18px;border-bottom:1px solid #1c1c1f;")}>
              <div style={{ minWidth: 180 }}>
                <div style={sx("font:700 15px Montserrat;color:#fff;")}>{o.item}</div>
                {/* захиалагч */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                  <span style={sx("width:22px;height:22px;border-radius:50%;background:#E10613;color:#fff;display:flex;align-items:center;justify-content:center;font:800 10px Montserrat;flex:none;")}>
                    {(o.userName || "?").trim().charAt(0).toUpperCase()}
                  </span>
                  <span style={sx("font:600 13px Roboto;color:#C8C8C8;")}>{o.userName || "Зочин"}</span>
                  {o.userPhone && <span style={sx("font:400 12px 'JetBrains Mono';color:#8A8F98;")}>· {o.userPhone}</span>}
                </div>
                <div style={sx("font:400 11px 'JetBrains Mono';color:#6b7280;margin-top:4px;")}>{o.id} · {o.date} · {o.qty}ш</div>
                {o.shipCountry && (
                  <div style={sx("margin-top:8px;background:#0B0B0D;border:1px solid #262626;border-radius:9px;padding:8px 10px;max-width:340px;")}>
                    <div style={sx("font:700 10px 'JetBrains Mono';letter-spacing:.1em;color:#E10613;")}>🚚 ХҮРГЭЛТ · {o.shipCountry}</div>
                    <div style={sx("font:600 12px Roboto;color:#C8C8C8;margin-top:4px;")}>{o.shipName}{o.shipPhone ? ` · ${o.shipPhone}` : ""}</div>
                    {o.shipAddress && <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:2px;white-space:pre-wrap;")}>{o.shipAddress}</div>}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={sx("font:800 15px Montserrat;color:#fff;")}>{fmt(o.total)}</span>
                {/* төлбөрийн төлөв */}
                <span style={sx(paymentBadge(o.paymentStatus))}>{paymentLabel(o.paymentStatus)}</span>
                {/* хүргэлтийн төлөв */}
                <span style={sx(`font:700 11px Montserrat;letter-spacing:.03em;padding:6px 12px;border-radius:999px;${delivered ? "color:#22c55e;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.35);" : "color:#f59e0b;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.35);"}`)}>
                  {delivered ? "✓ Хүргэгдсэн" : "Хүргэгдээгүй"}
                </span>
                {!delivered && o.status !== "Цуцлагдсан" && (
                  <button onClick={() => markDelivered(o.id)} style={sx("background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.4);color:#22c55e;font:700 12px Montserrat;padding:7px 12px;border-radius:8px;cursor:pointer;")}>Хүргэсэн ✓</button>
                )}
                <span style={sx(orderBadge(o.status))}>{o.status}</span>
                <Select value={o.status} onChange={(v) => changeStatus(o.id, v as Order["status"])} full bg="#050505" options={STATUSES.map((s) => ({ value: s, label: s }))} />
              </div>
            </div>
          );
        })}
        {loaded && shown.length === 0 && <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Захиалга алга.</div>}
        {!loaded && <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Ачаалж байна…</div>}
      </div>
    </div>
  );
}
