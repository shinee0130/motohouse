"use client";

import Link from "next/link";
import { sx } from "@/lib/ui/sx";
import { useI18n } from "@/lib/i18n";
import type { Photographer } from "@/lib/db/queries";
import { PhotoBookingForm } from "./PhotoBookingForm";

const SOCIALS: { key: keyof Photographer; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube", label: "YouTube" },
];

export function PhotoDetail({ p }: { p: Photographer }) {
  const { t, loc } = useI18n();
  const initial = loc(p.name, p.nameEn).replace(/\D+/g, "") || "📸";
  const works = p.works ?? [];
  const photos = works.filter((w) => w.kind === "photo");
  const videos = works.filter((w) => w.kind === "video");
  const socialLinks = SOCIALS.map((s) => ({ ...s, url: p[s.key] as string | undefined })).filter((s) => s.url);

  return (
    <div style={sx("max-width:1180px;margin:0 auto;padding:clamp(28px,5vw,52px) clamp(20px,4vw,40px);")}>
      <div style={{ animation: "mhfade .5s both" }}>
        <Link href="/photo" style={sx("font:600 13px Montserrat;color:#8A8F98;text-decoration:none;")}>← {t("Бүх зурагчид")}</Link>

        {/* профайл */}
        <div style={sx("display:flex;gap:22px;align-items:center;flex-wrap:wrap;margin-top:18px;")}>
          <div style={sx("width:104px;height:104px;border-radius:20px;overflow:hidden;flex-shrink:0;background:#0b0b0d;border:1px solid #262626;")}>
            {p.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.avatar} alt={loc(p.name, p.nameEn)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={sx("width:100%;height:100%;display:flex;align-items:center;justify-content:center;font:800 40px Montserrat;color:#E10613;")}>{initial}</div>
            )}
          </div>
          <div style={{ minWidth: 220, flex: 1 }}>
            <h1 style={sx("font:800 clamp(26px,4vw,38px) Montserrat;color:#fff;text-transform:uppercase;line-height:1.05;")}>{loc(p.name, p.nameEn)}</h1>
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {p.tags.map((tg) => (
                <span key={tg} style={sx("font:600 11px 'JetBrains Mono';letter-spacing:.04em;color:#FF3742;background:rgba(225,6,19,.12);border:1px solid rgba(225,6,19,.3);padding:3px 9px;border-radius:6px;")}>{t(tg)}</span>
              ))}
            </div>
            {p.specialty && <div style={sx("font:400 14px/1.6 Roboto;color:#A3A3A3;margin-top:12px;max-width:560px;")}>{loc(p.specialty, p.specialtyEn)}</div>}
            {p.price && <div style={sx("font:700 14px Montserrat;color:#fff;margin-top:10px;")}>{p.price}</div>}
          </div>
        </div>

        {p.bio && <p style={sx("font:400 14px/1.7 Roboto;color:#8A8F98;margin-top:18px;max-width:720px;")}>{loc(p.bio, p.bioEn)}</p>}

        {/* social */}
        {socialLinks.length > 0 && (
          <div style={{ display: "flex", gap: 9, marginTop: 16, flexWrap: "wrap" }}>
            {socialLinks.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                style={sx("font:600 12px Montserrat;color:#C8C8C8;background:#111113;border:1px solid #262626;padding:9px 15px;border-radius:9px;text-decoration:none;")}>
                {s.label} ↗
              </a>
            ))}
          </div>
        )}

        {/* портфолио */}
        {(photos.length > 0 || videos.length > 0) && (
          <div style={{ marginTop: 40 }}>
            <div style={sx("font:800 18px Montserrat;color:#fff;text-transform:uppercase;")}>{t("Ажлууд")}</div>

            {videos.length > 0 && (
              <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px;")}>
                {videos.map((w) => (
                  <a key={w.id} href={w.url} target="_blank" rel="noopener noreferrer"
                    style={sx("position:relative;display:block;aspect-ratio:9/16;max-height:340px;border-radius:14px;overflow:hidden;background:#0b0b0d;border:1px solid #262626;text-decoration:none;")}>
                    {w.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={w.thumb} alt={w.caption ? loc(w.caption, w.captionEn) : "reel"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={sx("width:100%;height:100%;background:radial-gradient(circle at 50% 40%,rgba(225,6,19,.14),transparent);")} />
                    )}
                    <div style={sx("position:absolute;inset:0;display:flex;align-items:center;justify-content:center;")}>
                      <div style={sx("width:52px;height:52px;border-radius:50%;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.6);display:flex;align-items:center;justify-content:center;")}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                    {w.caption && <div style={sx("position:absolute;left:0;right:0;bottom:0;padding:10px 12px;font:600 12px Roboto;color:#fff;background:linear-gradient(transparent,rgba(0,0,0,.8));")}>{loc(w.caption, w.captionEn)}</div>}
                  </a>
                ))}
              </div>
            )}

            {photos.length > 0 && (
              <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:12px;")}>
                {photos.map((w) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={w.id} src={w.url} alt={w.caption ? loc(w.caption, w.captionEn) : "photo"}
                    style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", borderRadius: 14, border: "1px solid #262626", background: "#0b0b0d" }} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* захиалга */}
        <div style={{ marginTop: 44 }}>
          <div style={sx("font:800 18px Montserrat;color:#fff;text-transform:uppercase;")}>{t("Цаг захиалах")}</div>
          <p style={sx("font:400 13px Roboto;color:#8A8F98;margin:6px 0 20px;")}>
            <b style={{ color: "#fff" }}>{loc(p.name, p.nameEn)}</b> — {t("тохирох үйлчилгээ, огноо, цагаа сонгоно уу.")}
          </p>
          <PhotoBookingForm photographerName={p.name} photographerId={p.id} />
        </div>
      </div>
    </div>
  );
}
