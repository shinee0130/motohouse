"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { Select } from "@/components/Select";
import { fmt, isPart, PARTS_CATS, GENDERS, type GearItem } from "@/lib/data";
import { getGearAll } from "@/lib/queries";
import { createGear, updateGear, deleteGear, uploadGear } from "@/lib/admin";
import { useConfirm, useAlert } from "@/lib/confirm";

const INPUT = "background:#050505;border:1px solid #262626;border-radius:9px;padding:11px 13px;color:#fff;font:400 14px Roboto;outline:none;width:100%;";
const LABEL = "font:600 11px Montserrat;letter-spacing:.04em;color:#A3A3A3;margin-bottom:6px;display:block;";
const BTN = "background:#E10613;color:#fff;font:700 13px Montserrat;padding:11px 18px;border:none;border-radius:9px;cursor:pointer;";
// Дагалдах хэрэгслийн ангиллууд — монголоор (EN горимд dict-ээр орчуулна).
// "Merch" нь брэнд нэр тул хэвээр (нүүрний merch poster /gear?cat=Merch руу холбоотой).
const GEAR_CATS = [
  "Каск", "Хүрэм", "Өмд", "Бээлий", "Гутал",
  "Хамгаалалт", "Нүдний шил", "Дуу холбогч (intercom)",
  "Бороо/салхины хувцас", "Дотуур хувцас", "Оймс", "Цүнх",
  "Merch", "Бусад хэрэгсэл",
];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const COLORS: { name: string; hex: string }[] = [
  { name: "Хар", hex: "#111114" }, { name: "Цагаан", hex: "#f5f5f5" }, { name: "Саарал", hex: "#6b7280" },
  { name: "Мөнгөлөг", hex: "#c0c0c0" }, { name: "Улаан", hex: "#E10613" }, { name: "Цэнхэр", hex: "#2563eb" },
  { name: "Хөх", hex: "#1e3a8a" }, { name: "Ногоон", hex: "#16a34a" }, { name: "Шар", hex: "#eab308" },
  { name: "Улбар шар", hex: "#f97316" }, { name: "Ягаан", hex: "#ec4899" }, { name: "Нил ягаан", hex: "#7c3aed" },
  { name: "Хүрэн", hex: "#92400e" }, { name: "Алтан", hex: "#d4af37" },
];
const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

type Form = {
  name: string; brand: string; category: string; meta: string; price: string; oldPrice: string;
  rating: string; reviews: string; sku: string; bestSeller: boolean; desc: string;
  features: string; sizes: string[]; colors: string[]; images: string[];
  gender: string;
  nameEn: string; descEn: string; metaEn: string; featuresEn: string;
};
function toForm(g: GearItem): Form {
  return {
    name: g.name, brand: g.brand, category: g.category, meta: g.meta ?? "",
    price: String(g.price), oldPrice: String(g.oldPrice), rating: String(g.rating),
    reviews: String(g.reviews), sku: g.sku, bestSeller: !!g.bestSeller, desc: g.desc,
    features: (g.features ?? []).join("\n"), sizes: g.sizes ?? [], colors: g.colors ?? [],
    images: g.images ?? [], gender: g.gender ?? "unisex",
    nameEn: g.nameEn ?? "", descEn: g.descEn ?? "", metaEn: g.metaEn ?? "", featuresEn: (g.featuresEn ?? []).join("\n"),
  };
}
function fromForm(f: Form): Partial<GearItem> {
  const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
  const price = Number(f.price) || 0;
  return {
    name: f.name.trim(), brand: f.brand.trim() || "—", category: f.category, meta: f.meta || "—",
    price, oldPrice: Number(f.oldPrice) || price, rating: Number(f.rating) || 5,
    reviews: Number(f.reviews) || 0, sku: f.sku || "—", bestSeller: f.bestSeller,
    desc: f.desc, features: lines(f.features), sizes: f.sizes, colors: f.colors,
    images: f.images, gender: f.gender,
    nameEn: f.nameEn.trim(), descEn: f.descEn.trim(), metaEn: f.metaEn.trim(), featuresEn: lines(f.featuresEn),
  };
}

