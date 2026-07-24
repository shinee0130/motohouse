"use client";

import { useEffect, useRef, useState } from "react";
import { sx } from "@/lib/ui/sx";
import { getAllPhotographers, getPhotographer, type Photographer, type PhotographerWork } from "@/lib/db/queries";
import {
  createPhotographer, updatePhotographer, deletePhotographer,
  addPhotographerWork, deletePhotographerWork, uploadPhotographerImage,
} from "@/lib/db/admin";
import { useConfirm, useAlert } from "@/lib/ui/confirm";

const INPUT = "background:#050505;border:1px solid #262626;border-radius:9px;padding:11px 13px;color:#fff;font:400 14px Roboto;outline:none;width:100%;";
const LABEL = "font:600 11px Montserrat;letter-spacing:.04em;color:#A3A3A3;margin-bottom:6px;display:block;";
const BTN = "background:#E10613;color:#fff;font:700 13px Montserrat;padding:11px 18px;border:none;border-radius:9px;cursor:pointer;";
const GHOST = "background:#111113;color:#C8C8C8;font:700 13px Montserrat;padding:11px 18px;border:1px solid #333;border-radius:9px;cursor:pointer;";

type Form = {
  name: string; nameEn: string; specialty: string; specialtyEn: string;
  tags: string; price: string; bio: string; bioEn: string;
  instagram: string; facebook: string; tiktok: string; youtube: string;
  avatar: string; sort: number; active: boolean;
};
const empty: Form = {
  name: "", nameEn: "", specialty: "", specialtyEn: "", tags: "", price: "", bio: "", bioEn: "",
  instagram: "", facebook: "", tiktok: "", youtube: "", avatar: "", sort: 0, active: true,
};
const arr = (s: string) => s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
function toForm(p: Photographer): Form {
  return {
    name: p.name, nameEn: p.nameEn ?? "", specialty: p.specialty ?? "", specialtyEn: p.specialtyEn ?? "",
    tags: (p.tags ?? []).join(", "), price: p.price ?? "", bio: p.bio ?? "", bioEn: p.bioEn ?? "",
    instagram: p.instagram ?? "", facebook: p.facebook ?? "", tiktok: p.tiktok ?? "", youtube: p.youtube ?? "",
    avatar: p.avatar ?? "", sort: p.sort ?? 0, active: p.active ?? true,
  };
}
function fromForm(f: Form): Partial<Photographer> {
  return {
    name: f.name.trim(), nameEn: f.nameEn.trim(), specialty: f.specialty.trim(), specialtyEn: f.specialtyEn.trim(),
    tags: arr(f.tags), price: f.price.trim(), bio: f.bio.trim(), bioEn: f.bioEn.trim(),
    instagram: f.instagram.trim(), facebook: f.facebook.trim(), tiktok: f.tiktok.trim(), youtube: f.youtube.trim(),
    avatar: f.avatar, sort: Number(f.sort) || 0, active: f.active,
  };
}

