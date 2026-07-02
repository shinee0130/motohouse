"use client";

import { useState } from "react";
import { sx } from "@/lib/sx";
import { Slot } from "./Slot";
import { badge, statusLabel } from "@/lib/data";

export function MotoGallery({ images, status, video }: { images?: string[]; status: string; video?: string }) {
  const [active, setActive] = useState(0);
  const has = !!images && images.length > 0;
  const main = has ? images![Math.min(active, images!.length - 1)] : null;

  return (
    <div>
      {/* main */}
      <div style={sx("position:relative;border-radius:18px;overflow:hidden;border:1px solid #262626;aspect-ratio:4/3;background:#0d0d0f;")}>
        {has ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={main!} alt="" style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:contain;")} />
        ) : (
          <Slot label="Мотоцикл том зураг" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        )}
        <span style={{ position: "absolute", top: 16, left: 16, zIndex: 2, ...sx(badge(status)) }}>{statusLabel(status)}</span>
      </div>

      {/* thumbnails */}
      <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:10px;margin-top:12px;")}>
        {has
          ? images!.map((src, i) => (
              <button
                key={src}
                onClick={() => setActive(i)}
                style={sx(
                  `position:relative;height:72px;border-radius:10px;overflow:hidden;cursor:pointer;padding:0;background:#0d0d0f;border:2px solid ${i === active ? "#E10613" : "#262626"};`,
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;")} />
              </button>
            ))
          : ["Зураг 2", "Зураг 3", "Зураг 4", "Зураг 5"].map((t) => (
              <Slot key={t} label={t} style={{ height: 72, borderRadius: 10 }} />
            ))}
      </div>

      {/* Бодит видео байвал тоглуулагч */}
      {video && (
        <video
          src={video}
          controls
          poster={has ? images![0] : undefined}
          style={sx("width:100%;border-radius:14px;overflow:hidden;border:1px solid #262626;margin-top:12px;display:block;background:#000;")}
        />
      )}

      {/* video poster — зураг ч, видео ч байхгүй үед */}
      {!has && !video && (
        <div style={sx("position:relative;border-radius:14px;overflow:hidden;border:1px solid #262626;aspect-ratio:16/9;margin-top:12px;")}>
          <Slot label="Видео poster" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
          <div style={sx("position:absolute;inset:0;background:linear-gradient(transparent,rgba(5,5,5,.5));pointer-events:none;")} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={sx("width:62px;height:62px;border-radius:50%;background:rgba(225,6,19,.92);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 24px rgba(225,6,19,.45);")}>
              <div style={sx("width:0;height:0;border-left:18px solid #fff;border-top:11px solid transparent;border-bottom:11px solid transparent;margin-left:5px;")} />
            </div>
          </div>
          <span style={sx("position:absolute;top:12px;left:14px;z-index:2;font:600 11px 'JetBrains Mono';letter-spacing:.16em;color:#fff;background:rgba(0,0,0,.5);padding:5px 11px;border-radius:6px;")}>
            ВИДЕО
          </span>
        </div>
      )}
    </div>
  );
}
