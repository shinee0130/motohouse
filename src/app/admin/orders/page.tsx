"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { fmt } from "@/lib/data";
import { orderBadge, type Order } from "@/lib/account";
import { getOrders } from "@/lib/queries";
import { updateOrderStatus } from "@/lib/admin";

const STATUSES: Order["status"][] = ["Хүлээгдэж буй", "Баталгаажсан", "Хүргэгдсэн", "Цуцлагдсан"];

export default function AdminOrders() {
  const [list, setList] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function refresh() { setList(await getOrders()); setLoaded(true); }
  useEffect(() => { refresh(); }, []);

  async function changeStatus(id: string, status: Order["status"]) {
    setList((l) => l.map((o) => (o.id === id ? { ...o, status } : o))); // шуурхай UI
    await updateOrderStatus(id, status);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={sx("font:700 18px Montserrat;color:#fff;")}>Захиалга ({list.length})</div>

      <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
        {list.map((o) => (
          <div key={o.id} style={sx("display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:16px 18px;border-bottom:1px solid #1c1c1f;")}>
            <div style={{ minWidth: 180 }}>
              <div style={sx("font:700 15px Montserrat;color:#fff;")}>{o.item}</div>
              <div style={sx("font:400 12px 'JetBrains Mono';color:#8A8F98;margin-top:3px;")}>{o.id} · {o.date} · {o.qty}ш</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <span style={sx("font:800 15px Montserrat;color:#fff;")}>{fmt(o.total)}</span>
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
        ))}
        {loaded && list.length === 0 && <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Захиалга алга.</div>}
        {!loaded && <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Ачаалж байна…</div>}
      </div>
    </div>
  );
}
