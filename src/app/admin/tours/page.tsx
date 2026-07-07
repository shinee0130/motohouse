"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { fmt } from "@/lib/data";
import { getTours, getTourBookings, type Tour, type TourBooking } from "@/lib/queries";
import { createTour, updateTour, deleteTour, uploadTourImage, updateTourBookingStatus } from "@/lib/admin";

const INPUT = "background:#050505;border:1px solid #262626;border-radius:9px;padding:11px 13px;color:#fff;font:400 14px Roboto;outline:none;width:100%;";
const LABEL = "font:600 11px Montserrat;letter-spacing:.04em;color:#A3A3A3;margin-bottom:6px;display:block;";
const BTN = "background:#E10613;color:#fff;font:700 13px Montserrat;padding:11px 18px;border:none;border-radius:9px;cursor:pointer;";
const STATUSES = ["Нээлттэй", "Дүүрсэн", "Дууссан"];
const BK_STATUSES = ["Шинэ", "Баталгаажсан", "Цуцлагдсан"];

type Form = {
  title: string; description: string; region: string; image: string;
  durationDays: number; startDate: string; price: number; maxCapacity: number;
  rentalAvailable: boolean; rentalMoto: string; status: string; featured: boolean;
};
const empty: Form = {
  title: "", description: "", region: "", image: "", durationDays: 1, startDate: "",
  price: 0, maxCapacity: 10, rentalAvailable: true, rentalMoto: "", status: "Нээлттэй", featured: false,
};
function toForm(t: Tour): Form {
  return {
    title: t.title, description: t.description ?? "", region: t.region ?? "", image: t.image ?? "",
    durationDays: t.durationDays, startDate: t.startDate ?? "", price: t.price, maxCapacity: t.maxCapacity,
    rentalAvailable: t.rentalAvailable, rentalMoto: t.rentalMoto ?? "", status: t.status, featured: !!t.featured,
  };
}

