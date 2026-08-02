"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { sx } from "@/lib/ui/sx";
import { Select } from "@/components/ui/Select";
import { fmt, isPart, PARTS_CATS, GENDERS, type GearItem } from "@/lib/db/data";
import { getGearAll } from "@/lib/db/queries";
import { createGear, updateGear, deleteGear, uploadGear } from "@/lib/db/admin";
import { useConfirm, useAlert } from "@/lib/ui/confirm";
import { useToast } from "@/lib/ui/toast";
import { GEAR_COLORS as COLORS, checkOn } from "@/lib/commerce/colors";

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
const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

type Form = {
  name: string; brand: string; category: string; meta: string; price: string; oldPrice: string;
  rating: string; reviews: string; sku: string; bestSeller: boolean; desc: string;
  features: string; sizes: string[]; colors: string[]; images: string[];
  imageColors: Record<string, string>;
  gender: string;
  nameEn: string; descEn: string; metaEn: string; featuresEn: string;
};
function toForm(g: GearItem): Form {
  return {
    name: g.name, brand: g.brand, category: g.category, meta: g.meta ?? "",
    price: String(g.price), oldPrice: String(g.oldPrice), rating: String(g.rating),
    reviews: String(g.reviews), sku: g.sku, bestSeller: !!g.bestSeller, desc: g.desc,
    features: (g.features ?? []).join("\n"), sizes: g.sizes ?? [], colors: g.colors ?? [],
    images: g.images ?? [], imageColors: g.imageColors ?? {}, gender: g.gender ?? "unisex",
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
    images: f.images, imageColors: f.imageColors, gender: f.gender,
    nameEn: f.nameEn.trim(), descEn: f.descEn.trim(), metaEn: f.metaEn.trim(), featuresEn: lines(f.featuresEn),
  };
}

