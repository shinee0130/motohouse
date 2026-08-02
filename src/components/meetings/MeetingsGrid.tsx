"use client";

import Link from "next/link";
import { sx } from "@/lib/ui/sx";
import { Slot } from "@/components/ui/Slot";
import { type EventItem } from "@/lib/db/data";
import type { EventPartner } from "@/lib/db/queries";
import { useI18n } from "@/lib/i18n";
import { imgSrc } from "@/lib/ui/img";
import { IconPin } from "@/components/ui/icons";

// Biker Meeting-үүдийн жагсаалт. Уулзалт бүр өөрийн зураг/видеоны галерейтай.
export function MeetingsGrid({
  meetings,
  counts,
  partners,
}: {
  meetings: EventItem[];
  counts: Record<number, number>;
  partners: Record<number, EventPartner[]>;
}) {
  const { t, loc } = useI18n();
  // Зохион байгуулагч нь хамтрагч БИШ — картын дээд талд тусад нь гарна.
  const isOrganizer = (p: EventPartner) => /зохион байгуул|organi[sz]er/i.test(p.role ?? "");
  return (
    <div style={sx("max-width:1280px;margin:0 auto;padding:clamp(24px,4vw,44px) clamp(20px,4vw,40px);animation:mhfade .5s both;")}>
      <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.2em;color:#E10613;")}>COMMUNITY</div>
      <h1 style={sx("font:800 clamp(28px,4.4vw,44px) Montserrat;color:#fff;text-transform:uppercase;margin-top:8px;")}>
        Biker Meeting
      </h1>
      <p style={sx("font:400 15px/1.7 Roboto;color:#8A8F98;margin-top:10px;max-width:780px;")}>
        {t("Спорт мотоцикл, мото клубүүд, бие даасан райдерууд, мото сонирхогчид нэг дор уулзаж, танилцаж, шинэ хүмүүстэй холбогдон, мото соёлоо хамтдаа бүтээх хамгийн том community gathering-д таныг урьж байна.")}
      </p>

      {meetings.length === 0 ? (
        <div style={sx("background:#111113;border:1px solid #262626;border-radius:16px;padding:44px;text-align:center;margin-top:26px;")}>
          <div style={sx("font:400 14px Roboto;color:#8A8F98;")}>
            {t("Одоогоор уулзалт бүртгэгдээгүй байна. Тун удахгүй зарлана!")}
          </div>
        </div>
      ) : (
        <div className="mh-prod-grid" style={{ marginTop: 26 }}>
          {meetings.map((m) => (
            <Link key={m.id} href={`/meetings/${m.id}`} className="mh-card"
              style={sx("background:#111113;border:1px solid #262626;border-radius:16px;overflow:hidden;display:block;cursor:pointer;")}>
              {/* Постер ихэвчлэн босоо. Тайрахгүйгээр бүтнээр нь харуулна. */}
              <div style={{ position: "relative", aspectRatio: "4 / 5", background: "#0d0d0f" }}>
                {m.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img {...imgSrc(m.image, 520)} alt={m.title}
                    style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:contain;")} />
                ) : (
                  <Slot label="Meeting" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
                )}
                {/* Зохион байгуулагч — постерын дээд буланд */}
                {(partners[m.id] ?? []).filter(isOrganizer).length > 0 && (
                  <div style={sx("position:absolute;top:10px;left:10px;display:flex;align-items:center;gap:6px;background:rgba(5,5,5,.78);border:1px solid #3a3a3f;border-radius:9px;padding:6px 9px;backdrop-filter:blur(4px);")}>
                    <span style={sx("font:600 8px 'JetBrains Mono';letter-spacing:.12em;color:#8A8F98;text-transform:uppercase;")}>
                      {t("Зохион байгуулагч")}
                    </span>
                    {(partners[m.id] ?? []).filter(isOrganizer).slice(0, 2).map((p) => (
                      p.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={p.id} {...imgSrc(p.logo, 140)} alt={p.name}
                          style={{ height: 22, maxWidth: 86, objectFit: "contain", display: "block" }} />
                      ) : (
                        <span key={p.id} style={sx("font:700 10px Montserrat;color:#fff;white-space:nowrap;")}>{p.name}</span>
                      )
                    ))}
                  </div>
                )}
                {counts[m.id] > 0 && (
                  <span style={sx("position:absolute;bottom:12px;right:12px;background:rgba(5,5,5,.82);border:1px solid #3a3a3f;color:#fff;font:700 11px Montserrat;padding:6px 11px;border-radius:999px;")}>
                    📷 {counts[m.id]}
                  </span>
                )}
              </div>
              <div style={{ padding: "16px 18px 18px" }}>
                <div style={sx("display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;font:500 11px 'JetBrains Mono';letter-spacing:.14em;color:#E10613;")}>
                  <span>{m.date}</span>
                  {m.location && (
                    <span style={sx("display:inline-flex;align-items:center;gap:4px;color:#A3A3A3;")}>
                      <IconPin style={{ width: 13, height: 13, strokeWidth: 2, color: "#E10613" }} />
                      {m.location}
                    </span>
                  )}
                </div>
                <div style={sx("font:800 18px Montserrat;color:#fff;margin-top:6px;")}>{loc(m.title, m.titleEn).trim()}</div>
                {/* Хамтрагчид — гарчигийн доор (зохион байгуулагч дээр гарсан). */}
                {(partners[m.id] ?? []).filter((p) => !isOrganizer(p)).length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 12 }}>
                    {(partners[m.id] ?? []).filter((p) => !isOrganizer(p)).slice(0, 5).map((p) => (
                      <span key={p.id} title={`${p.name}${p.role ? ` · ${t(p.role)}` : ""}`}
                        style={sx("background:#0B0B0D;border:1px solid #262626;border-radius:8px;padding:6px 8px;width:88px;height:42px;display:flex;align-items:center;justify-content:center;overflow:hidden;")}>
                        {p.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img {...imgSrc(p.logo, 176)} alt={p.name}
                            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                        ) : (
                          <span style={sx("font:700 10px Montserrat;letter-spacing:.04em;color:#A3A3A3;text-align:center;line-height:1.2;")}>{p.name}</span>
                        )}
                      </span>
                    ))}
                    {(partners[m.id] ?? []).filter((p) => !isOrganizer(p)).length > 5 && (
                      <span style={sx("font:600 11px Roboto;color:#6b7280;")}>
                        +{(partners[m.id] ?? []).filter((p) => !isOrganizer(p)).length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
