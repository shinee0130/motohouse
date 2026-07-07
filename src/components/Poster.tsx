"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

// Нүүрний full-width постер — EN хувилбар байвал EN горимд түүнийг, үгүй бол монгол постер (fallback).
// Аль аль нь байхгүй бол юу ч харуулахгүй (хэсэг нуугдана). href өгвөл дарахад тухайн хуудас руу орно.
export function Poster({ mn, en, href }: { mn?: string; en?: string; href?: string }) {
  const { loc } = useI18n();
  const src = loc(mn || "", en) || mn;
  if (!src) return null;
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="MOTO HOUSE" style={{ width: "100%", height: "auto", display: "block" }} />
  );
  return (
    <div style={{ marginTop: "clamp(44px,6vw,72px)" }}>
      {href ? <Link href={href} style={{ display: "block", cursor: "pointer" }}>{img}</Link> : img}
    </div>
  );
}
