"use client";

import { useMemo, useState } from "react";
import { sx } from "@/lib/sx";
import { useI18n } from "@/lib/i18n";

type RideRoute = {
  id: string;
  title: string;
  region: string;
  summary: string;
  distanceKm: number;
  duration: string;
  difficulty: string;
  road: string;
  season: string;
  start: string;
  destination: string;
  coords: string;
  mapX: number;
  mapY: number;
  image: string;
  imageAlt: string;
  tags: string[];
  stops: string[];
  checklist: string[];
};

const ROUTES: RideRoute[] = [
  {
    id: "tsagaan-suvarga",
    title: "Цагаан суварга",
    region: "Дундговь / Өмнөговь чиглэл",
    summary: "Говийн өнгөт цав, урт шулуун зам, шороон хэсэгтэй weekend аяллын route.",
    distanceKm: 426,
    duration: "8-9 цаг нэг талдаа",
    difficulty: "Дунд",
    road: "Асфальт + шороон зам",
    season: "5-10 сар",
    start: "Улаанбаатар",
    destination: "Tsagaan Suvarga, Dundgovi, Mongolia",
    coords: "45.3186,106.8333",
    mapX: 59,
    mapY: 63,
    image: "linear-gradient(135deg, rgba(225,6,19,.38), rgba(15,15,18,.84)), radial-gradient(circle at 72% 28%, rgba(255,190,110,.48), transparent 30%), linear-gradient(160deg, #6f3929, #161113 62%, #070708)",
    imageAlt: "Цагаан суварга route preview",
    tags: ["Gobi", "426 km", "2 өдөр", "Photo stop"],
    stops: ["Улаанбаатар", "Мандалговь", "Өлзийт", "Цагаан суварга"],
    checklist: ["Салхины хамгаалалт", "Ус ба нэмэлт түлш", "Tubeless repair kit", "GPS offline map"],
  },
  {
    id: "terelj",
    title: "Горхи-Тэрэлж",
    region: "Төв / Улаанбаатар ойролцоо",
    summary: "Шинэ rider-д тохиромжтой богино route. Асфальт зам, уулын view, өдрийн аялал.",
    distanceKm: 75,
    duration: "1.5-2 цаг нэг талдаа",
    difficulty: "Хөнгөн",
    road: "Ихэнх нь асфальт",
    season: "4-10 сар",
    start: "Улаанбаатар",
    destination: "Gorkhi Terelj National Park, Mongolia",
    coords: "47.9860,107.4590",
    mapX: 65,
    mapY: 42,
    image: "linear-gradient(135deg, rgba(225,6,19,.26), rgba(9,15,12,.76)), radial-gradient(circle at 72% 34%, rgba(120,180,120,.48), transparent 28%), linear-gradient(160deg, #2f533e, #101613 64%, #070708)",
    imageAlt: "Горхи-Тэрэлж route preview",
    tags: ["Day ride", "75 km", "Beginner", "Cafe stop"],
    stops: ["Улаанбаатар", "Налайх", "Мэлхий хад", "Тэрэлж"],
    checklist: ["Rain layer", "Basic tool kit", "Camera", "Warm gloves"],
  },
  {
    id: "khongoryn-els",
    title: "Хонгорын элс",
    region: "Өмнөговь",
    summary: "Урт зай, элсэн манхан, халуун цаг агаарын бэлтгэл шаардсан adventure route.",
    distanceKm: 650,
    duration: "2-3 өдөр нэг талдаа",
    difficulty: "Хүнд",
    road: "Асфальт + шороо + элс",
    season: "5-9 сар",
    start: "Улаанбаатар",
    destination: "Khongoryn Els, Mongolia",
    coords: "43.7688,102.2363",
    mapX: 42,
    mapY: 75,
    image: "linear-gradient(135deg, rgba(225,6,19,.2), rgba(17,13,8,.8)), radial-gradient(circle at 68% 40%, rgba(236,181,92,.62), transparent 30%), linear-gradient(160deg, #8b5b2d, #18110b 70%, #070708)",
    imageAlt: "Хонгорын элс route preview",
    tags: ["Adventure", "650 km", "Sand", "Multi-day"],
    stops: ["Улаанбаатар", "Даланзадгад", "Баянзаг", "Хонгорын элс"],
    checklist: ["Adventure tire", "Hydration pack", "Spare tube", "Satellite / offline comms"],
  },
];

function mapsUrl(route: RideRoute) {
  const destination = encodeURIComponent(route.destination);
  return `https://www.google.com/maps/dir/?api=1&origin=Ulaanbaatar%2C%20Mongolia&destination=${destination}&travelmode=driving`;
}

