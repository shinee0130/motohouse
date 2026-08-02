"use client";

import { sx } from "@/lib/ui/sx";
import { useI18n } from "@/lib/i18n";
import { imgSrc } from "@/lib/ui/img";
import type { EventPartner } from "@/lib/db/queries";

// Лого бүр өөр хэмжээтэй тул хайрцгийг нь тогтмол болгож жигдлэв.
const BOX = "background:#111113;border:1px solid #262626;border-radius:12px;padding:10px;width:176px;height:92px;display:flex;align-items:center;justify-content:center;overflow:hidden;";

function LogoBox({ p }: { p: EventPartner }) {
  const inner = p.logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...imgSrc(p.logo, 320)} alt={p.name}
      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
  ) : (
    <span style={sx("font:700 14px Montserrat;color:#fff;text-align:center;line-height:1.3;")}>{p.name}</span>
  );
  return p.url ? (
    <a href={p.url} target="_blank" rel="noopener noreferrer"
      title={p.name} className="mh-card" style={sx(BOX + "cursor:pointer;")}>{inner}</a>
  ) : (
    <div title={p.name} style={sx(BOX)}>{inner}</div>
  );
}

// Уулзалтын байгууллагууд. Зохион байгуулагч нь хамтрагч БИШ тул тусдаа
// хэсэгт эхэлж гарна, доор нь хамтрагчид үүргээр нь бүлэглэгдэнэ.
export function MeetingPartners({ partners }: { partners: EventPartner[] }) {
  const { t } = useI18n();
  if (partners.length === 0) return null;

  const isOrganizer = (p: EventPartner) => /зохион байгуул|organi[sz]er/i.test(p.role ?? "");
  const organizers = partners.filter(isOrganizer);
  const rest = partners.filter((p) => !isOrganizer(p));

  // Үүргийн дараалал нь мөрийн sort-оор — эхэлж тааралдсан үүрэг эхэнд.
  const groups: { role: string; items: EventPartner[] }[] = [];
  for (const p of rest) {
    const role = p.role?.trim() || t("Хамтрагч");
    const g = groups.find((x) => x.role === role);
    if (g) g.items.push(p); else groups.push({ role, items: [p] });
  }

  const H2 = "font:800 20px Montserrat;color:#fff;text-transform:uppercase;";
  const ROW = { display: "flex", flexWrap: "wrap" as const, gap: 12, marginTop: 12 };

  return (
    <>
      {organizers.length > 0 && (
        <div style={{ marginTop: 26 }}>
          <h2 style={sx(H2)}>{t("Зохион байгуулагч")}</h2>
          <div style={ROW}>
            {organizers.map((p) => <LogoBox key={p.id} p={p} />)}
          </div>
        </div>
      )}

      {groups.length > 0 && (
        <div style={{ marginTop: 26 }}>
          <h2 style={sx(H2)}>{t("Хамтрагчид")}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 16 }}>
            {groups.map((g) => (
              <div key={g.role}>
                <div style={sx("font:600 11px 'JetBrains Mono';letter-spacing:.16em;color:#E10613;text-transform:uppercase;")}>{t(g.role)}</div>
                <div style={{ ...ROW, marginTop: 10 }}>
                  {g.items.map((p) => <LogoBox key={p.id} p={p} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
