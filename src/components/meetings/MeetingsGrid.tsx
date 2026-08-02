"use client";

import { sx } from "@/lib/ui/sx";
import { type EventItem } from "@/lib/db/data";
import type { EventPartner } from "@/lib/db/queries";
import { useI18n } from "@/lib/i18n";
import { EventCard } from "@/components/events/EventCard";

// Зохион байгуулагч нь хамтрагч БИШ — картын дээд талд тусад нь гарна.
const isOrganizer = (p: EventPartner) => /зохион байгуул|organi[sz]er/i.test(p.role ?? "");

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
        <div className="mh-meetcard-grid" style={{ marginTop: 26 }}>
          {meetings.map((m) => {
            const list = partners[m.id] ?? [];
            return (
              <EventCard
                key={m.id}
                href={`/meetings/${m.id}`}
                image={m.image}
                title={loc(m.title, m.titleEn).trim()}
                date={m.date}
                location={m.location}
                slotLabel="Meeting"
                overlay={list.filter(isOrganizer)}
                logos={list.filter((p) => !isOrganizer(p))}
                cornerBadge={counts[m.id] > 0 ? `📷 ${counts[m.id]}` : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
