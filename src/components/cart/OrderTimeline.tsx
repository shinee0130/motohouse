"use client";

// Захиалгын явцын timeline — хэрэглэгчийн "Миний захиалга" дээр захиалга дэлгэхэд харагдана.
// Дотоод/гадаад/очиж авах гэдгээс алхмууд ялгаатай (orderSteps).

import { sx } from "@/lib/ui/sx";
import { useI18n } from "@/lib/i18n";
import { orderSteps, isInternational, type Order } from "@/lib/commerce/account";

export function OrderTimeline({ order }: { order: Order }) {
  const { t } = useI18n();

  if (order.status === "Цуцлагдсан") {
    return (
      <div style={sx("background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);border-radius:12px;padding:14px 16px;font:600 13px Roboto;color:#ef4444;")}>
        ✕ {t("Энэ захиалга цуцлагдсан.")}
        {order.paymentStatus === "paid" && <span style={{ color: "#f59e0b" }}> {t("Төлбөрийн буцаалтын талаар бид тантай холбогдоно.")}</span>}
      </div>
    );
  }

  const steps = orderSteps(order);
  const intl = isInternational(order);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {steps.map((s, i) => {
          const last = i === steps.length - 1;
          const color = s.done ? "#22c55e" : s.current ? "#E10613" : "#3a3a3f";
          return (
            <div key={s.label} style={{ display: "flex", gap: 13 }}>
              {/* зүүн талын цэг + шугам */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 22, flexShrink: 0 }}>
                <div style={sx(`width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;${s.done ? "background:rgba(34,197,94,.15);border:1.5px solid #22c55e;" : s.current ? "background:rgba(225,6,19,.15);border:1.5px solid #E10613;" : "background:#141416;border:1.5px solid #333;"}`)}>
                  {s.done ? (
                    <svg width="11" height="11" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5l3 3 6-7" fill="none" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : s.current ? (
                    <span style={sx("width:7px;height:7px;border-radius:50%;background:#E10613;animation:mhfade 1s infinite alternate;")} />
                  ) : (
                    <span style={sx("width:6px;height:6px;border-radius:50%;background:#3a3a3f;")} />
                  )}
                </div>
                {!last && <div style={{ width: 2, flex: 1, minHeight: 18, background: s.done ? "#22c55e" : "#2a2a2d" }} />}
              </div>
              {/* текст */}
              <div style={{ paddingBottom: last ? 0 : 16, minWidth: 0 }}>
                <div style={sx(`font:${s.current ? "700" : "600"} 13px Montserrat;color:${s.done ? "#22c55e" : s.current ? "#fff" : "#6b7280"};`)}>
                  {t(s.label)}
                  {s.current && <span style={sx("font:600 10px 'JetBrains Mono';color:#E10613;margin-left:8px;letter-spacing:.08em;")}>{t("ОДОО ЭНЭ ШАТАНД")}</span>}
                </div>
                {/* гадаад захиалгын тээврийн код */}
                {intl && s.label === "Олон улсын тээвэрт гарсан" && order.trackingNumber && (
                  <div style={sx("font:600 12px 'JetBrains Mono';color:#C8C8C8;background:#0B0B0D;border:1px solid #2a2a2d;border-radius:8px;padding:7px 10px;margin-top:7px;display:inline-block;")}>
                    📦 {t("Тээврийн код")}: <span style={{ color: "#60a5fa", userSelect: "all" }}>{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* хүргэлтийн хаяг (байвал) */}
      {order.shipAddress && (
        <div style={sx("margin-top:14px;background:#0B0B0D;border:1px solid #1c1c1f;border-radius:10px;padding:11px 13px;")}>
          <div style={sx("font:700 10px 'JetBrains Mono';letter-spacing:.1em;color:#8A8F98;text-transform:uppercase;")}>
            {order.deliveryMethod === "pickup" ? t("Очиж авах цэг") : t("Хүргэлтийн хаяг")}{order.shipCountry ? ` · ${order.shipCountry}` : ""}
          </div>
          <div style={sx("font:400 12px/1.6 Roboto;color:#A3A3A3;margin-top:5px;white-space:pre-wrap;")}>{order.shipAddress}</div>
        </div>
      )}
    </div>
  );
}
