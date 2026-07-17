"use client";

import { useMemo, useState } from "react";
import { sx } from "@/lib/sx";
import { useI18n } from "@/lib/i18n";
import type { RideRoute } from "@/lib/queries";

function mapsUrl(route: RideRoute) {
  const destination = encodeURIComponent(route.destination || route.title);
  const origin = encodeURIComponent(route.startPlace || "Ulaanbaatar, Mongolia");
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
}

export function TravelMapClient({ routes }: { routes: RideRoute[] }) {
  const { t, loc } = useI18n();
  const [selectedId, setSelectedId] = useState<number | null>(routes[0]?.id ?? null);
  const selected = useMemo(
    () => routes.find((route) => route.id === selectedId) ?? routes[0],
    [routes, selectedId],
  );

  if (!routes.length || !selected) return null;

  const bg = selected.image
    ? `linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.35)), url(${selected.image}) center/cover no-repeat`
    : selected.gradient;

  return (
    <div style={sx("max-width:1280px;margin:0 auto;padding:clamp(32px,5vw,56px) clamp(20px,4vw,40px);")}>
      <div style={{ animation: "mhfade .5s both" }}>
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
              {routes.map((route) => {
                const active = route.id === selected.id;
                return (
                  <button
                    key={route.id}
                    onClick={() => setSelectedId(route.id)}
                    aria-label={loc(route.title, route.titleEn)}
                    title={loc(route.title, route.titleEn)}
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
              {routes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => setSelectedId(route.id)}
                  style={sx(
                    "border-radius:999px;padding:9px 13px;cursor:pointer;font:700 12px Montserrat;border:1px solid;" +
                      (route.id === selected.id ? "background:#E10613;border-color:#E10613;color:#fff;" : "background:#111113;border-color:#262626;color:#A3A3A3;"),
                  )}
                >
                  {loc(route.title, route.titleEn)}
                </button>
              ))}
            </div>
          </section>

          <aside style={sx("background:#111113;border:1px solid #262626;border-radius:18px;overflow:hidden;display:flex;flex-direction:column;")}>
            <div
              role="img"
              aria-label={loc(selected.imageAlt || selected.title, selected.imageAltEn)}
              style={{ minHeight: 210, background: bg, position: "relative" }}
            >
              <div style={sx("position:absolute;left:18px;right:18px;bottom:18px;display:flex;flex-wrap:wrap;gap:7px;")}>
                {loc(selected.tags, selected.tagsEn).map((tag, i) => (
                  <span key={`${tag}-${i}`} style={sx("font:800 10px Montserrat;color:#fff;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:6px 9px;")}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ padding: "20px 22px 22px" }}>
              {selected.region && <div style={sx("font:700 11px 'JetBrains Mono';letter-spacing:.14em;color:#E10613;text-transform:uppercase;")}>{loc(selected.region, selected.regionEn)}</div>}
              <h2 style={sx("font:800 28px Montserrat;color:#fff;margin-top:6px;text-transform:uppercase;")}>{loc(selected.title, selected.titleEn)}</h2>
              {selected.summary && <p style={sx("font:400 14px/1.65 Roboto;color:#A3A3A3;margin-top:8px;")}>{loc(selected.summary, selected.summaryEn)}</p>}

              <div style={sx("display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:18px;")}>
                <Metric label={t("Нийт зай")} value={`${selected.distanceKm} km`} />
                <Metric label={t("Хугацаа")} value={loc(selected.duration || "", selected.durationEn)} />
                <Metric label={t("Түвшин")} value={loc(selected.difficulty || "", selected.difficultyEn)} />
                <Metric label={t("Замын төрөл")} value={loc(selected.road || "", selected.roadEn)} />
              </div>

              {loc(selected.stops, selected.stopsEn).length > 0 && (
                <div style={sx("margin-top:18px;border-top:1px solid #1c1c1f;padding-top:16px;")}>
                  <div style={sx("font:700 12px Montserrat;color:#fff;text-transform:uppercase;")}>{t("Route")}</div>
                  <div style={sx("display:flex;flex-wrap:wrap;gap:7px;margin-top:10px;")}>
                    {loc(selected.stops, selected.stopsEn).map((stop, index) => (
                      <span key={`${stop}-${index}`} style={sx("font:600 12px Roboto;color:#C8C8C8;background:#0B0B0D;border:1px solid #262626;border-radius:9px;padding:8px 10px;")}>
                        {index + 1}. {stop}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {loc(selected.checklist, selected.checklistEn).length > 0 && (
                <div style={sx("margin-top:18px;border-top:1px solid #1c1c1f;padding-top:16px;")}>
                  <div style={sx("font:700 12px Montserrat;color:#fff;text-transform:uppercase;")}>{t("Бэлтгэл")}</div>
                  <div style={sx("display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px;")}>
                    {loc(selected.checklist, selected.checklistEn).map((item, i) => (
                      <span key={`${item}-${i}`} style={sx("font:500 12px Roboto;color:#A3A3A3;")}>• {item}</span>
                    ))}
                  </div>
                </div>
              )}

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
