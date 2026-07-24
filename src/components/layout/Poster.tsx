"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

// Нүүрний full-width постер — сонгосон хэлний хувилбарыг харуулна.
// Тухайн хэлний зураг байхгүй бол нөгөө хэлнийхийг fallback болгож харуулна
// (жишээ: MN постер байхгүй бол EN-ийг шууд харуулна). Аль аль нь байхгүй бол хэсэг нуугдана.
export function Poster({ mn, en, href }: { mn?: string; en?: string; href?: string }) {
  const { loc } = useI18n();
  const src = loc(mn || "", en) || mn || en;
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
