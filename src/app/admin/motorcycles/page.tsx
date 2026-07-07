"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { fmt, statusLabel, MOTO_STATUS_LABEL, type Moto, type MotoStatus } from "@/lib/data";
import { getMotos } from "@/lib/queries";
import { createMoto, updateMoto, deleteMoto, uploadMoto } from "@/lib/admin";

const INPUT = "background:#050505;border:1px solid #262626;border-radius:9px;padding:11px 13px;color:#fff;font:400 14px Roboto;outline:none;width:100%;";
const LABEL = "font:600 11px Montserrat;letter-spacing:.04em;color:#A3A3A3;margin-bottom:6px;display:block;";
const BTN = "background:#E10613;color:#fff;font:700 13px Montserrat;padding:11px 18px;border:none;border-radius:9px;cursor:pointer;";
const UP_BTN = "display:inline-block;cursor:pointer;background:#1a1a1d;border:1px solid #333;color:#fff;font:600 12px Montserrat;padding:9px 16px;border-radius:8px;";
const STATUSES: MotoStatus[] = ["Available", "Reserved", "Incoming", "Sold"];
const BRANDS = ["Kawasaki", "Yamaha", "Honda", "Ducati", "BMW", "MV Agusta", "KTM", "Suzuki", "Triumph", "Aprilia", "Harley-Davidson", "Husqvarna", "Benelli", "CFMoto", "Royal Enfield"];
const COUNTRIES = ["Япон", "Герман", "Итали", "Австри", "Англи", "АНУ", "Франц", "Энэтхэг", "БНХАУ", "Тайланд", "Солонгос"];
const CUSTOMS = ["Гаальтай", "Гаальгүй"];
const CUSTOM = "__custom__"; // select дотор "гараар бичих" сонголтын утга

// Тоог мянгатын таслалтай харуулах (1000000 → "1,000,000"); зөвхөн цифр үлдээнэ.
const sep = (s: string) => { const d = (s || "").replace(/\D/g, ""); return d ? Number(d).toLocaleString("en-US") : ""; };
const unsep = (s: string) => Number((s || "").replace(/\D/g, "")) || 0;

type Form = {
  brand: string; model: string; year: string; cc: string; odo: string; price: string; salePrice: string;
  status: MotoStatus; country: string; customs: string; hp: string; nm: string;
  top: string; weight: string; cyl: string; gearbox: string; featured: boolean; desc: string;
  extras: string; images: string[]; video: string;
  descEn: string; extrasEn: string;
};
const empty: Form = {
  brand: "Kawasaki", model: "", year: "", cc: "", odo: "", price: "", salePrice: "", status: "Available",
  country: "Япон", customs: "Гаальтай", hp: "", nm: "", top: "", weight: "", cyl: "", gearbox: "6 шат · Шингэн",
  featured: false, desc: "", extras: "", images: [], video: "",
  descEn: "", extrasEn: "",
};
function toForm(m: Moto): Form {
  return {
    brand: m.brand, model: m.model, year: m.year, cc: String(m.cc), odo: String(m.odo),
    price: sep(String(m.price)), salePrice: m.salePrice ? sep(String(m.salePrice)) : "",
    status: m.status, country: m.country, customs: m.customs,
    hp: String(m.hp), nm: String(m.nm), top: String(m.top), weight: String(m.weight),
    cyl: m.cyl, gearbox: m.gearbox ?? "", featured: !!m.featured, desc: m.desc,
    extras: (m.extras ?? []).join("\n"), images: m.images ?? [], video: m.video ?? "",
    descEn: m.descEn ?? "", extrasEn: (m.extrasEn ?? []).join("\n"),
  };
}
function fromForm(f: Form): Partial<Moto> {
  const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
  const sale = unsep(f.salePrice);
  return {
    brand: f.brand.trim() || "—", model: f.model.trim(), year: f.year || "—", cc: Number(f.cc) || 0,
    odo: Number(f.odo) || 0, price: unsep(f.price), salePrice: sale > 0 ? sale : undefined, status: f.status,
    country: f.country.trim() || "—", customs: f.customs || "—", hp: Number(f.hp) || 0,
    nm: Number(f.nm) || 0, top: Number(f.top) || 0, weight: Number(f.weight) || 0,
    cyl: f.cyl || "—", gearbox: f.gearbox || "—", featured: f.featured, desc: f.desc, extras: lines(f.extras),
    images: f.images, video: f.video || undefined,
    descEn: f.descEn.trim(), extrasEn: lines(f.extrasEn),
  };
}

