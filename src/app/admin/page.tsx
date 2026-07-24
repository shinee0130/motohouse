"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sx } from "@/lib/ui/sx";
import { fmt } from "@/lib/db/data";
import { orderBadge, type Order } from "@/lib/commerce/account";
import { getMotos, getGearAll, getEvents, getOrders } from "@/lib/db/queries";
import { getProfiles } from "@/lib/db/admin";

const CARD = "background:#111113;border:1px solid #262626;border-radius:16px;padding:22px;";

export default function AdminOverview() {
  const [s, setS] = useState({ motos: 0, gear: 0, events: 0, orders: 0, users: 0, inventory: 0, pending: 0 });
  const [recent, setRecent] = useState<Order[]>([]);

  useEffect(() => {
    (async () => {
      const [motos, gear, events, orders, users] = await Promise.all([
        getMotos(), getGearAll(), getEvents(), getOrders(), getProfiles(),
      ]);
      setS({
        motos: motos.length, gear: gear.length, events: events.length, orders: orders.length,
        users: users.length, inventory: motos.reduce((a, m) => a + m.price, 0),
        pending: orders.filter((o) => o.status === "Хүлээгдэж буй").length,
      });
      setRecent(orders.slice(0, 3));
    })();
  }, []);

  const stats = [
    { label: "Мотоцикл", value: s.motos, href: "/admin/motorcycles" },
    { label: "Бараа / сэлбэг", value: s.gear, href: "/admin/gear" },
    { label: "Event", value: s.events, href: "/admin/events" },
    { label: "Захиалга", value: s.orders, href: "/admin/orders" },
    { label: "Хэрэглэгч", value: s.users, href: "/admin/users" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={sx(CARD)}>
        <div style={sx("font:800 22px Montserrat;color:#fff;")}>Тавтай морил, Админ 🛠️</div>
        <div style={sx("font:400 14px Roboto;color:#8A8F98;margin-top:6px;")}>
          Энд бүх зүйлийг (мотоцикл, бараа, Event, захиалга, хэрэглэгч, нүүрний зураг) удирдана. Supabase-тэй холбогдсон — өөрчлөлт хадгалагдана.
        </div>
      </div>

      <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px;")}>
        {stats.map((st) => (
          <Link key={st.label} href={st.href} className="mh-card" style={sx(CARD + "display:block;cursor:pointer;")}>
            <div style={sx("font:800 30px Montserrat;color:#E10613;")}>{st.value}</div>
            <div style={sx("font:500 13px Roboto;color:#A3A3A3;margin-top:4px;")}>{st.label}</div>
          </Link>
        ))}
      </div>

      <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;")}>
        <div style={sx(CARD)}>
          <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.14em;color:#8A8F98;")}>НИЙТ INVENTORY ҮНЭ</div>
          <div style={sx("font:800 26px Montserrat;color:#fff;margin-top:8px;")}>{fmt(s.inventory)}</div>
        </div>
        <div style={sx(CARD)}>
          <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.14em;color:#8A8F98;")}>ХҮЛЭЭГДЭЖ БУЙ ЗАХИАЛГА</div>
          <div style={sx("font:800 26px Montserrat;color:#fff;margin-top:8px;")}>{s.pending}</div>
        </div>
      </div>

      <div style={sx(CARD)}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={sx("font:700 16px Montserrat;color:#fff;")}>Сүүлийн захиалга</div>
          <Link href="/admin/orders" style={sx("font:600 13px Montserrat;color:#A3A3A3;")}>Бүгдийг →</Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recent.map((o) => (
            <div key={o.id} style={sx("display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;background:#0B0B0D;border:1px solid #1c1c1f;border-radius:12px;padding:14px 16px;")}>
              <div>
                <div style={sx("font:700 14px Montserrat;color:#fff;")}>{o.item}</div>
                <div style={sx("font:400 12px 'JetBrains Mono';color:#8A8F98;margin-top:3px;")}>{o.id} · {o.date}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={sx("font:700 14px Montserrat;color:#fff;")}>{fmt(o.total)}</span>
                <span style={sx(orderBadge(o.status))}>{o.status}</span>
              </div>
            </div>
          ))}
          {recent.length === 0 && <div style={sx("font:400 13px Roboto;color:#8A8F98;")}>Ачаалж байна…</div>}
        </div>
      </div>
    </div>
  );
}
