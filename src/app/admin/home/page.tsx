"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { getSettingsMap, updateSetting, uploadSiteImage } from "@/lib/admin";
import { useConfirm } from "@/lib/confirm";

const SLOTS = [
  { key: "hero", label: "Hero (нүүрний том зураг)" },
  { key: "home_poster", label: "Нүүр — урт poster зураг" },
  { key: "home_poster_en", label: "Нүүр — урт poster (Англи хувилбар, сонгох)" },
  { key: "home_poster2", label: "Нүүр — 2 дахь poster (Service ба Riding gear хооронд)" },
  { key: "home_poster2_en", label: "Нүүр — 2 дахь poster (Англи хувилбар, сонгох)" },
  { key: "home_poster3", label: "Нүүр — 3 дахь poster (Сэлбэг ба Event хооронд)" },
  { key: "home_poster3_en", label: "Нүүр — 3 дахь poster (Англи хувилбар, сонгох)" },
  { key: "cat_moto", label: "Категори — Мотоцикл" },
  { key: "cat_gear", label: "Категори — Хэрэгсэл" },
  { key: "cat_parts", label: "Категори — Сэлбэг" },
  { key: "cat_service", label: "Категори — Засвар" },
];

export default function AdminHome() {
  const [map, setMap] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const confirm = useConfirm();

  async function refresh() { setMap(await getSettingsMap()); }
  useEffect(() => { refresh(); }, []);

  // Нуугдсан зургийн нөөц утга энэ түлхүүрт хадгалагдана
  const bak = (key: string) => `${key}__hidden`;
  const isHidden = (key: string) => !map[key] && !!map[bak(key)];
  const shownSrc = (key: string) => map[key] || map[bak(key)] || "";

  async function clearImage(key: string, label: string) {
    const ok = await confirm({ title: `“${label}” зургийг устгах уу?`, message: "Зураг бүрмөсөн арилж, сайт дээр анхдагч/хоосон болно.", confirmLabel: "Устгах", danger: true });
    if (!ok) return;
    setBusy(key); setMsg("");
    try {
      await updateSetting(key, "");
      await updateSetting(bak(key), ""); // нөөцийг ч цэвэрлэнэ
      await refresh();
      setMsg(`✓ ${key} устгагдлаа.`);
    } catch (e) {
      setMsg("⚠️ Алдаа: " + (e instanceof Error ? e.message : String(e)));
    } finally { setBusy(null); }
  }

  // Түр нуух — зургаа нөөцөд хадгалаад тохиргоог хоослоно (сайт дээр нуугдана)
  async function hideImage(key: string) {
    const v = map[key];
    if (!v) return;
    setBusy(key); setMsg("");
    try {
      await updateSetting(bak(key), v);
      await updateSetting(key, "");
      await refresh();
      setMsg(`✓ ${key} нуугдлаа.`);
    } catch (e) {
      setMsg("⚠️ Алдаа: " + (e instanceof Error ? e.message : String(e)));
    } finally { setBusy(null); }
  }

  // Буцааж харуулах
  async function showImage(key: string) {
    const v = map[bak(key)];
    if (!v) return;
    setBusy(key); setMsg("");
    try {
      await updateSetting(key, v);
      await updateSetting(bak(key), "");
      await refresh();
      setMsg(`✓ ${key} дахин харагдана.`);
    } catch (e) {
      setMsg("⚠️ Алдаа: " + (e instanceof Error ? e.message : String(e)));
    } finally { setBusy(null); }
  }

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

  const softBtn = "background:#1a1a1d;border:1px solid #333;color:#C8C8C8;font:700 12px Montserrat;padding:9px 14px;border-radius:8px;cursor:pointer;";
  const delBtn = "background:none;border:1px solid #3a2020;color:#ef4444;font:700 12px Montserrat;padding:9px 14px;border-radius:8px;cursor:pointer;";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div style={sx("font:700 18px Montserrat;color:#fff;")}>Home backgrounds</div>
        <div style={sx("font:400 13px Roboto;color:#8A8F98;margin-top:4px;")}>
          Нүүр хуудасны зургуудыг солих, түр нуух эсвэл устгах. <b style={{ color: "#C8C8C8" }}>Нуух</b> — зургаа хадгалаад түр нуудаг (буцааж болно); <b style={{ color: "#C8C8C8" }}>Устгах</b> — бүрмөсөн арилгана.
        </div>
      </div>
      {msg && <div style={sx("font:500 13px Roboto;color:#22c55e;")}>{msg}</div>}

      {/* Hero видео */}
      <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
        <div style={{ position: "relative", height: 200, background: "#0d0d0f" }}>
          <video
            key={shownSrc("hero_video") || "default"}
            src={shownSrc("hero_video") || "https://ejdvftjtotahcummzlpn.supabase.co/storage/v1/object/public/site/home/hero-bg.mp4"}
            autoPlay muted loop playsInline
            style={sx(`position:absolute;inset:0;width:100%;height:100%;object-fit:cover;${isHidden("hero_video") ? "opacity:.3;filter:grayscale(1);" : ""}`)}
          />
          {isHidden("hero_video") && <span style={sx("position:absolute;top:10px;left:10px;background:rgba(0,0,0,.7);border:1px solid #444;color:#C8C8C8;font:700 10px Montserrat;letter-spacing:.06em;padding:5px 9px;border-radius:6px;")}>НУУГДСАН</span>}
        </div>
        <div style={{ padding: "14px 16px" }}>
          <div style={sx("font:700 14px Montserrat;color:#fff;")}>Hero видео (нүүрний background)</div>
          <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:4px;")}>Нүүр хуудасны том background видео. Анхдагч: hero-bg.mp4. Нуувал/устгавал анхдагч видео харагдана.</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            <label style={sx(`cursor:pointer;background:#E10613;color:#fff;font:700 12px Montserrat;padding:9px 16px;border-radius:8px;${busy === "hero_video" ? "opacity:.6;" : ""}`)}>
              {busy === "hero_video" ? "Хуулж байна…" : "Видео солих"}
              <input type="file" accept="video/*" disabled={busy === "hero_video"} onChange={(e) => onFile("hero_video", e.target.files?.[0] ?? null)} style={{ display: "none" }} />
            </label>
            {map.hero_video && <button onClick={() => hideImage("hero_video")} disabled={busy === "hero_video"} style={sx(softBtn)}>Нуух</button>}
            {isHidden("hero_video") && <button onClick={() => showImage("hero_video")} disabled={busy === "hero_video"} style={sx(softBtn)}>Харуулах</button>}
            {shownSrc("hero_video") && <button onClick={() => clearImage("hero_video", "Hero видео")} disabled={busy === "hero_video"} style={sx(delBtn)}>Устгах</button>}
          </div>
          <div style={sx("font:400 11px Roboto;color:#6b7280;margin-top:8px;")}>Санал болгох: 1920×1080 (16:9) · MP4 · &lt; 15MB</div>
        </div>
      </div>

      <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;")}>
        {SLOTS.map((s) => {
          const src = shownSrc(s.key);
          const hidden = isHidden(s.key);
          return (
          <div key={s.key} style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
            <div style={{ position: "relative", height: 150, background: "#0d0d0f" }}>
              {src && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={s.label} style={sx(`position:absolute;inset:0;width:100%;height:100%;object-fit:cover;${hidden ? "opacity:.3;filter:grayscale(1);" : ""}`)} />
              )}
              {hidden && <span style={sx("position:absolute;top:10px;left:10px;background:rgba(0,0,0,.7);border:1px solid #444;color:#C8C8C8;font:700 10px Montserrat;letter-spacing:.06em;padding:5px 9px;border-radius:6px;")}>НУУГДСАН</span>}
            </div>
            <div style={{ padding: "14px 16px" }}>
              <div style={sx("font:700 14px Montserrat;color:#fff;")}>{s.label}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                <label style={sx(`cursor:pointer;background:#E10613;color:#fff;font:700 12px Montserrat;padding:9px 14px;border-radius:8px;${busy === s.key ? "opacity:.6;" : ""}`)}>
                  {busy === s.key ? "Хуулж байна…" : "Зураг солих"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={busy === s.key}
                    onChange={(e) => onFile(s.key, e.target.files?.[0] ?? null)}
                    style={{ display: "none" }}
                  />
                </label>
                {map[s.key] && <button onClick={() => hideImage(s.key)} disabled={busy === s.key} style={sx(softBtn)}>Нуух</button>}
                {hidden && <button onClick={() => showImage(s.key)} disabled={busy === s.key} style={sx(softBtn)}>Харуулах</button>}
                {src && <button onClick={() => clearImage(s.key, s.label)} disabled={busy === s.key} style={sx(delBtn)}>Устгах</button>}
              </div>
              <div style={sx("font:400 11px Roboto;color:#6b7280;margin-top:8px;")}>
                Санал болгох: {s.key === "hero" ? "1920×1080 (16:9)" : s.key.startsWith("home_poster") ? "1600×600 (урт banner) эсвэл дурын" : "1200×800 (3:2)"} · JPG · &lt; 300KB
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