export function GearAdmin({ mode }: { mode: "gear" | "parts" }) {
  const isParts = mode === "parts";
  const baseCats = isParts ? PARTS_CATS : GEAR_CATS;
  const heading = isParts ? "Сэлбэг" : "Дагалдах хэрэгсэл";
  const newLabel = isParts ? "+ Шинэ сэлбэг" : "+ Шинэ хэрэгсэл";
  const empty: Form = {
    name: "", brand: "", category: baseCats[0], meta: "", price: "", oldPrice: "",
    rating: "5", reviews: "0", sku: "", bestSeller: false, desc: "", features: "", sizes: [], colors: [], images: [], imageColors: {},
    gender: "unisex", nameEn: "", descEn: "", metaEn: "", featuresEn: "",
  };

  const [flang, setFlang] = useState<"mn" | "en">("mn");
  const [list, setList] = useState<GearItem[]>([]);
  const [editing, setEditing] = useState<number | null | "new">(null);
  const [f, setF] = useState<Form>(empty);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [catInput, setCatInput] = useState("");
  const [drag, setDrag] = useState<number | null>(null); // чирж буй зургийн байрлал

  // Зургийн дугаарыг ӨНГӨ БҮРИЙН ДОТОР тоолно: Хар 1,2,3,4 · Саарал 1,2,3,4 …
  // Сайт дээр өнгө сонгоход тухайн өнгийн 1-р зураг эхэлж харагддаг тул
  // "хэд дэх нь вэ" гэдгийг өнгөөр нь харуулах нь ойлгомжтой.
  const seq = useMemo(() => {
    const count: Record<string, number> = {};
    return f.images.map((src) => {
      const c = f.imageColors[src] ?? "";
      count[c] = (count[c] ?? 0) + 1;
      return count[c];
    });
  }, [f.images, f.imageColors]);
  // Хуруу/хулгана өөр зургийн дээгүүр орох бүрд шууд байраа сольж, дараалал
  // нүдэн дээр амьдаар өөрчлөгдөнө. setPointerCapture-ээс болж эвент эх
  // элемент дээрээ ирдэг тул доорхыг elementFromPoint-оор олно.
  function dragOver(e: React.PointerEvent) {
    if (drag === null) return;
    const cell = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-img-idx]");
    if (!cell) return;
    const to = Number(cell.getAttribute("data-img-idx"));
    if (Number.isNaN(to) || to === drag) return;
    setF((c) => {
      const im = [...c.images];
      const [moved] = im.splice(drag, 1);
      im.splice(to, 0, moved);
      return { ...c, images: im };
    });
    setDrag(to);
  }
  // Сонгох ангиллууд: үндсэн багц + DB дээр бодитоор хэрэглэгдэж буй ангиллууд.
  // Админ шинэ ангилал бичээд хадгалмагц тэр ангилал энд орж ирнэ — дараагийн
  // бараагаа шууд сонгож оруулна. Тусдаа хүснэгт шаардлагагүй.
  const cats = useMemo(() => {
    const set = new Set<string>(baseCats);
    list.forEach((g) => g.category && set.add(g.category));
    if (f.category) set.add(f.category);
    return [...set];
  }, [baseCats, list, f.category]);

  const alert = useAlert();
  // Шинэ ангилал — бичээд нэмэхэд шууд сонгогдоно, хадгалмагц бүртгэгдэнэ.
  function addCategory() {
    const v = catInput.trim();
    if (!v) return;
    setF((c) => ({ ...c, category: v }));
    setCatInput("");
  }
  function addColor() {
    const v = colorInput.trim();
    if (!v) return;
    setF((c) => ({ ...c, colors: c.colors.includes(v) ? c.colors : [...c.colors, v] }));
    setColorInput("");
  }
  // Гараар хэмжээ нэмэх. Таслал/зайгаар зааглаж олныг нэг дор нэмнэ
  // (жнь "56 cm, 58 cm, 60 cm") — каск, бээлий г.м. үсгэн хэмжээгүй бараанд.
  function addSizes() {
    const parts = sizeInput.split(/[,;\n]/).map((x) => x.trim()).filter(Boolean);
    if (parts.length === 0) return;
    setF((c) => ({ ...c, sizes: [...c.sizes, ...parts.filter((p) => !c.sizes.includes(p))] }));
    setSizeInput("");
  }

  const EN_KEY = { name: "nameEn", desc: "descEn", meta: "metaEn", features: "featuresEn" } as const;
  function bind(field: "name" | "desc" | "meta" | "features") {
    const key = (flang === "en" ? EN_KEY[field] : field) as keyof Form;
    return {
      value: f[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [key]: e.target.value }),
    };
  }

  const refresh = useCallback(async () => {
    const all = await getGearAll();
    setList(all.filter((g) => (mode === "parts" ? isPart(g) : !isPart(g))));
  }, [mode]);
  useEffect(() => { void refresh(); }, [refresh]);

  const toast = useToast();

  async function onImages(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) urls.push(await uploadGear(file));
      // Давхардсан URL байвал React-ийн түлхүүр (=url) мөргөлдөнө — цэвэрлэнэ.
      setF((cur) => ({ ...cur, images: [...new Set([...cur.images, ...urls])] }));
      toast(urls.length > 1
        ? `${urls.length} зураг амжилттай орлоо. Доор нь Хадгалах товчийг дарна уу.`
        : "Зураг амжилттай орлоо. Доор нь Хадгалах товчийг дарна уу.");
    } catch (err) {
      alert({ title: "Зураг оруулахад алдаа гарлаа", message: err instanceof Error ? err.message : String(err), danger: true });
    } finally { setUploading(false); }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) return;
    setBusy(true);
    try {
      // Сэлбэгт хэмжээ/өнгө байхгүй тул хадгалахдаа өгөгдлийг нь ч цэвэрлэнэ —
      // эс бол админ дээр харагдахгүй атлаа сайт дээр үлдэж, засах аргагүй болно.
      // kind-ыг мөрөн дээр нь бичнэ — шинэ ангилал нэмсэн ч сэлбэг/хэрэгсэл нь
      // хатуу жагсаалтаас биш үүнээс тодорхойлогдоно.
      const base = { ...fromForm(f), kind: (isParts ? "part" : "gear") as "part" | "gear" };
      const row = isParts ? { ...base, sizes: [], colors: [], imageColors: {}, gender: "unisex" } : base;
      const isNew = editing === "new";
      if (isNew) await createGear(row);
      else if (typeof editing === "number") await updateGear(editing, row);
      await refresh();
      setEditing(null);
      toast(isNew ? "Амжилттай нэмэгдлээ" : "Амжилттай хадгалагдлаа");
    } catch (err) {
      await alert({ title: "Хадгалахад алдаа гарлаа", message: err instanceof Error ? err.message : String(err), danger: true });
    } finally { setBusy(false); }
  }
  const confirm = useConfirm();
  async function del(id: number) {
    if (!(await confirm({ title: "Энэ барааг устгах уу?", message: "Устгасны дараа буцаах боломжгүй.", confirmLabel: "Устгах", danger: true }))) return;
    try {
      await deleteGear(id);
      await refresh();
      toast("Устгагдлаа");
    } catch (err) {
      await alert({ title: "Устгахад алдаа гарлаа", message: err instanceof Error ? err.message : String(err), danger: true });
    }
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(150px,100%),1fr))", gap: 14 }}>
            <div><label style={sx(LABEL)}>Нэр * {flang === "en" && <span style={sx("color:#E10613;")}>(EN)</span>}</label><input {...bind("name")} style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Брэнд</label><input value={f.brand} onChange={(e) => setF({ ...f, brand: e.target.value })} style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Ангилал</label>
              <Select value={f.category} onChange={(v) => setF({ ...f, category: v })} full bg="#050505" options={cats.map((c) => ({ value: c, label: c }))} />
              {/* Шинэ ангилал — бичээд нэмэхэд сонгогдоно, бараагаа хадгалмагц
                  жагсаалтад бүртгэгдэж, дараагийн бараанд сонгогдоно. */}
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <input value={catInput} onChange={(e) => setCatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCategory(); } }}
                  placeholder="Шинэ ангилал" style={sx(INPUT + "padding:7px 10px;font:400 12px Roboto;")} />
                <button type="button" onClick={addCategory} style={sx("background:#1a1a1d;border:1px solid #333;color:#fff;font:600 11px Montserrat;padding:7px 11px;border-radius:8px;cursor:pointer;white-space:nowrap;")}>+</button>
              </div></div>
            {/* Хүйс зөвхөн дагалдах хэрэгсэлд — сэлбэг хэн ч хамаагүй нэг адил. */}
            {!isParts && <div><label style={sx(LABEL)}>Хүйс</label>
              <Select value={f.gender} onChange={(v) => setF({ ...f, gender: v })} full bg="#050505" options={GENDERS.map((g) => ({ value: g.v, label: g.mn }))} /></div>}
            <div><label style={sx(LABEL)}>Үнэ (₮)</label><input value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} inputMode="numeric" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Хуучин үнэ (₮)</label><input value={f.oldPrice} onChange={(e) => setF({ ...f, oldPrice: e.target.value })} inputMode="numeric" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Rating (1-5)</label><input value={f.rating} onChange={(e) => setF({ ...f, rating: e.target.value })} inputMode="numeric" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Сэтгэгдэл тоо</label><input value={f.reviews} onChange={(e) => setF({ ...f, reviews: e.target.value })} inputMode="numeric" style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>SKU</label><input value={f.sku} onChange={(e) => setF({ ...f, sku: e.target.value })} style={sx(INPUT)} /></div>
            <div><label style={sx(LABEL)}>Meta {flang === "en" && <span style={sx("color:#E10613;")}>(EN)</span>}</label><input {...bind("meta")} placeholder="ECE 22.06 · Carbon" style={sx(INPUT)} /></div>
          </div>
          <div><label style={sx(LABEL)}>Тайлбар {flang === "en" && <span style={sx("color:#E10613;")}>(EN)</span>}</label><textarea {...bind("desc")} rows={2} style={sx(INPUT + "resize:vertical;")} /></div>
          <div><label style={sx(LABEL)}>Онцлог (мөр тус бүр) {flang === "en" && <span style={sx("color:#E10613;")}>(EN)</span>}</label><textarea {...bind("features")} rows={3} style={sx(INPUT + "resize:vertical;")} /></div>
          {/* Хэмжээ, Өнгө хоёр зөвхөн дагалдах хэрэгсэлд. Сэлбэгт хэрэггүй —
              25 сэлбэгийн аль нь ч хэмжээ ашиглаагүй. */}
          {!isParts && <div>
            <label style={sx(LABEL)}>Хэмжээ <span style={sx("color:#6b7280;")}>(сонгох)</span></label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SIZES.map((s) => {
                const on = f.sizes.includes(s);
                return (
                  // Үсгэн хэмжээ дор см бичихээ болив — см нь тусдаа систем,
                  // доорх талбараар гараар нэмнэ (каск дээр толгойн тойрог,
                  // хувцас дээр цээж — үсэгтэй нь автоматаар холбож болохгүй).
                  <button key={s} type="button" onClick={() => setF((c) => ({ ...c, sizes: toggle(c.sizes, s) }))}
                    style={sx(`min-width:58px;cursor:pointer;font:700 13px Montserrat;padding:11px 14px;border-radius:9px;${on ? "background:#E10613;border:1px solid #E10613;color:#fff;" : "background:#050505;border:1px solid #333;color:#C8C8C8;"}`)}>
                    {s}
                  </button>
                );
              })}
            </div>
            {/* Гараар нэмсэн хэмжээнүүд (үсгэн бус — 56 cm, 58 cm г.м) */}
            {f.sizes.filter((s) => !SIZES.includes(s)).length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {f.sizes.filter((s) => !SIZES.includes(s)).map((s) => (
                  <span key={s} style={sx("display:inline-flex;align-items:center;gap:6px;background:#050505;border:1px solid #333;border-radius:999px;padding:6px 8px 6px 12px;font:600 12px Roboto;color:#C8C8C8;")}>
                    {s}
                    <button type="button" onClick={() => setF((c) => ({ ...c, sizes: c.sizes.filter((x) => x !== s) }))}
                      style={sx("width:18px;height:18px;border-radius:50%;background:#E10613;color:#fff;border:none;cursor:pointer;font:700 11px Montserrat;line-height:1;")}>×</button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 12, maxWidth: 420 }}>
              <input value={sizeInput} onChange={(e) => setSizeInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSizes(); } }}
                placeholder="Гараар хэмжээ (жнь: 56 cm, 58 cm, 60 cm)" style={sx(INPUT + "padding:8px 11px;font:400 13px Roboto;")} />
              <button type="button" onClick={addSizes} style={sx("background:#1a1a1d;border:1px solid #333;color:#fff;font:600 12px Montserrat;padding:8px 14px;border-radius:8px;cursor:pointer;white-space:nowrap;")}>Нэмэх</button>
            </div>
          </div>}
          {!isParts && <div>
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
                      {on && <span style={{ color: checkOn(c.hex), fontSize: 14, fontWeight: 800, lineHeight: 1 }}>✓</span>}
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
          </div>}
          <div>
            <label style={sx(LABEL)}>
              Зураг ({f.images.length}) <span style={sx("color:#6b7280;")}>— чирж дараалал солино. Өнгө бүрийн эхний зураг нь тэр өнгөний нүүр зураг болно.</span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
              {/* key нь ЗУРГИЙН URL — байрлалаас хамаарвал дараалал солих бүрд
                  React зангилааг дахин үүсгэж, чирэлтийн барилт тасарна. */}
              {f.images.map((src, i) => (
                <div key={src} data-img-idx={i} style={{ position: "relative", width: 84 }}>
                  {/* Чирэлт нь Pointer Events дээр — хулгана, хуруу, stylus гурвуулаа
                      нэг замаар ажиллана. HTML5 drag-and-drop гар утсан дээр огт
                      ажилладаггүй тул ашиглаагүй. Зөвхөн зураг нь бариул — доорх
                      өнгөний сонголт дээрээс чирэгдэхгүй. */}
                  <div
                    onPointerDown={(e) => {
                      if (e.button !== 0) return;
                      e.currentTarget.setPointerCapture(e.pointerId);
                      setDrag(i);
                    }}
                    onPointerMove={dragOver}
                    onPointerUp={() => setDrag(null)}
                    onPointerCancel={() => setDrag(null)}
                    style={{
                      position: "relative", cursor: drag === i ? "grabbing" : "grab",
                      opacity: drag === i ? 0.45 : 1,
                      // Чирэх үед хуудас гүйхээс сэргийлнэ (утсанд зайлшгүй).
                      touchAction: "none",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" draggable={false}
                      style={sx("width:84px;height:84px;object-fit:cover;border-radius:8px;border:1px solid #333;background:#fff;display:block;pointer-events:none;")} />
                    {/* Дугаар нь ӨНГӨ БҮРИЙН ДОТОР. Тухайн өнгийн 1-р зураг нь
                        сайт дээр эхэлж харагдана — тиймээс улаанаар онцолно. */}
                    <span style={sx(`position:absolute;top:4px;left:4px;min-width:20px;height:20px;padding:0 5px;border-radius:6px;color:#fff;font:700 11px Montserrat;display:flex;align-items:center;justify-content:center;pointer-events:none;background:${seq[i] === 1 ? "#E10613" : "rgba(5,5,5,.78)"};`)}>
                      {seq[i]}
                    </span>
                  </div>
                  <button type="button" onClick={() => setF((c) => {
                    const im = { ...c.imageColors };
                    delete im[src];
                    return { ...c, images: c.images.filter((_, x) => x !== i), imageColors: im };
                  })}
                    style={sx("position:absolute;top:-7px;right:-7px;width:22px;height:22px;border-radius:50%;background:#E10613;color:#fff;border:none;cursor:pointer;font:700 12px Montserrat;line-height:1;")}>×</button>
                  {/* Аль өнгөнийх вэ — хэрэглэгч тэр өнгийг сонгоход зөвхөн эдгээр
                      зураг харагдана. "Бүх өнгөнд" бол үргэлж харагдана. */}
                  <select
                    value={f.imageColors[src] ?? ""}
                    onChange={(e) => setF((c) => {
                      const im = { ...c.imageColors };
                      if (e.target.value) im[src] = e.target.value; else delete im[src];
                      return { ...c, imageColors: im };
                    })}
                    disabled={f.colors.length === 0}
                    title={f.colors.length === 0 ? "Эхлээд өнгө сонгоно уу" : "Аль өнгөний зураг вэ"}
                    style={sx("width:84px;margin-top:5px;background:#050505;border:1px solid #333;border-radius:7px;color:#C8C8C8;font:500 11px Roboto;padding:5px 6px;outline:none;cursor:pointer;")}
                  >
                    <option value="">Бүх өнгөнд</option>
                    {f.colors.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
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
          <div key={g.id} className="mh-adm-row" style={sx("padding:14px 18px;border-bottom:1px solid #1c1c1f;")}>
            <div className="mh-adm-row-main" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {g.images && g.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={g.images[0]} alt="" style={sx("width:46px;height:46px;object-fit:cover;border-radius:8px;border:1px solid #333;background:#fff;flex-shrink:0;")} />
              )}
              <div style={{ minWidth: 0 }}>
              <div className="mh-adm-clip" title={g.name} style={sx("font:700 15px Montserrat;color:#fff;")}>{g.name} {g.bestSeller && <span style={sx("font:700 9px Montserrat;color:#E10613;")}>★</span>}</div>
              <div className="mh-adm-clip" style={sx("font:400 12px 'JetBrains Mono';color:#8A8F98;margin-top:3px;")}>{g.brand.toUpperCase()} · {g.category}</div>
              </div>
            </div>
            <div className="mh-adm-row-side">
              <span style={sx("font:700 14px Montserrat;color:#fff;white-space:nowrap;")}>{fmt(g.price)}</span>
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
