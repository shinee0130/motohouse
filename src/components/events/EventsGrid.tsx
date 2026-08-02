"use client";

import { sx } from "@/lib/ui/sx";
import { badge, type EventItem } from "@/lib/db/data";
import { useI18n } from "@/lib/i18n";
import { EventCard } from "@/components/events/EventCard";

// Giveaway хуудсын жагсаалт. Карт нь Biker Meeting-тэй нэг компонент
// (EventCard) дээр суурилсан тул хоёр хэсэг ижил харагдана.
export function EventsGrid({
  label,
  title,
  events,
  emptyText = "Одоогоор мэдээлэл алга. Тун удахгүй!",
}: {
  label: string;
  title: string;
  events: EventItem[];
  emptyText?: string;
}) {
  const { t, loc } = useI18n();

  return (
    <div style={sx("max-width:1280px;margin:0 auto;padding:clamp(32px,5vw,56px) clamp(20px,4vw,40px);")}>
      <div aria-label={t(label)} style={{ animation: "mhfade .5s both" }}>
        <h1 style={sx("font:800 clamp(30px,5vw,46px) Montserrat;color:#fff;margin-top:6px;text-transform:uppercase;")}>
          {t(title)}
        </h1>

        {events.length === 0 && (
          <div style={sx("background:#111113;border:1px solid #262626;border-radius:16px;padding:44px 24px;margin-top:26px;text-align:center;font:500 15px Roboto;color:#8A8F98;")}>
            {t(emptyText)}
          </div>
        )}

        <div className="mh-meetcard-grid" style={{ marginTop: 26 }}>
          {events.map((e) => (
            <EventCard
              key={e.id}
              href={`/giveaway/${e.id}`}
              image={e.image}
              title={loc(e.title, e.titleEn)}
              date={e.date}
              slotLabel="Giveaway"
              badge={<span style={sx(badge(e.status))}>{t(e.status)}</span>}
              rows={e.prize ? [{ label: "🏆 ШАГНАЛ", value: loc(e.prize, e.prizeEn), accent: true }] : []}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
