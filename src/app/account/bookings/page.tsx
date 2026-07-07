"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sx } from "@/lib/sx";
import { Price } from "@/lib/currency";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { getMyTourBookings, type TourBooking } from "@/lib/queries";

function bkBadge(status: string): string {
  const b = "font:700 11px Montserrat;letter-spacing:.04em;padding:5px 11px;border-radius:6px;display:inline-block;";
  if (status === "Баталгаажсан") return b + "color:#22c55e;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.35);";
  if (status === "Цуцлагдсан") return b + "color:#ef4444;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.35);";
  return b + "color:#f59e0b;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.35);";
}

export default function MyBookingsPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [list, setList] = useState<TourBooking[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    getMyTourBookings(user.phone).then((b) => { setList(b); setLoaded(true); });
  }, [user]);

  return (
    <div style={sx("background:#111113;border:1px solid #262626;border-radius:16px;padding:clamp(18px,3vw,26px);")}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <div style={sx("font:700 18px Montserrat;color:#fff;")}>{t("Миний аяллууд")}</div>
        <Link href="/travel" style={sx("background:#E10613;color:#fff;font:700 12px Montserrat;padding:9px 16px;border-radius:9px;cursor:pointer;")}>{t("Аялал үзэх")}</Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {list.map((b) => (
          <div key={b.id} style={sx("background:#0B0B0D;border:1px solid #1c1c1f;border-radius:12px;padding:16px 18px;")}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ minWidth: 180 }}>
                <div style={sx("font:700 15px Montserrat;color:#fff;")}>{b.tourTitle || t("Аялал")}</div>
                <div style={sx("font:400 13px Roboto;color:#8A8F98;margin-top:5px;")}>
                  {b.people} {t("хүн")} · {b.motoChoice === "own" ? t("Өөрийн мото") : t("Түрээсийн мото")}{b.motoModel ? ` (${b.motoModel})` : ""}
                </div>
                <div style={sx("font:400 11px 'JetBrains Mono';color:#6b7280;margin-top:5px;")}>{b.id} · {b.date}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <span style={sx("font:800 15px Montserrat;color:#fff;")}><Price amount={b.total} /></span>
                <span style={sx(bkBadge(b.status))}>{t(b.status)}</span>
              </div>
            </div>
          </div>
        ))}
        {loaded && list.length === 0 && (
          <div style={sx("padding:24px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>
            {t("Одоогоор аялал захиалаагүй байна.")} <Link href="/travel" style={{ color: "#E10613" }}>{t("Аялал үзэх")}</Link>
          </div>
        )}
        {!loaded && <div style={sx("padding:24px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>{t("Ачаалж байна…")}</div>}
      </div>
    </div>
  );
}
