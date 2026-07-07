"use client";

import Link from "next/link";
import { sx } from "@/lib/sx";
import { Slot } from "@/components/Slot";
import { Price } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";
import type { Tour } from "@/lib/queries";

function tourBadge(status: string): string {
  const b = "font:700 11px Montserrat;letter-spacing:.06em;color:#fff;padding:6px 12px;border-radius:6px;";
  if (status === "Дүүрсэн") return b + "background:rgba(0,0,0,.6);border:1px solid #444;color:#C8C8C8;";
  if (status === "Дууссан") return b + "background:rgba(0,0,0,.6);border:1px solid #444;color:#8A8F98;";
  return b + "background:#E10613;"; // Нээлттэй
}

export function TourList({ tours }: { tours: Tour[] }) {
  const { t } = useI18n();
  return (
    <div style={sx("max-width:1280px;margin:0 auto;padding:0 clamp(20px,4vw,40px) clamp(32px,5vw,56px);")}>
      <div style={{ animation: "mhfade .5s both" }}>
        <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.24em;color:#E10613;")}>{t("BOOK A TOUR")}</div>
        <h2 style={sx("font:800 clamp(24px,4vw,36px) Montserrat;color:#fff;margin-top:6px;text-transform:uppercase;")}>
          {t("Захиалах аяллууд")}
        </h2>

        {tours.length === 0 && (
          <div style={sx("background:#111113;border:1px solid #262626;border-radius:16px;padding:44px 24px;margin-top:22px;text-align:center;font:500 15px Roboto;color:#8A8F98;")}>
            {t("Одоогоор захиалах аялал алга. Тун удахгүй зарлана!")}
          </div>
        )}

        <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:22px;margin-top:22px;")}>
          {tours.map((tour) => {
            const left = Math.max(0, tour.maxCapacity - tour.booked);
            const soldOut = tour.status !== "Нээлттэй" || left <= 0;
            return (
              <Link key={tour.id} href={`/travel/${tour.id}`} className="mh-card"
                style={sx("background:#111113;border:1px solid #262626;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;cursor:pointer;")}>
                <div style={{ position: "relative", height: 200 }}>
                  {tour.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tour.image} alt={tour.title} style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;")} />
                  ) : (
                    <Slot label={t("Аяллын зураг")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
                  )}
                  <span style={{ position: "absolute", top: 12, left: 12, ...sx(tourBadge(soldOut && tour.status === "Нээлттэй" ? "Дүүрсэн" : tour.status)) }}>
                    {soldOut && tour.status === "Нээлттэй" ? t("Дүүрсэн") : t(tour.status)}
                  </span>
                </div>
                <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", flex: 1 }}>
                  {tour.region && <div style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.12em;color:#E10613;")}>{tour.region}</div>}
                  <div style={sx("font:700 18px/1.3 Montserrat;color:#fff;margin-top:6px;")}>{tour.title}</div>
                  <div style={sx("margin-top:auto;padding-top:14px;border-top:1px solid #1c1c1f;display:flex;flex-direction:column;gap:8px;")}>
                    <Row label={t("Огноо")} value={tour.startDate || "—"} />
                    <Row label={t("Хугацаа")} value={`${tour.durationDays} ${t("хоног")}`} />
                    <Row label={t("Сул суудал")} value={soldOut ? t("Дүүрсэн") : `${left} / ${tour.maxCapacity}`} />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 4 }}>
                      <span style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.1em;color:#8A8F98;")}>{t("1 хүн")}</span>
                      <span style={sx("font:800 16px Montserrat;color:#E10613;")}><Price amount={tour.price} /></span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <span style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.1em;color:#8A8F98;")}>{label}</span>
      <span style={sx("font:600 13px Roboto;color:#C8C8C8;")}>{value}</span>
    </div>
  );
}
