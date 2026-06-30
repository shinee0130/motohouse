"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { sx } from "@/lib/sx";
import { Slot } from "@/components/Slot";
import { fmt, type GearItem } from "@/lib/data";

function chip(active: boolean): string {
  const base =
    "cursor:pointer;font:600 13px Montserrat;letter-spacing:.03em;padding:9px 16px;border-radius:999px;user-select:none;";
  return active
    ? base + "background:#E10613;color:#fff;border:1px solid #E10613;"
    : base + "background:#111113;color:#A3A3A3;border:1px solid #262626;";
}

export function GearClient({ gear }: { gear: GearItem[] }) {
  const [cat, setCat] = useState("All");
  const cats = useMemo(() => ["All", ...Array.from(new Set(gear.map((g) => g.category)))], [gear]);
  const list = cat === "All" ? gear : gear.filter((g) => g.category === cat);

  return (
    <div style={sx("max-width:1280px;margin:0 auto;padding:clamp(32px,5vw,56px) clamp(20px,4vw,40px);")}>
      <div style={{ animation: "mhfade .5s both" }}>
        <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.24em;color:#E10613;")}>GEAR · PARTS</div>
        <h1 style={sx("font:800 clamp(30px,5vw,46px) Montserrat;color:#fff;margin-top:6px;text-transform:uppercase;")}>
          Premium Gear &amp; Parts
        </h1>
        <p style={sx("font:400 15px Roboto;color:#8A8F98;margin-top:8px;max-width:620px;")}>
          Online payment v1-д байхгүй — request илгээж, admin холбогдоно. Parts дээр compatibility тод харагдана.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 22 }}>
          {cats.map((c) => (
            <span key={c} onClick={() => setCat(c)} style={sx(chip(cat === c))}>{c}</span>
          ))}
        </div>

        <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;margin-top:22px;")}>
          {list.map((g) => {
            const sale = Math.round((1 - g.price / g.oldPrice) * 100);
            return (
              <Link
                key={g.id}
                href={`/gear/${g.id}`}
                className="mh-card"
                style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;display:block;cursor:pointer;")}
              >
                <div style={{ position: "relative", height: 200, background: "#fff" }}>
                  <Slot label="Бүтээгдэхүүн зураг" light style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
                  <span style={sx("position:absolute;top:10px;left:10px;z-index:2;font:800 11px Montserrat;letter-spacing:.04em;color:#fff;background:#E10613;padding:5px 9px;border-radius:4px;")}>
                    SALE -{sale}%
                  </span>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <span style={sx("font:700 13px Montserrat;letter-spacing:.08em;color:#E10613;")}>{"★★★★★".slice(0, g.rating)}</span>
                  <div style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.12em;color:#8A8F98;margin-top:6px;")}>
                    {g.brand.toUpperCase()} · {g.category}
                  </div>
                  <div style={sx("font:700 15px Montserrat;color:#fff;margin-top:3px;")}>{g.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 11 }}>
                    <span style={sx("font:400 13px Roboto;color:#8A8F98;text-decoration:line-through;")}>{fmt(g.oldPrice)}</span>
                    <span style={sx("font:800 16px Montserrat;color:#fff;")}>{fmt(g.price)}</span>
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
