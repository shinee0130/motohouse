"use client";

import { useRef, useState } from "react";
import { sx } from "@/lib/ui/sx";
import type { PhotographerWork } from "@/lib/db/queries";
import { addPhotographerWork, deletePhotographerWork, uploadPhotographerImage } from "@/lib/db/admin";
import { useConfirm, useAlert } from "@/lib/ui/confirm";

const INPUT = "background:#050505;border:1px solid #262626;border-radius:9px;padding:11px 13px;color:#fff;font:400 14px Roboto;outline:none;width:100%;";
const LABEL = "font:600 11px Montserrat;letter-spacing:.04em;color:#A3A3A3;margin-bottom:6px;display:block;";
const BTN = "background:#E10613;color:#fff;font:700 13px Montserrat;padding:11px 18px;border:none;border-radius:9px;cursor:pointer;";
const GHOST = "background:#111113;color:#C8C8C8;font:700 13px Montserrat;padding:11px 18px;border:1px solid #333;border-radius:9px;cursor:pointer;";

// Зурагчны портфолио (ажлууд) удирдлага — admin ба studio-д хоёуланд ашиглана.
export function WorksManager({ photographerId, works, onChange }: { photographerId: number; works: PhotographerWork[]; onChange: () => Promise<void> }) {
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
