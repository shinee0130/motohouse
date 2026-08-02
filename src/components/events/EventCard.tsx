"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { sx } from "@/lib/ui/sx";
import { Slot } from "@/components/ui/Slot";
import { useI18n } from "@/lib/i18n";
import { imgSrc } from "@/lib/ui/img";
import { IconPin } from "@/components/ui/icons";
import type { EventPartner } from "@/lib/db/queries";

// Biker Meeting болон Giveaway хоёрын дундын карт — постер бүтнээрээ (4:5,
// тайрахгүй), доор нь огноо · байршил → гарчиг → нэмэлт мөр → логонууд.
// Хоёр хэсэг ижил харагдахын тулд шинэ хэсэг нэмэхдээ ч үүнийг ашиглана.

const BOX = "background:#111113;border:1px solid #262626;border-radius:16px;overflow:hidden;display:block;cursor:pointer;";
const CHIP = "background:#0B0B0D;border:1px solid #262626;border-radius:8px;padding:6px 8px;width:88px;height:42px;display:flex;align-items:center;justify-content:center;overflow:hidden;";

export interface EventCardRow {
  label: string;
  value: string;
  accent?: boolean; // шагнал гэх мэт онцлох утга улаанаар
}

export function EventCard({
  href,
  image,
  title,
  date,
  location,
  slotLabel = "Event",
  overlay,
  badge,
  cornerBadge,
  rows = [],
  logos = [],
}: {
  href: string;
  image?: string;
  title: string;
  date?: string;
  location?: string;
  slotLabel?: string;
  overlay?: EventPartner[]; // постерын зүүн дээд буланд (зохион байгуулагч)
  badge?: ReactNode; // постерын зүүн дээд буланд (төлөв) — overlay-гүй үед
  cornerBadge?: ReactNode; // баруун доод булан (жнь 📷 12)
  rows?: EventCardRow[];
  logos?: EventPartner[]; // доод талын логонууд (хамтрагчид)
}) {
  const { t } = useI18n();
  const shown = logos.slice(0, 6);

  return (
    <Link href={href} className="mh-card" style={sx(BOX)}>
      {/* Постер ихэвчлэн босоо. Тайрахгүйгээр бүтнээр нь харуулна. */}
      <div style={{ position: "relative", aspectRatio: "4 / 5", background: "#0d0d0f" }}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img {...imgSrc(image, 520)} alt={title}
            style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:contain;")} />
        ) : (
          <Slot label={slotLabel} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        )}

        {overlay && overlay.length > 0 ? (
          <div style={sx("position:absolute;top:10px;left:10px;right:10px;display:flex;align-items:center;flex-wrap:wrap;gap:8px;width:fit-content;max-width:calc(100% - 20px);background:rgba(5,5,5,.78);border:1px solid #3a3a3f;border-radius:10px;padding:8px 12px;backdrop-filter:blur(4px);")}>
            {overlay.slice(0, 3).map((p) => (
              p.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={p.id} {...imgSrc(p.logo, 140)} alt={p.name}
                  style={{ height: 30, maxWidth: 132, objectFit: "contain", display: "block" }} />
              ) : (
                <span key={p.id} style={sx("font:700 10px Montserrat;color:#fff;white-space:nowrap;")}>{p.name}</span>
              )
            ))}
          </div>
        ) : badge ? (
          <span style={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}>{badge}</span>
        ) : null}

        {cornerBadge && (
          <span style={sx("position:absolute;bottom:12px;right:12px;background:rgba(5,5,5,.82);border:1px solid #3a3a3f;color:#fff;font:700 11px Montserrat;padding:6px 11px;border-radius:999px;")}>
            {cornerBadge}
          </span>
        )}
      </div>

      <div style={{ padding: "16px 18px 18px" }}>
        {(date || location) && (
          <div style={sx("display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;font:500 11px 'JetBrains Mono';letter-spacing:.14em;color:#E10613;")}>
            {date && <span>{date}</span>}
            {location && (
              <span style={sx("display:inline-flex;align-items:center;gap:4px;color:#A3A3A3;")}>
                <IconPin style={{ width: 13, height: 13, strokeWidth: 2, color: "#E10613" }} />
                {location}
              </span>
            )}
          </div>
        )}

        <div style={sx("font:800 18px Montserrat;color:#fff;margin-top:6px;")}>{title}</div>

        {rows.length > 0 && (
          <div style={sx("margin-top:12px;padding-top:12px;border-top:1px solid #1c1c1f;display:flex;flex-direction:column;gap:8px;")}>
            {rows.map((r) => (
              <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.1em;color:#8A8F98;flex-shrink:0;")}>{t(r.label)}</span>
                <span style={sx(r.accent
                  ? "font:700 13px Montserrat;color:#E10613;text-align:right;"
                  : "font:600 13px Roboto;color:#C8C8C8;text-align:right;")}>{r.value}</span>
              </div>
            ))}
          </div>
        )}

        {shown.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 12 }}>
            {shown.map((p) => (
              <span key={p.id} title={`${p.name}${p.role ? ` · ${t(p.role)}` : ""}`} style={sx(CHIP)}>
                {p.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img {...imgSrc(p.logo, 176)} alt={p.name}
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                ) : (
                  <span style={sx("font:700 10px Montserrat;letter-spacing:.04em;color:#A3A3A3;text-align:center;line-height:1.2;")}>{p.name}</span>
                )}
              </span>
            ))}
            {logos.length > shown.length && (
              <span style={sx("font:600 11px Roboto;color:#6b7280;")}>+{logos.length - shown.length}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
