"use client";

import { sx } from "@/lib/ui/sx";
import { useI18n } from "@/lib/i18n";
import { imgSrc } from "@/lib/ui/img";
import type { EventPartner } from "@/lib/db/queries";

// Уулзалтын хамтрагч байгууллагууд — үүрэг (зохион байгуулагч, албан ёсны
// хамтрагч …) тус бүрээр бүлэглэж, лого эсвэл нэрээр нь харуулна.
export function MeetingPartners({ partners }: { partners: EventPartner[] }) {
  const { t } = useI18n();
  if (partners.length === 0) return null;

  // Үүргийн дараалал нь мөрийн sort-оор — эхэлж тааралдсан үүрэг эхэнд.
  const groups: { role: string; items: EventPartner[] }[] = [];
  for (const p of partners) {
    const role = p.role?.trim() || t("Хамтрагч");
    const g = groups.find((x) => x.role === role);
    if (g) g.items.push(p); else groups.push({ role, items: [p] });
  }

  return (
    <div style={{ marginTop: 26 }}>
      <h2 style={sx("font:800 20px Montserrat;color:#fff;text-transform:uppercase;")}>{t("Хамтрагчид")}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 16 }}>
        {groups.map((g) => (
          <div key={g.role}>
            <div style={sx("font:600 11px 'JetBrains Mono';letter-spacing:.16em;color:#E10613;text-transform:uppercase;")}>{t(g.role)}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
              {g.items.map((p) => {
                const inner = p.logo ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img {...imgSrc(p.logo, 320)} alt={p.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                  </>
                ) : (
                  <span style={sx("font:700 14px Montserrat;color:#fff;text-align:center;line-height:1.3;")}>{p.name}</span>
                );
                // Лого бүр өөр хэмжээтэй тул хайрцгийг нь тогтмол болгож жигдлэв.
                const box = "background:#111113;border:1px solid #262626;border-radius:12px;padding:10px;width:176px;height:92px;display:flex;align-items:center;justify-content:center;overflow:hidden;";
                return p.url ? (
                  <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer"
                    title={p.name} className="mh-card" style={sx(box + "cursor:pointer;")}>
                    {inner}
                  </a>
                ) : (
                  <div key={p.id} title={p.name} style={sx(box)}>{inner}</div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
