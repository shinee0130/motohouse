import Link from "next/link";
import { notFound } from "next/navigation";
import { sx } from "@/lib/ui/sx";
import { getEvent, getEventMedia, getEventPartners } from "@/lib/db/queries";
import { MeetingGallery } from "@/components/meetings/MeetingGallery";
import { MeetingPartners } from "@/components/meetings/MeetingPartners";
import { IconPin } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

// Уулзалтын хуудас: гарчиг + огноо → хамтрагчид → галерей.
// Постер зураг, тайлбар энд гарахгүй — постерийг зөвхөн жагсаалтын карт дээр
// нүүр зураг болгон ашиглана.
export default async function MeetingDetailPage({ params }: PageProps<"/meetings/[id]">) {
  const { id } = await params;
  const e = await getEvent(Number(id));
  if (!e) notFound();
  const [media, partners] = await Promise.all([getEventMedia(e.id), getEventPartners(e.id)]);

  return (
    <div style={sx("max-width:1080px;margin:0 auto;padding:clamp(24px,4vw,44px) clamp(20px,4vw,40px);animation:mhfade .5s both;")}>
      <Link href="/meetings" style={sx("font:600 13px Montserrat;color:#8A8F98;cursor:pointer;")}>← Biker Meeting</Link>

      <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.2em;color:#E10613;margin-top:20px;")}>BIKER MEETING</div>
      <h1 style={sx("font:800 clamp(28px,4.4vw,44px) Montserrat;color:#fff;margin-top:8px;")}>{e.title.trim()}</h1>
      <div style={sx("display:flex;align-items:center;flex-wrap:wrap;gap:6px 14px;font:600 14px Montserrat;color:#8A8F98;margin-top:8px;")}>
        <span>{e.date}</span>
        {e.location && (
          <span style={sx("display:inline-flex;align-items:center;gap:6px;")}>
            <IconPin style={{ width: 16, height: 16, strokeWidth: 2, color: "#E10613" }} />
            {e.location}
          </span>
        )}
      </div>

      <MeetingPartners partners={partners} />
      <MeetingGallery media={media} />
    </div>
  );
}
