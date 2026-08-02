"use client";

import { useCallback, useEffect, useState } from "react";
import { sx } from "@/lib/ui/sx";
import { getEventMedia, type EventMedia } from "@/lib/db/queries";
import { addEventMedia, updateEventMedia, deleteEventMedia, uploadEventMedia } from "@/lib/db/admin";
import { useConfirm, useAlert } from "@/lib/ui/confirm";
import { useToast } from "@/lib/ui/toast";

// Уулзалт/Event-ийн зураг, бичлэгийн галерей. Олон файл нэг дор оруулна,
// чирж дараалал солино, тайлбар нэмнэ.
export function EventMediaManager({ eventId, title }: { eventId: number; title: string }) {
  const [list, setList] = useState<EventMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [drag, setDrag] = useState<number | null>(null);
  const confirm = useConfirm();
  const alert = useAlert();

  const refresh = useCallback(async () => setList(await getEventMedia(eventId)), [eventId]);
  useEffect(() => { void refresh(); }, [refresh]);

  const toast = useToast();

  async function onFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    const arr = Array.from(files);
    let done = 0;
    try {
      for (const file of arr) {
        setProgress(`${done + 1} / ${arr.length}`);
        const url = await uploadEventMedia(file);
        await addEventMedia({
          eventId,
          kind: file.type.startsWith("video/") ? "video" : "photo",
          url,
          sort: list.length + done,
        });
        done++;
      }
      await refresh();
      toast(`${done} файл амжилттай нэмэгдэж, сайт дээр шууд харагдаж байна.`);
    } catch (e) {
      await alert({
        title: "Файл оруулахад алдаа гарлаа",
        message: `${done} файл нэмэгдсэн. Алдаа: ${e instanceof Error ? e.message : String(e)}`,
        danger: true,
      });
      await refresh();
    } finally { setUploading(false); setProgress(""); }
  }

  async function remove(m: EventMedia) {
    const ok = await confirm({
      title: m.kind === "video" ? "Энэ бичлэгийг устгах уу?" : "Энэ зургийг устгах уу?",
      message: "Файл бүрмөсөн устна.", confirmLabel: "Устгах", danger: true,
    });
    if (!ok) return;
    try {
      await deleteEventMedia(m.id, m.url);
      await refresh();
      toast(m.kind === "video" ? "Бичлэг устгагдлаа" : "Зураг устгагдлаа");
    } catch (e) {
      await alert({ title: "Устгахад алдаа гарлаа", message: e instanceof Error ? e.message : String(e), danger: true });
    }
  }

  // Чирч дараалал солих — хулгана, хуруу хоёуланд (Pointer Events).
  function dragOver(e: React.PointerEvent) {
    if (drag === null) return;
    const cell = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-media-idx]");
    if (!cell) return;
    const to = Number(cell.getAttribute("data-media-idx"));
    if (Number.isNaN(to) || to === drag) return;
    setList((c) => {
      const a = [...c];
      const [moved] = a.splice(drag, 1);
      a.splice(to, 0, moved);
      return a;
    });
    setDrag(to);
  }
  async function commitOrder() {
    setDrag(null);
    // Одоогийн дарааллаар sort-ыг дахин бичнэ
    const changed = list.filter((m, i) => m.sort !== i);
    if (changed.length === 0) return;
    try {
      await Promise.all(list.map((m, i) => (m.sort === i ? null : updateEventMedia(m.id, { sort: i }))).filter(Boolean));
      await refresh();
      toast("Дараалал хадгалагдлаа");
    } catch (e) {
      await alert({ title: "Дараалал хадгалахад алдаа гарлаа", message: e instanceof Error ? e.message : String(e), danger: true });
      await refresh();
    }
  }

  return (
    <div style={sx("background:#0e0e10;border:1px solid #262626;border-radius:14px;padding:18px;margin-top:14px;")}>
      <div style={sx("font:700 14px Montserrat;color:#fff;")}>Зураг, бичлэг ({list.length})</div>
      <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:4px;line-height:1.6;")}>
        “{title.trim()}” уулзалтын галерей. Олон файлыг нэг дор сонгож болно.
        Чирж дараалал солино — эхний зураг нь жагсаалт дээр нүүр болно.
      </div>

      {list.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
          {list.map((m, i) => (
            <div key={m.id} data-media-idx={i} style={{ position: "relative", width: 96 }}>
              <div
                onPointerDown={(e) => { if (e.button !== 0) return; e.currentTarget.setPointerCapture(e.pointerId); setDrag(i); }}
                onPointerMove={dragOver}
                onPointerUp={commitOrder}
                onPointerCancel={() => setDrag(null)}
                style={{ position: "relative", cursor: drag === i ? "grabbing" : "grab", opacity: drag === i ? 0.45 : 1, touchAction: "none" }}
              >
                {m.kind === "video" ? (
                  <video src={`${m.url}#t=0.1`} muted playsInline preload="metadata"
                    style={sx("width:96px;height:96px;object-fit:cover;border-radius:8px;border:1px solid #333;background:#000;display:block;pointer-events:none;")} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt="" draggable={false}
                    style={sx("width:96px;height:96px;object-fit:cover;border-radius:8px;border:1px solid #333;background:#fff;display:block;pointer-events:none;")} />
                )}
                <span style={sx(`position:absolute;top:4px;left:4px;min-width:20px;height:20px;padding:0 5px;border-radius:6px;color:#fff;font:700 11px Montserrat;display:flex;align-items:center;justify-content:center;pointer-events:none;background:${i === 0 ? "#E10613" : "rgba(5,5,5,.78)"};`)}>
                  {i + 1}
                </span>
                {m.kind === "video" && (
                  <span style={sx("position:absolute;bottom:4px;right:4px;background:rgba(5,5,5,.78);color:#fff;font:700 10px Montserrat;padding:3px 6px;border-radius:5px;pointer-events:none;")}>▶ ВИДЕО</span>
                )}
              </div>
              <button type="button" onClick={() => remove(m)} title="Устгах"
                style={sx("position:absolute;top:-7px;right:-7px;width:22px;height:22px;border-radius:50%;background:#E10613;color:#fff;border:none;cursor:pointer;font:700 12px Montserrat;line-height:1;")}>×</button>
              <input
                defaultValue={m.caption ?? ""}
                placeholder="Тайлбар"
                onBlur={(e) => { if (e.target.value !== (m.caption ?? "")) void updateEventMedia(m.id, { caption: e.target.value }).then(refresh); }}
                style={sx("width:96px;margin-top:5px;background:#050505;border:1px solid #333;border-radius:7px;color:#C8C8C8;font:400 11px Roboto;padding:5px 6px;outline:none;")}
              />
            </div>
          ))}
        </div>
      )}

      <label style={sx(`display:inline-block;margin-top:14px;cursor:pointer;background:#1a1a1d;border:1px solid #333;color:#fff;font:600 12px Montserrat;padding:10px 16px;border-radius:9px;${uploading ? "opacity:.6;" : ""}`)}>
        {uploading ? `Хуулж байна… ${progress}` : "＋ Зураг / бичлэг нэмэх (олон)"}
        <input type="file" accept="image/*,video/*" multiple disabled={uploading}
          onChange={(e) => { void onFiles(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
      </label>
      <div style={sx("font:400 11px Roboto;color:#6b7280;margin-top:8px;")}>
        Зураг: JPG/PNG · Бичлэг: MP4. Том бичлэг удаан хуулагдана — 1–2 минутын дотор багтаавал зохимжтой.
      </div>
    </div>
  );
}
