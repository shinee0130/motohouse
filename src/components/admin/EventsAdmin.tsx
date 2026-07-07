"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { type EventItem } from "@/lib/data";
import { getEvents, getParticipants, type Participant } from "@/lib/queries";
import { createEvent, updateEvent, deleteEvent, uploadEvent } from "@/lib/admin";

const INPUT = "background:#050505;border:1px solid #262626;border-radius:9px;padding:11px 13px;color:#fff;font:400 14px Roboto;outline:none;width:100%;";
const LABEL = "font:600 11px Montserrat;letter-spacing:.04em;color:#A3A3A3;margin-bottom:6px;display:block;";
const BTN = "background:#E10613;color:#fff;font:700 13px Montserrat;padding:11px 18px;border:none;border-radius:9px;cursor:pointer;";

const isGiveaway = (t: string) => t.toUpperCase().includes("GIVEAWAY");

type Form = { type: string; title: string; status: string; date: string; prize: string; image: string; description: string; winner: string; titleEn: string; descriptionEn: string; prizeEn: string };
function toForm(e: EventItem): Form {
  return { type: e.type, title: e.title, status: e.status, date: e.date, prize: e.prize, image: e.image ?? "", description: e.description ?? "", winner: e.winner ?? "", titleEn: e.titleEn ?? "", descriptionEn: e.descriptionEn ?? "", prizeEn: e.prizeEn ?? "" };
}

