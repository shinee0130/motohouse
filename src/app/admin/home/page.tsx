"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { getSettingsMap, updateSetting, uploadSiteImage } from "@/lib/admin";

const SLOTS = [
  { key: "hero", label: "Hero (нүүрний том зураг)" },
  { key: "cat_moto", label: "Категори — Мотоцикл" },
  { key: "cat_gear", label: "Категори — Хэрэгсэл" },
  { key: "cat_parts", label: "Категори — Сэлбэг" },
  { key: "cat_service", label: "Категори — Засвар" },
];

export default function AdminHome() {
  const [map, setMap] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function refresh() { setMap(await getSettingsMap()); }
  useEffect(() => { refresh(); }, []);

  async function onFile(key: string, file: File | null) {
    if (!file) return;
    setBusy(key); setMsg("");
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const url = await uploadSiteImage(file, `home/${key}.${ext}`);
      await updateSetting(key, url);
      await refresh();
      setMsg(`✓ ${key} шинэчлэгдлээ.`);
    } catch (e) {
      setMsg("⚠️ Алдаа: " + (e instanceof Error ? e.message : String(e)));
    } finally { setBusy(null); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div style={sx("font:700 18px Montserrat;color:#fff;")}>Home backgrounds</div>
        <div style={sx("font:400 13px Roboto;color:#8A8F98;margin-top:4px;")}>
          Нүүр хуудасны зургуудыг солих. Шинэ зураг сонгоход шууд хадгалагдаж, сайт дээр шинэчлэгдэнэ.
        </div>
      </div>
      {msg && <div style={sx("font:500 13px Roboto;color:#22c55e;")}>{msg}</div>}

      {/* Hero видео */}
      <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
        <div style={{ position: "relative", height: 200, background: "#0d0d0f" }}>
          {map.hero_video ? (
            <video src={map.hero_video} autoPlay muted loop playsInline style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;")} />
          ) : (
            <video src="/assets/hero-bg.mp4" autoPlay muted loop playsInline style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;")} />
          )}
        </div>
        <div style={{ padding: "14px 16px" }}>
          <div style={sx("font:700 14px Montserrat;color:#fff;")}>Hero видео (нүүрний background)</div>
          <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:4px;")}>Нүүр хуудасны том background видео. Анхдагч: hero-bg.mp4. Шинэ видео сонгоход шууд солигдоно.</div>
          <label style={sx(`display:inline-block;margin-top:12px;cursor:pointer;background:#E10613;color:#fff;font:700 12px Montserrat;padding:9px 16px;border-radius:8px;${busy === "hero_video" ? "opacity:.6;" : ""}`)}>
            {busy === "hero_video" ? "Хуулж байна…" : "Видео солих"}
            <input type="file" accept="video/*" disabled={busy === "hero_video"} onChange={(e) => onFile("hero_video", e.target.files?.[0] ?? null)} style={{ display: "none" }} />
          </label>
        </div>
      </div>

      <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;")}>
        {SLOTS.map((s) => (
          <div key={s.key} style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
            <div style={{ position: "relative", height: 150, background: "#0d0d0f" }}>
              {map[s.key] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={map[s.key]} alt={s.label} style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;")} />
              )}
            </div>
            <div style={{ padding: "14px 16px" }}>
              <div style={sx("font:700 14px Montserrat;color:#fff;")}>{s.label}</div>
              <label style={sx(`display:inline-block;margin-top:12px;cursor:pointer;background:#E10613;color:#fff;font:700 12px Montserrat;padding:9px 16px;border-radius:8px;${busy === s.key ? "opacity:.6;" : ""}`)}>
                {busy === s.key ? "Хуулж байна…" : "Зураг солих"}
                <input
                  type="file"
                  accept="image/*"
                  disabled={busy === s.key}
                  onChange={(e) => onFile(s.key, e.target.files?.[0] ?? null)}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
