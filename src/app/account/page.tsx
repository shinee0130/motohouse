"use client";

import Link from "next/link";
import { sx } from "@/lib/sx";
import { useAuth } from "@/lib/auth";
import { fmt } from "@/lib/data";
import { ORDERS, orderBadge } from "@/lib/account";

const CARD = "background:#111113;border:1px solid #262626;border-radius:16px;padding:22px;";

export default function AccountOverview() {
  const { user } = useAuth();
  const stats = [
    { label: "Захиалга", value: String(ORDERS.length), href: "/account/orders" },
    { label: "Хүслийн жагсаалт", value: "4", href: "/account/wishlist" },
    { label: "Bonus оноо", value: "1,250", href: "/account" },
  ];
  const recent = ORDERS.slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={sx(CARD)}>
        <div style={sx("font:800 22px Montserrat;color:#fff;")}>Сайн уу, {user?.name || "Райдер"} 👋</div>
        <div style={sx("font:400 14px Roboto;color:#8A8F98;margin-top:6px;")}>
          Тавтай морил. Энд захиалга, хүслийн жагсаалт, профайлаа удирдана.
        </div>
      </div>

      {/* stats */}
      <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;")}>
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="mh-card" style={sx(CARD + "display:block;cursor:pointer;")}>
            <div style={sx("font:800 30px Montserrat;color:#E10613;")}>{s.value}</div>
            <div style={sx("font:500 13px Roboto;color:#A3A3A3;margin-top:4px;")}>{s.label}</div>
          </Link>
        ))}
      </div>

      {/* recent orders */}
      <div style={sx(CARD)}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={sx("font:700 16px Montserrat;color:#fff;")}>Сүүлийн захиалга</div>
          <Link href="/account/orders" style={sx("font:600 13px Montserrat;color:#A3A3A3;")}>Бүгдийг →</Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recent.map((o) => (
            <div
              key={o.id}
              style={sx("display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;background:#0B0B0D;border:1px solid #1c1c1f;border-radius:12px;padding:14px 16px;")}
            >
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
        </div>
      </div>
    </div>
  );
}