export function GearAdmin({ mode }: { mode: "gear" | "parts" }) {
  const cats = mode === "parts" ? PARTS_CATS : GEAR_CATS;
  const heading = mode === "parts" ? "Сэлбэг" : "Дагалдах хэрэгсэл";
  const newLabel = mode === "parts" ? "+ Шинэ сэлбэг" : "+ Шинэ хэрэгсэл";
  const empty: Form = {
    name: "", brand: "", category: cats[0], meta: "", price: "", oldPrice: "",
    rating: "5", reviews: "0", sku: "", bestSeller: false, desc: "", features: "", sizes: [], colors: [], images: [],
    gender: "unisex", nameEn: "", descEn: "", metaEn: "", featuresEn: "",
  };

  const [flang, setFlang] = useState<"mn" | "en">("mn");
  const [list, setList] = useState<GearItem[]>([]);
  const [editing, setEditing] = useState<number | null | "new">(null);
  const [f, setF] = useState<Form>(empty);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [colorInput, setColorInput] = useState("");
  const alert = useAlert();
  function addColor() {
    const v = colorInput.trim();
    if (!v) return;
    setF((c) => ({ ...c, colors: c.colors.includes(v) ? c.colors : [...c.colors, v] }));
    setColorInput("");
  }

  const EN_KEY = { name: "nameEn", desc: "descEn", meta: "metaEn", features: "featuresEn" } as const;
  function bind(field: "name" | "desc" | "meta" | "features") {
    const key = (flang === "en" ? EN_KEY[field] : field) as keyof Form;
    return {
      value: f[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [key]: e.target.value }),
    };
  }

  async function refresh() {
    const all = await getGearAll();
    setList(all.filter((g) => (mode === "parts" ? isPart(g) : !isPart(g))));
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [mode]);

  async function onImages(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) urls.push(await uploadGear(file));
      setF((cur) => ({ ...cur, images: [...cur.images, ...urls] }));
    } catch (err) {
      alert({ title: "Зураг оруулахад алдаа гарлаа", message: err instanceof Error ? err.message : String(err), danger: true });
    } finally { setUploading(false); }
  }

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
  const confirm = useConfirm();
  async function del(id: number) {
    if (!(await confirm({ title: "Энэ барааг устгах уу?", confirmLabel: "Устгах", danger: true }))) return;
    await deleteGear(id);
    await refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={sx("font:700 18px Montserrat;color:#fff;")}>{heading} ({list.length})</div>
        {editing === null && <button onClick={() => { setF(empty); setEditing("new"); }} style={sx(BTN)}>{newLabel}</button>}
      </div>

      {editing !== null && (
        <form onSubmit={save} style={sx("background:#0e0e10;border:1px solid #262626;border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:14px;")}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={sx("font:700 15px Montserrat;color:#fff;")}>{editing === "new" ? newLabel.replace("+ ", "") : "Засах"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {(["mn", "en"] as const).map((l) => (
                <button type="button" key={l} onClick={() => setFlang(l)}
                  style={sx(`cursor:pointer;font:800 11px Montserrat;padding:6px 12px;border-radius:8px;${flang === l ? "background:#E10613;border:1px solid #E10613;color:#fff;" : "background:#050505;border:1px solid #333;color:#8A8F98;"}`)}>
                  {l.toUpperCase()}
                </button>
              ))}
              <span style={sx("font:400 11px Roboto;color:#6b7280;")}>{flang === "en" ? "Англи (хоосон бол монголоор)" : "Монгол"}</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
            <div><label style={sx(LABEL)}>Нэр * {flang === "en" && <span style={sx("color:#E10613;")}>(EN)</span>}</label><input {...bind("name")} style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Брэнд</label><input value={f.brand} onChange={(e) => setF({ ...f, brand: e.target.value })} style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Ангилал</label>
              <Select value={f.category} onChange={(v) => setF({ ...f, category: v })} full bg="#050505" options={[...cats.map((c) => ({ value: c, label: c })), ...(!cats.includes(f.category) ? [{ value: f.category, label: f.category }] : [])]} /></div>
            <div><label style={sx(LABEL)}>Хэнд зориулсан</label>
              <Select value={f.gender} onChange={(v) => setF({ ...f, gender: v })} full bg="#050505" options={GENDERS.map((g) => ({ value: g.v, label: g.mn }))} /></div>
            <div><label style={sx(LABEL)}>Үнэ (₮)</label><input value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} inputMode="numeric" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Хуучин үнэ (₮)</label><input value={f.oldPrice} onChange={(e) => setF({ ...f, oldPrice: e.target.value })} inputMode="numeric" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Rating (1-5)</label><input value={f.rating} onChange={(e) => setF({ ...f, rating: e.target.value })} inputMode="numeric" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Сэтгэгдэл тоо</label><input value={f.reviews} onChange={(e) => setF({ ...f, reviews: e.target.value })} inputMode="numeric" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>SKU</label><input value={f.sku} onChange={(e) => setF({ ...f, sku: e.target.value })} style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Meta {flang === "en" && <span style={sx("color:#E10613;")}>(EN)</span>}</label><input {...bind("meta")} placeholder="ECE 22.06 · Carbon" style={sx(INPUT)} /></div>
          </div>
          <div><label style={sx(LABEL)}>Тайлбар {flang === "en" && <span style={sx("color:#E10613;")}>(EN)</span>}</label><textarea {...bind("desc")} rows={2} style={sx(INPUT + "resize:vertical;")} /></div>
          <div><label style={sx(LABEL)}>Онцлог (мөр тус бүр) {flang === "en" && <span style={sx("color:#E10613;")}>(EN)</span>}</label><textarea {...bind("features")} rows={3} style={sx(INPUT + "resize:vertical;")} /></div>
          <div>
            <label style={sx(LABEL)}>Хэмжээ <span style={sx("color:#6b7280;")}>(сонгох)</span></label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SIZES.map((s) => {
                const on = f.sizes.includes(s);
                return (
                  <button key={s} type="button" onClick={() => setF((c) => ({ ...c, sizes: toggle(c.sizes, s) }))}
                    style={sx(`min-width:46px;cursor:pointer;font:700 13px Montserrat;padding:9px 14px;border-radius:9px;${on ? "background:#E10613;border:1px solid #E10613;color:#fff;" : "background:#050505;border:1px solid #333;color:#C8C8C8;"}`)}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label style={sx(LABEL)}>Өнгө <span style={sx("color:#6b7280;")}>(сонгох)</span></label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {COLORS.map((c) => {
                const on = f.colors.includes(c.name);
                return (
                  <button key={c.name} type="button" title={c.name} onClick={() => setF((cur) => ({ ...cur, colors: toggle(cur.colors, c.name) }))}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <span style={{
                      width: 30, height: 30, borderRadius: "50%", background: c.hex,
                      border: on ? "2px solid #E10613" : "1px solid #444",
                      boxShadow: on ? "0 0 0 2px #050505, 0 0 0 4px #E10613" : "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {on && <span style={{ color: c.hex === "#f5f5f5" || c.hex === "#c0c0c0" || c.hex === "#eab308" || c.hex === "#d4af37" ? "#111" : "#fff", fontSize: 14, fontWeight: 800, lineHeight: 1 }}>✓</span>}
                    </span>
                    <span style={sx(`font:600 10px Roboto;${on ? "color:#fff;" : "color:#8A8F98;"}`)}>{c.name}</span>
                  </button>
                );
              })}
            </div>
            {f.colors.filter((c) => !COLORS.some((p) => p.name === c)).length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {f.colors.filter((c) => !COLORS.some((p) => p.name === c)).map((c) => (
                  <span key={c} style={sx("display:inline-flex;align-items:center;gap:6px;background:#050505;border:1px solid #333;border-radius:999px;padding:6px 8px 6px 12px;font:600 12px Roboto;color:#C8C8C8;")}>
                    {c}
                    <button type="button" onClick={() => setF((cur) => ({ ...cur, colors: cur.colors.filter((x) => x !== c) }))}
                      style={sx("width:18px;height:18px;border-radius:50%;background:#E10613;color:#fff;border:none;cursor:pointer;font:700 11px Montserrat;line-height:1;")}>×</button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 12, maxWidth: 320 }}>
              <input value={colorInput} onChange={(e) => setColorInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addColor(); } }}
                placeholder="Бусад өнгө (жнь: Хар/Улаан)" style={sx(INPUT + "padding:8px 11px;font:400 13px Roboto;")} />
              <button type="button" onClick={addColor} style={sx("background:#1a1a1d;border:1px solid #333;color:#fff;font:600 12px Montserrat;padding:8px 14px;border-radius:8px;cursor:pointer;white-space:nowrap;")}>Нэмэх</button>
            </div>
          </div>
          <div>
            <label style={sx(LABEL)}>Зураг ({f.images.length})</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
              {f.images.map((src, i) => (
                <div key={src + i} style={{ position: "relative", width: 84, height: 84 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" style={sx("width:84px;height:84px;object-fit:cover;border-radius:8px;border:1px solid #333;background:#fff;")} />
                  <button type="button" onClick={() => setF((c) => ({ ...c, images: c.images.filter((_, x) => x !== i) }))}
                    style={sx("position:absolute;top:-7px;right:-7px;width:22px;height:22px;border-radius:50%;background:#E10613;color:#fff;border:none;cursor:pointer;font:700 12px Montserrat;line-height:1;")}>×</button>
                </div>
              ))}
            </div>
            <label style={sx("display:inline-block;cursor:pointer;background:#1a1a1d;border:1px solid #333;color:#fff;font:600 12px Montserrat;padding:9px 16px;border-radius:8px;" + (uploading ? "opacity:.6;" : ""))}>
              {uploading ? "Хуулж байна…" : "＋ Зураг сонгох (олон)"}
              <input type="file" accept="image/*" multiple disabled={uploading} onChange={(e) => onImages(e.target.files)} style={{ display: "none" }} />
            </label>
            <div style={sx("font:400 11px Roboto;color:#6b7280;margin-top:8px;")}>Санал болгох: 1200×1200 (квадрат) · цагаан/ил тод дэвсгэр · PNG/JPG · &lt; 300KB</div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={f.bestSeller} onChange={(e) => setF({ ...f, bestSeller: e.target.checked })} />
            <span style={sx("font:500 13px Roboto;color:#C8C8C8;")}>Best Seller</span>
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={busy || uploading} style={sx(BTN + (busy || uploading ? "opacity:.6;" : ""))}>{busy ? "Хадгалж байна…" : "Хадгалах"}</button>
            <button type="button" onClick={() => setEditing(null)} style={sx("background:none;border:1px solid #333;color:#A3A3A3;font:600 13px Montserrat;padding:11px 18px;border-radius:9px;cursor:pointer;")}>Болих</button>
          </div>
        </form>
      )}

      <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
        {list.map((g) => (
          <div key={g.id} style={sx("display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 18px;border-bottom:1px solid #1c1c1f;")}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 160 }}>
              {g.images && g.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={g.images[0]} alt="" style={sx("width:46px;height:46px;object-fit:cover;border-radius:8px;border:1px solid #333;background:#fff;flex-shrink:0;")} />
              )}
              <div>
              <div style={sx("font:700 15px Montserrat;color:#fff;")}>{g.name} {g.bestSeller && <span style={sx("font:700 9px Montserrat;color:#E10613;")}>★</span>}</div>
              <div style={sx("font:400 12px 'JetBrains Mono';color:#8A8F98;margin-top:3px;")}>{g.brand.toUpperCase()} · {g.category}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={sx("font:700 14px Montserrat;color:#fff;")}>{fmt(g.price)}</span>
              <button onClick={() => { setF(toForm(g)); setEditing(g.id); }} style={sx("background:none;border:1px solid #333;color:#C8C8C8;font:600 12px Montserrat;padding:7px 12px;border-radius:8px;cursor:pointer;")}>Засах</button>
              <button onClick={() => del(g.id)} style={sx("background:none;border:1px solid #333;color:#ef4444;font:600 12px Montserrat;padding:7px 12px;border-radius:8px;cursor:pointer;")}>Устгах</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Одоогоор бараа алга.</div>}
      </div>
    </div>
  );
}
