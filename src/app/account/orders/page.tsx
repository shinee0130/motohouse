"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/ui/sx";
import { Price } from "@/lib/reference/currency";
import { orderBadge, paymentBadge, paymentLabel, type Order } from "@/lib/commerce/account";
import { useAuth } from "@/lib/auth/auth";
import { useI18n } from "@/lib/i18n";
import { getUserOrders } from "@/lib/db/queries";
import { OrderTimeline } from "@/components/cart/OrderTimeline";

export default function OrdersPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [list, setList] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null); // дэлгэсэн захиалга

  useEffect(() => {
    if (!user) return;
    getUserOrders(user.phone).then((o) => { setList(o); setLoaded(true); });
  }, [user]);

  return (
    <div style={sx("background:#111113;border:1px solid #262626;border-radius:16px;padding:clamp(18px,3vw,26px);")}>
      <div style={sx("font:700 18px Montserrat;color:#fff;margin-bottom:18px;")}>{t("Миний захиалга")}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {list.map((o) => {
          const open = openId === o.id;
          return (
            <div key={o.id} style={sx(`background:#0B0B0D;border:1px solid ${open ? "#3a3a3d" : "#1c1c1f"};border-radius:12px;overflow:hidden;`)}>
              <button
                onClick={() => setOpenId(open ? null : o.id)}
                aria-expanded={open}
                style={sx("width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;background:none;border:none;padding:16px 18px;cursor:pointer;text-align:left;")}
              >
                <div style={{ minWidth: 180 }}>
                  <div style={sx("font:700 15px Montserrat;color:#fff;")}>{o.item}</div>
                  <div style={sx("font:400 12px 'JetBrains Mono';color:#8A8F98;margin-top:4px;")}>{o.id} · {o.date} · {o.qty}ш</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={sx("font:800 15px Montserrat;color:#fff;")}><Price amount={o.total} /></span>
                  <span style={sx(paymentBadge(o.paymentStatus))}>{t(paymentLabel(o.paymentStatus))}</span>
                  <span style={sx(orderBadge(o.status))}>{t(o.status)}</span>
                  <svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true" style={{ transition: "transform .18s ease", transform: open ? "rotate(180deg)" : "none", flexShrink: 0 }}>
                    <path d="M2 4l4 4 4-4" fill="none" stroke="#9a9aa0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
              {open && (
                <div style={sx("border-top:1px solid #1c1c1f;padding:16px 18px 18px;animation:mhfade .2s both;")}>
                  <OrderTimeline order={o} />
                </div>
              )}
            </div>
          );
        })}
        {loaded && list.length === 0 && <div style={sx("padding:20px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>{t("Захиалга алга. Дэлгүүрээс мотоцикл эсвэл бараа захиалаарай.")}</div>}
        {!loaded && <div style={sx("padding:20px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>{t("Ачаалж байна…")}</div>}
      </div>
    </div>
  );
}
