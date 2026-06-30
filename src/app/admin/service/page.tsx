"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { getBookings, updateBookingStatus, type Booking } from "@/lib/admin";

const STATUSES = ["Шинэ", "Баталгаажсан", "Дууссан", "Цуцлагдсан"];

function badge(status: string): string {
  const base = "font:700 11px Montserrat;letter-spacing:.04em;padding:5px 11px;border-radius:6px;display:inline-block;";
  if (status === "Баталгаажсан") return base + "color:#fff;background:#E10613;";
  if (status === "Дууссан") return base + "color:#22c55e;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.35);";
  if (status === "Цуцлагдсан") return base + "color:#ef4444;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.35);";
  return base + "color:#A3A3A3;background:#1a1a1d;border:1px solid #333;";
}

export default function AdminService() {
  const [list, setList] = useState<Booking[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function refresh() { setList(await getBookings()); setLoaded(true); }
  useEffect(() => { refresh(); }, []);

  async function changeStatus(id: number, status: string) {
    setList((l) => l.map((b) => (b.id === id ? { ...b, status } : b)));
    await updateBookingStatus(id, status);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={sx("font:700 18px Montserrat;color:#fff;")}>Засварын цаг захиалга ({list.length})</div>

      <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
        {list.map((b) => (
          <div key={b.id} style={sx("display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:16px 18px;border-bottom:1px solid #1c1c1f;")}>
            <div style={{ minWidth: 200 }}>
              <div style={sx("font:700 15px Montserrat;color:#fff;")}>{b.service_type}</div>
              <div style={sx("font:600 13px Roboto;color:#E10613;margin-top:3px;")}>📅 {b.booking_date} · {b.booking_time}</div>
              <div style={sx("font:400 12px 'JetBrains Mono';color:#8A8F98;margin-top:4px;")}>
                {b.name} · +976 {b.phone}{b.moto_model ? ` · ${b.moto_model}` : ""}
              </div>
              {b.note && <div style={sx("font:400 12px Roboto;color:#A3A3A3;margin-top:4px;")}>“{b.note}”</div>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={sx(badge(b.status))}>{b.status}</span>
              <select
                value={b.status}
                onChange={(e) => changeStatus(b.id, e.target.value)}
                style={sx("background:#050505;border:1px solid #262626;border-radius:8px;padding:8px 10px;color:#fff;font:500 12px Roboto;cursor:pointer;outline:none;")}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        ))}
        {loaded && list.length === 0 && <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Захиалга алга.</div>}
        {!loaded && <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Ачаалж байна…</div>}
      </div>
    </div>
  );
}
