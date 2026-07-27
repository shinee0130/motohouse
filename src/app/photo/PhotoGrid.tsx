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
            style={sx("position:relative;display:block;border-radius:16px;overflow:hidden;background:#0b0b0d;border:1px solid #262626;text-decoration:none;aspect-ratio:3/4;")}>
            {p.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.avatar} alt={loc(p.name, p.nameEn)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={sx("position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:800 48px Montserrat;color:#2c2c30;background:radial-gradient(circle at 50% 38%,rgba(225,6,19,.14),transparent);")}>
                {initial}
              </div>
            )}
            {/* доод градиент + мэдээлэл */}
            <div style={sx("position:absolute;left:0;right:0;bottom:0;padding:16px 16px 15px;background:linear-gradient(transparent,rgba(5,5,5,.35) 30%,rgba(5,5,5,.92));")}>
              <div style={sx("font:800 17px Montserrat;color:#fff;")}>{loc(p.name, p.nameEn)}</div>
              <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
                {p.tags.map((tg) => (
                  <span key={tg} style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.04em;color:#fff;background:rgba(225,6,19,.85);padding:2px 7px;border-radius:5px;")}>{t(tg)}</span>
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
