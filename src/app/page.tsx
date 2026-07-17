import Link from "next/link";
import { sx } from "@/lib/sx";
import { MotoCard } from "@/components/MotoCard";
import { Slot } from "@/components/Slot";
import { badge, isPart, type GearItem } from "@/lib/data";
import { Price } from "@/lib/currency";
import { getMotos, getGearAll, getEvents, getSettings } from "@/lib/queries";
import { T, Loc } from "@/lib/i18n";
import { NewsletterInput } from "@/components/NewsletterInput";
import { Poster } from "@/components/Poster";

// Бодит лого байгаа брэндүүд — marquee-д зургаар, бусад нь текстээр.
const BRAND_LOGOS: Record<string, string> = {
  Kawasaki: "/assets/brands/kawasaki.png",
  Yamaha: "/assets/brands/yamaha.png",
  Honda: "/assets/brands/honda.png",
  BMW: "/assets/brands/bmw.png",
  Ducati: "/assets/brands/ducati.png",
  Dainese: "/assets/brands/dainese.png",
  Shoei: "/assets/brands/shoei.png",
  Alpinestars: "/assets/brands/alpinestars.png",
  Akrapovic: "/assets/brands/akrapovic.png",
};

const WRAP = "max-width:1280px;margin:0 auto;padding:0 clamp(20px,4vw,40px);";
const SECTION_TITLE = "font:800 clamp(24px,4vw,36px) Montserrat;color:#fff;text-transform:uppercase;";
const SEE_ALL = "font:600 14px Montserrat;color:#A3A3A3;cursor:pointer;white-space:nowrap;";

