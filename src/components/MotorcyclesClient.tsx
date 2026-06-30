"use client";

import { useMemo, useState } from "react";
import { sx } from "@/lib/sx";
import { MotoCard } from "@/components/MotoCard";
import { statusLabel, type Moto, type MotoStatus } from "@/lib/data";

type SortKey = "featured" | "priceAsc" | "priceDesc";
const BRANDS = ["All", "Kawasaki", "Yamaha", "Honda", "Ducati", "BMW"];
const STATUSES: ("All" | MotoStatus)[] = ["All", "Available", "Reserved", "Incoming"];

function chip(active: boolean): string {
  const base =
    "cursor:pointer;font:600 13px Montserrat;letter-spacing:.03em;padding:9px 16px;border-radius:999px;user-select:none;";
  return active
    ? base + "background:#E10613;color:#fff;border:1px solid #E10613;"
    : base + "background:#111113;color:#A3A3A3;border:1px solid #262626;";
}

export function MotorcyclesClient({ motos }: { motos: Moto[] }) {
  const [brand, setBrand] = useState("All");
  const [status, setStatus] = useState<"All" | MotoStatus>("All");
  const [sort, setSort] = useState<SortKey>("featured");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    let l = motos.slice();
    if (brand !== "All") l = l.filter((m) => m.brand === brand);
    if (status !== "All") l = l.filter((m) => m.status === status);
    const query = q.trim().toLowerCase();
    if (query) l = l.filter((m) => `${m.brand} ${m.model}`.toLowerCase().includes(query));
    if (sort === "priceAsc") l.sort((a, b) => a.price - b.price);
    else if (sort === "priceDesc") l.sort((a, b) => b.price - a.price);
    return l;
  }, [motos, brand, status, sort, q]);

  return (
    <div style={sx("max-width:1280px;margin:0 auto;padding:clamp(32px,5vw,56px) clamp(20px,4vw,40px);")}>
      <div style={{ animation: "mhfade .5s both" }}>
        <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.24em;color:#E10613;")}>MARKETPLACE</div>
        <h1 style={sx("font:800 clamp(30px,5vw,46px) Montserrat;color:#fff;margin-top:6px;text-transform:uppercase;")}>
          Motorcycles
        </h1>

        <div style={sx("display:flex;flex-wrap:wrap;gap:14px;align-items:center;margin-top:26px;justify-content:space-between;")}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {BRANDS.map((b) => (
              <span key={b} onClick={() => setBrand(b)} style={sx(chip(brand === b))}>{b}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Хайх: model..."
              className="mh-input"
              style={sx("background:#111113;border:1px solid #262626;border-radius:9px;padding:11px 15px;color:#fff;font:400 14px Roboto;width:180px;outline:none;")}
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              style={sx("background:#111113;border:1px solid #262626;border-radius:9px;padding:11px 14px;color:#fff;font:500 13px Roboto;outline:none;cursor:pointer;")}
            >
              <option value="featured">Featured</option>
              <option value="priceAsc">Үнэ ↑</option>
              <option value="priceDesc">Үнэ ↓</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {STATUSES.map((s) => (
            <span key={s} onClick={() => setStatus(s)} style={sx(chip(status === s))}>
              {s === "All" ? "Бүгд" : statusLabel(s)}
            </span>
          ))}
        </div>

        <div style={sx("font:400 13px 'JetBrains Mono';color:#8A8F98;margin-top:18px;")}>
          {list.length} мотоцикл олдлоо
        </div>

        <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;margin-top:14px;")}>
          {list.map((m) => (
            <MotoCard key={m.id} m={m} showCc />
          ))}
        </div>
      </div>
    </div>
  );
}
