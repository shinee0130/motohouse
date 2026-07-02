import Link from "next/link";
import { sx } from "@/lib/sx";
import { Slot } from "@/components/Slot";
import { badge } from "@/lib/data";
import { getEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const EVENTS = await getEvents();
  return (
    <div style={sx("max-width:1280px;margin:0 auto;padding:clamp(32px,5vw,56px) clamp(20px,4vw,40px);")}>
      <div style={{ animation: "mhfade .5s both" }}>
        <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.24em;color:#E10613;")}>COMMUNITY</div>
        <h1 style={sx("font:800 clamp(30px,5vw,46px) Montserrat;color:#fff;margin-top:6px;text-transform:uppercase;")}>
          Events & Giveaway
        </h1>

        <div
          style={sx(
            "display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:22px;margin-top:26px;",
          )}
        >
          {EVENTS.map((e) => (
            <Link
              key={e.id}
              href={`/events/${e.id}`}
              className="mh-card"
              style={sx("background:#111113;border:1px solid #262626;border-radius:16px;overflow:hidden;display:block;cursor:pointer;")}
            >
              <div style={{ position: "relative", height: 220, background: "#0d0d0f" }}>
                {e.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.image} alt={e.title} style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:contain;")} />
                ) : (
                  <Slot label="Event poster" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
                )}
                <span style={{ position: "absolute", top: 12, left: 12, zIndex: 2, ...sx(badge(e.status)) }}>
                  {e.status}
                </span>
                <div
                  style={sx(
                    "position:absolute;left:0;right:0;bottom:0;height:60%;background:linear-gradient(transparent,rgba(5,5,5,.9));z-index:1;",
                  )}
                />
              </div>
              <div style={{ padding: "18px 20px" }}>
                <div style={sx("font:500 11px 'JetBrains Mono';letter-spacing:.14em;color:#E10613;")}>{e.type}</div>
                <div style={sx("font:700 19px Montserrat;color:#fff;margin-top:6px;")}>{e.title}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                  <span style={sx("font:400 13px Roboto;color:#8A8F98;")}>{e.date}</span>
                  <span style={sx("font:700 14px Montserrat;color:#fff;")}>{e.prize}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
