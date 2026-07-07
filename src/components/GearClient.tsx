"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { sx } from "@/lib/sx";
import { Slot } from "@/components/Slot";
import { GENDERS, type GearItem } from "@/lib/data";
import { Price } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";

function chip(active: boolean): string {
  const base =
    "cursor:pointer;font:600 13px Montserrat;letter-spacing:.03em;padding:9px 16px;border-radius:999px;user-select:none;";
  return active
    ? base + "background:#E10613;color:#fff;border:1px solid #E10613;"
    : base + "background:#111113;color:#A3A3A3;border:1px solid #262626;";
}

export function GearClient({
  gear,
  label = "GEAR · PARTS",
  title = "Хэрэгсэл ба сэлбэг",
  desc = "Каск, хувцас, хамгаалалт болон сэлбэгийг ангиллаар нь хурдан сонгоорой.",
  baseHref = "/gear",
  initialGender = "all",
  initialBrand = "all",
}: {
  gear: GearItem[];
  label?: string;
  title?: string;
  desc?: string;
  baseHref?: "/gear" | "/parts";
  initialGender?: string;
  initialBrand?: string;
}) {
  const { t, loc } = useI18n();
  const [cat, setCat] = useState("All");
  const [gender, setGender] = useState(initialGender);
  const [brand, setBrand] = useState(initialBrand);
  const cats = useMemo(() => ["All", ...Array.from(new Set(gear.map((g) => g.category)))], [gear]);
  // Брэндүүд — өгөгдлөөс + initialBrand (жиш постероос X-Pro) чипээр харагдана
  const brands = useMemo(() => {
    const b = Array.from(new Set(gear.map((g) => g.brand).filter(Boolean))).sort();
    if (initialBrand !== "all" && !b.includes(initialBrand)) b.unshift(initialBrand);
    return b;
  }, [gear, initialBrand]);
  // "Хэнд зориулсан" шүүлт нь эмэгтэй/эрэгтэй тэмдэглэсэн бараа байвал л харагдана
  const hasGendered = useMemo(() => gear.some((g) => g.gender === "women" || g.gender === "men"), [gear]);
  const byGender = gender === "all" ? gear : gear.filter((g) => g.gender === gender);
  const byBrand = brand === "all" ? byGender : byGender.filter((g) => g.brand === brand);
  const list = cat === "All" ? byBrand : byBrand.filter((g) => g.category === cat);

  return (
    <div style={sx("max-width:1280px;margin:0 auto;padding:clamp(32px,5vw,56px) clamp(20px,4vw,40px);")}>
      <div style={{ animation: "mhfade .5s both" }}>
        <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.24em;color:#E10613;")}>{t(label)}</div>
        <h1 style={sx("font:800 clamp(30px,5vw,46px) Montserrat;color:#fff;margin-top:6px;text-transform:uppercase;")}>
          {t(title)}
        </h1>
        <p style={sx("font:400 15px Roboto;color:#8A8F98;margin-top:8px;max-width:620px;")}>
          {t(desc)}
        </p>

        {/* Хэнд зориулсан шүүлт (эмэгтэй/эрэгтэй бараа байвал л) */}
        {hasGendered && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18 }}>
            <span onClick={() => setGender("all")} style={sx(chip(gender === "all"))}>{t("Бүгд")}</span>
            {GENDERS.filter((g) => g.v !== "unisex").map((g) => (
              <span key={g.v} onClick={() => setGender(g.v)} style={sx(chip(gender === g.v))}>{t(g.mn)}</span>
            ))}
          </div>
        )}

        {/* Брэнд шүүлт */}
        {brands.length > 1 && (
          <div style={{ marginTop: 16 }}>
            <div style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.14em;color:#6b7280;margin-bottom:8px;")}>{t("Брэнд")}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span onClick={() => setBrand("all")} style={sx(chip(brand === "all"))}>{t("Бүх брэнд")}</span>
              {brands.map((b) => (
                <span key={b} onClick={() => setBrand(b)} style={sx(chip(brand === b))}>{b}</span>
              ))}
            </div>
          </div>
        )}

        {/* Ангилал шүүлт */}
        <div style={{ marginTop: 16 }}>
          <div style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.14em;color:#6b7280;margin-bottom:8px;")}>{t("Ангилал")}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {cats.map((c) => (
              <span key={c} onClick={() => setCat(c)} style={sx(chip(cat === c))}>{t(c)}</span>
            ))}
          </div>
        </div>

        <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;margin-top:22px;")}>
          {list.map((g) => {
            const sale = g.oldPrice > g.price ? Math.round((1 - g.price / g.oldPrice) * 100) : 0;
            return (
              <Link
                key={g.id}
                href={`${baseHref}/${g.id}`}
                className="mh-card"
                style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;display:block;cursor:pointer;")}
              >
                <div style={{ position: "relative", height: 200, background: "#fff" }}>
                  {g.images && g.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.images[0]} alt={g.name} style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:contain;")} />
                  ) : (
                    <Slot label={t("Бүтээгдэхүүн зураг")} light style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
                  )}
                  {sale > 0 && (
                    <span style={sx("position:absolute;top:10px;left:10px;z-index:2;font:800 11px Montserrat;letter-spacing:.04em;color:#fff;background:#E10613;padding:5px 9px;border-radius:4px;")}>
                      SALE -{sale}%
                    </span>
                  )}
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <span style={sx("font:700 13px Montserrat;letter-spacing:.08em;color:#E10613;")}>{"★★★★★".slice(0, g.rating)}</span>
                  <div style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.12em;color:#8A8F98;margin-top:6px;")}>
                    {g.brand.toUpperCase()} · {g.category}
                  </div>
                  <div style={sx("font:700 15px Montserrat;color:#fff;margin-top:3px;")}>{loc(g.name, g.nameEn)}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 11 }}>
                    {g.oldPrice > g.price && (
                      <span style={sx("font:400 13px Roboto;color:#8A8F98;text-decoration:line-through;")}><Price amount={g.oldPrice} /></span>
                    )}
                    <span style={sx("font:800 16px Montserrat;color:#fff;")}><Price amount={g.price} /></span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* дэлгүүрт байхгүй бол захиалах */}
        <div style={sx("margin-top:30px;background:linear-gradient(120deg,#1a0405,#111113 70%);border:1px solid #262626;border-radius:16px;padding:clamp(20px,3vw,28px);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;")}>
          <div>
            <div style={sx("font:800 clamp(17px,2.4vw,22px) Montserrat;color:#fff;")}>{t("Хайж байгаа зүйл олдсонгүй юу?")}</div>
            <div style={sx("font:400 13px Roboto;color:#A3A3A3;margin-top:5px;max-width:520px;")}>{t("Дэлгүүрт байхгүй сэлбэг, каск, хувцас болон бусад зүйлийг захиалж, үнийн санал аваарай.")}</div>
          </div>
          <Link href="/request" style={sx("background:#E10613;color:#fff;font:700 13px Montserrat;letter-spacing:.05em;padding:14px 24px;border-radius:10px;text-transform:uppercase;cursor:pointer;white-space:nowrap;")}>
            {t("Захиалгын хүсэлт")}
          </Link>
        </div>
      </div>
    </div>
  );
}
