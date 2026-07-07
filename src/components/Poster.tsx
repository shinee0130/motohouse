"use client";

import { useI18n } from "@/lib/i18n";

// Нүүрний full-width постер — EN хувилбар байвал EN горимд түүнийг, үгүй бол монгол постер (fallback).
// Аль аль нь байхгүй бол юу ч харуулахгүй (хэсэг нуугдана).
export function Poster({ mn, en }: { mn?: string; en?: string }) {
  const { loc } = useI18n();
  const src = loc(mn || "", en) || mn;
  if (!src) return null;
  return (
    <div style={{ marginTop: "clamp(44px,6vw,72px)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="MOTO HOUSE" style={{ width: "100%", height: "auto", display: "block" }} />
    </div>
  );
}
