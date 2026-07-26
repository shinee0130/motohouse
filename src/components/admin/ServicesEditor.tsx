"use client";

import { sx } from "@/lib/ui/sx";
import type { PhotographerService } from "@/lib/db/queries";

const INPUT = "background:#050505;border:1px solid #262626;border-radius:9px;padding:10px 12px;color:#fff;font:400 14px Roboto;outline:none;width:100%;";
const LABEL = "font:600 11px Montserrat;letter-spacing:.04em;color:#A3A3A3;margin-bottom:6px;display:block;";

// Зурагчны үйлчилгээ + үнэ (₮) удирдах — admin ба studio-д хоёуланд.
export function ServicesEditor({ value, onChange }: { value: PhotographerService[]; onChange: (v: PhotographerService[]) => void }) {
  function update(i: number, patch: Partial<PhotographerService>) {
    onChange(value.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function add() { onChange([...value, { name: "", nameEn: "", price: undefined }]); }
  function remove(i: number) { onChange(value.filter((_, idx) => idx !== i)); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label style={sx(LABEL)}>Үйлчилгээ ба үнэ (₮)</label>
      {value.length === 0 && <div style={sx("font:400 12px Roboto;color:#8A8F98;")}>Үйлчилгээ нэмээгүй байна. Хоосон бол ерөнхий жагсаалт харагдана.</div>}
      {value.map((s, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 130px 34px", gap: 8, alignItems: "center" }}>
          <input value={s.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="Нэр (MN)" style={sx(INPUT)} />
          <input value={s.nameEn ?? ""} onChange={(e) => update(i, { nameEn: e.target.value })} placeholder="Name (EN)" style={sx(INPUT)} />
          <input type="number" inputMode="numeric" value={s.price ?? ""} onChange={(e) => update(i, { price: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder="Үнэ ₮" style={sx(INPUT)} />
          <button type="button" onClick={() => remove(i)} style={sx("width:34px;height:38px;border-radius:8px;background:transparent;color:#ef4444;border:1px solid rgba(239,68,68,.4);cursor:pointer;font:700 16px Montserrat;line-height:1;")}>×</button>
        </div>
      ))}
      <button type="button" onClick={add} style={sx("align-self:flex-start;background:#111113;color:#C8C8C8;font:700 12px Montserrat;padding:9px 16px;border:1px solid #333;border-radius:9px;cursor:pointer;")}>+ Үйлчилгээ нэмэх</button>
    </div>
  );
}
