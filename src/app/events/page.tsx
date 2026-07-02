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
              style={sx("background:#111113;border:1px solid #262626;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;cursor:pointer;")}
            >
              <div style={{ position: "relative", height: 260, background: "radial-gradient(120% 120% at 50% 0%, #17171a, #0b0b0d)" }}>
                {e.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.image} alt={e.title} style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:10px;")} />
                ) : (
                  <Slot label="Event poster" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
                )}
                <span style={{ position: "absolute", top: 12, left: 12, zIndex: 2, ...sx(badge(e.status)) }}>
                  {e.status}
                </span>
              </div>
              <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
                <span style={sx("display:inline-block;align-self:flex-start;font:600 10px 'JetBrains Mono';letter-spacing:.14em;color:#E10613;background:rgba(225,6,19,.1);border:1px solid rgba(225,6,19,.3);padding:4px 9px;border-radius:6px;")}>{e.type}</span>
                <div style={sx("font:700 18px/1.3 Montserrat;color:#fff;margin-top:10px;")}>{e.title}</div>
                <div style={sx("margin-top:auto;padding-top:14px;border-top:1px solid #1c1c1f;display:flex;flex-direction:column;gap:8px;")}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <span style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.1em;color:#8A8F98;")}>ОГНОО</span>
                    <span style={sx("font:600 13px Roboto;color:#C8C8C8;")}>{e.date}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <span style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.1em;color:#8A8F98;flex-shrink:0;")}>🏆 ШАГНАЛ</span>
                    <span style={sx("font:700 13px Montserrat;color:#E10613;text-align:right;")}>{e.prize}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
