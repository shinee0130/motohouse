"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { type EventItem } from "@/lib/data";
import { getEvents } from "@/lib/queries";
import { createEvent, updateEvent, deleteEvent } from "@/lib/admin";

const INPUT = "background:#050505;border:1px solid #262626;border-radius:9px;padding:11px 13px;color:#fff;font:400 14px Roboto;outline:none;width:100%;";
const LABEL = "font:600 11px Montserrat;letter-spacing:.04em;color:#A3A3A3;margin-bottom:6px;display:block;";
const BTN = "background:#E10613;color:#fff;font:700 13px Montserrat;padding:11px 18px;border:none;border-radius:9px;cursor:pointer;";

type Form = { type: string; title: string; status: string; date: string; prize: string };
const empty: Form = { type: "GIVEAWAY", title: "", status: "Upcoming", date: "", prize: "" };
function toForm(e: EventItem): Form { return { type: e.type, title: e.title, status: e.status, date: e.date, prize: e.prize }; }

export default function AdminEvents() {
  const [list, setList] = useState<EventItem[]>([]);
  const [editing, setEditing] = useState<number | null | "new">(null);
  const [f, setF] = useState<Form>(empty);
  const [busy, setBusy] = useState(false);

  async function refresh() { setList(await getEvents()); }
  useEffect(() => { refresh(); }, []);

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
    if (!confirm("Энэ эвентийг устгах уу?")) return;
    await deleteEvent(id);
    await refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={sx("font:700 18px Montserrat;color:#fff;")}>Events & Giveaway ({list.length})</div>
        {editing === null && <button onClick={() => { setF(empty); setEditing("new"); }} style={sx(BTN)}>+ Шинэ эвент</button>}
      </div>

      {editing !== null && (
        <form onSubmit={save} style={sx("background:#0e0e10;border:1px solid #262626;border-radius:14px;padding:20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;align-items:end;")}>
          <div><label style={sx(LABEL)}>Төрөл</label><input value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} placeholder="GIVEAWAY / RACE" style={sx(INPUT)} /></div>
          <div style={{ gridColumn: "1 / -1" }}><label style={sx(LABEL)}>Гарчиг *</label><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>Төлөв</label>
            <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} style={sx(INPUT + "cursor:pointer;")}>
              {["Ongoing", "Upcoming", "Winner"].map((s) => <option key={s}>{s}</option>)}
            </select></div>
          <div><label style={sx(LABEL)}>Огноо</label><input value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} placeholder="2026.07.15" style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>Шагнал</label><input value={f.prize} onChange={(e) => setF({ ...f, prize: e.target.value })} style={sx(INPUT)} /></div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={busy} style={sx(BTN + (busy ? "opacity:.6;" : ""))}>{busy ? "…" : "Хадгалах"}</button>
            <button type="button" onClick={() => setEditing(null)} style={sx("background:none;border:1px solid #333;color:#A3A3A3;font:600 13px Montserrat;padding:11px 18px;border-radius:9px;cursor:pointer;")}>Болих</button>
          </div>
        </form>
      )}

      <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
        {list.map((e) => (
          <div key={e.id} style={sx("display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 18px;border-bottom:1px solid #1c1c1f;")}>
            <div style={{ minWidth: 160 }}>
              <div style={sx("font:500 10px 'JetBrains Mono';letter-spacing:.12em;color:#E10613;")}>{e.type}</div>
              <div style={sx("font:700 15px Montserrat;color:#fff;margin-top:2px;")}>{e.title}</div>
              <div style={sx("font:400 12px 'JetBrains Mono';color:#8A8F98;margin-top:3px;")}>{e.date} · {e.prize}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={sx("font:700 11px Montserrat;padding:5px 10px;border-radius:6px;color:#A3A3A3;background:#1a1a1d;border:1px solid #333;")}>{e.status}</span>
              <button onClick={() => { setF(toForm(e)); setEditing(e.id); }} style={sx("background:none;border:1px solid #333;color:#C8C8C8;font:600 12px Montserrat;padding:7px 12px;border-radius:8px;cursor:pointer;")}>Засах</button>
              <button onClick={() => del(e.id)} style={sx("background:none;border:1px solid #333;color:#ef4444;font:600 12px Montserrat;padding:7px 12px;border-radius:8px;cursor:pointer;")}>Устгах</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Ачаалж байна…</div>}
      </div>
    </div>
  );
}