export default function AdminMotorcycles() {
  const [list, setList] = useState<Moto[]>([]);
  const [editing, setEditing] = useState<number | null | "new">(null);
  const [f, setF] = useState<Form>(empty);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<"" | "img" | "video">("");
  const [customBrand, setCustomBrand] = useState(false);
  const [customCountry, setCustomCountry] = useState(false);
  const [flang, setFlang] = useState<"mn" | "en">("mn");

  const EN_KEY = { desc: "descEn", extras: "extrasEn" } as const;
  function bind(field: "desc" | "extras") {
    const key = (flang === "en" ? EN_KEY[field] : field) as keyof Form;
    return {
      value: f[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [key]: e.target.value }),
    };
  }

  async function refresh() { setList(await getMotos()); }
  useEffect(() => { refresh(); }, []);

  function openNew() { setF(empty); setCustomBrand(false); setCustomCountry(false); setEditing("new"); }
  function openEdit(m: Moto) {
    setF(toForm(m));
    setCustomBrand(!BRANDS.includes(m.brand));
    setCustomCountry(!COUNTRIES.includes(m.country));
    setEditing(m.id);
  }

  async function onImages(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading("img");
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) urls.push(await uploadMoto(file, "img"));
      setF((cur) => ({ ...cur, images: [...cur.images, ...urls] }));
    } finally { setUploading(""); }
  }
  async function onVideo(file: File | null) {
    if (!file) return;
    setUploading("video");
    try {
      const url = await uploadMoto(file, "video");
      setF((cur) => ({ ...cur, video: url }));
    } finally { setUploading(""); }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.model.trim()) return;
    setBusy(true);
    try {
      if (editing === "new") await createMoto(fromForm(f));
      else if (typeof editing === "number") await updateMoto(editing, fromForm(f));
      await refresh();
      setEditing(null);
    } finally { setBusy(false); }
  }
  async function del(id: number) {
    if (!confirm("Энэ мотоциклыг устгах уу?")) return;
    await deleteMoto(id);
    await refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={sx("font:700 18px Montserrat;color:#fff;")}>Мотоцикл ({list.length})</div>
        {editing === null && <button onClick={openNew} style={sx(BTN)}>+ Шинэ мотоцикл</button>}
      </div>

      {editing !== null && (
        <form onSubmit={save} style={sx("background:#0e0e10;border:1px solid #262626;border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:16px;")}>
          <div style={sx("font:700 15px Montserrat;color:#fff;")}>{editing === "new" ? "Шинэ мотоцикл" : "Засах"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
            <div><label style={sx(LABEL)}>Брэнд</label>
              <select
                value={customBrand ? CUSTOM : f.brand}
                onChange={(e) => { if (e.target.value === CUSTOM) { setCustomBrand(true); setF({ ...f, brand: "" }); } else { setCustomBrand(false); setF({ ...f, brand: e.target.value }); } }}
                style={sx(INPUT + "cursor:pointer;")}
              >
                {BRANDS.map((b) => <option key={b}>{b}</option>)}
                <option value={CUSTOM}>＋ Шинэ брэнд…</option>
              </select>
              {customBrand && <input value={f.brand} onChange={(e) => setF({ ...f, brand: e.target.value })} placeholder="Брэндийн нэр" style={sx(INPUT + "margin-top:8px;")} autoFocus />}
            </div>
            <div><label style={sx(LABEL)}>Модель *</label><input value={f.model} onChange={(e) => setF({ ...f, model: e.target.value })} style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Он</label><input value={f.year} onChange={(e) => setF({ ...f, year: e.target.value })} placeholder="2022 / 2024" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>CC</label><input value={f.cc} onChange={(e) => setF({ ...f, cc: e.target.value })} inputMode="numeric" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>ODO (км)</label><input value={f.odo} onChange={(e) => setF({ ...f, odo: e.target.value })} inputMode="numeric" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Үнэ (₮)</label><input value={f.price} onChange={(e) => setF({ ...f, price: sep(e.target.value) })} inputMode="numeric" placeholder="1,000,000" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Хямдарсан үнэ (₮)</label><input value={f.salePrice} onChange={(e) => setF({ ...f, salePrice: sep(e.target.value) })} inputMode="numeric" placeholder="хоосон = хямдралгүй" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Төлөв</label>
              <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as MotoStatus })} style={sx(INPUT + "cursor:pointer;")}>
                {STATUSES.map((s) => <option key={s} value={s}>{MOTO_STATUS_LABEL[s]}</option>)}
              </select></div>
            <div><label style={sx(LABEL)}>Улс</label>
              <select
                value={customCountry ? CUSTOM : f.country}
                onChange={(e) => { if (e.target.value === CUSTOM) { setCustomCountry(true); setF({ ...f, country: "" }); } else { setCustomCountry(false); setF({ ...f, country: e.target.value }); } }}
                style={sx(INPUT + "cursor:pointer;")}
              >
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                <option value={CUSTOM}>＋ Бусад улс…</option>
              </select>
              {customCountry && <input value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })} placeholder="Улсын нэр" style={sx(INPUT + "margin-top:8px;")} autoFocus />}
            </div>
            <div><label style={sx(LABEL)}>Гааль</label>
              <select value={f.customs} onChange={(e) => setF({ ...f, customs: e.target.value })} style={sx(INPUT + "cursor:pointer;")}>
                {CUSTOMS.map((c) => <option key={c}>{c}</option>)}
              </select></div>
            <div><label style={sx(LABEL)}>HP</label><input value={f.hp} onChange={(e) => setF({ ...f, hp: e.target.value })} inputMode="numeric" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Nm</label><input value={f.nm} onChange={(e) => setF({ ...f, nm: e.target.value })} inputMode="numeric" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Дээд хурд</label><input value={f.top} onChange={(e) => setF({ ...f, top: e.target.value })} inputMode="numeric" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Жин (кг)</label><input value={f.weight} onChange={(e) => setF({ ...f, weight: e.target.value })} inputMode="numeric" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Хөдөлгүүр</label><input value={f.cyl} onChange={(e) => setF({ ...f, cyl: e.target.value })} placeholder="Inline-4" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Хурдны хайрцаг</label><input value={f.gearbox} onChange={(e) => setF({ ...f, gearbox: e.target.value })} placeholder="6 шат · Шингэн" style={sx(INPUT)} /></div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {(["mn", "en"] as const).map((l) => (
              <button type="button" key={l} onClick={() => setFlang(l)}
                style={sx(`cursor:pointer;font:800 11px Montserrat;padding:6px 12px;border-radius:8px;${flang === l ? "background:#E10613;border:1px solid #E10613;color:#fff;" : "background:#050505;border:1px solid #333;color:#8A8F98;"}`)}>
                {l.toUpperCase()}
              </button>
            ))}
            <span style={sx("font:400 11px Roboto;color:#6b7280;")}>{flang === "en" ? "Тайлбар/тоногийн англи (хоосон бол монголоор)" : "Тайлбар/тоног — монгол"}</span>
          </div>
          <div><label style={sx(LABEL)}>Тайлбар {flang === "en" && <span style={sx("color:#E10613;")}>(EN)</span>}</label><textarea {...bind("desc")} rows={2} style={sx(INPUT + "resize:vertical;")} /></div>
          <div><label style={sx(LABEL)}>Нэмэлт тоног (мөр тус бүр) {flang === "en" && <span style={sx("color:#E10613;")}>(EN)</span>}</label><textarea {...bind("extras")} rows={3} style={sx(INPUT + "resize:vertical;")} /></div>

          {/* ===== Зураг upload ===== */}
          <div>
            <label style={sx(LABEL)}>Зураг ({f.images.length})</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
              {f.images.map((src, i) => (
                <div key={src + i} style={{ position: "relative", width: 84, height: 84 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" style={sx("width:84px;height:84px;object-fit:cover;border-radius:8px;border:1px solid #333;")} />
                  <button type="button" onClick={() => setF((c) => ({ ...c, images: c.images.filter((_, x) => x !== i) }))}
                    style={sx("position:absolute;top:-7px;right:-7px;width:22px;height:22px;border-radius:50%;background:#E10613;color:#fff;border:none;cursor:pointer;font:700 12px Montserrat;line-height:1;")}>×</button>
                </div>
              ))}
            </div>
            <label style={sx(UP_BTN + (uploading === "img" ? "opacity:.6;" : ""))}>
              {uploading === "img" ? "Хуулж байна…" : "＋ Зураг сонгох (олон)"}
              <input type="file" accept="image/*" multiple disabled={uploading !== ""} onChange={(e) => onImages(e.target.files)} style={{ display: "none" }} />
            </label>
            <div style={sx("font:400 11px Roboto;color:#6b7280;margin-top:8px;")}>Санал болгох: 1600×1200 (4:3, хэвтээ) · JPG · &lt; 400KB</div>
          </div>

          {/* ===== Видео upload ===== */}
          <div>
            <label style={sx(LABEL)}>Видео</label>
            {f.video ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <video src={f.video} controls style={{ width: 220, borderRadius: 8, border: "1px solid #333" }} />
                <button type="button" onClick={() => setF((c) => ({ ...c, video: "" }))} style={sx("background:none;border:1px solid #333;color:#ef4444;font:600 12px Montserrat;padding:7px 12px;border-radius:8px;cursor:pointer;")}>Видео устгах</button>
              </div>
            ) : (
              <label style={sx(UP_BTN + (uploading === "video" ? "opacity:.6;" : ""))}>
                {uploading === "video" ? "Хуулж байна…" : "＋ Видео сонгох"}
                <input type="file" accept="video/*" disabled={uploading !== ""} onChange={(e) => onVideo(e.target.files?.[0] ?? null)} style={{ display: "none" }} />
              </label>
            )}
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} />
            <span style={sx("font:500 13px Roboto;color:#C8C8C8;")}>Нүүр хуудсанд онцлох (featured)</span>
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={busy || uploading !== ""} style={sx(BTN + (busy || uploading ? "opacity:.6;" : ""))}>{busy ? "Хадгалж байна…" : "Хадгалах"}</button>
            <button type="button" onClick={() => setEditing(null)} style={sx("background:none;border:1px solid #333;color:#A3A3A3;font:600 13px Montserrat;padding:11px 18px;border-radius:9px;cursor:pointer;")}>Болих</button>
          </div>
        </form>
      )}

      <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
        {list.map((m) => (
          <div key={m.id} style={sx("display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 18px;border-bottom:1px solid #1c1c1f;")}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 160 }}>
              {m.images && m.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.images[0]} alt="" style={sx("width:46px;height:46px;object-fit:cover;border-radius:8px;border:1px solid #333;flex-shrink:0;")} />
              )}
              <div>
                <div style={sx("font:700 15px Montserrat;color:#fff;")}>{m.brand} {m.model} {m.featured && <span style={sx("font:700 9px Montserrat;color:#E10613;")}>★</span>}</div>
                <div style={sx("font:400 12px 'JetBrains Mono';color:#8A8F98;margin-top:3px;")}>{m.year} · {m.cc}cc · ODO {m.odo.toLocaleString("en-US")}km</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              {m.salePrice ? (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={sx("font:500 12px Montserrat;color:#6b7280;text-decoration:line-through;")}>{fmt(m.price)}</span>
                  <span style={sx("font:700 14px Montserrat;color:#E10613;")}>{fmt(m.salePrice)}</span>
                </span>
              ) : (
                <span style={sx("font:700 14px Montserrat;color:#E10613;")}>{fmt(m.price)}</span>
              )}
              <span style={sx(`font:700 11px Montserrat;padding:5px 10px;border-radius:6px;${m.status === "Available" ? "color:#fff;background:#E10613;" : "color:#A3A3A3;background:#1a1a1d;border:1px solid #333;"}`)}>{statusLabel(m.status)}</span>
              <button onClick={() => openEdit(m)} style={sx("background:none;border:1px solid #333;color:#C8C8C8;font:600 12px Montserrat;padding:7px 12px;border-radius:8px;cursor:pointer;")}>Засах</button>
              <button onClick={() => del(m.id)} style={sx("background:none;border:1px solid #333;color:#ef4444;font:600 12px Montserrat;padding:7px 12px;border-radius:8px;cursor:pointer;")}>Устгах</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Ачаалж байна…</div>}
      </div>
    </div>
  );
}
