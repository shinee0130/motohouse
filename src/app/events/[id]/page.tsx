import Link from "next/link";
import { notFound } from "next/navigation";
import { sx } from "@/lib/sx";
import { Slot } from "@/components/Slot";
import { badge } from "@/lib/data";
import { getEvent, getParticipants } from "@/lib/queries";
import { EventParticipate } from "@/components/EventParticipate";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;
  const e = await getEvent(Number(id));
  if (!e) notFound();
  const participants = await getParticipants(e.id);

  return (
    <div style={sx("max-width:920px;margin:0 auto;padding:clamp(24px,4vw,44px) clamp(20px,4vw,40px);animation:mhfade .5s both;")}>
      <Link href="/events" style={sx("font:600 13px Montserrat;color:#8A8F98;cursor:pointer;")}>← Events руу</Link>

      {/* poster — зургийн жинхэнэ харьцаагаар (босоо ч, хэвтээ ч бүтнээр) */}
      <div style={sx("position:relative;border-radius:18px;overflow:hidden;border:1px solid #262626;margin-top:16px;background:#0d0d0f;display:flex;justify-content:center;align-items:center;min-height:220px;")}>
        {e.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={e.image} alt={e.title} style={{ display: "block", maxWidth: "100%", maxHeight: "78vh", width: "auto", height: "auto" }} />
        ) : (
          <Slot label="Event poster" style={{ width: "100%", aspectRatio: "16/10" }} />
        )}
        <span style={{ position: "absolute", top: 16, left: 16, zIndex: 2, ...sx(badge(e.status)) }}>{e.status}</span>
      </div>

      <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.2em;color:#E10613;margin-top:22px;")}>{e.type}</div>
      <h1 style={sx("font:800 clamp(26px,4vw,40px) Montserrat;color:#fff;margin-top:8px;")}>{e.title}</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 18 }}>
        <div style={sx("background:#111113;border:1px solid #262626;border-radius:12px;padding:14px 18px;")}>
          <div style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.12em;color:#8A8F98;")}>ОГНОО</div>
          <div style={sx("font:700 15px Montserrat;color:#fff;margin-top:4px;")}>{e.date}</div>
        </div>
        <div style={sx("background:#111113;border:1px solid #262626;border-radius:12px;padding:14px 18px;")}>
          <div style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.12em;color:#8A8F98;")}>ШАГНАЛ</div>
          <div style={sx("font:700 15px Montserrat;color:#E10613;margin-top:4px;")}>{e.prize}</div>
        </div>
      </div>

      {e.winner && (
        <div style={sx("background:linear-gradient(120deg,#1a0405,#111113 70%);border:1px solid #E10613;border-radius:14px;padding:20px 22px;margin-top:18px;")}>
          <div style={sx("font:600 11px 'JetBrains Mono';letter-spacing:.16em;color:#E10613;")}>🏆 ЯЛАГЧ</div>
          <div style={sx("font:800 22px Montserrat;color:#fff;margin-top:6px;")}>{e.winner}</div>
          <div style={sx("font:400 13px Roboto;color:#A3A3A3;margin-top:4px;")}>Баяр хүргэе! Шагналаа авахаар бидэнтэй холбогдоно уу.</div>
        </div>
      )}

      {e.description && (
        <p style={sx("font:400 15px/1.7 Roboto;color:#C8C8C8;margin-top:20px;")}>{e.description}</p>
      )}

      <EventParticipate eventId={e.id} status={e.status} initial={participants} />
    </div>
  );
}
