"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { fmt, type GearItem } from "@/lib/data";
import { getGearAll } from "@/lib/queries";
import { createGear, updateGear, deleteGear } from "@/lib/admin";

const INPUT = "background:#050505;border:1px solid #262626;border-radius:9px;padding:11px 13px;color:#fff;font:400 14px Roboto;outline:none;width:100%;";
const LABEL = "font:600 11px Montserrat;letter-spacing:.04em;color:#A3A3A3;margin-bottom:6px;display:block;";
const BTN = "background:#E10613;color:#fff;font:700 13px Montserrat;padding:11px 18px;border:none;border-radius:9px;cursor:pointer;";
const CATS = ["Helmet", "Jacket", "Gloves", "Exhaust", "Battery", "Tire", "Intercom"];

type Form = {
  name: string; brand: string; category: string; meta: string; price: string; oldPrice: string;
  rating: string; reviews: string; sku: string; bestSeller: boolean; desc: string;
  features: string; sizes: string; colors: string;
};
const empty: Form = {
  name: "", brand: "", category: "Helmet", meta: "", price: "", oldPrice: "",
  rating: "5", reviews: "0", sku: "", bestSeller: false, desc: "", features: "", sizes: "", colors: "",
};
function toForm(g: GearItem): Form {
  return {
    name: g.name, brand: g.brand, category: g.category, meta: g.meta ?? "",
    price: String(g.price), oldPrice: String(g.oldPrice), rating: String(g.rating),
    reviews: String(g.reviews), sku: g.sku, bestSeller: !!g.bestSeller, desc: g.desc,
    features: (g.features ?? []).join("\n"), sizes: (g.sizes ?? []).join(", "), colors: (g.colors ?? []).join(", "),
  };
}
function fromForm(f: Form): Partial<GearItem> {
  const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
  const csv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
  const price = Number(f.price) || 0;
  return {
    name: f.name.trim(), brand: f.brand.trim() || "—", category: f.category, meta: f.meta || "—",
    price, oldPrice: Number(f.oldPrice) || price, rating: Number(f.rating) || 5,
    reviews: Number(f.reviews) || 0, sku: f.sku || "—", bestSeller: f.bestSeller,
    desc: f.desc, features: lines(f.features), sizes: csv(f.sizes), colors: csv(f.colors),
  };
}

export default function AdminGear() {
  const [list, setList] = useState<GearItem[]>([]);
  const [editing, setEditing] = useState<number | null | "new">(null);
  const [f, setF] = useState<Form>(empty);
  const [busy, setBusy] = useState(false);

  async function refresh() { setList(await getGearAll()); }
  useEffect(() => { refresh(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) return;
    setBusy(true);
    try {
      if (editing === "new") await createGear(fromForm(f));
      else if (typeof editing === "number") await updateGear(editing, fromForm(f));
      await refresh();
      setEditing(null);
    } finally { setBusy(false); }
  }
  async function del(id: number) {
    if (!confirm("Энэ барааг устгах уу?")) return;
    await deleteGear(id);
    await refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={sx("font:700 18px Montserrat;color:#fff;")}>Бараа / сэлбэг ({list.length})</div>
        {editing === null && <button onClick={() => { setF(empty); setEditing("new"); }} style={sx(BTN)}>+ Шинэ бараа</button>}
      </div>

      {editing !== null && (
        <form onSubmit={save} style={sx("background:#0e0e10;border:1px solid #262626;border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:14px;")}>
          <div style={sx("font:700 15px Montserrat;color:#fff;")}>{editing === "new" ? "Шинэ бараа" : "Засах"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
            <div><label style={sx(LABEL)}>Нэр *</label><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Брэнд</label><input value={f.brand} onChange={(e) => setF({ ...f, brand: e.target.value })} style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Ангилал</label>
              <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} style={sx(INPUT + "cursor:pointer;")}>
                {CATS.map((c) => <option key={c}>{c}</option>)}
              </select></div>
            <div><label style={sx(LABEL)}>Үнэ (₮)</label><input value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} inputMode="numeric" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Хуучин үнэ (₮)</label><input value={f.oldPrice} onChange={(e) => setF({ ...f, oldPrice: e.target.value })} inputMode="numeric" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Rating (1-5)</label><input value={f.rating} onChange={(e) => setF({ ...f, rating: e.target.value })} inputMode="numeric" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Сэтгэгдэл тоо</label><input value={f.reviews} onChange={(e) => setF({ ...f, reviews: e.target.value })} inputMode="numeric" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>SKU</label><input value={f.sku} onChange={(e) => setF({ ...f, sku: e.target.value })} style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Meta</label><input value={f.meta} onChange={(e) => setF({ ...f, meta: e.target.value })} placeholder="ECE 22.06 · Carbon" style={sx(INPUT)} /></div>
          </div>
          <div><label style={sx(LABEL)}>Тайлбар</label><textarea value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} rows={2} style={sx(INPUT + "resize:vertical;")} /></div>
          <div><label style={sx(LABEL)}>Онцлог (мөр тус бүр)</label><textarea value={f.features} onChange={(e) => setF({ ...f, features: e.target.value })} rows={3} style={sx(INPUT + "resize:vertical;")} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={sx(LABEL)}>Хэмжээ (таслалаар)</label><input value={f.sizes} onChange={(e) => setF({ ...f, sizes: e.target.value })} placeholder="S, M, L, XL" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Өнгө (таслалаар)</label><input value={f.colors} onChange={(e) => setF({ ...f, colors: e.target.value })} placeholder="Хар, Цагаан" style={sx(INPUT)} /></div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={f.bestSeller} onChange={(e) => setF({ ...f, bestSeller: e.target.checked })} />
            <span style={sx("font:500 13px Roboto;color:#C8C8C8;")}>Best Seller</span>
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={busy} style={sx(BTN + (busy ? "opacity:.6;" : ""))}>{busy ? "Хадгалж байна…" : "Хадгалах"}</button>
            <button type="button" onClick={() => setEditing(null)} style={sx("background:none;border:1px solid #333;color:#A3A3A3;font:600 13px Montserrat;padding:11px 18px;border-radius:9px;cursor:pointer;")}>Болих</button>
          </div>
        </form>
      )}

      <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
        {list.map((g) => (
          <div key={g.id} style={sx("display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 18px;border-bottom:1px solid #1c1c1f;")}>
            <div style={{ minWidth: 160 }}>
              <div style={sx("font:700 15px Montserrat;color:#fff;")}>{g.name} {g.bestSeller && <span style={sx("font:700 9px Montserrat;color:#E10613;")}>★</span>}</div>
              <div style={sx("font:400 12px 'JetBrains Mono';color:#8A8F98;margin-top:3px;")}>{g.brand.toUpperCase()} · {g.category}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={sx("font:700 14px Montserrat;color:#fff;")}>{fmt(g.price)}</span>
              <button onClick={() => { setF(toForm(g)); setEditing(g.id); }} style={sx("background:none;border:1px solid #333;color:#C8C8C8;font:600 12px Montserrat;padding:7px 12px;border-radius:8px;cursor:pointer;")}>Засах</button>
              <button onClick={() => del(g.id)} style={sx("background:none;border:1px solid #333;color:#ef4444;font:600 12px Montserrat;padding:7px 12px;border-radius:8px;cursor:pointer;")}>Устгах</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Ачаалж байна…</div>}
      </div>
    </div>
  );
}
