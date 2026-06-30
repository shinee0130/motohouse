"use client";

import { useEffect, useMemo, useState } from "react";
import { sx } from "@/lib/sx";
import { getBookings, updateBookingStatus, type Booking } from "@/lib/admin";

const STATUSES = ["Шинэ", "Баталгаажсан", "Дууссан", "Цуцлагдсан"];
const TIMES = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

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
  const [today, setToday] = useState("");
  const [day, setDay] = useState<string>(""); // "" = бүгд, эсвэл ISO огноо

  async function refresh() { setList(await getBookings()); setLoaded(true); }
  useEffect(() => {
    const t = iso(new Date());
    setToday(t);
    setDay(t); // анхдагчаар өнөөдрийг харуулна
    refresh();
  }, []);

  async function changeStatus(id: number, status: string) {
    setList((l) => l.map((b) => (b.id === id ? { ...b, status } : b)));
    await updateBookingStatus(id, status);
  }

  // тухайн өдрийн (эсвэл бүх) захиалга
  const shown = useMemo(() => {
    const l = day ? list.filter((b) => b.booking_date === day) : list;
    return [...l].sort((a, b) => (a.booking_date + a.booking_time).localeCompare(b.booking_date + b.booking_time));
  }, [list, day]);

  // тухайн өдрийн цаг → захиалгууд
  const slotMap = useMemo(() => {
    const m: Record<string, Booking[]> = {};
    if (day) shown.forEach((b) => { (m[b.booking_time] ??= []).push(b); });
    return m;
  }, [shown, day]);

  const tomorrow = useMemo(() => { if (!today) return ""; const d = new Date(today); d.setDate(d.getDate() + 1); return iso(d); }, [today]);
  const bookedToday = list.filter((b) => b.booking_date === today && b.status !== "Цуцлагдсан").length;

  const dayLabel = day === today ? "Өнөөдөр" : day === tomorrow ? "Маргааш" : day || "Бүх өдөр";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={sx("font:700 18px Montserrat;color:#fff;")}>Засварын цаг захиалга</div>
        <div style={sx("font:600 12px Montserrat;color:#E10613;")}>Өнөөдөр захиалагдсан: {bookedToday}</div>
      </div>

      {/* өдрийн шүүлтүүр */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setDay(today)} style={sx(`cursor:pointer;font:700 12px Montserrat;padding:8px 16px;border-radius:999px;${day === today ? "background:#E10613;border:1px solid #E10613;color:#fff;" : "background:#111113;border:1px solid #333;color:#C8C8C8;"}`)}>Өнөөдөр</button>
        <button onClick={() => setDay(tomorrow)} style={sx(`cursor:pointer;font:700 12px Montserrat;padding:8px 16px;border-radius:999px;${day === tomorrow ? "background:#E10613;border:1px solid #E10613;color:#fff;" : "background:#111113;border:1px solid #333;color:#C8C8C8;"}`)}>Маргааш</button>
        <button onClick={() => setDay("")} style={sx(`cursor:pointer;font:700 12px Montserrat;padding:8px 16px;border-radius:999px;${day === "" ? "background:#E10613;border:1px solid #E10613;color:#fff;" : "background:#111113;border:1px solid #333;color:#C8C8C8;"}`)}>Бүгд ({list.length})</button>
        <input type="date" value={day} onChange={(e) => setDay(e.target.value)}
          style={sx("background:#050505;border:1px solid #262626;border-radius:9px;padding:8px 11px;color:#fff;font:500 12px Roboto;outline:none;cursor:pointer;")} />
      </div>

      {/* тухайн өдрийн цагийн хуваарь */}
      {day && (
        <div style={sx("background:#0e0e10;border:1px solid #262626;border-radius:14px;padding:18px;")}>
          <div style={sx("font:700 14px Montserrat;color:#fff;margin-bottom:14px;")}>{dayLabel} — цагийн хуваарь</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10 }}>
            {TIMES.map((t) => {
              const bs = (slotMap[t] || []).filter((b) => b.status !== "Цуцлагдсан");
              const booked = bs.length > 0;
              return (
                <div key={t} style={sx(`border-radius:11px;padding:12px 13px;border:1px solid ${booked ? "#E10613" : "#222"};background:${booked ? "rgba(225,6,19,.08)" : "#050505"};`)}>
                  <div style={sx(`font:700 14px Montserrat;${booked ? "color:#fff;" : "color:#5b5b60;"}`)}>{t}</div>
                  {booked ? (
                    bs.map((b) => (
                      <div key={b.id} style={{ marginTop: 6 }}>
                        <div style={sx("font:600 12px Roboto;color:#E10613;")}>{b.name}</div>
                        <div style={sx("font:400 10px 'JetBrains Mono';color:#8A8F98;")}>{b.service_type}</div>
                      </div>
                    ))
                  ) : (
                    <div style={sx("font:500 11px Roboto;color:#5b5b60;margin-top:6px;")}>Сул</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* дэлгэрэнгүй жагсаалт */}
      <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
        {shown.map((b) => (
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
        {loaded && shown.length === 0 && <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>{day ? `${dayLabel} — захиалга алга.` : "Захиалга алга."}</div>}
        {!loaded && <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Ачаалж байна…</div>}
      </div>
    </div>
  );
}
