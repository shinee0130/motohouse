"use client";

import { sx } from "@/lib/sx";
import { fmt } from "@/lib/data";
import { ORDERS, orderBadge } from "@/lib/account";

export default function OrdersPage() {
  return (
    <div style={sx("background:#111113;border:1px solid #262626;border-radius:16px;padding:clamp(18px,3vw,26px);")}>
      <div style={sx("font:700 18px Montserrat;color:#fff;margin-bottom:18px;")}>Миний захиалга</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {ORDERS.map((o) => (
          <div
            key={o.id}
            style={sx("display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;background:#0B0B0D;border:1px solid #1c1c1f;border-radius:12px;padding:16px 18px;")}
          >
            <div style={{ minWidth: 180 }}>
              <div style={sx("font:700 15px Montserrat;color:#fff;")}>{o.item}</div>
              <div style={sx("font:400 12px 'JetBrains Mono';color:#8A8F98;margin-top:4px;")}>
                {o.id} · {o.date} · {o.qty}ш
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={sx("font:800 15px Montserrat;color:#fff;")}>{fmt(o.total)}</span>
              <span style={sx(orderBadge(o.status))}>{o.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
