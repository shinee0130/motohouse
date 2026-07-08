"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { getRideRoutes, type RideRoute } from "@/lib/queries";
import { createRideRoute, updateRideRoute, deleteRideRoute, uploadRouteImage } from "@/lib/admin";
import { useConfirm, useAlert } from "@/lib/confirm";

const INPUT = "background:#050505;border:1px solid #262626;border-radius:9px;padding:11px 13px;color:#fff;font:400 14px Roboto;outline:none;width:100%;";
const LABEL = "font:600 11px Montserrat;letter-spacing:.04em;color:#A3A3A3;margin-bottom:6px;display:block;";
const BTN = "background:#E10613;color:#fff;font:700 13px Montserrat;padding:11px 18px;border:none;border-radius:9px;cursor:pointer;";

type Form = {
  slug: string; sort: number;
  title: string; region: string; summary: string; distanceKm: number;
  duration: string; difficulty: string; road: string; season: string;
  startPlace: string; destination: string; coords: string; mapX: number; mapY: number;
  gradient: string; image: string; imageAlt: string;
  tags: string; stops: string; checklist: string;
  titleEn: string; regionEn: string; summaryEn: string;
  durationEn: string; difficultyEn: string; roadEn: string; seasonEn: string;
  imageAltEn: string; tagsEn: string; stopsEn: string; checklistEn: string;
};
const empty: Form = {
  slug: "", sort: 0, title: "", region: "", summary: "", distanceKm: 0,
  duration: "", difficulty: "", road: "", season: "", startPlace: "Улаанбаатар",
  destination: "", coords: "", mapX: 50, mapY: 50, gradient: "", image: "", imageAlt: "",
  tags: "", stops: "", checklist: "",
  titleEn: "", regionEn: "", summaryEn: "", durationEn: "", difficultyEn: "", roadEn: "", seasonEn: "",
  imageAltEn: "", tagsEn: "", stopsEn: "", checklistEn: "",
};
const j = (a: string[]) => (a ?? []).join(", ");
const arr = (s: string) => s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
function toForm(r: RideRoute): Form {
  return {
    slug: r.slug, sort: r.sort, title: r.title, region: r.region ?? "", summary: r.summary ?? "", distanceKm: r.distanceKm,
    duration: r.duration ?? "", difficulty: r.difficulty ?? "", road: r.road ?? "", season: r.season ?? "",
    startPlace: r.startPlace ?? "", destination: r.destination ?? "", coords: r.coords ?? "", mapX: r.mapX, mapY: r.mapY,
    gradient: r.gradient ?? "", image: r.image ?? "", imageAlt: r.imageAlt ?? "",
    tags: j(r.tags), stops: j(r.stops), checklist: j(r.checklist),
    titleEn: r.titleEn ?? "", regionEn: r.regionEn ?? "", summaryEn: r.summaryEn ?? "",
    durationEn: r.durationEn ?? "", difficultyEn: r.difficultyEn ?? "", roadEn: r.roadEn ?? "", seasonEn: r.seasonEn ?? "",
    imageAltEn: r.imageAltEn ?? "", tagsEn: j(r.tagsEn), stopsEn: j(r.stopsEn), checklistEn: j(r.checklistEn),
  };
}
const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9Ѐ-ӿ]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || `route-${Date.now()}`;

