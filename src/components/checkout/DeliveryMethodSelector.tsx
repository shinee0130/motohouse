"use client";

// Авах хэлбэр — Хүргэлтээр авах / Дэлгүүрээс очиж авах. Pickup үед салбарын хаяг+цаг харагдана.

import { sx } from "@/lib/sx";
import { useI18n } from "@/lib/i18n";
import type { DeliveryMethod } from "@/lib/checkout";

const STORE_MAP = "https://www.google.com/maps/search/?api=1&query=47.8993424,106.9309956";

export function DeliveryMethodSelector({ value, onChange }: { value: DeliveryMethod; onChange: (m: DeliveryMethod) => void }) {
  const { t } = useI18n();
  const opts: { key: DeliveryMethod; label: string; icon: string }[] = [
    { key: "delivery", label: t("Хүргэлтээр авах"), icon: "🚚" },
    { key: "pickup", label: t("Дэлгүүрээс очиж авах"), icon: "🏬" },
  ];
  return (
    <div>
      <div role="radiogroup" aria-label={t("Авах хэлбэр")} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {opts.map((o) => {
          const active = value === o.key;
          return (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.key)}
              style={sx(`display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-height:44px;padding:13px 14px;border-radius:12px;cursor:pointer;text-align:left;font:700 13px Montserrat;${active ? "background:rgba(225,6,19,.1);border:1.5px solid #E10613;color:#fff;" : "background:#0B0B0D;border:1.5px solid #262626;color:#C8C8C8;"}`)}
            >
              <span style={{ fontSize: 20 }} aria-hidden="true">{o.icon}</span>
              {o.label}
            </button>
          );
        })}
      </div>

      {value === "pickup" && (
        <div style={sx("margin-top:12px;background:#0B0B0D;border:1px solid #262626;border-radius:12px;padding:14px 15px;")}>
          <div style={sx("font:700 11px 'JetBrains Mono';letter-spacing:.1em;color:#E10613;text-transform:uppercase;margin-bottom:8px;")}>MOTO HOUSE</div>
          <div style={sx("font:500 13px Roboto;color:#D4D4D4;line-height:1.6;")}>
            {t("Улаанбаатар хот, Хан-Уул дүүрэг, 18-р хороо, Их Монгол Улсын гудамж, Uniqcenter, 00 тоот, 17013")}
          </div>
          <div style={sx("display:flex;align-items:center;gap:8px;margin-top:10px;font:600 12px Montserrat;color:#A3A3A3;")}>
            <span aria-hidden="true">🕒</span>{t("Даваа–Ням")} · 10:00 – 21:00
          </div>
          <a href={STORE_MAP} target="_blank" rel="noopener noreferrer"
            style={sx("display:inline-flex;align-items:center;gap:6px;margin-top:12px;font:700 12px Montserrat;color:#E10613;text-decoration:none;")}>
            📍 {t("Газрын зураг дээр харах")}
          </a>
        </div>
      )}
    </div>
  );
}
