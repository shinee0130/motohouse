"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { sx } from "@/lib/ui/sx";
import { useI18n } from "@/lib/i18n";

// Тухайн фичер бэлэн болоогүй үед харуулах "Тун удахгүй" хуудас (брэндэд тохирсон, 2 хэлтэй).
export function ComingSoon({
  icon,
  titleMn,
  titleEn,
  descMn,
  descEn,
}: {
  icon: ReactNode;
  titleMn: string;
  titleEn?: string;
  descMn: string;
  descEn?: string;
}) {
  const { loc } = useI18n();
  return (
    <div style={sx("min-height:62vh;display:flex;align-items:center;justify-content:center;padding:clamp(48px,8vw,96px) clamp(20px,4vw,40px);")}>
      <div style={{ ...sx("max-width:560px;text-align:center;"), animation: "mhfade .5s both" }}>
        <div style={sx("width:88px;height:88px;margin:0 auto 26px;border-radius:22px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 38%,rgba(225,6,19,.22),rgba(225,6,19,.03));border:1px solid rgba(225,6,19,.35);color:#FF3742;")}>
          {icon}
        </div>
        <div style={sx("font:700 12px Montserrat;letter-spacing:.28em;color:#E10613;text-transform:uppercase;margin-bottom:14px;")}>
          {loc("Тун удахгүй", "Coming soon")}
        </div>
        <h1 style={sx("font:800 clamp(30px,5vw,48px) Montserrat;color:#fff;text-transform:uppercase;line-height:1.05;")}>
          {loc(titleMn, titleEn)}
        </h1>
        <p style={sx("font:400 15px/1.7 Roboto;color:#8A8F98;margin-top:16px;")}>
          {loc(descMn, descEn)}
        </p>
        <div style={sx("width:46px;height:3px;background:#E10613;border-radius:2px;margin:28px auto 0;")} />
        <div style={sx("font:600 11px 'JetBrains Mono';letter-spacing:.22em;color:#4b4b50;margin-top:16px;")}>
          RIDE · POWER · LIVE
        </div>
        <Link href="/" style={sx("display:inline-block;margin-top:30px;background:#E10613;color:#fff;font:700 13px Montserrat;letter-spacing:.06em;padding:14px 28px;border-radius:11px;text-decoration:none;text-transform:uppercase;")}>
          {loc("Нүүр хуудас руу", "Back to home")}
        </Link>
      </div>
    </div>
  );
}