export function TravelMapClient() {
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState(ROUTES[0].id);
  const selected = useMemo(() => ROUTES.find((route) => route.id === selectedId) ?? ROUTES[0], [selectedId]);

  return (
    <div style={sx("max-width:1280px;margin:0 auto;padding:clamp(32px,5vw,56px) clamp(20px,4vw,40px);")}>
      <div style={{ animation: "mhfade .5s both" }}>
        <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.24em;color:#E10613;")}>{t("GROUP RIDE")}</div>
        <h1 style={sx("font:800 clamp(30px,5vw,46px) Montserrat;color:#fff;margin-top:6px;text-transform:uppercase;")}>
          {t("Монголын аяллын маршрутууд")}
        </h1>
        <p style={sx("font:400 15px/1.65 Roboto;color:#8A8F98;margin-top:10px;max-width:720px;")}>
          {t("Газрын зураг дээрх pin-ийг сонгоод route-ийн зураг, нийт км, хугацаа, замын нөхцөл болон Google Maps чиглэлийг хараарай.")}
        </p>

        <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(380px,100%),1fr));gap:22px;margin-top:28px;align-items:stretch;")}>
          <section style={sx("background:#0B0B0D;border:1px solid #262626;border-radius:18px;padding:clamp(14px,2vw,22px);overflow:hidden;")}>
            <div style={{ position: "relative", aspectRatio: "4 / 3", minHeight: 320 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/maps/mongolia-map-dark.png"
                alt={t("Монголын аяллын газрын зураг")}
                style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:contain;")}
              />
              {ROUTES.map((route) => {
                const active = route.id === selected.id;
                return (
                  <button
                    key={route.id}
                    onClick={() => setSelectedId(route.id)}
                    aria-label={t(route.title)}
                    title={t(route.title)}
                    style={{
                      position: "absolute",
                      left: `${route.mapX}%`,
                      top: `${route.mapY}%`,
                      transform: "translate(-50%, -100%)",
                      width: active ? 34 : 28,
                      height: active ? 34 : 28,
                      borderRadius: 999,
                      border: active ? "2px solid #fff" : "2px solid #E10613",
                      background: active ? "#E10613" : "#0B0B0D",
                      color: "#fff",
                      cursor: "pointer",
                      boxShadow: active ? "0 0 0 8px rgba(225,6,19,.18),0 10px 26px rgba(0,0,0,.45)" : "0 8px 18px rgba(0,0,0,.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all .18s ease",
                    }}
                  >
                    <span style={sx("width:8px;height:8px;border-radius:999px;background:currentColor;display:block;")} />
                  </button>
                );
              })}
            </div>
            <div style={sx("display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;")}>
              {ROUTES.map((route) => (
                <button
                  key={route.id}
                  onClick={() => setSelectedId(route.id)}
                  style={sx(
                    "border-radius:999px;padding:9px 13px;cursor:pointer;font:700 12px Montserrat;border:1px solid;" +
                      (route.id === selected.id ? "background:#E10613;border-color:#E10613;color:#fff;" : "background:#111113;border-color:#262626;color:#A3A3A3;"),
                  )}
                >
                  {t(route.title)}
                </button>
              ))}
            </div>
          </section>

          <aside style={sx("background:#111113;border:1px solid #262626;border-radius:18px;overflow:hidden;display:flex;flex-direction:column;")}>
            <div
              role="img"
              aria-label={t(selected.imageAlt)}
              style={{
                minHeight: 210,
                background: selected.image,
                position: "relative",
              }}
            >
              <div style={sx("position:absolute;left:18px;right:18px;bottom:18px;display:flex;flex-wrap:wrap;gap:7px;")}>
                {selected.tags.map((tag) => (
                  <span key={tag} style={sx("font:800 10px Montserrat;color:#fff;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:6px 9px;")}>
                  {t(tag)}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ padding: "20px 22px 22px" }}>
              <div style={sx("font:700 11px 'JetBrains Mono';letter-spacing:.14em;color:#E10613;text-transform:uppercase;")}>{t(selected.region)}</div>
              <h2 style={sx("font:800 28px Montserrat;color:#fff;margin-top:6px;text-transform:uppercase;")}>{t(selected.title)}</h2>
              <p style={sx("font:400 14px/1.65 Roboto;color:#A3A3A3;margin-top:8px;")}>{t(selected.summary)}</p>

              <div style={sx("display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:18px;")}>
                <Metric label={t("Нийт зай")} value={`${selected.distanceKm} km`} />
                <Metric label={t("Хугацаа")} value={t(selected.duration)} />
                <Metric label={t("Түвшин")} value={t(selected.difficulty)} />
                <Metric label={t("Замын төрөл")} value={t(selected.road)} />
              </div>

              <div style={sx("margin-top:18px;border-top:1px solid #1c1c1f;padding-top:16px;")}>
                <div style={sx("font:700 12px Montserrat;color:#fff;text-transform:uppercase;")}>{t("Route")}</div>
                <div style={sx("display:flex;flex-wrap:wrap;gap:7px;margin-top:10px;")}>
                  {selected.stops.map((stop, index) => (
                    <span key={stop} style={sx("font:600 12px Roboto;color:#C8C8C8;background:#0B0B0D;border:1px solid #262626;border-radius:9px;padding:8px 10px;")}>
                      {index + 1}. {t(stop)}
                    </span>
                  ))}
                </div>
              </div>

              <div style={sx("margin-top:18px;border-top:1px solid #1c1c1f;padding-top:16px;")}>
                <div style={sx("font:700 12px Montserrat;color:#fff;text-transform:uppercase;")}>{t("Бэлтгэл")}</div>
                <div style={sx("display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px;")}>
                  {selected.checklist.map((item) => (
                    <span key={item} style={sx("font:500 12px Roboto;color:#A3A3A3;")}>• {t(item)}</span>
                  ))}
                </div>
              </div>

              <a
                href={mapsUrl(selected)}
                target="_blank"
                rel="noopener noreferrer"
                style={sx("display:block;text-align:center;margin-top:20px;background:#E10613;color:#fff;font:800 13px Montserrat;letter-spacing:.06em;padding:14px 20px;border-radius:11px;text-transform:uppercase;cursor:pointer;")}
              >
                {t("Чиглэл авах")}
              </a>
              <div style={sx("font:400 11px Roboto;color:#6b7280;text-align:center;margin-top:9px;")}>
                {t("Google Maps дээр Улаанбаатараас очих чиглэл нээгдэнэ.")}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={sx("background:#0B0B0D;border:1px solid #262626;border-radius:12px;padding:12px;")}>
      <div style={sx("font:700 10px 'JetBrains Mono';letter-spacing:.12em;color:#8A8F98;text-transform:uppercase;")}>{label}</div>
      <div style={sx("font:800 14px Montserrat;color:#fff;margin-top:5px;")}>{value}</div>
    </div>
  );
}