export default function AdminTours() {
  const [list, setList] = useState<Tour[]>([]);
  const [bookings, setBookings] = useState<TourBooking[]>([]);
  const [editing, setEditing] = useState<number | null | "new">(null);
  const [f, setF] = useState<Form>(empty);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function refresh() {
    setList(await getTours());
    setBookings(await getTourBookings());
  }
  useEffect(() => { refresh(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.title.trim()) return;
    setBusy(true);
    try {
      const payload: Partial<Tour> = {
        title: f.title, description: f.description, region: f.region, image: f.image,
        durationDays: Number(f.durationDays) || 1, startDate: f.startDate, price: Number(f.price) || 0,
        maxCapacity: Number(f.maxCapacity) || 1, rentalAvailable: f.rentalAvailable,
        rentalMoto: f.rentalMoto, status: f.status, featured: f.featured,
      };
      if (editing === "new") await createTour(payload);
      else if (typeof editing === "number") await updateTour(editing, payload);
      await refresh();
      setEditing(null);
    } finally { setBusy(false); }
  }
  async function del(id: number) {
    if (!confirm("Энэ аяллыг устгах уу? (холбоотой захиалгууд ч устана)")) return;
    await deleteTour(id);
    await refresh();
  }
  async function onUpload(file: File) {
    setUploading(true);
    try { const url = await uploadTourImage(file); setF((p) => ({ ...p, image: url })); }
    catch (err) { alert("Зураг оруулахад алдаа: " + (err instanceof Error ? err.message : String(err))); }
    finally { setUploading(false); }
  }
  async function setBkStatus(id: string, status: string) {
    setBookings((l) => l.map((b) => (b.id === id ? { ...b, status } : b)));
    await updateTourBookingStatus(id, status);
    setList(await getTours()); // booked тоолуур шинэчлэгдэнэ
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* ==== Аяллууд ==== */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={sx("font:700 18px Montserrat;color:#fff;")}>Аялал ({list.length})</div>
        {editing === null && <button onClick={() => { setF(empty); setEditing("new"); }} style={sx(BTN)}>+ Шинэ аялал</button>}
      </div>

      {editing !== null && (
        <form onSubmit={save} style={sx("background:#0e0e10;border:1px solid #262626;border-radius:14px;padding:20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;align-items:end;")}>
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={sx("position:relative;width:150px;height:100px;border-radius:10px;overflow:hidden;border:1px solid #262626;background:#050505;flex:none;")}>
              {f.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.image} alt="" style={sx("width:100%;height:100%;object-fit:cover;")} />
              ) : <div style={sx("width:100%;height:100%;display:flex;align-items:center;justify-content:center;font:500 11px Roboto;color:#555;")}>Зураг алга</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={sx(LABEL)}>Зураг</label>
              <label style={sx("background:#1a1a1d;border:1px solid #333;color:#C8C8C8;font:600 12px Montserrat;padding:9px 14px;border-radius:8px;cursor:pointer;display:inline-block;")}>
                {uploading ? "Ачаалж байна…" : "Зураг сонгох"}
                <input type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) onUpload(file); }} />
              </label>
              <div style={sx("font:400 11px Roboto;color:#6b7280;")}>Санал болгох: 1200×800 (3:2) · &lt; 500KB</div>
            </div>
          </div>

          <div style={{ gridColumn: "1 / -1" }}><label style={sx(LABEL)}>Гарчиг *</label><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>Бүс / чиглэл</label><input value={f.region} onChange={(e) => setF({ ...f, region: e.target.value })} placeholder="Дундговь" style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>Эхлэх огноо</label><input value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} placeholder="2026.08.15" style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>Хугацаа (хоног)</label><input type="number" min={1} value={f.durationDays} onChange={(e) => setF({ ...f, durationDays: +e.target.value })} style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>1 хүний үнэ (₮)</label><input type="number" min={0} value={f.price} onChange={(e) => setF({ ...f, price: +e.target.value })} style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>Дээд хүний тоо</label><input type="number" min={1} value={f.maxCapacity} onChange={(e) => setF({ ...f, maxCapacity: +e.target.value })} style={sx(INPUT)} /></div>
          <div><label style={sx(LABEL)}>Төлөв</label>
            <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} style={sx(INPUT + "cursor:pointer;")}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 10 }}>
            <input id="rental" type="checkbox" checked={f.rentalAvailable} onChange={(e) => setF({ ...f, rentalAvailable: e.target.checked })} style={{ width: 18, height: 18, accentColor: "#E10613" }} />
            <label htmlFor="rental" style={sx("font:500 13px Roboto;color:#C8C8C8;cursor:pointer;")}>Түрээсийн мото санал болгох</label>
          </div>
          {f.rentalAvailable && <div><label style={sx(LABEL)}>Түрээсийн моделийн нэр</label><input value={f.rentalMoto} onChange={(e) => setF({ ...f, rentalMoto: e.target.value })} placeholder="Honda CB500X" style={sx(INPUT)} /></div>}
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 10 }}>
            <input id="feat" type="checkbox" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} style={{ width: 18, height: 18, accentColor: "#E10613" }} />
            <label htmlFor="feat" style={sx("font:500 13px Roboto;color:#C8C8C8;cursor:pointer;")}>Онцлох</label>
          </div>
          <div style={{ gridColumn: "1 / -1" }}><label style={sx(LABEL)}>Дэлгэрэнгүй</label><textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} rows={4} style={sx(INPUT + "resize:vertical;")} /></div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={busy} style={sx(BTN + (busy ? "opacity:.6;" : ""))}>{busy ? "…" : "Хадгалах"}</button>
            <button type="button" onClick={() => setEditing(null)} style={sx("background:none;border:1px solid #333;color:#A3A3A3;font:600 13px Montserrat;padding:11px 18px;border-radius:9px;cursor:pointer;")}>Болих</button>
          </div>
        </form>
      )}

      <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
        {list.map((tr) => (
          <div key={tr.id} style={sx("display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 18px;border-bottom:1px solid #1c1c1f;")}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 220 }}>
              <div style={sx("width:56px;height:56px;border-radius:9px;overflow:hidden;border:1px solid #262626;background:#050505;flex:none;")}>
                {tr.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={tr.image} alt="" style={sx("width:100%;height:100%;object-fit:cover;")} />
                ) : null}
              </div>
              <div>
                <div style={sx("font:700 15px Montserrat;color:#fff;")}>{tr.title}</div>
                <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:3px;")}>{tr.startDate || "—"} · {tr.durationDays} хоног · {tr.booked}/{tr.maxCapacity} хүн · {fmt(tr.price)}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={sx(`font:700 11px Montserrat;padding:5px 11px;border-radius:999px;${tr.status === "Нээлттэй" ? "color:#22c55e;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.35);" : "color:#8A8F98;background:#1a1a1d;border:1px solid #333;"}`)}>{tr.status}</span>
              <button onClick={() => { setF(toForm(tr)); setEditing(tr.id); }} style={sx("background:#1a1a1d;border:1px solid #333;color:#C8C8C8;font:600 12px Montserrat;padding:7px 12px;border-radius:8px;cursor:pointer;")}>Засах</button>
              <button onClick={() => del(tr.id)} style={sx("background:none;border:1px solid #333;color:#ef4444;font:600 12px Montserrat;padding:7px 12px;border-radius:8px;cursor:pointer;")}>Устгах</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <div style={sx("padding:26px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Аялал алга. Шинээр нэмээрэй.</div>}
      </div>

      {/* ==== Захиалгууд ==== */}
      <div style={sx("font:700 18px Montserrat;color:#fff;margin-top:8px;")}>Аяллын захиалга ({bookings.length})</div>
      <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
        {bookings.map((b) => (
          <div key={b.id} style={sx("display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 18px;border-bottom:1px solid #1c1c1f;")}>
            <div style={{ minWidth: 220 }}>
              <div style={sx("font:700 14px Montserrat;color:#fff;")}>{b.tourTitle || "Аялал"} <span style={sx("font:400 12px Roboto;color:#8A8F98;")}>· {b.people} хүн</span></div>
              <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:4px;")}>
                {b.name || "?"}{b.phone ? ` · ${b.phone}` : ""} · {b.motoChoice === "own" ? "Өөрийн" : "Түрээс"}{b.motoModel ? ` (${b.motoModel})` : ""}
              </div>
              {b.note && <div style={sx("font:400 12px Roboto;color:#6b7280;margin-top:3px;")}>“{b.note}”</div>}
              <div style={sx("font:400 11px 'JetBrains Mono';color:#6b7280;margin-top:3px;")}>{b.id} · {b.date}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={sx("font:800 15px Montserrat;color:#fff;")}>{fmt(b.total)}</span>
              <select value={b.status} onChange={(e) => setBkStatus(b.id, e.target.value)}
                style={sx("background:#050505;border:1px solid #262626;border-radius:8px;padding:8px 10px;color:#fff;font:500 12px Roboto;cursor:pointer;outline:none;")}>
                {BK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        ))}
        {bookings.length === 0 && <div style={sx("padding:26px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Захиалга алга.</div>}
      </div>
    </div>
  );
}
