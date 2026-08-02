"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { sx } from "@/lib/ui/sx";
import { fmt } from "@/lib/db/data";
import { orderBadge, type Order } from "@/lib/commerce/account";
import {
  getMotos, getGearAll, getEvents, getOrders, getOrderRequests, getBonumEvents,
  type OrderRequest, type BonumEvent,
} from "@/lib/db/queries";
import { getProfiles, type Profile } from "@/lib/db/admin";
import type { EventItem, GearItem, Moto } from "@/lib/db/data";

const CARD = "background:#111113;border:1px solid #262626;border-radius:16px;padding:22px;";
const LABEL = "font:500 11px 'JetBrains Mono';letter-spacing:.14em;color:#8A8F98;";

// Сайтын шимтгэл. Хувь өөрчлөгдвөл ЗӨВХӨН энд солино.
const COMMISSION_RATE = 0.05;

// Огноо нь "2026.07.31" хэлбэрээр хадгалагддаг. Одоогийн сарын угтвар.
function currentYm(): string {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}
// profiles.created_at нь ISO ("2026-07-14T…") тул тусдаа угтвар
function currentYmIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100));

export default function AdminOverview() {
  const [motos, setMotos] = useState<Moto[]>([]);
  const [gear, setGear] = useState<GearItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [payments, setPayments] = useState<BonumEvent[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [m, g, e, o, u, r, p] = await Promise.all([
        getMotos(), getGearAll(), getEvents(), getOrders(), getProfiles(),
        getOrderRequests(), getBonumEvents(200),
      ]);
      setMotos(m); setGear(g); setEvents(e); setOrders(o);
      setUsers(u); setRequests(r); setPayments(p);
      setLoaded(true);
    })();
  }, []);

  const k = useMemo(() => {
    const ym = currentYm();
    const ymIso = currentYmIso();

    // ---- Орлого: зөвхөн ТӨЛБӨР БАТАЛГААЖСАН, цуцлагдаагүй захиалга ----
    const earning = orders.filter((o) => o.paymentStatus === "paid" && o.status !== "Цуцлагдсан");
    const revenue = earning.reduce((a, o) => a + (o.total ?? 0), 0);
    const monthEarning = earning.filter((o) => (o.date ?? "").startsWith(ym));
    const monthRevenue = monthEarning.reduce((a, o) => a + (o.total ?? 0), 0);

    // ---- Захиалга ----
    const unpaid = orders.filter((o) => o.paymentStatus !== "paid");
    const undelivered = earning.filter((o) => o.status !== "Хүргэгдсэн");

    // ---- Хүсэлт ----
    const openReq = requests.filter((r) => r.status !== "Үнэ өгсөн" && r.status !== "Хаагдсан");
    const reqByCat = new Map<string, number>();
    for (const r of requests) reqByCat.set(r.category || "Бусад", (reqByCat.get(r.category || "Бусад") ?? 0) + 1);

    // ---- Хэрэглэгч ----
    const buyers = new Set(earning.map((o) => o.userPhone).filter(Boolean)).size;
    const newUsers = users.filter((u) => (u.created_at ?? "").startsWith(ymIso)).length;

    // ---- Төлбөрийн амжилт (Bonum лог) ----
    const payOk = payments.filter((p) => (p.status ?? "").toUpperCase() === "SUCCESS").length;

    return {
      revenue, commission: Math.round(revenue * COMMISSION_RATE),
      monthRevenue, monthCommission: Math.round(monthRevenue * COMMISSION_RATE),
      monthOrders: monthEarning.length,
      avgOrder: earning.length ? Math.round(revenue / earning.length) : 0,
      paidCount: earning.length, unpaidCount: unpaid.length, undelivered: undelivered.length,
      reqTotal: requests.length, reqOpen: openReq.length,
      reqByCat: [...reqByCat.entries()].sort((a, b) => b[1] - a[1]),
      buyers, newUsers, conversion: pct(buyers, users.length),
      payOk, payTotal: payments.length, paySuccess: pct(payOk, payments.length),
      inventory: motos.reduce((a, m) => a + (m.price ?? 0), 0),
      meetings: events.filter((e) => (e.type || "").toLowerCase().includes("meeting")).length,
      giveaways: events.filter((e) => (e.type || "").toUpperCase().includes("GIVEAWAY")).length,
    };
  }, [orders, requests, users, payments, motos, events]);

  const recent = orders.slice(0, 3);

  // Анхаарал татах мөрүүд — ажил хүлээгдэж байвал л гарна
  const alerts = [
    k.reqOpen > 0 && { text: `${k.reqOpen} захиалгын хүсэлтэд хариу өгөөгүй байна`, href: "/admin/requests" },
    k.undelivered > 0 && { text: `${k.undelivered} төлбөртэй захиалга хүргэгдээгүй байна`, href: "/admin/orders" },
    k.unpaidCount > 0 && { text: `${k.unpaidCount} захиалгын төлбөр хүлээгдэж байна`, href: "/admin/orders" },
  ].filter(Boolean) as { text: string; href: string }[];

  const counters = [
    { label: "Мотоцикл", value: motos.length, href: "/admin/motorcycles" },
    { label: "Бараа / сэлбэг", value: gear.length, href: "/admin/gear" },
    { label: "Biker Meeting", value: k.meetings, href: "/admin/meetings" },
    { label: "Giveaway", value: k.giveaways, href: "/admin/giveaway" },
    { label: "Худалдан авалт", value: orders.length, href: "/admin/orders" },
    { label: "Хэрэглэгч", value: users.length, href: "/admin/users" },
  ];

  if (!loaded) {
    return <div style={sx("padding:40px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Ачаалж байна…</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={sx(CARD)}>
        <div style={sx("font:800 22px Montserrat;color:#fff;")}>Тавтай морил, Админ 🛠️</div>
        <div style={sx("font:400 14px Roboto;color:#8A8F98;margin-top:6px;")}>
          Сайтын өнөөдрийн байдал. Тоонууд Supabase-ээс шууд уншигдана.
        </div>
      </div>

      {/* ==== Анхаарал шаардсан ажил ==== */}
      {alerts.length > 0 && (
        <div style={sx("background:rgba(245,158,11,.07);border:1px solid rgba(245,158,11,.3);border-radius:16px;padding:16px 20px;display:flex;flex-direction:column;gap:9px;")}>
          <div style={sx("font:700 12px 'JetBrains Mono';letter-spacing:.14em;color:#f59e0b;")}>⚠️ АНХААРАЛ ШААРДСАН</div>
          {alerts.map((a) => (
            <Link key={a.text} href={a.href} style={sx("font:600 14px Roboto;color:#e8e8e8;text-decoration:none;display:flex;align-items:center;gap:8px;")}>
              <span style={sx("color:#f59e0b;")}>→</span> {a.text}
            </Link>
          ))}
        </div>
      )}

      {/* ==== Санхүү ==== */}
      <div>
        <div style={sx("font:700 13px 'JetBrains Mono';letter-spacing:.16em;color:#E10613;margin-bottom:12px;")}>САНХҮҮ</div>
        <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr));gap:16px;")}>
          <div style={sx(CARD)}>
            <div style={sx(LABEL)}>НИЙТ БОРЛУУЛАЛТ</div>
            <div style={sx("font:800 26px Montserrat;color:#fff;margin-top:8px;")}>{fmt(k.revenue)}</div>
            <div style={sx("font:400 12px Roboto;color:#6b7280;margin-top:4px;")}>{k.paidCount} төлөгдсөн захиалга</div>
          </div>
          <div style={sx(CARD + "border-color:#1f7a44;background:linear-gradient(140deg,rgba(34,197,94,.09),#111113 70%);")}>
            <div style={sx(LABEL)}>САЙТЫН ШИМТГЭЛ · {Math.round(COMMISSION_RATE * 100)}%</div>
            <div style={sx("font:800 26px Montserrat;color:#22c55e;margin-top:8px;")}>{fmt(k.commission)}</div>
            <div style={sx("font:400 12px Roboto;color:#6b7280;margin-top:4px;")}>нийт борлуулалтаас</div>
          </div>
          <div style={sx(CARD)}>
            <div style={sx(LABEL)}>ЭНЭ САРЫН БОРЛУУЛАЛТ</div>
            <div style={sx("font:800 26px Montserrat;color:#fff;margin-top:8px;")}>{fmt(k.monthRevenue)}</div>
            <div style={sx("font:400 12px Roboto;color:#22c55e;margin-top:4px;")}>
              шимтгэл {fmt(k.monthCommission)} · {k.monthOrders} захиалга
            </div>
          </div>
          <div style={sx(CARD)}>
            <div style={sx(LABEL)}>ДУНДАЖ ЗАХИАЛГА</div>
            <div style={sx("font:800 26px Montserrat;color:#fff;margin-top:8px;")}>{fmt(k.avgOrder)}</div>
            <div style={sx("font:400 12px Roboto;color:#6b7280;margin-top:4px;")}>нэг захиалганд ногдох дүн</div>
          </div>
        </div>
      </div>

      {/* ==== Захиалга, төлбөр ==== */}
      <div>
        <div style={sx("font:700 13px 'JetBrains Mono';letter-spacing:.16em;color:#E10613;margin-bottom:12px;")}>ЗАХИАЛГА · ТӨЛБӨР</div>
        <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr));gap:16px;")}>
          <Link href="/admin/orders" className="mh-card" style={sx(CARD + "display:block;cursor:pointer;")}>
            <div style={sx(LABEL)}>ТӨЛБӨР БАТАЛГААЖСАН</div>
            <div style={sx("font:800 26px Montserrat;color:#22c55e;margin-top:8px;")}>{k.paidCount}</div>
          </Link>
          <Link href="/admin/orders" className="mh-card" style={sx(CARD + "display:block;cursor:pointer;")}>
            <div style={sx(LABEL)}>ТӨЛБӨР ХҮЛЭЭГДЭЖ БУЙ</div>
            <div style={sx(`font:800 26px Montserrat;color:${k.unpaidCount ? "#f59e0b" : "#fff"};margin-top:8px;`)}>{k.unpaidCount}</div>
          </Link>
          <Link href="/admin/orders" className="mh-card" style={sx(CARD + "display:block;cursor:pointer;")}>
            <div style={sx(LABEL)}>ХҮРГЭГДЭЭГҮЙ</div>
            <div style={sx(`font:800 26px Montserrat;color:${k.undelivered ? "#f59e0b" : "#fff"};margin-top:8px;`)}>{k.undelivered}</div>
          </Link>
          <Link href="/admin/payments" className="mh-card" style={sx(CARD + "display:block;cursor:pointer;")}>
            <div style={sx(LABEL)}>ТӨЛБӨРИЙН АМЖИЛТ</div>
            <div style={sx("font:800 26px Montserrat;color:#fff;margin-top:8px;")}>{k.paySuccess}%</div>
            <div style={sx("font:400 12px Roboto;color:#6b7280;margin-top:4px;")}>{k.payOk}/{k.payTotal} гүйлгээ</div>
          </Link>
        </div>
      </div>

      {/* ==== Хүсэлт ==== */}
      <div>
        <div style={sx("font:700 13px 'JetBrains Mono';letter-spacing:.16em;color:#E10613;margin-bottom:12px;")}>ЗАХИАЛГЫН ХҮСЭЛТ</div>
        <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr));gap:16px;")}>
          <Link href="/admin/requests" className="mh-card" style={sx(CARD + "display:block;cursor:pointer;")}>
            <div style={sx(LABEL)}>НИЙТ ХҮСЭЛТ</div>
            <div style={sx("font:800 26px Montserrat;color:#fff;margin-top:8px;")}>{k.reqTotal}</div>
          </Link>
          <Link href="/admin/requests" className="mh-card"
            style={sx(CARD + `display:block;cursor:pointer;${k.reqOpen ? "border-color:#E10613;" : ""}`)}>
            <div style={sx(LABEL)}>ХАРИУ ӨГӨӨГҮЙ</div>
            <div style={sx(`font:800 26px Montserrat;color:${k.reqOpen ? "#E10613" : "#22c55e"};margin-top:8px;`)}>{k.reqOpen}</div>
            <div style={sx("font:400 12px Roboto;color:#6b7280;margin-top:4px;")}>
              {k.reqTotal ? `${pct(k.reqTotal - k.reqOpen, k.reqTotal)}% нь хариулагдсан` : "хүсэлт алга"}
            </div>
          </Link>
          <div style={sx(CARD)}>
            <div style={sx(LABEL)}>АНГИЛЛААР</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
              {k.reqByCat.length === 0 && <div style={sx("font:400 13px Roboto;color:#6b7280;")}>Хүсэлт алга.</div>}
              {k.reqByCat.map(([c, n]) => (
                <div key={c} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span style={sx("font:500 13px Roboto;color:#C8C8C8;")}>{c}</span>
                  <span style={sx("font:700 13px Montserrat;color:#fff;")}>{n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ==== Хэрэглэгч ==== */}
      <div>
        <div style={sx("font:700 13px 'JetBrains Mono';letter-spacing:.16em;color:#E10613;margin-bottom:12px;")}>ХЭРЭГЛЭГЧ</div>
        <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr));gap:16px;")}>
          <Link href="/admin/users" className="mh-card" style={sx(CARD + "display:block;cursor:pointer;")}>
            <div style={sx(LABEL)}>НИЙТ БҮРТГЭЛТЭЙ</div>
            <div style={sx("font:800 26px Montserrat;color:#fff;margin-top:8px;")}>{users.length}</div>
          </Link>
          <div style={sx(CARD)}>
            <div style={sx(LABEL)}>ЭНЭ САРД ШИНЭЭР</div>
            <div style={sx("font:800 26px Montserrat;color:#fff;margin-top:8px;")}>{k.newUsers}</div>
          </div>
          <div style={sx(CARD)}>
            <div style={sx(LABEL)}>ХУДАЛДАН АВСАН</div>
            <div style={sx("font:800 26px Montserrat;color:#fff;margin-top:8px;")}>{k.buyers}</div>
            <div style={sx("font:400 12px Roboto;color:#6b7280;margin-top:4px;")}>хөрвөлт {k.conversion}%</div>
          </div>
          <div style={sx(CARD)}>
            <div style={sx(LABEL)}>НИЙТ INVENTORY ҮНЭ</div>
            <div style={sx("font:800 26px Montserrat;color:#fff;margin-top:8px;")}>{fmt(k.inventory)}</div>
            <div style={sx("font:400 12px Roboto;color:#6b7280;margin-top:4px;")}>{motos.length} мотоцикл</div>
          </div>
        </div>
      </div>

      {/* ==== Тоолуурууд ==== */}
      <div>
        <div style={sx("font:700 13px 'JetBrains Mono';letter-spacing:.16em;color:#E10613;margin-bottom:12px;")}>АГУУЛГА</div>
        <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(140px,100%),1fr));gap:16px;")}>
          {counters.map((st) => (
            <Link key={st.label} href={st.href} className="mh-card" style={sx(CARD + "display:block;cursor:pointer;")}>
              <div style={sx("font:800 30px Montserrat;color:#E10613;")}>{st.value}</div>
              <div style={sx("font:500 13px Roboto;color:#A3A3A3;margin-top:4px;")}>{st.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* ==== Сүүлийн захиалга ==== */}
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
          {recent.length === 0 && <div style={sx("font:400 13px Roboto;color:#8A8F98;")}>Захиалга алга.</div>}
        </div>
      </div>
    </div>
  );
}
