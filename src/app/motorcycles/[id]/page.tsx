import Link from "next/link";
import { notFound } from "next/navigation";
import { sx } from "@/lib/sx";
import { Slot } from "@/components/Slot";
import { MotoGallery } from "@/components/MotoGallery";
import { MotoActions } from "@/components/MotoActions";
import { fmt, statusLabel } from "@/lib/data";
import { getMotos, similarOf } from "@/lib/queries";
import { T } from "@/lib/i18n";

// Admin засвар шууд харагдахаар — DB-ээс амьд уншина
export const dynamic = "force-dynamic";

const STAT = "background:#111113;border:1px solid #262626;border-radius:12px;padding:18px 16px;";
const STAT_LBL = "font:600 10px 'JetBrains Mono';letter-spacing:.12em;color:#8A8F98;";
const STAT_BIG = "font:800 26px Montserrat;color:#fff;margin-top:6px;";
const STAT_UNIT = "font:600 13px Montserrat;color:#E10613;";
const SPEC_LBL = "font:600 11px 'JetBrains Mono';letter-spacing:.14em;color:#8A8F98;";
const SPEC_VAL = "font:600 16px Roboto;color:#fff;margin-top:3px;";

export default async function DetailPage({ params }: PageProps<"/motorcycles/[id]">) {
  const { id } = await params;
  const motos = await getMotos();
  const m = motos.find((x) => x.id === Number(id));
  if (!m) notFound();

  const similar = similarOf(m, motos);

  return (
    <div
      style={sx("max-width:1280px;margin:0 auto;padding:clamp(24px,4vw,44px) clamp(20px,4vw,40px);")}
    >
      <div style={{ animation: "mhfade .5s both" }}>
        <Link href="/motorcycles" style={sx("font:600 13px Montserrat;color:#8A8F98;cursor:pointer;")}>
          ← <T>Жагсаалт руу</T>
        </Link>

        <div
          className="mh-moto-detail"
          style={sx(
            "display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:32px;margin-top:20px;align-items:start;",
          )}
        >
          {/* gallery */}
          <MotoGallery images={m.images} status={m.status} video={m.video} />

          {/* info */}
          <div>
            <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.2em;color:#E10613;")}>{m.brand}</div>
            <h1 style={sx("font:800 clamp(28px,4vw,40px) Montserrat;color:#fff;margin-top:6px;")}>{m.model}</h1>
            {m.salePrice ? (
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginTop: 10 }}>
                <span style={sx("font:600 18px Montserrat;color:#6b7280;text-decoration:line-through;")}>{fmt(m.price)}</span>
                <span style={sx("font:800 30px Montserrat;color:#E10613;")}>{fmt(m.salePrice)}</span>
                <span style={sx("font:700 11px Montserrat;letter-spacing:.05em;color:#fff;background:#E10613;padding:5px 10px;border-radius:6px;")}><T>ХЯМДРАЛ</T></span>
              </div>
            ) : (
              <div style={sx("font:800 30px Montserrat;color:#E10613;margin-top:10px;")}>{fmt(m.price)}</div>
            )}

            <div
              style={sx(
                "background:#111113;border:1px solid #262626;border-radius:16px;padding:22px 24px;margin-top:22px;display:grid;grid-template-columns:1fr 1fr;gap:16px;",
              )}
            >
              {([
                ["YEAR", m.year],
                ["ENGINE", `${m.cc}cc`],
                ["ODO", `${m.odo.toLocaleString("en-US")} km`],
                ["CUSTOMS", m.customs],
                ["COUNTRY", m.country],
                ["STATUS", <T key="st">{statusLabel(m.status)}</T>],
              ] as [string, React.ReactNode][]).map(([lbl, val]) => (
                <div key={lbl}>
                  <div style={sx(SPEC_LBL)}>{lbl}</div>
                  <div style={sx(SPEC_VAL)}>{val}</div>
                </div>
              ))}
            </div>

            <p style={sx("font:400 15px/1.6 Roboto;color:#A3A3A3;margin-top:18px;")}>{m.desc}</p>

            <MotoActions id={m.id} name={`${m.brand} ${m.model}`} price={m.price} />
          </div>
        </div>

        {/* performance + extras */}
        <div
          style={sx(
            "margin-top:clamp(36px,5vw,56px);display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:32px;",
          )}
        >
          <div>
            <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.22em;color:#E10613;")}>PERFORMANCE</div>
            <h2 style={sx("font:800 22px Montserrat;color:#fff;text-transform:uppercase;margin-top:4px;")}>Performance</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
              <div style={sx(STAT)}>
                <div style={sx(STAT_LBL)}><T>МОРИНЫ ХҮЧ</T></div>
                <div style={sx(STAT_BIG)}>{m.hp}<span style={sx(STAT_UNIT)}> HP</span></div>
              </div>
              <div style={sx(STAT)}>
                <div style={sx(STAT_LBL)}><T>ЭРГЭХ МОМЕНТ</T></div>
                <div style={sx(STAT_BIG)}>{m.nm}<span style={sx(STAT_UNIT)}> Nm</span></div>
              </div>
              <div style={sx(STAT)}>
                <div style={sx(STAT_LBL)}><T>ДЭЭД ХУРД</T></div>
                <div style={sx(STAT_BIG)}>{m.top}<span style={sx(STAT_UNIT)}> <T>км/ц</T></span></div>
              </div>
              <div style={sx(STAT)}>
                <div style={sx(STAT_LBL)}><T>ЖИН</T></div>
                <div style={sx(STAT_BIG)}>{m.weight}<span style={sx(STAT_UNIT)}> <T>кг</T></span></div>
              </div>
              <div style={sx(STAT)}>
                <div style={sx(STAT_LBL)}><T>ХӨДӨЛГҮҮР</T></div>
                <div style={sx("font:700 16px Montserrat;color:#fff;margin-top:10px;")}>{m.cyl}</div>
              </div>
              <div style={sx(STAT)}>
                <div style={sx(STAT_LBL)}><T>ХУРДНЫ ХАЙРЦАГ</T></div>
                <div style={sx("font:700 16px Montserrat;color:#fff;margin-top:10px;")}>{m.gearbox || "—"}</div>
              </div>
            </div>
          </div>
          <div>
            <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.22em;color:#E10613;")}>EXTRAS</div>
            <h2 style={sx("font:800 22px Montserrat;color:#fff;text-transform:uppercase;margin-top:4px;")}><T>Нэмэлт тоног</T></h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              {m.extras.map((x) => (
                <div
                  key={x}
                  style={sx(
                    "display:flex;align-items:center;gap:13px;background:#111113;border:1px solid #262626;border-radius:11px;padding:13px 16px;",
                  )}
                >
                  <span style={sx("width:7px;height:7px;border-radius:50%;background:#E10613;flex-shrink:0;")} />
                  <span style={sx("font:500 15px Roboto;color:#fff;")}>{x}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* similar */}
        <div style={{ marginTop: "clamp(36px,5vw,56px)" }}>
          <h2 style={sx("font:800 22px Montserrat;color:#fff;text-transform:uppercase;")}><T>Төстэй мотоцикл</T></h2>
          <div
            style={sx(
              "display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;margin-top:18px;",
            )}
          >
            {similar.map((s) => (
              <Link
                key={s.id}
                href={`/motorcycles/${s.id}`}
                className="mh-card"
                style={sx(
                  "cursor:pointer;background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;display:block;",
                )}
              >
                <div style={{ position: "relative", height: 150, background: "#0d0d0f" }}>
                  {s.images && s.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.images[0]} alt={`${s.brand} ${s.model}`} style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:contain;")} />
                  ) : (
                    <Slot label="Image" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
                  )}
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <div style={sx("font:700 16px Montserrat;color:#fff;")}>{s.brand} {s.model}</div>
                  <div style={sx("font:700 14px Montserrat;color:#E10613;margin-top:6px;")}>{fmt(s.price)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
