"use client";

import { useState } from "react";
import { sx } from "@/lib/sx";
import { useI18n } from "@/lib/i18n";

const MONTHS_MN = ["1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар", "7-р сар", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WD_MN = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"]; // Даваа эхэлнэ
const WD_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function Calendar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { lang } = useI18n();
  const MONTHS = lang === "en" ? MONTHS_EN : MONTHS_MN;
  const WD = lang === "en" ? WD_EN : WD_MN;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const year = view.getFullYear();
  const month = view.getMonth();
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Даваа = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  function move(delta: number) {
    setView(new Date(year, month + delta, 1));
  }

  return (
    <div style={sx("background:#050505;border:1px solid #262626;border-radius:12px;padding:14px;")}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button type="button" onClick={() => move(-1)} style={sx("width:32px;height:32px;border-radius:8px;background:#111113;border:1px solid #262626;color:#fff;cursor:pointer;")}>‹</button>
        <div style={sx("font:700 14px Montserrat;color:#fff;")}>{year} · {MONTHS[month]}</div>
        <button type="button" onClick={() => move(1)} style={sx("width:32px;height:32px;border-radius:8px;background:#111113;border:1px solid #262626;color:#fff;cursor:pointer;")}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 }}>
        {WD.map((w) => (
          <div key={w} style={sx("text-align:center;font:600 11px Montserrat;color:#8A8F98;padding:4px 0;")}>{w}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const date = new Date(year, month, d);
          const str = ymd(date);
          const past = date < today;
          const selected = str === value;
          return (
            <button
              key={i}
              type="button"
              disabled={past}
              onClick={() => onChange(str)}
              style={sx(
                `aspect-ratio:1;border-radius:8px;font:600 13px Montserrat;cursor:${past ? "not-allowed" : "pointer"};border:1px solid ${selected ? "#E10613" : "transparent"};background:${selected ? "#E10613" : "transparent"};color:${selected ? "#fff" : past ? "#3a3a3f" : "#C8C8C8"};`,
              )}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
