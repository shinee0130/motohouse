"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { Price } from "@/lib/currency";
import { orderBadge, paymentBadge, paymentLabel, type Order } from "@/lib/account";
import { useAuth } from "@/lib/auth";
import { getUserOrders } from "@/lib/queries";

export default function OrdersPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserOrders(user.phone).then((o) => { setList(o); setLoaded(true); });
  }, [user]);

  return (
    <div style={sx("background:#111113;border:1px solid #262626;border-radius:16px;padding:clamp(18px,3vw,26px);")}>
      <div style={sx("font:700 18px Montserrat;color:#fff;margin-bottom:18px;")}>Миний захиалга</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {list.map((o) => (
          <div key={o.id} style={sx("display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;background:#0B0B0D;border:1px solid #1c1c1f;border-radius:12px;padding:16px 18px;")}>
            <div style={{ minWidth: 180 }}>
              <div style={sx("font:700 15px Montserrat;color:#fff;")}>{o.item}</div>
              <div style={sx("font:400 12px 'JetBrains Mono';color:#8A8F98;margin-top:4px;")}>{o.id} · {o.date} · {o.qty}ш</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={sx("font:800 15px Montserrat;color:#fff;")}><Price amount={o.total} /></span>
              <span style={sx(paymentBadge(o.paymentStatus))}>{paymentLabel(o.paymentStatus)}</span>
              <span style={sx(orderBadge(o.status))}>{o.status}</span>
            </div>
          </div>
        ))}
        {loaded && list.length === 0 && <div style={sx("padding:20px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Захиалга алга. Дэлгүүрээс мотоцикл эсвэл бараа захиалаарай.</div>}
        {!loaded && <div style={sx("padding:20px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Ачаалж байна…</div>}
      </div>
    </div>
  );
}
