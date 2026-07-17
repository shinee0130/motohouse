"use client";

// Захиалгын дүн + үндсэн CTA. Sticky байрлуулалтыг эцэг (CartBody) хийнэ.

import { sx } from "@/lib/sx";
import { Price } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";

interface Props {
  total: number;
  itemCount: number;
  ctaLabel: string;
  onCta: () => void;
  busy?: boolean;
  note?: string;
}

export function OrderSummary({ total, itemCount, ctaLabel, onCta, busy, note }: Props) {
  const { t } = useI18n();
  return (
    <div style={sx("padding:14px 0 16px;")}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <div style={sx("font:600 11px 'JetBrains Mono';letter-spacing:.12em;color:#8A8F98;")}>{t("НИЙТ ДҮН")}</div>
          <div style={sx("font:800 24px Montserrat;color:#E10613;margin-top:2px;")}><Price amount={total} /></div>
          <div style={sx("font:400 11px Roboto;color:#8A8F98;margin-top:2px;")}>{itemCount} {t("бараа")}</div>
        </div>
        <button
          onClick={onCta}
          disabled={busy}
          style={sx(`flex:1;min-width:180px;min-height:52px;background:#E10613;color:#fff;font:700 15px Montserrat;letter-spacing:.04em;padding:15px 24px;border:none;border-radius:12px;text-transform:uppercase;cursor:pointer;${busy ? "opacity:.6;" : ""}`)}
        >
          {ctaLabel}
        </button>
      </div>
      {note && <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:12px;")}>{note}</div>}
    </div>
  );
}
