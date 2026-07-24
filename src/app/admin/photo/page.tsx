"use client";

import { useEffect, useMemo, useState } from "react";
import { sx } from "@/lib/ui/sx";
import { Select } from "@/components/ui/Select";
import { getPhotoBookings, updatePhotoBookingStatus, type PhotoBooking } from "@/lib/db/admin";

const STATUSES = ["Шинэ", "Баталгаажсан", "Дууссан", "Цуцлагдсан"];

function badge(status: string): string {
  const base = "font:700 11px Montserrat;letter-spacing:.04em;padding:5px 11px;border-radius:6px;display:inline-block;";
  if (status === "Баталгаажсан") return base + "color:#fff;background:#E10613;";
  if (status === "Дууссан") return base + "color:#22c55e;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.35);";
  if (status === "Цуцлагдсан") return base + "color:#ef4444;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.35);";
  return base + "color:#A3A3A3;background:#1a1a1d;border:1px solid #333;";
}

export default function AdminPhoto() {
  const [list, setList] = useState<PhotoBooking[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState("Бүгд");

  async function refresh() { setList(await getPhotoBookings()); setLoaded(true); }
  useEffect(() => { refresh(); }, []);

  async function changeStatus(id: number, status: string) {
    setList((l) => l.map((b) => (b.id === id ? { ...b, status } : b)));
    await updatePhotoBookingStatus(id, status);
  }

  const shown = useMemo(() => (filter === "Бүгд" ? list : list.filter((b) => b.status === filter)), [list, filter]);
  const newCount = list.filter((b) => b.status === "Шинэ").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={sx("font:700 18px Montserrat;color:#fff;")}>Зураг авалт захиалга</div>
        <div style={sx("font:600 12px Montserrat;color:#E10613;")}>Шинэ: {newCount}</div>
      </div>

      {/* статусын шүүлтүүр */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["Бүгд", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            style={sx(`cursor:pointer;font:700 12px Montserrat;padding:8px 16px;border-radius:999px;${filter === s ? "background:#E10613;border:1px solid #E10613;color:#fff;" : "background:#111113;border:1px solid #333;color:#C8C8C8;"}`)}>
            {s}{s === "Бүгд" ? ` (${list.length})` : ""}
          </button>
        ))}
      </div>

      {/* жагсаалт */}
      <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
        {shown.map((b) => (
          <div key={b.id} style={sx("display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:16px 18px;border-bottom:1px solid #1c1c1f;")}>
            <div style={{ minWidth: 220 }}>
              <div style={sx("font:700 15px Montserrat;color:#fff;")}>
                📸 {b.photographer} <span style={sx("font:500 13px Roboto;color:#8A8F98;")}>· {b.service_type}</span>
              </div>
              <div style={sx("font:600 13px Roboto;color:#E10613;margin-top:3px;")}>📅 {b.booking_date} · {b.booking_time}</div>
              <div style={sx("font:400 12px 'JetBrains Mono';color:#8A8F98;margin-top:4px;")}>
                {b.name} · +976 {b.phone}{b.moto_model ? ` · ${b.moto_model}` : ""}
              </div>
              {b.note && <div style={sx("font:400 12px Roboto;color:#A3A3A3;margin-top:4px;")}>“{b.note}”</div>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={sx(badge(b.status))}>{b.status}</span>
              <Select value={b.status} onChange={(v) => changeStatus(b.id, v)} full bg="#050505" options={STATUSES.map((s) => ({ value: s, label: s }))} />
            </div>
          </div>
        ))}
        {loaded && shown.length === 0 && <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Захиалга алга.</div>}
        {!loaded && <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Ачаалж байна…</div>}
      </div>
    </div>
  );
}
