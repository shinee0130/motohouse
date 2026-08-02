import Link from "next/link";
import { notFound } from "next/navigation";
import { sx } from "@/lib/ui/sx";
import { Slot } from "@/components/ui/Slot";
import { badge } from "@/lib/db/data";
import { getEvent, getEventMedia } from "@/lib/db/queries";
import { imgSrc } from "@/lib/ui/img";
import { MeetingGallery } from "@/components/meetings/MeetingGallery";

export const dynamic = "force-dynamic";

export default async function MeetingDetailPage({ params }: PageProps<"/meetings/[id]">) {
  const { id } = await params;
  const e = await getEvent(Number(id));
  if (!e) notFound();
  const media = await getEventMedia(e.id);

  return (
    <div style={sx("max-width:1080px;margin:0 auto;padding:clamp(24px,4vw,44px) clamp(20px,4vw,40px);animation:mhfade .5s both;")}>
      <Link href="/meetings" style={sx("font:600 13px Montserrat;color:#8A8F98;cursor:pointer;")}>← Biker Meeting</Link>

      {/* нүүр зураг — жинхэнэ харьцаагаараа */}
      <div style={sx("position:relative;border-radius:18px;overflow:hidden;border:1px solid #262626;margin-top:16px;background:#0d0d0f;display:flex;justify-content:center;align-items:center;min-height:220px;")}>
        {e.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img {...imgSrc(e.image, 1080)} alt={e.title}
            style={{ display: "block", maxWidth: "100%", maxHeight: "78vh", width: "auto", height: "auto" }} />
        ) : (
          <Slot label="Meeting" style={{ width: "100%", aspectRatio: "16/10" }} />
        )}
        <span style={{ position: "absolute", top: 16, left: 16, zIndex: 2, ...sx(badge(e.status)) }}>{e.status}</span>
      </div>

      <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.2em;color:#E10613;margin-top:22px;")}>BIKER MEETING</div>
      <h1 style={sx("font:800 clamp(26px,4vw,40px) Montserrat;color:#fff;margin-top:8px;")}>{e.title.trim()}</h1>

      <div style={sx("background:#111113;border:1px solid #262626;border-radius:12px;padding:14px 18px;margin-top:18px;display:inline-block;")}>
        <div style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.12em;color:#8A8F98;")}>ОГНОО</div>
        <div style={sx("font:700 15px Montserrat;color:#fff;margin-top:4px;")}>{e.date}</div>
      </div>

      {e.description && (
        <p style={sx("font:400 15px/1.7 Roboto;color:#C8C8C8;margin-top:20px;white-space:pre-wrap;max-width:760px;")}>{e.description}</p>
      )}

      <MeetingGallery media={media} />
    </div>
  );
}
