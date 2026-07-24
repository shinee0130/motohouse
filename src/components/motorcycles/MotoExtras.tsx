"use client";

import { sx } from "@/lib/ui/sx";
import { useI18n } from "@/lib/i18n";

// Мото дэлгэрэнгүйн "Нэмэлт тоног" жагсаалт — EN байвал англиар (server component дотор ажиллана).
export function MotoExtras({ extras, extrasEn }: { extras: string[]; extrasEn?: string[] }) {
  const { loc } = useI18n();
  return (
    <>
      {loc(extras, extrasEn).map((x) => (
        <div key={x} style={sx("display:flex;align-items:center;gap:13px;background:#111113;border:1px solid #262626;border-radius:11px;padding:13px 16px;")}>
          <span style={sx("width:7px;height:7px;border-radius:50%;background:#E10613;flex-shrink:0;")} />
          <span style={sx("font:500 15px Roboto;color:#fff;")}>{x}</span>
        </div>
      ))}
    </>
  );
}