export function EventsAdmin({ mode }: { mode: "events" | "giveaway" }) {
  const gv = mode === "giveaway";
  const heading = gv ? "Giveaway" : "Events";
  const newLabel = gv ? "+ Шинэ Giveaway" : "+ Шинэ Event";
  const empty: Form = { type: gv ? "GIVEAWAY" : "RACE", title: "", status: "Upcoming", date: "", prize: "", image: "", description: "", winner: "", titleEn: "", descriptionEn: "", prizeEn: "" };

  const [flang, setFlang] = useState<"mn" | "en">("mn");
  const [list, setList] = useState<EventItem[]>([]);
  const [editing, setEditing] = useState<number | null | "new">(null);
  const [f, setF] = useState<Form>(empty);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState<EventItem | null>(null);
  const [parts, setParts] = useState<Participant[]>([]);

  const EN_KEY = { title: "titleEn", description: "descriptionEn", prize: "prizeEn" } as const;
  function bind(field: "title" | "description" | "prize") {
    const key = (flang === "en" ? EN_KEY[field] : field) as keyof Form;
    return {
      value: f[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [key]: e.target.value }),
    };
  }

  async function refresh() {
    const all = await getEvents();
    setList(all.filter((e) => (gv ? isGiveaway(e.type) : !isGiveaway(e.type))));
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [mode]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.title.trim()) return;
    setBusy(true);
    try {
      if (editing === "new") await createEvent(f);
      else if (typeof editing === "number") await updateEvent(editing, f);
      await refresh();
      setEditing(null);
    } finally { setBusy(false); }
  }
  async function del(id: number) {
    if (!confirm(`Энэ ${gv ? "Giveaway" : "Event"}-ийг устгах уу?`)) return;
    await deleteEvent(id);
    await refresh();
  }
  async function onUpload(file: File) {
    setUploading(true);
    try { const url = await uploadEvent(file); setF((p) => ({ ...p, image: url })); }
    catch (err) { alert("Зураг оруулахад алдаа гарлаа: " + (err instanceof Error ? err.message : String(err))); }
    finally { setUploading(false); }
  }
  async function openParts(e: EventItem) {
    setViewing(e);
    setParts(await getParticipants(e.id));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={sx("font:700 18px Montserrat;color:#fff;")}>{heading} ({list.length})</div>
        {editing === null && <button onClick={() => { setF(empty); setEditing("new"); }} style={sx(BTN)}>{newLabel}</button>}
      </div>

      {editing !== null && (
        <form onSubmit={save} style={sx("background:#0e0e10;border:1px solid #262626;border-radius:14px;padding:20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;align-items:end;")}>
          <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
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
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={sx("position:relative;width:160px;height:100px;border-radius:10px;overflow:hidden;border:1px solid #262626;background:#050505;flex:none;")}>
              {f.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.image} alt="" style={sx("width:100%;height:100%;object-fit:cover;")} />
              ) : (
                <div style={sx("width:100%;height:100%;display:flex;align-items:center;justify-content:center;font:500 11px Roboto;color:#555;")}>Poster алга</div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={sx(LABEL)}>Poster зураг</label>
              <label style={sx("background:#1a1a1d;border:1px solid #333;color:#C8C8C8;font:600 12px Montserrat;padding:9px 14px;border-radius:8px;cursor:pointer;display:inline-block;")}>
                {uploading ? "Ачаалж байна…" : "Зураг сонгох"}
                <input type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpload(file); }} />
              </label>
              {f.image && <button type="button" onClick={() => setF({ ...f, image: "" })} style={sx("background:none;border:none;color:#ef4444;font:600 12px Montserrat;cursor:pointer;text-align:left;")}>Зураг устгах</button>}
              <div style={sx("font:400 11px Roboto;color:#6b7280;")}>Санал болгох: 1080×1350 (4:5) эсвэл 1080×1080 · JPG/PNG · &lt; 500KB</div>
            </div>
          </div>

          <div><label style={sx(LABEL)}>Төрөл</label><input value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} placeholder={gv ? "GIVEAWAY" : "RACE / RIDE / АЯЛАЛ"} style={sx(INPUT)} /></div>
          <div style={{ gridColumn: "1 / -1" }}><label style={sx(LABEL)}>Гарчиг * {flang === "en" && <span style={sx("color:#E10613;")}>(EN)</span>}</label><input {...bind("title")} style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>Төлөв</label>
            <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} style={sx(INPUT + "cursor:pointer;")}>
              {["Ongoing", "Upcoming", "Winner"].map((s) => <option key={s}>{s}</option>)}
            </select></div>
          <div><label style={sx(LABEL)}>Огноо</label><input value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} placeholder="2026.07.15" style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>Шагнал {flang === "en" && <span style={sx("color:#E10613;")}>(EN)</span>}</label><input {...bind("prize")} style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>Ялагч (Winner үед)</label><input value={f.winner} onChange={(e) => setF({ ...f, winner: e.target.value })} placeholder="@username" style={sx(INPUT)} /></div>
          <div style={{ gridColumn: "1 / -1" }}><label style={sx(LABEL)}>Дэлгэрэнгүй {flang === "en" && <span style={sx("color:#E10613;")}>(EN)</span>}</label><textarea {...bind("description")} rows={4} style={sx(INPUT + "resize:vertical;font:400 14px Roboto;")} /></div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={busy} style={sx(BTN + (busy ? "opacity:.6;" : ""))}>{busy ? "…" : "Хадгалах"}</button>
            <button type="button" onClick={() => setEditing(null)} style={sx("background:none;border:1px solid #333;color:#A3A3A3;font:600 13px Montserrat;padding:11px 18px;border-radius:9px;cursor:pointer;")}>Болих</button>
          </div>
        </form>
      )}

      <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
        {list.map((e) => (
          <div key={e.id} style={sx("display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 18px;border-bottom:1px solid #1c1c1f;")}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 200 }}>
              <div style={sx("width:56px;height:56px;border-radius:9px;overflow:hidden;border:1px solid #262626;background:#050505;flex:none;")}>
                {e.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.image} alt="" style={sx("width:100%;height:100%;object-fit:cover;")} />
                ) : (
                  <div style={sx("width:100%;height:100%;display:flex;align-items:center;justify-content:center;font:700 18px Montserrat;color:#333;")}>★</div>
                )}
              </div>
              <div>
                <div style={sx("font:500 10px 'JetBrains Mono';letter-spacing:.12em;color:#E10613;")}>{e.type}</div>
                <div style={sx("font:700 15px Montserrat;color:#fff;margin-top:2px;")}>{e.title}</div>
                <div style={sx("font:400 12px 'JetBrains Mono';color:#8A8F98;margin-top:3px;")}>{e.date} · {e.prize}{e.winner ? ` · 🏆 ${e.winner}` : ""}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={sx("font:700 11px Montserrat;padding:5px 10px;border-radius:6px;color:#A3A3A3;background:#1a1a1d;border:1px solid #333;")}>{e.status}</span>
              <button onClick={() => openParts(e)} style={sx("background:none;border:1px solid #333;color:#C8C8C8;font:600 12px Montserrat;padding:7px 12px;border-radius:8px;cursor:pointer;")}>Оролцогчид</button>
              <button onClick={() => { setF(toForm(e)); setEditing(e.id); }} style={sx("background:none;border:1px solid #333;color:#C8C8C8;font:600 12px Montserrat;padding:7px 12px;border-radius:8px;cursor:pointer;")}>Засах</button>
              <button onClick={() => del(e.id)} style={sx("background:none;border:1px solid #333;color:#ef4444;font:600 12px Montserrat;padding:7px 12px;border-radius:8px;cursor:pointer;")}>Устгах</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Одоогоор {gv ? "Giveaway" : "Event"} алга.</div>}
      </div>

      {viewing && (
        <div onClick={() => setViewing(null)} style={sx("position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:50;display:flex;align-items:center;justify-content:center;padding:20px;")}>
          <div onClick={(ev) => ev.stopPropagation()} style={sx("background:#111113;border:1px solid #262626;border-radius:16px;padding:24px;width:100%;max-width:480px;max-height:80vh;overflow:auto;")}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={sx("font:700 17px Montserrat;color:#fff;")}>Оролцогчид ({parts.length})</div>
              <button onClick={() => setViewing(null)} style={sx("background:none;border:none;color:#8A8F98;font:700 20px Montserrat;cursor:pointer;")}>×</button>
            </div>
            <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-bottom:16px;")}>{viewing.title}</div>
            {parts.length === 0 ? (
              <div style={sx("font:400 13px Roboto;color:#8A8F98;padding:20px 0;text-align:center;")}>Одоогоор оролцогч алга.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {parts.map((p, i) => (
                  <div key={p.user_phone} style={sx("display:flex;align-items:center;gap:12px;background:#0B0B0D;border:1px solid #1c1c1f;border-radius:10px;padding:10px 14px;")}>
                    <span style={sx("font:700 12px 'JetBrains Mono';color:#555;width:20px;")}>{i + 1}</span>
                    <span style={sx("width:30px;height:30px;border-radius:50%;background:#E10613;color:#fff;display:flex;align-items:center;justify-content:center;font:800 12px Montserrat;flex:none;")}>{(p.name || "U").trim().charAt(0).toUpperCase()}</span>
                    <div>
                      <div style={sx("font:600 14px Montserrat;color:#fff;")}>{p.name || "—"}</div>
                      <div style={sx("font:400 12px 'JetBrains Mono';color:#8A8F98;")}>{p.user_phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
