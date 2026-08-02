import Link from "next/link";
import { notFound } from "next/navigation";
import { sx } from "@/lib/ui/sx";
import { Slot } from "@/components/ui/Slot";
import { badge } from "@/lib/db/data";
import { getEvent, getParticipants } from "@/lib/db/queries";
import { EventParticipate } from "@/components/events/EventParticipate";

export const dynamic = "force-dynamic";

// Ялагчийн нэрийг Instagram хаяг руу хөрвүүлнэ. "@nogoolzgono", бүтэн URL,
// эсвэл зүгээр нэр (зайтай) байж болно — сүүлийнх дээр холбоос гаргахгүй.
function instagramUrl(winner: string): string | null {
  const v = winner.trim();
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@/, "");
  return /^[A-Za-z0-9._]{1,30}$/.test(handle) ? `https://www.instagram.com/${handle}/` : null;
}

export default async function GiveawayDetailPage({ params }: PageProps<"/giveaway/[id]">) {
  const { id } = await params;
  const e = await getEvent(Number(id));
  if (!e) notFound();
  const participants = await getParticipants(e.id);

  return (
    <div style={sx("max-width:920px;margin:0 auto;padding:clamp(24px,4vw,44px) clamp(20px,4vw,40px);animation:mhfade .5s both;")}>
      <Link href="/giveaway" style={sx("font:600 13px Montserrat;color:#8A8F98;cursor:pointer;")}>← Giveaway руу</Link>

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
          {(() => {
            const ig = instagramUrl(e.winner!);
            const name = sx("font:800 22px Montserrat;color:#fff;margin-top:6px;");
            return ig ? (
              <a href={ig} target="_blank" rel="noopener noreferrer"
                style={{ ...name, display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }} aria-hidden>
                  <defs><linearGradient id="mh-ig-win" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#feda75"/><stop offset="0.5" stopColor="#d62976"/><stop offset="1" stopColor="#4f5bd5"/></linearGradient></defs>
                  <path fill="url(#mh-ig-win)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                {e.winner}
              </a>
            ) : (
              <div style={name}>{e.winner}</div>
            );
          })()}
          <div style={sx("font:400 13px Roboto;color:#A3A3A3;margin-top:4px;")}>Баяр хүргэе! Нэр дээр нь дарж Instagram хаяг руу нь орно. Шагналаа авахаар бидэнтэй холбогдоно уу.</div>
        </div>
      )}

      {e.description && (
        <p style={sx("font:400 15px/1.7 Roboto;color:#C8C8C8;margin-top:20px;")}>{e.description}</p>
      )}

      <EventParticipate eventId={e.id} status={e.status} initial={participants} />
    </div>
  );
}