export default function AdminRoutes() {
  const [list, setList] = useState<RideRoute[]>([]);
  const [editing, setEditing] = useState<number | null | "new">(null);
  const [f, setF] = useState<Form>(empty);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [flang, setFlang] = useState<"mn" | "en">("mn");
  const confirm = useConfirm();
  const alert = useAlert();

  const EN_KEY = {
    title: "titleEn", region: "regionEn", summary: "summaryEn", duration: "durationEn",
    difficulty: "difficultyEn", road: "roadEn", season: "seasonEn", imageAlt: "imageAltEn",
    tags: "tagsEn", stops: "stopsEn", checklist: "checklistEn",
  } as const;
  type LField = keyof typeof EN_KEY;
  function bind(field: LField) {
    const key = (flang === "en" ? EN_KEY[field] : field) as keyof Form;
    return {
      value: f[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [key]: e.target.value }),
    };
  }
  const en = flang === "en";
  const EN = en ? <span style={sx("color:#E10613;")}>(EN)</span> : null;

  async function refresh() { setList(await getRideRoutes()); }
  useEffect(() => { refresh(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.title.trim()) return;
    setBusy(true);
    try {
      const payload: Partial<RideRoute> = {
        slug: f.slug.trim() || slugify(f.title), sort: Number(f.sort) || 0,
        title: f.title, region: f.region, summary: f.summary, distanceKm: Number(f.distanceKm) || 0,
        duration: f.duration, difficulty: f.difficulty, road: f.road, season: f.season,
        startPlace: f.startPlace, destination: f.destination, coords: f.coords,
        mapX: Number(f.mapX) || 0, mapY: Number(f.mapY) || 0,
        gradient: f.gradient, image: f.image, imageAlt: f.imageAlt,
        tags: arr(f.tags), stops: arr(f.stops), checklist: arr(f.checklist),
        titleEn: f.titleEn.trim(), regionEn: f.regionEn.trim(), summaryEn: f.summaryEn.trim(),
        durationEn: f.durationEn.trim(), difficultyEn: f.difficultyEn.trim(), roadEn: f.roadEn.trim(), seasonEn: f.seasonEn.trim(),
        imageAltEn: f.imageAltEn.trim(), tagsEn: arr(f.tagsEn), stopsEn: arr(f.stopsEn), checklistEn: arr(f.checklistEn),
      };
      if (editing === "new") await createRideRoute(payload);
      else if (typeof editing === "number") await updateRideRoute(editing, payload);
      await refresh();
      setEditing(null);
    } catch (err) {
      alert({ title: "Хадгалахад алдаа гарлаа", message: err instanceof Error ? err.message : String(err), danger: true });
    } finally { setBusy(false); }
  }
  async function del(id: number) {
    if (!(await confirm({ title: "Энэ маршрутыг устгах уу?", confirmLabel: "Устгах", danger: true }))) return;
    await deleteRideRoute(id);
    await refresh();
  }
  async function onUpload(file: File) {
    setUploading(true);
    try { const url = await uploadRouteImage(file); setF((p) => ({ ...p, image: url })); }
    catch (err) { alert({ title: "Зураг оруулахад алдаа гарлаа", message: err instanceof Error ? err.message : String(err), danger: true }); }
    finally { setUploading(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={sx("font:700 18px Montserrat;color:#fff;")}>Аяллын маршрут ({list.length})</div>
        {editing === null && <button onClick={() => { setF(empty); setFlang("mn"); setEditing("new"); }} style={sx(BTN)}>+ Шинэ маршрут</button>}
      </div>
      <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:-10px;")}>
        Эдгээр нь /travel хуудасны газрын зураг дээрх маршрутууд. Tag/зогсоол/бэлтгэлийг таслал (,) эсвэл мөрөөр тусгаарлана.
      </div>

      {editing !== null && (
        <form onSubmit={save} style={sx("background:#0e0e10;border:1px solid #262626;border-radius:14px;padding:20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;align-items:end;")}>
          <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={sx("font:700 15px Montserrat;color:#fff;")}>{editing === "new" ? "Шинэ маршрут" : "Засах"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {(["mn", "en"] as const).map((l) => (
                <button type="button" key={l} onClick={() => setFlang(l)}
                  style={sx(`cursor:pointer;font:800 11px Montserrat;padding:6px 12px;border-radius:8px;${flang === l ? "background:#E10613;border:1px solid #E10613;color:#fff;" : "background:#050505;border:1px solid #333;color:#8A8F98;"}`)}>
                  {l.toUpperCase()}
                </button>
              ))}
              <span style={sx("font:400 11px Roboto;color:#6b7280;")}>{en ? "Англи (хоосон бол монголоор)" : "Монгол"}</span>
            </div>
          </div>

          {/* зураг (дэвсгэр) */}
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={sx("position:relative;width:150px;height:100px;border-radius:10px;overflow:hidden;border:1px solid #262626;flex:none;")}>
              {f.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.image} alt="" style={sx("width:100%;height:100%;object-fit:cover;")} />
              ) : <div style={{ width: "100%", height: "100%", background: f.gradient || "#050505", display: "flex", alignItems: "center", justifyContent: "center", font: "500 11px Roboto", color: "#fff" }}>Урьдчилан харах</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={sx(LABEL)}>Дэвсгэр зураг (нэмэлт)</label>
              <label style={sx("background:#1a1a1d;border:1px solid #333;color:#C8C8C8;font:600 12px Montserrat;padding:9px 14px;border-radius:8px;cursor:pointer;display:inline-block;")}>
                {uploading ? "Ачаалж байна…" : "Зураг сонгох"}
                <input type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpload(file); }} />
              </label>
              {f.image && <button type="button" onClick={() => setF((p) => ({ ...p, image: "" }))} style={sx("background:none;border:1px solid #333;color:#ef4444;font:600 11px Montserrat;padding:6px 10px;border-radius:7px;cursor:pointer;")}>Зураг хасах</button>}
              <div style={sx("font:400 11px Roboto;color:#6b7280;")}>Зураг байхгүй бол доорх gradient харагдана.</div>
            </div>
          </div>

          <div style={{ gridColumn: "1 / -1" }}><label style={sx(LABEL)}>Гарчиг * {EN}</label><input {...bind("title")} style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>Бүс / чиглэл {EN}</label><input {...bind("region")} placeholder="Дундговь" style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>Нийт зай (км)</label><input type="number" min={0} value={f.distanceKm} onChange={(e) => setF({ ...f, distanceKm: +e.target.value })} style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>Хугацаа {EN}</label><input {...bind("duration")} placeholder="8-9 цаг нэг талдаа" style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>Түвшин {EN}</label><input {...bind("difficulty")} placeholder="Дунд" style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>Замын төрөл {EN}</label><input {...bind("road")} placeholder="Асфальт + шороон зам" style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>Улирал {EN}</label><input {...bind("season")} placeholder="5-10 сар" style={sx(INPUT)} /></div>
          <div style={{ gridColumn: "1 / -1" }}><label style={sx(LABEL)}>Товч тайлбар {EN}</label><textarea {...bind("summary")} rows={2} style={sx(INPUT + "resize:vertical;")} /></div>

          <div style={{ gridColumn: "1 / -1" }}><label style={sx(LABEL)}>Зогсоолууд ( , тусгаарлана) {EN}</label><input {...bind("stops")} placeholder="Улаанбаатар, Мандалговь, Өлзийт" style={sx(INPUT)} /></div>
          <div style={{ gridColumn: "1 / -1" }}><label style={sx(LABEL)}>Tag-ууд ( , тусгаарлана) {EN}</label><input {...bind("tags")} placeholder="Gobi, 426 km, 2 өдөр" style={sx(INPUT)} /></div>
          <div style={{ gridColumn: "1 / -1" }}><label style={sx(LABEL)}>Бэлтгэл ( , тусгаарлана) {EN}</label><input {...bind("checklist")} placeholder="Салхины хамгаалалт, GPS offline map" style={sx(INPUT)} /></div>

          {/* газрын зураг дээр pin-ийг дарж тавина */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={sx(LABEL)}>Газрын зураг дээрх байрлал — дарж pin тавь</label>
            <div
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                const x = Math.max(0, Math.min(100, Math.round(((e.clientX - r.left) / r.width) * 100)));
                const y = Math.max(0, Math.min(100, Math.round(((e.clientY - r.top) / r.height) * 100)));
                setF((p) => ({ ...p, mapX: x, mapY: y }));
              }}
              style={{ position: "relative", width: "100%", maxWidth: 420, aspectRatio: "4 / 3", background: "#0B0B0D", border: "1px solid #262626", borderRadius: 12, overflow: "hidden", cursor: "crosshair" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/maps/mongolia-map-dark.png" alt="" draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }} />
              <div style={{ position: "absolute", left: `${f.mapX}%`, top: `${f.mapY}%`, transform: "translate(-50%,-100%)", width: 26, height: 26, borderRadius: 999, border: "2px solid #fff", background: "#E10613", boxShadow: "0 0 0 6px rgba(225,6,19,.2),0 6px 14px rgba(0,0,0,.4)", pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: "#fff", display: "block" }} />
              </div>
            </div>
            <div style={sx("font:400 11px Roboto;color:#6b7280;margin-top:6px;")}>Зураг дээр дарахад pin тэнд шилжинэ. (X: {f.mapX}% · Y: {f.mapY}%)</div>
          </div>
          <div><label style={sx(LABEL)}>Эхлэх цэг</label><input value={f.startPlace} onChange={(e) => setF({ ...f, startPlace: e.target.value })} placeholder="Улаанбаатар" style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>Очих газар (Google Maps)</label><input value={f.destination} onChange={(e) => setF({ ...f, destination: e.target.value })} placeholder="Tsagaan Suvarga, Mongolia" style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>Координат (lat,lng)</label><input value={f.coords} onChange={(e) => setF({ ...f, coords: e.target.value })} placeholder="45.3186,106.8333" style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>Эрэмбэ</label><input type="number" value={f.sort} onChange={(e) => setF({ ...f, sort: +e.target.value })} style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>Slug (авто)</label><input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} placeholder="tsagaan-suvarga" style={sx(INPUT)} /></div>
          <div style={{ gridColumn: "1 / -1" }}><label style={sx(LABEL)}>Дэвсгэр gradient (нэмэлт CSS)</label><textarea value={f.gradient} onChange={(e) => setF({ ...f, gradient: e.target.value })} rows={2} placeholder="linear-gradient(...)" style={sx(INPUT + "resize:vertical;font-family:'JetBrains Mono';font-size:11px;")} /></div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={busy} style={sx(BTN + (busy ? "opacity:.6;" : ""))}>{busy ? "…" : "Хадгалах"}</button>
            <button type="button" onClick={() => setEditing(null)} style={sx("background:none;border:1px solid #333;color:#A3A3A3;font:600 13px Montserrat;padding:11px 18px;border-radius:9px;cursor:pointer;")}>Болих</button>
          </div>
        </form>
      )}

      <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
        {list.map((r) => (
          <div key={r.id} style={sx("display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 18px;border-bottom:1px solid #1c1c1f;")}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 220 }}>
              <div style={{ width: 56, height: 56, borderRadius: 9, overflow: "hidden", border: "1px solid #262626", flex: "none", background: r.image ? undefined : (r.gradient || "#050505") }}>
                {r.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image} alt="" style={sx("width:100%;height:100%;object-fit:cover;")} />
                ) : null}
              </div>
              <div>
                <div style={sx("font:700 15px Montserrat;color:#fff;")}>{r.title}</div>
                <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:3px;")}>{r.region || "—"} · {r.distanceKm} km · {r.stops.length} зогсоол</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => { setF(toForm(r)); setFlang("mn"); setEditing(r.id); }} style={sx("background:#1a1a1d;border:1px solid #333;color:#C8C8C8;font:600 12px Montserrat;padding:7px 12px;border-radius:8px;cursor:pointer;")}>Засах</button>
              <button onClick={() => del(r.id)} style={sx("background:none;border:1px solid #333;color:#ef4444;font:600 12px Montserrat;padding:7px 12px;border-radius:8px;cursor:pointer;")}>Устгах</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <div style={sx("padding:26px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Маршрут алга. Шинээр нэмээрэй.</div>}
      </div>
    </div>
  );
}
