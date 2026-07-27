"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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

type Embed = { type: "iframe" | "video"; src: string; aspect: string };
// Видео линк/файлыг сайт дээр тоглуулах хэлбэрт хөрвүүлнэ (боломжгүй бол null)
function videoEmbed(url: string): Embed | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { type: "iframe", src: `https://www.youtube.com/embed/${yt[1]}`, aspect: "16 / 9" };
  const ig = url.match(/instagram\.com\/(reel|reels|p|tv)\/([\w-]+)/);
  if (ig) return { type: "iframe", src: `https://www.instagram.com/${ig[1] === "reels" ? "reel" : ig[1]}/${ig[2]}/embed`, aspect: "9 / 16" };
  const tt = url.match(/tiktok\.com\/.*\/video\/(\d+)/) || url.match(/tiktok\.com\/embed\/v2\/(\d+)/);
  if (tt) return { type: "iframe", src: `https://www.tiktok.com/embed/v2/${tt[1]}`, aspect: "9 / 16" };
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) return { type: "video", src: url, aspect: "9 / 16" };
  return null;
}

export function PhotoDetail({ p }: { p: Photographer }) {
  const { t, loc } = useI18n();
  const [lb, setLb] = useState<number | null>(null); // томоор харах зургийн индекс
  const [vid, setVid] = useState<Embed | null>(null); // сайт дээр тоглуулах видео
  const initial = loc(p.name, p.nameEn).replace(/\D+/g, "") || "📸";
  const works = p.works ?? [];
  const photos = works.filter((w) => w.kind === "photo");
  const videos = works.filter((w) => w.kind === "video");
  const socialLinks = SOCIALS.map((s) => ({ ...s, url: p[s.key] as string | undefined })).filter((s) => s.url);

  // Lightbox — сум, Esc товч
  useEffect(() => {
    if (lb === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLb(null);
      else if (e.key === "ArrowRight") setLb((i) => (i === null ? i : (i + 1) % photos.length));
      else if (e.key === "ArrowLeft") setLb((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prevOverflow; };
  }, [lb, photos.length]);

  useEffect(() => {
    if (!vid) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setVid(null); }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [vid]);

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
                {videos.map((w) => {
                  const e = videoEmbed(w.url);
                  return (
                    <button key={w.id} type="button"
                      onClick={() => { if (e) setVid(e); else window.open(w.url, "_blank", "noopener"); }}
                      style={{ padding: 0, cursor: "pointer", ...sx("position:relative;display:block;aspect-ratio:9/16;max-height:340px;border-radius:14px;overflow:hidden;background:#0b0b0d;border:1px solid #262626;width:100%;") }}>
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
                      {w.caption && <div style={sx("position:absolute;left:0;right:0;bottom:0;padding:10px 12px;font:600 12px Roboto;color:#fff;text-align:left;background:linear-gradient(transparent,rgba(0,0,0,.8));")}>{loc(w.caption, w.captionEn)}</div>}
                    </button>
                  );
                })}
              </div>
            )}

            {photos.length > 0 && (
              <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:12px;")}>
                {photos.map((w, i) => (
                  <button key={w.id} type="button" onClick={() => setLb(i)} aria-label={t("Томоор харах")}
                    style={{ padding: 0, border: "1px solid #262626", borderRadius: 14, overflow: "hidden", background: "#0b0b0d", cursor: "zoom-in", display: "block" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.url} alt={w.caption ? loc(w.caption, w.captionEn) : "photo"}
                      style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", display: "block" }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* lightbox — зургийг бүтнээр том харах (portal-аар body руу, header дээгүүр) */}
        {lb !== null && photos[lb] && typeof document !== "undefined" && createPortal(
          <div onClick={() => setLb(null)}
            style={sx("position:fixed;inset:0;z-index:99999;background:rgba(5,5,5,.95);display:flex;align-items:center;justify-content:center;padding:16px;")}>
            <button type="button" onClick={() => setLb(null)} aria-label={t("Хаах")}
              style={sx("position:absolute;top:18px;right:20px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.3);color:#fff;font:400 22px Montserrat;cursor:pointer;line-height:1;")}>×</button>
            {photos.length > 1 && (
              <>
                <button type="button" onClick={(e) => { e.stopPropagation(); setLb((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)); }} aria-label="prev"
                  style={sx("position:absolute;left:14px;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.3);color:#fff;font:400 24px Montserrat;cursor:pointer;")}>‹</button>
                <button type="button" onClick={(e) => { e.stopPropagation(); setLb((i) => (i === null ? i : (i + 1) % photos.length)); }} aria-label="next"
                  style={sx("position:absolute;right:14px;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.3);color:#fff;font:400 24px Montserrat;cursor:pointer;")}>›</button>
              </>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[lb].url} alt="" onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "96vw", maxHeight: "94vh", width: "auto", height: "auto", objectFit: "contain", borderRadius: 8 }} />
            {photos[lb].caption && <div style={sx("position:absolute;left:0;right:0;bottom:14px;text-align:center;font:600 14px Roboto;color:#fff;pointer-events:none;")}>{loc(photos[lb].caption as string, photos[lb].captionEn)}</div>}
          </div>,
          document.body,
        )}

        {/* видео player — сайт дээр шууд тоглоно (portal-аар body руу) */}
        {vid && typeof document !== "undefined" && createPortal(
          <div onClick={() => setVid(null)}
            style={sx("position:fixed;inset:0;z-index:99999;background:rgba(5,5,5,.95);display:flex;align-items:center;justify-content:center;padding:16px;")}>
            <button type="button" onClick={() => setVid(null)} aria-label={t("Хаах")}
              style={sx("position:absolute;top:18px;right:20px;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.3);color:#fff;font:400 22px Montserrat;cursor:pointer;line-height:1;z-index:1;")}>×</button>
            <div onClick={(e) => e.stopPropagation()}
              style={{ ...sx("position:relative;background:#000;border-radius:10px;overflow:hidden;"), width: "min(94vw, 900px)", aspectRatio: vid.aspect, maxHeight: "88vh" }}>
              {vid.type === "iframe" ? (
                <iframe src={vid.src} title="video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen
                  style={{ width: "100%", height: "100%", border: 0, display: "block" }} />
              ) : (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video src={vid.src} controls autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }} />
              )}
            </div>
          </div>,
          document.body,
        )}

        {/* захиалга */}
        <div style={{ marginTop: 44 }}>
          <div style={sx("font:800 18px Montserrat;color:#fff;text-transform:uppercase;")}>{t("Цаг захиалах")}</div>
          <p style={sx("font:400 13px Roboto;color:#8A8F98;margin:6px 0 20px;")}>
            <b style={{ color: "#fff" }}>{loc(p.name, p.nameEn)}</b> — {t("тохирох үйлчилгээ, огноо, цагаа сонгоно уу.")}
          </p>
          <PhotoBookingForm photographerName={p.name} photographerId={p.id} services={p.services} dailyLimit={p.dailyLimit} />
        </div>
      </div>
    </div>
  );
}