const CATS = [
  { title: "Мотоцикл", desc: "Sport, naked, adventure төрлийн сонголтууд", href: "/motorcycles", img: "/assets/home/cat_moto.webp", setKey: "cat_moto" },
  { title: "Дагалдах хэрэгсэл", desc: "Монгол болон гадаад захиалгад нийлүүлэх riding gear", href: "/gear", img: "/assets/home/cat_gear.avif", setKey: "cat_gear" },
  { title: "Сэлбэг", desc: "Экспортод бэлтгэх боломжтой сэлбэг, consumables", href: "/parts", img: "/assets/home/cat_parts.jpg", setKey: "cat_parts" },
  { title: "Засвар", desc: "Оношилгоо, үйлчилгээ, суурилуулалт", href: "/service", img: "/assets/home/cat_service.jpg", setKey: "cat_service" },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [motos, gear, allEvents, settings] = await Promise.all([getMotos(), getGearAll(), getEvents(), getSettings()]);
  const heroImg = settings.hero || "https://ejdvftjtotahcummzlpn.supabase.co/storage/v1/object/public/site/home/hero.webp";
  // hero видеог түр хассан (Free egress хэмнэх) — сэргээхэд доорх <img>-ийг <video>-оор солино
  const homePoster = settings.home_poster; // урт poster зураг (admin-аас)
  const homePoster2 = settings.home_poster2; // 2 дахь poster (promo ба riding gear хооронд)
  const homePoster3 = settings.home_poster3; // 3 дахь poster (parts ба event хооронд)
  // Постер бүрийн англи хувилбар (сонгох; байхгүй бол монголоор fallback)

  const featuredAll = motos.filter((m) => m.featured);
  const featured = (featuredAll.length ? featuredAll : motos).slice(0, 4);
  const bestGear = gear.filter((g) => !isPart(g)).slice(0, 4);
  const bestParts = gear.filter(isPart).slice(0, 4);
  const events = allEvents.slice(0, 3);

  // Каталогт зарагддаг брэндүүд → зөвхөн бодит логотой нь marquee-д.
  const BRANDS = Array.from(new Set([...motos.map((m) => m.brand), ...gear.map((g) => g.brand)]));
  const logoBrands = BRANDS.filter((b) => BRAND_LOGOS[b]);
  const brands = [...logoBrands, ...logoBrands];
  const renderProductCards = (items: GearItem[], baseHref: "/gear" | "/parts") =>
    items.map((g) => {
      const sale = g.oldPrice > g.price ? Math.round((1 - g.price / g.oldPrice) * 100) : 0;
      return (
        <Link key={g.id} href={`${baseHref}/${g.id}`} className="mh-card" style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;display:block;cursor:pointer;")}>
          <div style={{ position: "relative", height: 190, background: "#fff" }}>
            {g.images && g.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={g.images[0]} alt={g.name} style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:contain;")} />
            ) : (
              <Slot label="Бүтээгдэхүүн зураг" light style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
            )}
            {sale > 0 && (
              <span style={sx("position:absolute;top:10px;left:10px;z-index:2;font:800 11px Montserrat;letter-spacing:.04em;color:#fff;background:#E10613;padding:5px 9px;border-radius:4px;")}>
                SALE -{sale}%
              </span>
            )}
          </div>
          <div style={{ padding: "14px 16px" }}>
            <div style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.12em;color:#8A8F98;")}>
              {g.brand.toUpperCase()} · <T>{g.category}</T>
            </div>
            <div style={sx("font:700 15px Montserrat;color:#fff;margin-top:4px;")}><Loc mn={g.name} en={g.nameEn} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 10 }}>
              {g.oldPrice > g.price && (
                <span style={sx("font:400 13px Roboto;color:#8A8F98;text-decoration:line-through;")}><Price amount={g.oldPrice} /></span>
              )}
              <span style={sx("font:800 16px Montserrat;color:#fff;")}><Price amount={g.price} /></span>
            </div>
          </div>
        </Link>
      );
    });

  return (
    <div style={{ animation: "mhfade .5s both" }}>
      {/* ===== HERO ===== */}
      <div style={sx("position:relative;overflow:hidden;border-bottom:1px solid #1c1c1f;")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImg}
          alt=""
          style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;")}
        />
        <div
          style={sx(
            "position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(5,5,5,.72),rgba(5,5,5,.32) 45%,rgba(5,5,5,0) 75%),radial-gradient(70% 120% at 88% 12%,rgba(225,6,19,.18),transparent 55%);",
          )}
        />
        <div style={sx(`position:relative;${WRAP}padding-top:clamp(64px,10vw,128px);padding-bottom:clamp(64px,10vw,128px);pointer-events:none;`)}>
          <h1 style={sx("font:900 clamp(46px,8vw,96px)/0.92 Montserrat;letter-spacing:-.01em;color:#fff;text-transform:uppercase;")}>
            Ride
            <br />
            Power
            <br />
            <span style={{ color: "#E10613" }}>Live</span>
          </h1>
          <p style={sx("font:400 clamp(15px,2vw,19px)/1.6 Roboto;color:#C8C8C8;max-width:520px;margin-top:24px;")}>
            <T>Монголд суурилсан MOTO HOUSE нь мотоцикл, хамгаалалтын хэрэгсэл, сэлбэг, засвар үйлчилгээ болон гадаад захиалгын нийлүүлэлтийг нэг дор холбодог платформ.</T>
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 36 }}>
            <Link href="/motorcycles" style={sx("background:#E10613;color:#fff;font:700 14px Montserrat;letter-spacing:.06em;padding:15px 28px;border-radius:10px;text-transform:uppercase;cursor:pointer;pointer-events:auto;")}>
              <T>Мотоцикл үзэх</T>
            </Link>
            <Link href="/gear" style={sx("border:1px solid #444;color:#fff;font:700 14px Montserrat;letter-spacing:.06em;padding:15px 28px;border-radius:10px;text-transform:uppercase;cursor:pointer;pointer-events:auto;")}>
              <T>Гадаад захиалгын бараа үзэх</T>
            </Link>
          </div>
        </div>
      </div>

      {/* ===== SHOP BY CATEGORY ===== */}
      <div style={sx(`${WRAP}padding-top:clamp(44px,6vw,72px);`)}>
        <h2 style={sx(SECTION_TITLE)}><T>Ангилалаар үзэх</T></h2>
        <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px;margin-top:24px;")}>
          {CATS.map(({ title, desc, href, img, setKey }) => (
            <Link
              key={title}
              href={href}
              className="mh-card mh-cat"
              style={sx("position:relative;overflow:hidden;cursor:pointer;background:#0d0d0f;border:1px solid #262626;border-radius:18px;padding:26px;min-height:280px;display:flex;flex-direction:column;justify-content:flex-end;")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings[setKey] || img}
                alt={title}
                style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;")}
              />
              <div
                style={sx("position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(to top,rgba(5,5,5,.92) 12%,rgba(5,5,5,.5) 48%,rgba(5,5,5,.2) 100%);")}
              />
              <div style={{ position: "relative", zIndex: 2 }}>
                <div style={sx("font:800 22px Montserrat;color:#fff;text-transform:uppercase;")}><T>{title}</T></div>
                <div style={sx("font:400 13px Roboto;color:#C8C8C8;margin-top:6px;")}><T>{desc}</T></div>
                <div style={sx("font:700 13px Montserrat;color:#E10613;margin-top:14px;letter-spacing:.04em;")}>
                  <T>ҮЗЭХ →</T>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== POSTER 1 (full-width) — эмэгтэй rider gear рүү холбоно ===== */}
      <Poster mn={homePoster} en={settings.home_poster_en} href="/gear?for=women" />

      {/* ===== BRAND MARQUEE (түр нуусан) ===== */}
      {false && (
      <div style={sx("border-top:1px solid #1c1c1f;margin-top:clamp(44px,6vw,72px);padding:clamp(34px,5vw,52px) 0;overflow:hidden;")}>
        <div style={sx("text-align:center;font:500 12px 'JetBrains Mono';letter-spacing:.26em;color:#8A8F98;")}>
          БИДНИЙ САНАЛ БОЛГОХ БРЭНДҮҮД
        </div>
        <div
          style={{
            position: "relative",
            marginTop: 28,
            WebkitMaskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)",
            maskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)",
          }}
        >
          <div style={{ display: "flex", width: "max-content", alignItems: "center", animation: "mhmarquee 26s linear infinite" }}>
            {brands.map((name, i) => (
              <span
                key={i}
                aria-hidden={i >= logoBrands.length}
                style={sx("display:inline-flex;align-items:center;justify-content:center;height:68px;width:150px;background:#fff;border-radius:14px;padding:14px 20px;margin:0 14px;flex-shrink:0;color:#0B0B0D;font:800 18px Montserrat;letter-spacing:.01em;")}
              >
                {BRAND_LOGOS[name] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={BRAND_LOGOS[name]}
                    alt={name}
                    style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", display: "block" }}
                  />
                ) : (
                  name
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* ===== FEATURED MOTORCYCLES ===== */}
      <div style={sx(`${WRAP}padding-top:clamp(44px,6vw,72px);`)}>
        <div style={sx("display:flex;align-items:flex-end;justify-content:space-between;gap:16px;")}>
          <div>
            <h2 style={sx(SECTION_TITLE)}><T>Онцлох мотоцикл</T></h2>
          </div>
          <Link href="/motorcycles" style={sx(SEE_ALL)}><T>Бүгдийг →</T></Link>
        </div>
        <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;margin-top:24px;")}>
          {featured.map((m) => (
            <MotoCard key={m.id} m={m} />
          ))}
        </div>
      </div>

      {/* ===== PROMO BANNERS ===== */}
      <div style={sx(`${WRAP}padding-top:clamp(44px,6vw,72px);`)}>
        <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;")}>
          <Link
            href="/service"
            className="mh-card"
            style={sx("position:relative;overflow:hidden;background:linear-gradient(120deg,#2a0608,#111113 70%);border:1px solid #E10613;border-radius:20px;padding:clamp(28px,4vw,40px);min-height:230px;display:flex;flex-direction:column;justify-content:flex-end;cursor:pointer;")}
          >
            <div style={sx("font:800 clamp(24px,3vw,32px) Montserrat;color:#fff;text-transform:uppercase;line-height:1.05;")}>
              <T>Засвар · оношилгоо{"\n"}· суурилуулалт</T>
            </div>
            <div style={sx("font:400 14px Roboto;color:#C8C8C8;margin-top:10px;max-width:360px;")}>
              <T>Тос, тормоз, дугуй, цахилгаан оношилгоо болон сэлбэг суурилуулалтыг нэг дор хийлгээрэй.</T>
            </div>
            <span style={sx("align-self:flex-start;margin-top:18px;background:#E10613;color:#fff;font:700 13px Montserrat;letter-spacing:.06em;padding:12px 22px;border-radius:9px;text-transform:uppercase;")}>
              <T>Цаг захиалах</T>
            </span>
          </Link>
          <Link
            href="/gear"
            className="mh-card"
            style={sx("position:relative;overflow:hidden;background:linear-gradient(120deg,#101216,#111113 70%);border:1px solid #262626;border-radius:20px;padding:clamp(28px,4vw,40px);min-height:230px;display:flex;flex-direction:column;justify-content:flex-end;cursor:pointer;")}
          >
            <div style={sx("font:800 clamp(24px,3vw,32px) Montserrat;color:#fff;text-transform:uppercase;line-height:1.05;")}>
              Gear<br />& parts
            </div>
            <div style={sx("font:400 14px Roboto;color:#C8C8C8;margin-top:10px;max-width:360px;")}>
              <T>Каск, хувцас, intercom, хамгаалалт болон сэлбэгийг Монголд худалдаалж, гадаад захиалгад бэлтгэнэ.</T>
            </div>
            <span style={sx("align-self:flex-start;margin-top:18px;border:1px solid #444;color:#fff;font:700 13px Montserrat;letter-spacing:.06em;padding:12px 22px;border-radius:9px;text-transform:uppercase;")}>
              <T>Дэлгүүр үзэх</T>
            </span>
          </Link>
        </div>
      </div>

      {/* ===== POSTER 2 (promo ба riding gear хооронд) — Nexx брэнд рүү ===== */}
      <Poster mn={homePoster2} en={settings.home_poster2_en} href="/gear?brand=Nexx" />

      {/* ===== GEAR BESTSELLERS ===== */}
      <div style={sx(`${WRAP}padding-top:clamp(44px,6vw,72px);`)}>
        <div style={sx("display:flex;align-items:flex-end;justify-content:space-between;gap:16px;")}>
          <div>
            <h2 style={sx(SECTION_TITLE)}><T>Эрэлттэй дагалдах хэрэгсэл</T></h2>
          </div>
          <Link href="/gear" style={sx(SEE_ALL)}><T>Бүгдийг →</T></Link>
        </div>
        <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;margin-top:24px;")}>
          {renderProductCards(bestGear, "/gear")}
        </div>
      </div>

      {/* ===== PARTS BESTSELLERS ===== */}
      <div style={sx(`${WRAP}padding-top:clamp(44px,6vw,72px);`)}>
        <div style={sx("display:flex;align-items:flex-end;justify-content:space-between;gap:16px;")}>
          <div>
            <h2 style={sx(SECTION_TITLE)}><T>Эрэлттэй сэлбэг</T></h2>
          </div>
          <Link href="/parts" style={sx(SEE_ALL)}><T>Бүгдийг →</T></Link>
        </div>
        <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;margin-top:24px;")}>
          {renderProductCards(bestParts, "/parts")}
        </div>
      </div>

      {/* ===== POSTER 3 (parts ба event хооронд) — Merch ангилал руу ===== */}
      <Poster mn={homePoster3} en={settings.home_poster3_en} href="/gear?cat=Merch" />

      {/* ===== EVENTS TEASER ===== */}
      <div style={sx(`${WRAP}padding-top:clamp(44px,6vw,72px);`)}>
        <div style={sx("display:flex;align-items:flex-end;justify-content:space-between;gap:16px;")}>
          <div>
            <h2 style={sx(SECTION_TITLE)}><T>Event & Giveaway</T></h2>
          </div>
          <Link href="/events" style={sx(SEE_ALL)}><T>Бүгдийг →</T></Link>
        </div>
        <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;margin-top:24px;")}>
          {events.map((e) => (
            <Link key={e.id} href={`/events/${e.id}`} className="mh-card" style={sx("background:#111113;border:1px solid #262626;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;cursor:pointer;")}>
              <div style={{ position: "relative", height: 240, background: "radial-gradient(120% 120% at 50% 0%, #17171a, #0b0b0d)" }}>
                {e.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.image} alt={e.title} style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:10px;")} />
                ) : (
                  <Slot label="Event poster" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
                )}
                <span style={{ position: "absolute", top: 12, left: 12, zIndex: 2, ...sx(badge(e.status)) }}>{e.status}</span>
              </div>
              <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
                <span style={sx("display:inline-block;align-self:flex-start;font:600 10px 'JetBrains Mono';letter-spacing:.14em;color:#E10613;background:rgba(225,6,19,.1);border:1px solid rgba(225,6,19,.3);padding:4px 9px;border-radius:6px;")}>{e.type}</span>
                <div style={sx("font:700 17px/1.3 Montserrat;color:#fff;margin-top:10px;")}><Loc mn={e.title} en={e.titleEn} /></div>
                <div style={sx("margin-top:auto;padding-top:12px;border-top:1px solid #1c1c1f;display:flex;flex-direction:column;gap:7px;")}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.1em;color:#8A8F98;")}><T>ОГНОО</T></span>
                    <span style={sx("font:600 12px Roboto;color:#C8C8C8;")}>{e.date}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.1em;color:#8A8F98;flex-shrink:0;")}><T>🏆 ШАГНАЛ</T></span>
                    <span style={sx("font:700 12px Montserrat;color:#E10613;text-align:right;")}><Loc mn={e.prize} en={e.prizeEn} /></span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== NEWSLETTER ===== */}
      <div style={sx(`${WRAP}padding-top:clamp(44px,6vw,72px);padding-bottom:clamp(44px,6vw,72px);`)}>
        <div style={sx("background:linear-gradient(120deg,#1a0405,#111113 70%);border:1px solid #262626;border-radius:20px;padding:clamp(28px,5vw,48px);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:24px;")}>
          <div>
            <div style={sx("font:800 clamp(22px,3vw,30px) Montserrat;color:#fff;text-transform:uppercase;")}>
              <T>MOTO HOUSE-ийн мэдээллийг түрүүлж аваарай</T>
            </div>
            <div style={sx("font:400 14px Roboto;color:#A3A3A3;margin-top:8px;max-width:480px;")}>
              <T>Шинэ бараа, экспортын боломж, Event, Giveaway болон засварын зөвлөгөөг и-мэйлээр хүргэнэ.</T>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <NewsletterInput />
            <button style={sx("background:#E10613;color:#fff;font:700 14px Montserrat;letter-spacing:.06em;padding:14px 26px;border:none;border-radius:10px;text-transform:uppercase;cursor:pointer;")}>
              <T>Мэдээ авах</T>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
