"use client";

import Link from "next/link";
import { sx } from "@/lib/sx";
import { Slot } from "@/components/Slot";
import { GEAR, fmt } from "@/lib/data";

export default function WishlistPage() {
  const saved = GEAR.slice(0, 4); // demo: хадгалсан бараа

  return (
    <div style={sx("background:#111113;border:1px solid #262626;border-radius:16px;padding:clamp(18px,3vw,26px);")}>
      <div style={sx("font:700 18px Montserrat;color:#fff;margin-bottom:18px;")}>Хүслийн жагсаалт</div>
      <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:18px;")}>
        {saved.map((g) => (
          <Link
            key={g.id}
            href={`/gear/${g.id}`}
            className="mh-card"
            style={sx("background:#0B0B0D;border:1px solid #262626;border-radius:14px;overflow:hidden;display:block;cursor:pointer;")}
          >
            <div style={{ position: "relative", height: 160, background: "#fff" }}>
              <Slot label="Зураг" light style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
              <span style={sx("position:absolute;top:10px;right:10px;z-index:2;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;color:#E10613;font-size:15px;")}>
                ♥
              </span>
            </div>
            <div style={{ padding: "13px 15px" }}>
              <div style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.12em;color:#8A8F98;")}>{g.brand.toUpperCase()}</div>
              <div style={sx("font:700 14px Montserrat;color:#fff;margin-top:3px;")}>{g.name}</div>
              <div style={sx("font:800 14px Montserrat;color:#fff;margin-top:8px;")}>{fmt(g.price)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
