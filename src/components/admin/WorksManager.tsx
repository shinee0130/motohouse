"use client";

import { useState } from "react";
import { sx } from "@/lib/ui/sx";
import type { PhotographerWork } from "@/lib/db/queries";
import { addPhotographerWork, deletePhotographerWork, uploadPhotographerImage } from "@/lib/db/admin";
import { useConfirm, useAlert } from "@/lib/ui/confirm";

const INPUT = "background:#050505;border:1px solid #262626;border-radius:9px;padding:11px 13px;color:#fff;font:400 14px Roboto;outline:none;width:100%;";
const LABEL = "font:600 11px Montserrat;letter-spacing:.04em;color:#A3A3A3;margin-bottom:6px;display:block;";
const BTN = "background:#E10613;color:#fff;font:700 13px Montserrat;padding:11px 18px;border:none;border-radius:9px;cursor:pointer;";
const GHOST = "background:#111113;color:#C8C8C8;font:700 13px Montserrat;padding:11px 18px;border:1px solid #333;border-radius:9px;cursor:pointer;";

type Pending = { kind: "photo" | "video"; url: string; thumb?: string; caption?: string };

// Зурагчны портфолио (ажлууд) удирдлага. Зураг/reel-ээ сонгож жагсаалтад нэмээд,
// дараа нь ХАДГАЛАХ товчоор нэг дор хадгална. admin ба studio-д хоёуланд.
export function WorksManager({ photographerId, works, onChange }: { photographerId: number; works: PhotographerWork[]; onChange: () => Promise<void> }) {
  const [kind, setKind] = useState<"photo" | "video">("photo");
  const [vurl, setVurl] = useState(""); // upload хийсэн видео файлын URL
  const [vthumb, setVthumb] = useState("");
  const [vcaption, setVcaption] = useState("");
  const [pending, setPending] = useState<Pending[]>([]);
  const [uploading, setUploading] = useState(false);
  const [vidUploading, setVidUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const confirm = useConfirm();
  const alert = useAlert();

  // Зураг сонгоход storage-д upload хийж, ЖАГСААЛТАД нэмнэ (хараахан хадгалахгүй)
  async function stagePhotos(files: FileList) {
    const arr = Array.from(files);
    setUploading(true);
    try {
      const added: Pending[] = [];
      for (const f of arr) added.push({ kind: "photo", url: await uploadPhotographerImage(f) });
      setPending((p) => [...p, ...added]);
    } catch (e) { await alert({ title: "Upload алдаа: " + (e instanceof Error ? e.message : String(e)) }); }
    finally { setUploading(false); }
  }

  async function stageThumb(file: File) {
    setUploading(true);
    try { setVthumb(await uploadPhotographerImage(file)); }
    catch (e) { await alert({ title: "Upload алдаа: " + (e instanceof Error ? e.message : String(e)) }); }
    finally { setUploading(false); }
  }

  // Видео файл (mp4) storage-д upload хийж, URL-ыг барина
  async function uploadVideoFile(file: File) {
    if (file.size > 100 * 1024 * 1024) { await alert({ title: "Видео 100MB-аас бага байх ёстой." }); return; }
    setVidUploading(true);
    try { setVurl(await uploadPhotographerImage(file)); }
    catch (e) { await alert({ title: "Видео upload алдаа: " + (e instanceof Error ? e.message : String(e)) }); }
    finally { setVidUploading(false); }
  }

  function stageVideo() {
    if (!vurl.trim()) return;
    setPending((p) => [...p, { kind: "video", url: vurl.trim(), thumb: vthumb || undefined, caption: vcaption || undefined }]);
    setVurl(""); setVthumb(""); setVcaption("");
  }

  function removePending(i: number) { setPending((p) => p.filter((_, idx) => idx !== i)); }

  // ХАДГАЛАХ — жагсаалт дахь бүх ажлыг DB-д бичнэ
  async function saveAll() {
    if (!pending.length) return;
    setSaving(true);
    try {
      for (let i = 0; i < pending.length; i++) {
        const pw = pending[i];
        await addPhotographerWork({ photographerId, kind: pw.kind, url: pw.url, thumb: pw.thumb, caption: pw.caption, sort: works.length + i });
      }
      setPending([]);
      await onChange();
      await alert({ title: "Хадгалагдлаа" });
    } catch (e) { await alert({ title: "Алдаа: " + (e instanceof Error ? e.message : String(e)) }); }
    finally { setSaving(false); }
  }

  async function del(w: PhotographerWork) {
    if (!(await confirm({ title: "Энэ ажлыг устгах уу?", danger: true }))) return;
    await deletePhotographerWork(w.id); await onChange();
  }

  return (
    <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:14px;")}>
      <div style={sx("font:700 15px Montserrat;color:#fff;")}>Портфолио — ажлууд</div>

      {/* хадгалагдсан ажлууд */}
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
            <button key={k} type="button" onClick={() => setKind(k)} style={sx(`cursor:pointer;font:700 12px Montserrat;padding:8px 16px;border-radius:8px;${kind === k ? "background:#E10613;border:1px solid #E10613;color:#fff;" : "background:#050505;border:1px solid #333;color:#C8C8C8;"}`)}>
              {k === "photo" ? "Зураг" : "Reel / Видео"}
            </button>
          ))}
        </div>

        {kind === "photo" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={sx(GHOST + "display:inline-block;align-self:flex-start;" + (uploading ? "opacity:.6;pointer-events:none;" : ""))}>
              {uploading ? "Ачаалж байна…" : "Зураг сонгох (олон зэрэг болно)"}
              <input type="file" accept="image/*" multiple hidden onChange={(e) => { const fs = e.target.files; if (fs && fs.length) stagePhotos(fs); e.target.value = ""; }} />
            </label>
            <div style={sx("font:400 11px Roboto;color:#8A8F98;")}>Нэг дор олон зураг сонгож болно. Доор жагсаалтад нэмэгдэнэ — дараа нь “Хадгалах” дарна.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <label style={sx(GHOST + "display:inline-block;" + (vidUploading ? "opacity:.6;pointer-events:none;" : ""))}>
                {vidUploading ? "Ачаалж байна…" : vurl ? "Видео солих" : "Видео файл сонгох (mp4)"}
                <input type="file" accept="video/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadVideoFile(file); e.target.value = ""; }} />
              </label>
              {vurl && <span style={sx("font:600 12px Roboto;color:#22c55e;")}>✓ Видео бэлэн</span>}
            </div>
            <div style={sx("font:400 11px Roboto;color:#8A8F98;")}>Видео файлаа шууд оруулбал сайт дээр тоглоно (100MB хүртэл).</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <label style={sx(GHOST + "display:inline-block;")}>
                {uploading ? "Ачаалж байна…" : "Нүүр зураг / poster (сонголт)"}
                <input type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) stageThumb(file); }} />
              </label>
              {vthumb && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={vthumb} alt="" style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 8, border: "1px solid #262626" }} />
              )}
            </div>
            <div><label style={sx(LABEL)}>Гарчиг (сонголт)</label><input value={vcaption} onChange={(e) => setVcaption(e.target.value)} style={sx(INPUT)} /></div>
            <button type="button" onClick={stageVideo} disabled={!vurl} style={sx(GHOST + "align-self:flex-start;" + (!vurl ? "opacity:.5;" : ""))}>+ Жагсаалтад нэмэх</button>
          </div>
        )}

        {/* жагсаалт (хадгалахаас өмнө) */}
        {pending.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={sx("font:600 12px Montserrat;color:#C8C8C8;")}>Хадгалахад бэлэн ({pending.length})</div>
            <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;")}>
              {pending.map((p, i) => (
                <div key={i} style={sx("position:relative;border-radius:8px;overflow:hidden;aspect-ratio:1;background:#0b0b0d;border:1px solid #333;")}>
                  {(p.kind === "photo" ? p.url : p.thumb) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.kind === "photo" ? p.url : (p.thumb as string)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={sx("width:100%;height:100%;display:flex;align-items:center;justify-content:center;font:600 10px Roboto;color:#8A8F98;padding:6px;text-align:center;")}>{p.url.slice(0, 30)}</div>
                  )}
                  {p.kind === "video" && <div style={sx("position:absolute;top:4px;left:4px;font:700 8px Montserrat;color:#fff;background:rgba(225,6,19,.9);padding:1px 5px;border-radius:4px;")}>VIDEO</div>}
                  <button type="button" onClick={() => removePending(i)} style={sx("position:absolute;top:3px;right:3px;width:20px;height:20px;border-radius:5px;background:rgba(0,0,0,.7);color:#fff;border:none;cursor:pointer;font:700 11px Montserrat;line-height:1;")}>×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={saveAll} disabled={saving} style={sx(BTN + "align-self:flex-start;" + (saving ? "opacity:.6;" : ""))}>{saving ? "Хадгалж байна…" : `Хадгалах (${pending.length})`}</button>
          </div>
        )}
      </div>
    </div>
  );
}
