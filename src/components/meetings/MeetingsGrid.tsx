"use client";

import Link from "next/link";
import { sx } from "@/lib/ui/sx";
import { Slot } from "@/components/ui/Slot";
import { type EventItem } from "@/lib/db/data";
import type { EventPartner } from "@/lib/db/queries";
import { useI18n } from "@/lib/i18n";
import { imgSrc } from "@/lib/ui/img";

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
                {counts[m.id] > 0 && (
                  <span style={sx("position:absolute;bottom:12px;right:12px;background:rgba(5,5,5,.82);border:1px solid #3a3a3f;color:#fff;font:700 11px Montserrat;padding:6px 11px;border-radius:999px;")}>
                    📷 {counts[m.id]}
                  </span>
                )}
              </div>
              <div style={{ padding: "16px 18px 18px" }}>
                <div style={sx("font:500 11px 'JetBrains Mono';letter-spacing:.14em;color:#E10613;")}>
                  {m.date}{m.location ? ` · ${m.location}` : ""}
                </div>
                <div style={sx("font:800 18px Montserrat;color:#fff;margin-top:6px;")}>{loc(m.title, m.titleEn).trim()}</div>
                {/* Хамтрагчид — гарчигийн доор. Логотой нь логогоор, эс бол нэрээр. */}
                {(partners[m.id]?.length ?? 0) > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 10 }}>
                    {partners[m.id].slice(0, 5).map((p) => (
                      <span key={p.id} title={`${p.name}${p.role ? ` · ${t(p.role)}` : ""}`}
                        style={sx("background:#0B0B0D;border:1px solid #262626;border-radius:7px;padding:5px 9px;height:30px;display:flex;align-items:center;justify-content:center;")}>
                        {p.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img {...imgSrc(p.logo, 96)} alt={p.name}
                            style={{ maxHeight: 18, maxWidth: 70, objectFit: "contain", display: "block" }} />
                        ) : (
                          <span style={sx("font:700 10px Montserrat;letter-spacing:.04em;color:#A3A3A3;white-space:nowrap;")}>{p.name}</span>
                        )}
                      </span>
                    ))}
                    {partners[m.id].length > 5 && (
                      <span style={sx("font:600 11px Roboto;color:#6b7280;")}>+{partners[m.id].length - 5}</span>
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
