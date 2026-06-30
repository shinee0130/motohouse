import Link from "next/link";
import { notFound } from "next/navigation";
import { sx } from "@/lib/sx";
import { Slot } from "@/components/Slot";
import { MOTOS, fmt, badge, similarMotos } from "@/lib/data";

export function generateStaticParams() {
  return MOTOS.map((m) => ({ id: String(m.id) }));
}

const STAT = "background:#111113;border:1px solid #262626;border-radius:12px;padding:18px 16px;";
const STAT_LBL = "font:600 10px 'JetBrains Mono';letter-spacing:.12em;color:#8A8F98;";
const STAT_BIG = "font:800 26px Montserrat;color:#fff;margin-top:6px;";
const STAT_UNIT = "font:600 13px Montserrat;color:#E10613;";
const SPEC_LBL = "font:600 11px 'JetBrains Mono';letter-spacing:.14em;color:#8A8F98;";
const SPEC_VAL = "font:600 16px Roboto;color:#fff;margin-top:3px;";

export default async function DetailPage({ params }: PageProps<"/motorcycles/[id]">) {
  const { id } = await params;
  const m = MOTOS.find((x) => x.id === Number(id));
  if (!m) notFound();

  const similar = similarMotos(m);

  return (
    <div
      style={sx("max-width:1280px;margin:0 auto;padding:clamp(24px,4vw,44px) clamp(20px,4vw,40px);")}
    >
      <div style={{ animation: "mhfade .5s both" }}>
        <Link href="/motorcycles" style={sx("font:600 13px Montserrat;color:#8A8F98;cursor:pointer;")}>
          ← Жагсаалт руу
        </Link>

        <div
          style={sx(
            "display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:32px;margin-top:20px;align-items:start;",
          )}
        >
          {/* gallery */}
          <div>
            <div
              style={sx(
                "position:relative;border-radius:18px;overflow:hidden;border:1px solid #262626;aspect-ratio:4/3;",
              )}
            >
              <Slot label="Мотоцикл том зураг" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
              <span style={{ position: "absolute", top: 16, left: 16, zIndex: 2, ...sx(badge(m.status)) }}>
                {m.status}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 12 }}>
              {["Зураг 2", "Зураг 3", "Зураг 4", "Зураг 5"].map((t) => (
                <Slot key={t} label={t} style={{ height: 84, borderRadius: 10 }} />
              ))}
            </div>
            <div
              style={sx(
                "position:relative;border-radius:14px;overflow:hidden;border:1px solid #262626;aspect-ratio:16/9;margin-top:12px;",
              )}
            >
              <Slot label="Видео poster" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
              <div
                style={sx(
                  "position:absolute;inset:0;background:linear-gradient(transparent,rgba(5,5,5,.5));pointer-events:none;",
                )}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={sx(
                    "width:62px;height:62px;border-radius:50%;background:rgba(225,6,19,.92);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 24px rgba(225,6,19,.45);",
                  )}
                >
                  <div
                    style={sx(
                      "width:0;height:0;border-left:18px solid #fff;border-top:11px solid transparent;border-bottom:11px solid transparent;margin-left:5px;",
                    )}
                  />
                </div>
              </div>
              <span
                style={sx(
                  "position:absolute;top:12px;left:14px;z-index:2;font:600 11px 'JetBrains Mono';letter-spacing:.16em;color:#fff;background:rgba(0,0,0,.5);padding:5px 11px;border-radius:6px;",
                )}
              >
                ВИДЕО
              </span>
            </div>
          </div>

          {/* info */}
          <div>
            <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.2em;color:#E10613;")}>{m.brand}</div>
            <h1 style={sx("font:800 clamp(28px,4vw,40px) Montserrat;color:#fff;margin-top:6px;")}>{m.model}</h1>
            <div style={sx("font:800 30px Montserrat;color:#E10613;margin-top:10px;")}>{fmt(m.price)}</div>

            <div
              style={sx(
                "background:#111113;border:1px solid #262626;border-radius:16px;padding:22px 24px;margin-top:22px;display:grid;grid-template-columns:1fr 1fr;gap:16px;",
              )}
            >
              {[
                ["YEAR", m.year],
                ["ENGINE", `${m.cc}cc`],
                ["ODO", `${m.odo.toLocaleString("en-US")} km`],
                ["CUSTOMS", m.customs],
                ["COUNTRY", m.country],
                ["STATUS", m.status],
              ].map(([lbl, val]) => (
                <div key={lbl}>
                  <div style={sx(SPEC_LBL)}>{lbl}</div>
                  <div style={sx(SPEC_VAL)}>{val}</div>
                </div>
              ))}
            </div>

            <p style={sx("font:400 15px/1.6 Roboto;color:#A3A3A3;margin-top:18px;")}>{m.desc}</p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 22 }}>
              <Link
                href="/service"
                style={sx(
                  "background:#E10613;color:#fff;font:700 14px Montserrat;letter-spacing:.05em;padding:14px 26px;border-radius:10px;text-transform:uppercase;cursor:pointer;",
                )}
              >
                Сонирхож байна
              </Link>
              <Link
                href="/service"
                style={sx(
                  "border:1px solid #444;color:#fff;font:700 14px Montserrat;letter-spacing:.05em;padding:14px 26px;border-radius:10px;cursor:pointer;",
                )}
              >
                Messenger
              </Link>
            </div>
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
                <div style={sx(STAT_LBL)}>МОРИНЫ ХҮЧ</div>
                <div style={sx(STAT_BIG)}>{m.hp}<span style={sx(STAT_UNIT)}> HP</span></div>
              </div>
              <div style={sx(STAT)}>
                <div style={sx(STAT_LBL)}>ЭРГЭХ МОМЕНТ</div>
                <div style={sx(STAT_BIG)}>{m.nm}<span style={sx(STAT_UNIT)}> Nm</span></div>
              </div>
              <div style={sx(STAT)}>
                <div style={sx(STAT_LBL)}>ДЭЭД ХУРД</div>
                <div style={sx(STAT_BIG)}>{m.top}<span style={sx(STAT_UNIT)}> км/ц</span></div>
              </div>
              <div style={sx(STAT)}>
                <div style={sx(STAT_LBL)}>ЖИН</div>
                <div style={sx(STAT_BIG)}>{m.weight}<span style={sx(STAT_UNIT)}> кг</span></div>
              </div>
              <div style={sx(STAT)}>
                <div style={sx(STAT_LBL)}>ХӨДӨЛГҮҮР</div>
                <div style={sx("font:700 16px Montserrat;color:#fff;margin-top:10px;")}>{m.cyl}</div>
              </div>
              <div style={sx(STAT)}>
                <div style={sx(STAT_LBL)}>ХУРДНЫ ХАЙРЦАГ</div>
                <div style={sx("font:700 16px Montserrat;color:#fff;margin-top:10px;")}>6 шат · Шингэн</div>
              </div>
            </div>
          </div>
          <div>
            <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.22em;color:#E10613;")}>EXTRAS</div>
            <h2 style={sx("font:800 22px Montserrat;color:#fff;text-transform:uppercase;margin-top:4px;")}>Нэмэлт тоног</h2>
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
          <h2 style={sx("font:800 22px Montserrat;color:#fff;text-transform:uppercase;")}>Төстэй мотоцикл</h2>
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
                <div style={{ position: "relative", height: 140 }}>
                  <Slot label="Зураг" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
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