export default function AdminPhotographers() {
  const [list, setList] = useState<Photographer[]>([]);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [f, setF] = useState<Form>(empty);
  const [flang, setFlang] = useState<"mn" | "en">("mn");
  const [works, setWorks] = useState<PhotographerWork[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const confirm = useConfirm();
  const alert = useAlert();

  async function refresh() { setList(await getAllPhotographers()); }
  useEffect(() => { refresh(); }, []);

  function set<K extends keyof Form>(k: K, v: Form[K]) { setF((p) => ({ ...p, [k]: v })); }

  async function openEdit(id: number) {
    const p = await getPhotographer(id);
    if (!p) return;
    setEditing(id); setF(toForm(p)); setWorks(p.works ?? []); setFlang("mn");
  }
  function openNew() { setEditing("new"); setF(empty); setWorks([]); setFlang("mn"); }
  function close() { setEditing(null); setF(empty); setWorks([]); }

  async function save() {
    if (!f.name.trim()) { await alert({ title: "Нэр оруулна уу." }); return; }
    setBusy(true);
    try {
      if (editing === "new") await createPhotographer(fromForm(f));
      else if (typeof editing === "number") await updatePhotographer(editing, fromForm(f));
      await refresh();
      close();
    } catch (e) {
      await alert({ title: "Хадгалахад алдаа: " + (e instanceof Error ? e.message : String(e)) });
    } finally { setBusy(false); }
  }

  async function remove(p: Photographer) {
    if (!(await confirm({ title: `"${p.name}"-г устгах уу? Портфолио бүхэлдээ устана.`, danger: true }))) return;
    await deletePhotographer(p.id); await refresh();
  }

  async function uploadAvatar(file: File) {
    setUploading(true);
    try { set("avatar", await uploadPhotographerImage(file)); }
    catch (e) { await alert({ title: "Upload алдаа: " + (e instanceof Error ? e.message : String(e)) }); }
    finally { setUploading(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={sx("font:700 18px Montserrat;color:#fff;")}>Зурагчид</div>
        {editing === null && <button onClick={openNew} style={sx(BTN)}>+ Зурагчин нэмэх</button>}
      </div>

      {editing === null ? (
        <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
          {list.map((p) => (
            <div key={p.id} style={sx("display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid #1c1c1f;")}>
              <div style={sx("width:46px;height:46px;border-radius:10px;overflow:hidden;flex-shrink:0;background:#0b0b0d;border:1px solid #262626;display:flex;align-items:center;justify-content:center;font:800 16px Montserrat;color:#E10613;")}>
                {p.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.avatar} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (p.name.replace(/\D+/g, "") || "📸")}
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={sx("font:700 15px Montserrat;color:#fff;")}>{p.name} {!p.active && <span style={sx("font:600 10px Montserrat;color:#8A8F98;")}>(нуугдсан)</span>}</div>
                <div style={sx("font:400 12px Roboto;color:#8A8F98;")}>{p.specialty} · {(p.tags ?? []).join(", ")}</div>
              </div>
              <button onClick={() => openEdit(p.id)} style={sx(GHOST)}>Засах</button>
              <button onClick={() => remove(p)} style={sx("background:transparent;color:#ef4444;font:700 13px Montserrat;padding:11px 14px;border:1px solid rgba(239,68,68,.4);border-radius:9px;cursor:pointer;")}>Устгах</button>
            </div>
          ))}
          {list.length === 0 && <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Зурагчин алга. “+ Зурагчин нэмэх”.</div>}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* үндсэн форм */}
          <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:14px;")}>
            <div style={{ display: "flex", gap: 8 }}>
              {(["mn", "en"] as const).map((l) => (
                <button key={l} onClick={() => setFlang(l)} style={sx(`cursor:pointer;font:700 12px Montserrat;padding:7px 15px;border-radius:8px;${flang === l ? "background:#E10613;border:1px solid #E10613;color:#fff;" : "background:#050505;border:1px solid #333;color:#C8C8C8;"}`)}>{l.toUpperCase()}</button>
              ))}
            </div>

            <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;")}>
              {flang === "mn" ? (
                <>
                  <div><label style={sx(LABEL)}>Нэр *</label><input value={f.name} onChange={(e) => set("name", e.target.value)} style={sx(INPUT)} /></div>
                  <div><label style={sx(LABEL)}>Чиглэл</label><input value={f.specialty} onChange={(e) => set("specialty", e.target.value)} style={sx(INPUT)} /></div>
                </>
              ) : (
                <>
                  <div><label style={sx(LABEL)}>Name (EN)</label><input value={f.nameEn} onChange={(e) => set("nameEn", e.target.value)} style={sx(INPUT)} /></div>
                  <div><label style={sx(LABEL)}>Specialty (EN)</label><input value={f.specialtyEn} onChange={(e) => set("specialtyEn", e.target.value)} style={sx(INPUT)} /></div>
                </>
              )}
            </div>
            <div>
              <label style={sx(LABEL)}>{flang === "mn" ? "Танилцуулга (био)" : "Bio (EN)"}</label>
              <textarea value={flang === "mn" ? f.bio : f.bioEn} onChange={(e) => set(flang === "mn" ? "bio" : "bioEn", e.target.value)} rows={3} style={sx(INPUT + "resize:vertical;")} />
            </div>

            <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;")}>
              <div><label style={sx(LABEL)}>Tag (таслалаар: Зураг, Reel, Видео)</label><input value={f.tags} onChange={(e) => set("tags", e.target.value)} style={sx(INPUT)} /></div>
              <div><label style={sx(LABEL)}>Үнэ (текст, сонголт)</label><input value={f.price} onChange={(e) => set("price", e.target.value)} placeholder="ж: 150,000₮-с" style={sx(INPUT)} /></div>
              <div><label style={sx(LABEL)}>Эрэмбэ (sort)</label><input type="number" value={f.sort} onChange={(e) => set("sort", Number(e.target.value))} style={sx(INPUT)} /></div>
            </div>

            <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;")}>
              <div><label style={sx(LABEL)}>Instagram URL</label><input value={f.instagram} onChange={(e) => set("instagram", e.target.value)} style={sx(INPUT)} /></div>
              <div><label style={sx(LABEL)}>Facebook URL</label><input value={f.facebook} onChange={(e) => set("facebook", e.target.value)} style={sx(INPUT)} /></div>
              <div><label style={sx(LABEL)}>TikTok URL</label><input value={f.tiktok} onChange={(e) => set("tiktok", e.target.value)} style={sx(INPUT)} /></div>
              <div><label style={sx(LABEL)}>YouTube URL</label><input value={f.youtube} onChange={(e) => set("youtube", e.target.value)} style={sx(INPUT)} /></div>
            </div>

            {/* avatar */}
            <div>
              <label style={sx(LABEL)}>Профайл зураг</label>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={sx("width:64px;height:64px;border-radius:12px;overflow:hidden;background:#0b0b0d;border:1px solid #262626;flex-shrink:0;")}>
                  {f.avatar && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>
                <label style={sx(GHOST + "display:inline-block;")}>
                  {uploading ? "Ачаалж байна…" : "Зураг сонгох"}
                  <input type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadAvatar(file); }} />
                </label>
                {f.avatar && <button onClick={() => set("avatar", "")} style={sx("background:transparent;color:#8A8F98;font:600 12px Montserrat;border:none;cursor:pointer;")}>Арилгах</button>}
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} />
              <span style={sx("font:600 13px Roboto;color:#C8C8C8;")}>Идэвхтэй (сайт дээр харагдана)</span>
            </label>

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={save} disabled={busy} style={sx(BTN + (busy ? "opacity:.6;" : ""))}>{busy ? "Хадгалж байна…" : "Хадгалах"}</button>
              <button onClick={close} style={sx(GHOST)}>Болих</button>
            </div>
          </div>

          {/* портфолио — зөвхөн хадгалсан зурагчинд */}
          {typeof editing === "number" ? (
            <WorksManager photographerId={editing} works={works} onChange={async () => { const p = await getPhotographer(editing); setWorks(p?.works ?? []); }} />
          ) : (
            <div style={sx("background:#0e0e10;border:1px dashed #333;border-radius:14px;padding:18px;font:400 13px Roboto;color:#8A8F98;")}>
              Портфолио (зураг/reel) нэмэхийн тулд эхлээд зурагчнаа <b style={{ color: "#fff" }}>хадгалаад</b>, дараа нь “Засах”-аар нээнэ үү.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===== Портфолио удирдлага =====
function WorksManager({ photographerId, works, onChange }: { photographerId: number; works: PhotographerWork[]; onChange: () => Promise<void> }) {
  const [kind, setKind] = useState<"photo" | "video">("photo");
  const [url, setUrl] = useState("");
  const [thumb, setThumb] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const confirm = useConfirm();
  const alert = useAlert();

  async function upload(file: File, target: "url" | "thumb") {
    setUploading(true);
    try { const u = await uploadPhotographerImage(file); if (target === "url") setUrl(u); else setThumb(u); }
    catch (e) { await alert({ title: "Upload алдаа: " + (e instanceof Error ? e.message : String(e)) }); }
    finally { setUploading(false); }
  }

  async function add() {
    if (!url.trim()) { await alert({ title: kind === "photo" ? "Зураг оруулна уу." : "Reel/видео линк оруулна уу." }); return; }
    setBusy(true);
    try {
      await addPhotographerWork({ photographerId, kind, url: url.trim(), thumb: thumb.trim() || undefined, caption: caption.trim() || undefined, sort: works.length });
      setUrl(""); setThumb(""); setCaption("");
      await onChange();
    } catch (e) { await alert({ title: "Алдаа: " + (e instanceof Error ? e.message : String(e)) }); }
    finally { setBusy(false); }
  }

  async function del(w: PhotographerWork) {
    if (!(await confirm({ title: "Энэ ажлыг устгах уу?", danger: true }))) return;
    await deletePhotographerWork(w.id); await onChange();
  }

  return (
    <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:14px;")}>
      <div style={sx("font:700 15px Montserrat;color:#fff;")}>Портфолио — ажлууд</div>

      {/* байгаа ажлууд */}
      {works.length > 0 && (
        <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;")}>
          {works.map((w) => (
            <div key={w.id} style={sx("position:relative;border-radius:10px;overflow:hidden;aspect-ratio:1;background:#0b0b0d;border:1px solid #262626;")}>
              {(w.kind === "photo" ? w.url : w.thumb) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={w.kind === "photo" ? w.url : (w.thumb as string)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={sx("width:100%;height:100%;display:flex;align-items:center;justify-content:center;font:600 11px Roboto;color:#8A8F98;padding:8px;text-align:center;")}>{w.url.slice(0, 40)}</div>
              )}
              {w.kind === "video" && <div style={sx("position:absolute;top:6px;left:6px;font:700 9px Montserrat;color:#fff;background:rgba(225,6,19,.9);padding:2px 6px;border-radius:4px;")}>VIDEO</div>}
              <button onClick={() => del(w)} style={sx("position:absolute;top:5px;right:5px;width:22px;height:22px;border-radius:6px;background:rgba(0,0,0,.7);color:#fff;border:none;cursor:pointer;font:700 12px Montserrat;line-height:1;")}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* нэмэх */}
      <div style={sx("border-top:1px solid #1c1c1f;padding-top:14px;display:flex;flex-direction:column;gap:12px;")}>
        <div style={{ display: "flex", gap: 8 }}>
          {(["photo", "video"] as const).map((k) => (
            <button key={k} onClick={() => { setKind(k); setUrl(""); setThumb(""); }} style={sx(`cursor:pointer;font:700 12px Montserrat;padding:8px 16px;border-radius:8px;${kind === k ? "background:#E10613;border:1px solid #E10613;color:#fff;" : "background:#050505;border:1px solid #333;color:#C8C8C8;"}`)}>
              {k === "photo" ? "Зураг" : "Reel / Видео"}
            </button>
          ))}
        </div>

        {kind === "photo" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <label style={sx(GHOST + "display:inline-block;")}>
              {uploading ? "Ачаалж байна…" : "Зураг сонгох"}
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(file, "url"); }} />
            </label>
            {url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 8, border: "1px solid #262626" }} />
            )}
          </div>
        ) : (
          <>
            <div><label style={sx(LABEL)}>Reel / видео линк (Instagram, YouTube, TikTok)</label><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" style={sx(INPUT)} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <label style={sx(GHOST + "display:inline-block;")}>
                {uploading ? "Ачаалж байна…" : "Thumbnail зураг (сонголт)"}
                <input type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(file, "thumb"); }} />
              </label>
              {thumb && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb} alt="" style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 8, border: "1px solid #262626" }} />
              )}
            </div>
          </>
        )}

        <div><label style={sx(LABEL)}>Гарчиг (сонголт)</label><input value={caption} onChange={(e) => setCaption(e.target.value)} style={sx(INPUT)} /></div>
        <button onClick={add} disabled={busy} style={sx(BTN + (busy ? "opacity:.6;" : "") + "align-self:flex-start;")}>{busy ? "Нэмж байна…" : "+ Ажил нэмэх"}</button>
      </div>
    </div>
  );
}
