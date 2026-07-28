"use client";

import { useState } from "react";
import { sx } from "@/lib/ui/sx";
import type { PhotographerWork } from "@/lib/db/queries";
import { addPhotographerWork, deletePhotographerWork, uploadPhotographerImage } from "@/lib/db/admin";
import { useConfirm, useAlert } from "@/lib/ui/confirm";

const BTN = "background:#E10613;color:#fff;font:700 13px Montserrat;padding:11px 18px;border:none;border-radius:9px;cursor:pointer;";
const MAX_VIDEO = 1024 * 1024 * 1024; // 1GB

type Pending = { kind: "photo" | "video"; url: string };
const isVideoUrl = (u: string) => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(u);

// Зурагчны портфолио. Зураг/видеогоо нэг товчоор (олон зэрэг) сонгоод, Хадгалах дарна.
export function WorksManager({ photographerId, works, onChange }: { photographerId: number; works: PhotographerWork[]; onChange: () => Promise<void> }) {
  const [pending, setPending] = useState<Pending[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const confirm = useConfirm();
  const alert = useAlert();

  // Файл сонгоход storage-д upload хийж, жагсаалтад нэмнэ (хараахан хадгалахгүй)
  async function stageFiles(files: FileList) {
    const arr = Array.from(files);
    const tooBig = arr.filter((f) => f.type.startsWith("video/") && f.size > MAX_VIDEO);
    if (tooBig.length) { await alert({ title: "Видео 1GB-аас бага байх ёстой.", message: tooBig.map((f) => f.name).join(", ") }); }
    const ok = arr.filter((f) => !(f.type.startsWith("video/") && f.size > MAX_VIDEO));
    if (!ok.length) return;

    setProgress({ done: 0, total: ok.length });
    try {
      const added: Pending[] = [];
      for (let i = 0; i < ok.length; i++) {
        const url = await uploadPhotographerImage(ok[i]);
        added.push({ kind: ok[i].type.startsWith("video/") || isVideoUrl(url) ? "video" : "photo", url });
        setProgress({ done: i + 1, total: ok.length });
      }
      setPending((p) => [...p, ...added]);
    } catch (e) { await alert({ title: "Upload алдаа: " + (e instanceof Error ? e.message : String(e)) }); }
    finally { setProgress(null); }
  }

  function removePending(i: number) { setPending((p) => p.filter((_, idx) => idx !== i)); }

  async function saveAll() {
    if (!pending.length) return;
    setSaving(true);
    try {
      for (let i = 0; i < pending.length; i++) {
        await addPhotographerWork({ photographerId, kind: pending[i].kind, url: pending[i].url, sort: works.length + i });
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

  const busy = !!progress;

  return (
    <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:16px;")}>
      <div style={sx("font:700 15px Montserrat;color:#fff;")}>Портфолио — ажлууд</div>

      {/* хадгалагдсан ажлууд */}
      {works.length > 0 && (
        <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;")}>
          {works.map((w) => (
            <div key={w.id} style={sx("position:relative;border-radius:10px;overflow:hidden;aspect-ratio:1;background:#0b0b0d;border:1px solid #262626;")}>
              {w.kind === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={w.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : w.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={w.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : isVideoUrl(w.url) ? (
                <video src={`${w.url}#t=1`} muted playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={sx("width:100%;height:100%;display:flex;align-items:center;justify-content:center;font:600 11px Roboto;color:#8A8F98;padding:8px;text-align:center;")}>{w.url.slice(0, 40)}</div>
              )}
              {w.kind === "video" && <div style={sx("position:absolute;top:6px;left:6px;font:700 9px Montserrat;color:#fff;background:rgba(225,6,19,.9);padding:2px 6px;border-radius:4px;")}>VIDEO</div>}
              <button type="button" onClick={() => del(w)} style={sx("position:absolute;top:5px;right:5px;width:22px;height:22px;border-radius:6px;background:rgba(0,0,0,.7);color:#fff;border:none;cursor:pointer;font:700 12px Montserrat;line-height:1;")}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* нэмэх — нэг товч, зураг+видео зэрэг */}
      <div style={sx("border-top:1px solid #1c1c1f;padding-top:16px;display:flex;flex-direction:column;gap:12px;")}>
        <label style={sx(BTN + "display:inline-block;align-self:flex-start;" + (busy ? "opacity:.6;pointer-events:none;" : ""))}>
          {busy ? `Ачаалж байна… (${progress!.done}/${progress!.total})` : "+ Зураг / Видео нэмэх"}
          <input type="file" accept="image/*,video/*" multiple hidden
            onChange={(e) => { const fs = e.target.files; if (fs && fs.length) stageFiles(fs); e.target.value = ""; }} />
        </label>
        <div style={sx("font:400 11px Roboto;color:#8A8F98;")}>Зураг, видеогоо нэг дор олноор сонгож болно (видео 1GB хүртэл). Доор нэмэгдээд, “Хадгалах” дарахад портфолиод орно.</div>

        {/* хадгалахад бэлэн */}
        {pending.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={sx("font:600 12px Montserrat;color:#C8C8C8;")}>Хадгалахад бэлэн ({pending.length})</div>
            <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;")}>
              {pending.map((p, i) => (
                <div key={i} style={sx("position:relative;border-radius:8px;overflow:hidden;aspect-ratio:1;background:#0b0b0d;border:1px solid #333;")}>
                  {p.kind === "photo" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <video src={`${p.url}#t=1`} muted playsInline preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
