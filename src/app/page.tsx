import Link from "next/link";
import { sx } from "@/lib/sx";
import { MotoCard } from "@/components/MotoCard";
import { MOTOS, PARTNERS } from "@/lib/data";

const CATS = [
  { n: "01", title: "Мотоцикл", desc: "Бэлэн ба захиалгаар орох мотоцикл, specs, үнэ.", href: "/motorcycles" },
  { n: "02", title: "Дагалдах хэрэгсэл", desc: "Каск, хувцас, хамгаалалт, intercom төхөөрөмж.", href: "/gear" },
  { n: "03", title: "Сэлбэг хэрэгсэл", desc: "Яндан, батерей, дугуй, тохирох сэлбэг.", href: "/gear" },
  { n: "04", title: "Засвар үйлчилгээ", desc: "Засвар, оношилгоо, тюнинг, угсралт.", href: "/service" },
];

export default function HomePage() {
  const featured = [MOTOS[0], MOTOS[4], MOTOS[7], MOTOS[3]];
  const partners = [...PARTNERS, ...PARTNERS];

  return (
    <div style={{ animation: "mhfade .5s both" }}>
      {/* HERO */}
      <div style={sx("position:relative;overflow:hidden;border-bottom:1px solid #1c1c1f;")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/hero-ducati.webp"
          alt="Ducati Panigale"
          style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;")}
        />
        <div
          style={sx(
            "position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,#050505 26%,rgba(5,5,5,.5) 58%,rgba(5,5,5,.1)),radial-gradient(80% 120% at 90% 10%,rgba(225,6,19,.22),transparent 55%);",
          )}
        />
        <div
          style={sx(
            "position:relative;max-width:1280px;margin:0 auto;padding:clamp(60px,9vw,120px) clamp(20px,4vw,40px);pointer-events:none;",
          )}
        >
          <span style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.32em;color:#8A8F98;")}>
            MARKETPLACE · SERVICE · COMMUNITY
          </span>
          <h1
            style={sx(
              "font:900 clamp(46px,8vw,96px)/0.92 Montserrat;letter-spacing:-.01em;color:#fff;margin-top:18px;text-transform:uppercase;",
            )}
          >
            Ride.
            <br />
            Power.
            <br />
            <span style={{ color: "#E10613" }}>Live.</span>
          </h1>
          <p
            style={sx(
              "font:400 clamp(15px,2vw,19px)/1.6 Roboto;color:#C8C8C8;max-width:520px;margin-top:24px;",
            )}
          >
            Мотоцикл худалдаа, premium gear, performance parts, засвар үйлчилгээ болон rider
            community-ийн нэгдсэн платформ.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 36 }}>
            <Link
              href="/motorcycles"
              style={sx(
                "background:#E10613;color:#fff;font:700 14px Montserrat;letter-spacing:.06em;padding:15px 28px;border-radius:10px;text-transform:uppercase;cursor:pointer;pointer-events:auto;",
              )}
            >
              Мотоцикл үзэх
            </Link>
            <Link
              href="/service"
              style={sx(
                "border:1px solid #444;color:#fff;font:700 14px Montserrat;letter-spacing:.06em;padding:15px 28px;border-radius:10px;text-transform:uppercase;cursor:pointer;pointer-events:auto;",
              )}
            >
              Засварт цаг захиалах
            </Link>
          </div>
        </div>
      </div>

      <div style={sx("max-width:1280px;margin:0 auto;padding:clamp(40px,6vw,72px) clamp(20px,4vw,40px);")}>
        {/* CATEGORY CARDS */}
        <div
          style={sx(
            "display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;",
          )}
        >
          {CATS.map((c) => (
            <Link
              key={c.n}
              href={c.href}
              className="mh-card"
              style={sx(
                "cursor:pointer;background:#111113;border:1px solid #262626;border-radius:16px;padding:26px;display:block;",
              )}
            >
              <div style={sx("font:800 13px 'JetBrains Mono';color:#E10613;")}>{c.n}</div>
              <div style={sx("font:700 20px Montserrat;color:#fff;margin-top:12px;")}>{c.title}</div>
              <div style={sx("font:400 14px Roboto;color:#8A8F98;margin-top:6px;")}>{c.desc}</div>
            </Link>
          ))}
        </div>

        {/* FEATURED */}
        <div
          style={sx(
            "display:flex;align-items:flex-end;justify-content:space-between;margin-top:clamp(40px,6vw,64px);gap:16px;",
          )}
        >
          <div>
            <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.24em;color:#E10613;")}>ОНЦЛОХ</div>
            <h2 style={sx("font:800 clamp(26px,4vw,38px) Montserrat;color:#fff;margin-top:6px;text-transform:uppercase;")}>
              Онцлох мотоцикл
            </h2>
          </div>
          <Link href="/motorcycles" style={sx("font:600 14px Montserrat;color:#A3A3A3;cursor:pointer;white-space:nowrap;")}>
            Бүгдийг →
          </Link>
        </div>
        <div
          style={sx(
            "display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;margin-top:24px;",
          )}
        >
          {featured.map((m) => (
            <MotoCard key={m.id} m={m} />
          ))}
        </div>

        {/* SERVICE / COMMUNITY CTA */}
        <div
          style={sx(
            "display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:clamp(40px,6vw,64px);",
          )}
        >
          <div
            style={sx(
              "background:linear-gradient(135deg,#1a0405,#111113);border:1px solid #E10613;border-radius:18px;padding:32px;display:flex;flex-direction:column;justify-content:space-between;min-height:200px;",
            )}
          >
            <div>
              <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.2em;color:#E10613;")}>ЗАСВАР ҮЙЛЧИЛГЭЭ</div>
              <div style={sx("font:800 26px Montserrat;color:#fff;margin-top:10px;")}>Засвар · тюнинг · угсралт</div>
              <div style={sx("font:400 14px Roboto;color:#A3A3A3;margin-top:8px;")}>
                Тос солих, оношилгоо, яндан суурилуулах, тормозны засвар, custom тюнинг.
              </div>
            </div>
            <Link
              href="/service"
              style={sx(
                "align-self:flex-start;margin-top:18px;background:#E10613;color:#fff;font:700 13px Montserrat;letter-spacing:.06em;padding:12px 22px;border-radius:9px;text-transform:uppercase;cursor:pointer;",
              )}
            >
              Засварын хүсэлт
            </Link>
          </div>
          <div
            style={sx(
              "background:#111113;border:1px solid #262626;border-radius:18px;padding:32px;display:flex;flex-direction:column;justify-content:space-between;min-height:200px;",
            )}
          >
            <div>
              <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.2em;color:#8A8F98;")}>КОМЬЮНИТИ</div>
              <div style={sx("font:800 26px Montserrat;color:#fff;margin-top:10px;")}>Эвент · Giveaway · Уралдаан</div>
              <div style={sx("font:400 14px Roboto;color:#A3A3A3;margin-top:8px;")}>
                Giveaway, ride, уралдаан, meetup-ийн мэдээлэл, ялагчдын архив.
              </div>
            </div>
            <Link
              href="/events"
              style={sx(
                "align-self:flex-start;margin-top:18px;border:1px solid #444;color:#fff;font:700 13px Montserrat;letter-spacing:.06em;padding:12px 22px;border-radius:9px;text-transform:uppercase;cursor:pointer;",
              )}
            >
              Event үзэх
            </Link>
          </div>
        </div>
      </div>

      {/* PARTNER MARQUEE */}
      <div style={sx("border-top:1px solid #1c1c1f;margin-top:clamp(24px,4vw,44px);padding:clamp(34px,5vw,52px) 0;overflow:hidden;")}>
        <div style={sx("text-align:center;font:500 12px 'JetBrains Mono';letter-spacing:.26em;color:#8A8F98;")}>
          ТӨЛБӨР · ЗЭЭЛИЙН ХАМТРАГЧ
        </div>
        <div
          style={{
            position: "relative",
            marginTop: 28,
            WebkitMaskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)",
            maskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "max-content",
              alignItems: "center",
              animation: "mhmarquee 26s linear infinite",
            }}
          >
            {partners.map((p, i) => (
              <span
                key={i}
                aria-hidden={i >= PARTNERS.length}
                style={sx(
                  "display:inline-flex;align-items:center;justify-content:center;height:68px;width:150px;background:#fff;border-radius:14px;padding:12px 20px;margin:0 14px;flex-shrink:0;color:#0B0B0D;font:800 18px Montserrat;letter-spacing:.01em;",
                )}
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
