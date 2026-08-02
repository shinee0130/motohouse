"use client";

import { useEffect, useMemo, useState } from "react";
import { sx } from "@/lib/ui/sx";
import { useToast } from "@/lib/ui/toast";
import { Select } from "@/components/ui/Select";
import { fmt } from "@/lib/db/data";
import { orderBadge, paymentBadge, paymentLabel, isInternational, type Order } from "@/lib/commerce/account";
import { getOrders } from "@/lib/db/queries";
import { updateOrderStatus, updateOrderTracking } from "@/lib/db/admin";

// Хоёр өөр зүйлийг хольж болохгүй:
//  · Төлбөрийн төлөв — Bonum-оос автоматаар ирнэ, админ өөрчлөхгүй.
//  · Захиалгын төлөв — админ өөрөө хөтөлнө.
// Тиймээс хуудсыг ТӨЛБӨР / ЗАХИАЛГА гэж хоёр хэсэг болгов. Төлбөр нь
// амжилттай болмогц захиалга нь доод хэсгээс дээд хэсэг рүү өөрөө шилжинэ.
const STATUSES: Order["status"][] = ["Хүлээгдэж буй", "Баталгаажсан", "Хүргэлтэнд гарсан", "Хүргэгдсэн", "Цуцлагдсан"];

type Tab = "orders" | "payments";

export default function AdminOrders() {
  const [list, setList] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>("orders");

  async function refresh() { setList(await getOrders()); setLoaded(true); }
  useEffect(() => { refresh(); }, []);

  const toast = useToast();

  async function changeStatus(id: string, status: Order["status"]) {
    setList((l) => l.map((o) => (o.id === id ? { ...o, status } : o))); // шуурхай UI
    try {
      await updateOrderStatus(id, status);
      toast(`Төлөв "${status}" болж хадгалагдлаа`);
    } catch (e) {
      toast("Хадгалж чадсангүй: " + (e instanceof Error ? e.message : String(e)), "err");
      await refresh();
    }
  }

  async function saveTracking(id: string, v: string) {
    setList((l) => l.map((o) => (o.id === id ? { ...o, trackingNumber: v } : o)));
    try {
      await updateOrderTracking(id, v);
      toast("Хүргэлтийн дугаар хадгалагдлаа");
    } catch (e) {
      toast("Хадгалж чадсангүй: " + (e instanceof Error ? e.message : String(e)), "err");
      await refresh();
    }
  }

  const paid = useMemo(() => list.filter((o) => o.paymentStatus === "paid"), [list]);
  const unpaid = useMemo(() => list.filter((o) => o.paymentStatus !== "paid"), [list]);
  const shown = tab === "orders" ? paid : unpaid;

  const TABS: { key: Tab; label: string; count: number; on: string }[] = [
    { key: "orders", label: "Захиалга", count: paid.length, on: "background:#E10613;border:1px solid #E10613;color:#fff;" },
    { key: "payments", label: "Төлбөр хүлээгдэж буй", count: unpaid.length, on: "background:#f59e0b;border:1px solid #f59e0b;color:#1a1204;" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={sx("font:700 18px Montserrat;color:#fff;")}>Худалдан авалтын захиалга ({list.length})</div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {TABS.map((tt) => (
          <button key={tt.key} onClick={() => setTab(tt.key)}
            style={sx(`cursor:pointer;font:700 12px Montserrat;padding:9px 18px;border-radius:999px;${tab === tt.key ? tt.on : "background:#111113;border:1px solid #333;color:#C8C8C8;"}`)}>
            {tt.label} ({tt.count})
          </button>
        ))}
      </div>

      <div style={sx("font:400 12px Roboto;color:#8A8F98;line-height:1.6;")}>
        {tab === "orders"
          ? "Төлбөр нь баталгаажсан захиалгууд. Захиалгын төлвийг эндээс өөрчилнө."
          : "Төлбөр хийгдээгүй эсвэл амжилтгүй болсон захиалгууд. Төлбөр орж ирмэгц дээд хэсэг рүү автоматаар шилжинэ."}
      </div>

      <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
        {shown.map((o) => (
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
                  <div style={sx("font:700 10px 'JetBrains Mono';letter-spacing:.1em;color:#E10613;")}>
                    {o.deliveryMethod === "pickup" ? "🏬 ОЧИЖ АВНА" : `🚚 ХҮРГЭЛТ · ${o.shipCountry}`}{isInternational(o) ? " · ГАДААД" : ""}
                  </div>
                  <div style={sx("font:600 12px Roboto;color:#C8C8C8;margin-top:4px;")}>{o.shipName}{o.shipPhone ? ` · ${o.shipPhone}` : ""}</div>
                  {o.shipAddress && <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:2px;white-space:pre-wrap;")}>{o.shipAddress}</div>}
                  {/* Гадаад захиалгад тээврийн код — хэрэглэгчийн timeline дээр харагдана */}
                  {isInternational(o) && (
                    <input
                      defaultValue={o.trackingNumber || ""}
                      placeholder="Тээврийн код (DHL/EMS…)"
                      onBlur={(e) => { if (e.target.value !== (o.trackingNumber || "")) saveTracking(o.id, e.target.value); }}
                      style={sx("width:100%;margin-top:7px;background:#050505;border:1px solid #2a2a2d;border-radius:7px;padding:7px 9px;color:#60a5fa;font:600 12px 'JetBrains Mono';outline:none;")}
                    />
                  )}
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={sx("font:800 15px Montserrat;color:#fff;")}>{fmt(o.total)}</span>
              {tab === "orders" ? (
                <>
                  {/* Захиалгын төлөв — зөвхөн одоогийнх нь, солихдоо цэснээс */}
                  <span style={sx(orderBadge(o.status))}>{o.status}</span>
                  <Select value={o.status} onChange={(v) => changeStatus(o.id, v as Order["status"])} bg="#050505"
                    options={STATUSES.map((s) => ({ value: s, label: s }))} />
                </>
              ) : (
                /* Төлбөрийн төлөв — Bonum-оос ирнэ, гараар өөрчлөхгүй */
                <span style={sx(paymentBadge(o.paymentStatus))}>{paymentLabel(o.paymentStatus)}</span>
              )}
            </div>
          </div>
        ))}
        {loaded && shown.length === 0 && (
          <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>
            {tab === "orders" ? "Төлбөр баталгаажсан захиалга алга." : "Хүлээгдэж буй төлбөр алга."}
          </div>
        )}
        {!loaded && <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Ачаалж байна…</div>}
      </div>
    </div>
  );
}
