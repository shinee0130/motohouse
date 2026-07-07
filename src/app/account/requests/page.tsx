"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sx } from "@/lib/sx";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { getMyOrderRequests, type OrderRequest } from "@/lib/queries";

function reqBadge(status: string): string {
  const base = "font:700 11px Montserrat;letter-spacing:.04em;padding:5px 11px;border-radius:6px;display:inline-block;white-space:nowrap;";
  if (status === "Үнэ өгсөн") return base + "color:#22c55e;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.35);";
  if (status === "Хянаж буй") return base + "color:#fff;background:#E10613;";
  if (status === "Хаагдсан") return base + "color:#8A8F98;background:#1a1a1d;border:1px solid #333;";
  return base + "color:#f59e0b;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.35);"; // Шинэ
}

export default function MyRequestsPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [list, setList] = useState<OrderRequest[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    getMyOrderRequests(user.phone).then((r) => { setList(r); setLoaded(true); });
  }, [user]);

  return (
    <div style={sx("background:#111113;border:1px solid #262626;border-radius:16px;padding:clamp(18px,3vw,26px);")}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <div style={sx("font:700 18px Montserrat;color:#fff;")}>{t("Миний хүсэлтүүд")}</div>
        <Link href="/request" style={sx("background:#E10613;color:#fff;font:700 12px Montserrat;padding:9px 16px;border-radius:9px;cursor:pointer;")}>+ {t("Шинэ хүсэлт")}</Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {list.map((r) => (
          <div key={r.id} style={sx("background:#0B0B0D;border:1px solid #1c1c1f;border-radius:12px;padding:16px 18px;")}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
              {r.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.image} alt="" style={sx("width:64px;height:64px;object-fit:cover;border-radius:10px;border:1px solid #262626;flex-shrink:0;")} />
              )}
              <div style={{ minWidth: 180, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.1em;color:#E10613;")}>{t(r.category)}</span>
                  <span style={sx(reqBadge(r.status))}>{t(r.status)}</span>
                </div>
                <div style={sx("font:500 14px/1.5 Roboto;color:#C8C8C8;margin-top:7px;white-space:pre-wrap;")}>{r.detail}</div>
                <div style={sx("font:400 11px 'JetBrains Mono';color:#6b7280;margin-top:6px;")}>{r.id} · {r.date}</div>
              </div>
            </div>
            {r.quote && (
              <div style={sx("margin-top:12px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.3);border-radius:10px;padding:11px 13px;")}>
                <div style={sx("font:700 10px 'JetBrains Mono';letter-spacing:.1em;color:#22c55e;")}>💬 {t("ҮНИЙН САНАЛ")}</div>
                <div style={sx("font:500 13px/1.5 Roboto;color:#e8e8e8;margin-top:5px;white-space:pre-wrap;")}>{r.quote}</div>
              </div>
            )}
          </div>
        ))}
        {loaded && list.length === 0 && (
          <div style={sx("padding:24px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>
            {t("Одоогоор хүсэлт алга.")} <Link href="/request" style={{ color: "#E10613" }}>{t("Хүсэлт илгээх")}</Link>
          </div>
        )}
        {!loaded && <div style={sx("padding:24px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>{t("Ачаалж байна…")}</div>}
      </div>
    </div>
  );
}
