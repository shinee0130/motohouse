"use client";

import Link from "next/link";
import { sx } from "@/lib/ui/sx";
import { useI18n } from "@/lib/i18n";
import type { Photographer } from "@/lib/db/queries";

export function PhotoGrid({ photographers }: { photographers: Photographer[] }) {
  const { t, loc } = useI18n();

  if (photographers.length === 0) {
    return <div style={sx("font:400 14px Roboto;color:#8A8F98;margin-top:24px;")}>{t("Одоогоор зурагчин бүртгэгдээгүй байна.")}</div>;
  }

  return (
    <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;margin-top:26px;")}>
      {photographers.map((p) => {
        const initial = loc(p.name, p.nameEn).replace(/\D+/g, "") || "📸";
        return (
          <Link key={p.id} href={`/photo/${p.id}`} className="mh-card"
            style={sx("display:block;border-radius:16px;overflow:hidden;background:#111113;border:1px solid #262626;text-decoration:none;")}>
            <div style={sx("aspect-ratio:4/3;background:#0b0b0d;position:relative;overflow:hidden;")}>
              {p.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.avatar} alt={loc(p.name, p.nameEn)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={sx("width:100%;height:100%;display:flex;align-items:center;justify-content:center;font:800 40px Montserrat;color:#2c2c30;background:radial-gradient(circle at 50% 40%,rgba(225,6,19,.14),transparent);")}>
                  {initial}
                </div>
              )}
            </div>
            <div style={sx("padding:14px 16px 16px;")}>
              <div style={sx("font:700 16px Montserrat;color:#fff;")}>{loc(p.name, p.nameEn)}</div>
              <div style={{ display: "flex", gap: 5, marginTop: 7, flexWrap: "wrap" }}>
                {p.tags.map((tg) => (
                  <span key={tg} style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.04em;color:#FF3742;background:rgba(225,6,19,.12);border:1px solid rgba(225,6,19,.3);padding:2px 7px;border-radius:5px;")}>{t(tg)}</span>
                ))}
              </div>
              {p.specialty && <div style={sx("font:400 12px/1.5 Roboto;color:#8A8F98;margin-top:10px;")}>{loc(p.specialty, p.specialtyEn)}</div>}
              <div style={sx("font:700 12px Montserrat;color:#E10613;margin-top:12px;")}>{t("Захиалах")} →</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
