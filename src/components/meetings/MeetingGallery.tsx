"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { sx } from "@/lib/ui/sx";
import { useI18n } from "@/lib/i18n";
import { imgSrc } from "@/lib/ui/img";
import type { EventMedia } from "@/lib/db/queries";

// Уулзалтын зураг/видеоны галерей. Зураг дээр дарвал бүтнээр нь харна,
// видео нь голд нь ▶ тэмдэгтэй, дарахад тоглоно.
export function MeetingGallery({ media }: { media: EventMedia[] }) {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(null);

  // Сум болон Esc-ээр удирдана
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + media.length) % media.length));
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % media.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, media.length]);

  if (media.length === 0) return null;
  const cur = open === null ? null : media[open];

  return (
    <div style={{ marginTop: 30 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <h2 style={sx("font:800 20px Montserrat;color:#fff;text-transform:uppercase;")}>{t("Зураг, бичлэг")}</h2>
        <span style={sx("font:500 13px Roboto;color:#8A8F98;")}>{media.length}</span>
      </div>

      <div className="mh-meet-grid" style={{ marginTop: 16 }}>
        {media.map((m, i) => (
          <button
            key={m.id}
            onClick={() => setOpen(i)}
            aria-label={m.caption || (m.kind === "video" ? t("Бичлэг") : t("Зураг"))}
            style={sx("position:relative;aspect-ratio:1/1;border-radius:12px;overflow:hidden;border:1px solid #262626;background:#0d0d0f;padding:0;cursor:pointer;display:block;")}
          >
            {m.kind === "video" ? (
              m.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img {...imgSrc(m.thumb, 320)} alt="" style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;")} />
              ) : (
                // Нүүр зураг өгөөгүй бол видеоны эхний кадрыг үзүүлнэ
                <video src={`${m.url}#t=0.1`} muted playsInline preload="metadata"
                  style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;")} />
              )
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img {...imgSrc(m.url, 320)} alt={m.caption || ""} loading="lazy"
                style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;")} />
            )}
            {m.kind === "video" && (
              <span style={sx("position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.25);color:#fff;font-size:34px;")}>▶</span>
            )}
          </button>
        ))}
      </div>

      {/* Бүтэн дэлгэц — portal-аар body руу (эцгийн animation нь fixed-ийг эвддэг) */}
      {cur !== null && typeof document !== "undefined" && createPortal(
        <div onClick={() => setOpen(null)}
          style={sx("position:fixed;inset:0;z-index:99999;background:rgba(5,5,5,.95);display:flex;align-items:center;justify-content:center;padding:16px;animation:mhfade .2s both;")}>
          <button onClick={(e) => { e.stopPropagation(); setOpen(null); }} aria-label={t("Хаах")}
            style={sx("position:absolute;top:18px;right:20px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.3);color:#fff;font:400 22px Montserrat;cursor:pointer;line-height:1;z-index:2;")}>×</button>

          {media.length > 1 && ([["‹", -1, "left:14px"], ["›", 1, "right:14px"]] as const).map(([ch, dir, pos]) => (
            <button key={ch} onClick={(e) => { e.stopPropagation(); setOpen((i) => (i === null ? i : (i + dir + media.length) % media.length)); }}
              aria-label={dir < 0 ? t("Өмнөх зураг") : t("Дараах зураг")}
              style={sx(`position:absolute;${pos};top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.3);color:#fff;font:400 24px Montserrat;cursor:pointer;z-index:2;`)}>
              {ch}
            </button>
          ))}

          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "100%", maxHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            {cur.kind === "video" ? (
              <video src={cur.url} controls autoPlay playsInline
                style={{ maxWidth: "100%", maxHeight: "82vh", borderRadius: 12, display: "block" }} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img {...imgSrc(cur.url, 1280)} alt={cur.caption || ""}
                style={{ maxWidth: "100%", maxHeight: "82vh", objectFit: "contain", borderRadius: 12, display: "block" }} />
            )}
            {cur.caption && <div style={sx("font:500 14px Roboto;color:#C8C8C8;text-align:center;max-width:640px;")}>{cur.caption}</div>}
            <div style={sx("font:500 12px 'JetBrains Mono';color:#6b7280;")}>{(open ?? 0) + 1} / {media.length}</div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
