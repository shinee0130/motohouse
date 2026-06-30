"use client";

import { useEffect, useMemo, useState } from "react";
import { sx } from "@/lib/sx";
import { fmt } from "@/lib/data";
import { orderBadge, type Order } from "@/lib/account";
import { getOrders } from "@/lib/queries";
import { updateOrderStatus } from "@/lib/admin";

const STATUSES: Order["status"][] = ["Хүлээгдэж буй", "Баталгаажсан", "Хүргэгдсэн", "Цуцлагдсан"];
type Filter = "all" | "undelivered" | "delivered";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Бүгд" },
  { key: "undelivered", label: "Хүргэгдээгүй" },
  { key: "delivered", label: "Хүргэгдсэн" },
];

export default function AdminOrders() {
  const [list, setList] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  async function refresh() { setList(await getOrders()); setLoaded(true); }
  useEffect(() => { refresh(); }, []);

  async function changeStatus(id: string, status: Order["status"]) {
    setList((l) => l.map((o) => (o.id === id ? { ...o, status } : o))); // шуурхай UI
    await updateOrderStatus(id, status);
  }
  async function markDelivered(id: string) { await changeStatus(id, "Хүргэгдсэн"); }

  const shown = useMemo(() => {
    if (filter === "delivered") return list.filter((o) => o.status === "Хүргэгдсэн");
    if (filter === "undelivered") return list.filter((o) => o.status !== "Хүргэгдсэн" && o.status !== "Цуцлагдсан");
    return list;
  }, [list, filter]);

  const undeliveredCount = list.filter((o) => o.status !== "Хүргэгдсэн" && o.status !== "Цуцлагдсан").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={sx("font:700 18px Montserrat;color:#fff;")}>Захиалга ({list.length})</div>
        <div style={sx("font:600 12px Montserrat;color:#f59e0b;")}>Хүргэгдээгүй: {undeliveredCount}</div>
      </div>

      {/* filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FILTERS.map((ff) => (
          <button key={ff.key} onClick={() => setFilter(ff.key)}
            style={sx(`cursor:pointer;font:700 12px Montserrat;padding:8px 16px;border-radius:999px;${filter === ff.key ? "background:#E10613;border:1px solid #E10613;color:#fff;" : "background:#111113;border:1px solid #333;color:#C8C8C8;"}`)}>
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
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={sx("font:800 15px Montserrat;color:#fff;")}>{fmt(o.total)}</span>
                {/* хүргэлтийн төлөв */}
                <span style={sx(`font:700 11px Montserrat;letter-spacing:.03em;padding:6px 12px;border-radius:999px;${delivered ? "color:#22c55e;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.35);" : "color:#f59e0b;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.35);"}`)}>
                  {delivered ? "✓ Хүргэгдсэн" : "Хүргэгдээгүй"}
                </span>
                {!delivered && o.status !== "Цуцлагдсан" && (
                  <button onClick={() => markDelivered(o.id)} style={sx("background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.4);color:#22c55e;font:700 12px Montserrat;padding:7px 12px;border-radius:8px;cursor:pointer;")}>Хүргэсэн ✓</button>
                )}
                <span style={sx(orderBadge(o.status))}>{o.status}</span>
                <select
                  value={o.status}
                  onChange={(e) => changeStatus(o.id, e.target.value as Order["status"])}
                  style={sx("background:#050505;border:1px solid #262626;border-radius:8px;padding:8px 10px;color:#fff;font:500 12px Roboto;cursor:pointer;outline:none;")}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
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
