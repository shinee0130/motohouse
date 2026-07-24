"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sx } from "@/lib/ui/sx";
import { useAuth } from "@/lib/auth/auth";
import { getMyPhotographer, getPhotographer, type Photographer } from "@/lib/db/queries";
import { updatePhotographer, uploadPhotographerImage, getMyPhotoBookings, updatePhotoBookingStatus, type PhotoBooking } from "@/lib/db/admin";
import { WorksManager } from "@/components/admin/WorksManager";
import { Select } from "@/components/ui/Select";
import { useAlert } from "@/lib/ui/confirm";

const INPUT = "background:#050505;border:1px solid #262626;border-radius:9px;padding:11px 13px;color:#fff;font:400 14px Roboto;outline:none;width:100%;";
const LABEL = "font:600 11px Montserrat;letter-spacing:.04em;color:#A3A3A3;margin-bottom:6px;display:block;";
const BTN = "background:#E10613;color:#fff;font:700 13px Montserrat;padding:11px 18px;border:none;border-radius:9px;cursor:pointer;";
const GHOST = "background:#111113;color:#C8C8C8;font:700 13px Montserrat;padding:11px 18px;border:1px solid #333;border-radius:9px;cursor:pointer;";
const STATUSES = ["Шинэ", "Баталгаажсан", "Дууссан", "Цуцлагдсан"];
const arr = (s: string) => s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);

type Form = {
  name: string; nameEn: string; specialty: string; specialtyEn: string; bio: string; bioEn: string;
  tags: string; price: string; instagram: string; facebook: string; tiktok: string; youtube: string; avatar: string;
};
function toForm(p: Photographer): Form {
  return {
    name: p.name, nameEn: p.nameEn ?? "", specialty: p.specialty ?? "", specialtyEn: p.specialtyEn ?? "", bio: p.bio ?? "", bioEn: p.bioEn ?? "",
    tags: (p.tags ?? []).join(", "), price: p.price ?? "", instagram: p.instagram ?? "", facebook: p.facebook ?? "", tiktok: p.tiktok ?? "", youtube: p.youtube ?? "", avatar: p.avatar ?? "",
  };
}
function badge(status: string): string {
  const base = "font:700 11px Montserrat;letter-spacing:.04em;padding:5px 11px;border-radius:6px;display:inline-block;";
  if (status === "Баталгаажсан") return base + "color:#fff;background:#E10613;";
  if (status === "Дууссан") return base + "color:#22c55e;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.35);";
  if (status === "Цуцлагдсан") return base + "color:#ef4444;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.35);";
  return base + "color:#A3A3A3;background:#1a1a1d;border:1px solid #333;";
}

export default function StudioPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const alert = useAlert();
  const [me, setMe] = useState<Photographer | null | undefined>(undefined);
  const [f, setF] = useState<Form | null>(null);
  const [flang, setFlang] = useState<"mn" | "en">("mn");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bookings, setBookings] = useState<PhotoBooking[]>([]);
  const [tab, setTab] = useState<"profile" | "works" | "bookings">("profile");

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/"); return; }
    (async () => {
      const p = await getMyPhotographer();
      setMe(p);
      if (p) { setF(toForm(p)); setBookings(await getMyPhotoBookings(p.id)); }
    })();
  }, [ready, user, router]);

  function set<K extends keyof Form>(k: K, v: Form[K]) { setF((p) => (p ? { ...p, [k]: v } : p)); }

  async function reloadWorks() { if (me) { const p = await getPhotographer(me.id); if (p) setMe((m) => (m ? { ...m, works: p.works } : m)); } }

  async function save() {
    if (!me || !f) return;
    if (!f.name.trim()) { await alert({ title: "Нэр оруулна уу." }); return; }
    setBusy(true);
    try {
      await updatePhotographer(me.id, {
        name: f.name.trim(), nameEn: f.nameEn.trim(), specialty: f.specialty.trim(), specialtyEn: f.specialtyEn.trim(),
        bio: f.bio.trim(), bioEn: f.bioEn.trim(), tags: arr(f.tags), price: f.price.trim(),
        instagram: f.instagram.trim(), facebook: f.facebook.trim(), tiktok: f.tiktok.trim(), youtube: f.youtube.trim(), avatar: f.avatar,
      });
      await alert({ title: "Хадгалагдлаа" });
    } catch (e) { await alert({ title: "Алдаа", message: e instanceof Error ? e.message : String(e), danger: true }); }
    finally { setBusy(false); }
  }

  async function uploadAvatar(file: File) {
    setUploading(true);
    try { set("avatar", await uploadPhotographerImage(file)); }
    catch (e) { await alert({ title: "Upload алдаа", message: e instanceof Error ? e.message : String(e), danger: true }); }
    finally { setUploading(false); }
  }

  async function changeStatus(id: number, status: string) {
    setBookings((l) => l.map((b) => (b.id === id ? { ...b, status } : b)));
    await updatePhotoBookingStatus(id, status);
  }

  const wrap = "max-width:960px;margin:0 auto;padding:clamp(28px,5vw,52px) clamp(20px,4vw,40px);";

  if (!ready || me === undefined) return <div style={sx(wrap + "color:#8A8F98;font:400 14px Roboto;")}>Ачаалж байна…</div>;

  // Нэвтэрсэн ч зурагчин биш (admin эсвэл холбогдоогүй)
  if (!me) {
    return (
      <div style={sx(wrap)}>
        <h1 style={sx("font:800 26px Montserrat;color:#fff;text-transform:uppercase;")}>Studio</h1>
        <p style={sx("font:400 14px Roboto;color:#8A8F98;margin-top:12px;")}>
          {user?.role === "admin"
            ? "Та админ байна. Зурагчдыг /admin/photographers-аас удирдана."
            : "Таны бүртгэл ямар нэг зурагчинтай холбогдоогүй байна. Админд хандана уу."}
        </p>
      </div>
    );
  }

  return (
    <div style={sx(wrap)}>
      <div style={{ animation: "mhfade .5s both" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={sx("width:54px;height:54px;border-radius:12px;overflow:hidden;background:#0b0b0d;border:1px solid #262626;flex-shrink:0;")}>
            {me.avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.avatar} alt={me.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
          </div>
          <div>
            <div style={sx("font:600 11px Montserrat;letter-spacing:.2em;color:#E10613;")}>STUDIO</div>
            <h1 style={sx("font:800 26px Montserrat;color:#fff;text-transform:uppercase;line-height:1;")}>{me.name}</h1>
          </div>
        </div>

        {/* tab-ууд */}
        <div style={{ display: "flex", gap: 8, marginTop: 22, flexWrap: "wrap" }}>
          {([["profile", "Профайл"], ["works", "Портфолио"], ["bookings", `Захиалга (${bookings.length})`]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} style={sx(`cursor:pointer;font:700 12px Montserrat;padding:9px 18px;border-radius:999px;${tab === k ? "background:#E10613;border:1px solid #E10613;color:#fff;" : "background:#111113;border:1px solid #333;color:#C8C8C8;"}`)}>{label}</button>
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          {tab === "profile" && f && (
            <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;padding:20px;display:flex;flex-direction:column;gap:14px;")}>
              <div style={{ display: "flex", gap: 8 }}>
                {(["mn", "en"] as const).map((l) => (
                  <button key={l} onClick={() => setFlang(l)} style={sx(`cursor:pointer;font:700 12px Montserrat;padding:7px 15px;border-radius:8px;${flang === l ? "background:#E10613;border:1px solid #E10613;color:#fff;" : "background:#050505;border:1px solid #333;color:#C8C8C8;"}`)}>{l.toUpperCase()}</button>
                ))}
              </div>
              <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;")}>
                {flang === "mn" ? (
                  <>
                    <div><label style={sx(LABEL)}>Нэр *</label><input value={f.name} onChange={(e) => set("name", e.target.value)} style={sx(INPUT)} /></div>
                    <div><label style={sx(LABEL)}>Чиглэл</label><input value={f.specialty} onChange={(e) => set("specialty", e.target.value)} style={sx(INPUT)} /></div>
                  </>
                ) : (
                  <>
                    <div><label style={sx(LABEL)}>Name (EN)</label><input value={f.nameEn} onChange={(e) => set("nameEn", e.target.value)} style={sx(INPUT)} /></div>
                    <div><label style={sx(LABEL)}>Specialty (EN)</label><input value={f.specialtyEn} onChange={(e) => set("specialtyEn", e.target.value)} style={sx(INPUT)} /></div>
                  </>
                )}
              </div>
              <div>
                <label style={sx(LABEL)}>{flang === "mn" ? "Танилцуулга" : "Bio (EN)"}</label>
                <textarea value={flang === "mn" ? f.bio : f.bioEn} onChange={(e) => set(flang === "mn" ? "bio" : "bioEn", e.target.value)} rows={3} style={sx(INPUT + "resize:vertical;")} />
              </div>
              <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;")}>
                <div><label style={sx(LABEL)}>Tag (таслалаар)</label><input value={f.tags} onChange={(e) => set("tags", e.target.value)} style={sx(INPUT)} /></div>
                <div><label style={sx(LABEL)}>Үнэ (текст)</label><input value={f.price} onChange={(e) => set("price", e.target.value)} style={sx(INPUT)} /></div>
              </div>
              <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;")}>
                <div><label style={sx(LABEL)}>Instagram URL</label><input value={f.instagram} onChange={(e) => set("instagram", e.target.value)} style={sx(INPUT)} /></div>
                <div><label style={sx(LABEL)}>Facebook URL</label><input value={f.facebook} onChange={(e) => set("facebook", e.target.value)} style={sx(INPUT)} /></div>
                <div><label style={sx(LABEL)}>TikTok URL</label><input value={f.tiktok} onChange={(e) => set("tiktok", e.target.value)} style={sx(INPUT)} /></div>
                <div><label style={sx(LABEL)}>YouTube URL</label><input value={f.youtube} onChange={(e) => set("youtube", e.target.value)} style={sx(INPUT)} /></div>
              </div>
              <div>
                <label style={sx(LABEL)}>Профайл зураг</label>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={sx("width:64px;height:64px;border-radius:12px;overflow:hidden;background:#0b0b0d;border:1px solid #262626;flex-shrink:0;")}>
                    {f.avatar && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                  </div>
                  <label style={sx(GHOST + "display:inline-block;")}>
                    {uploading ? "Ачаалж байна…" : "Зураг сонгох"}
                    <input type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadAvatar(file); }} />
                  </label>
                </div>
              </div>
              <button onClick={save} disabled={busy} style={sx(BTN + (busy ? "opacity:.6;" : "") + "align-self:flex-start;")}>{busy ? "Хадгалж байна…" : "Хадгалах"}</button>
            </div>
          )}

          {tab === "works" && <WorksManager photographerId={me.id} works={me.works ?? []} onChange={reloadWorks} />}

          {tab === "bookings" && (
            <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
              {bookings.map((b) => (
                <div key={b.id} style={sx("display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:16px 18px;border-bottom:1px solid #1c1c1f;")}>
                  <div style={{ minWidth: 200 }}>
                    <div style={sx("font:700 15px Montserrat;color:#fff;")}>{b.service_type}</div>
                    <div style={sx("font:600 13px Roboto;color:#E10613;margin-top:3px;")}>📅 {b.booking_date} · {b.booking_time}</div>
                    <div style={sx("font:400 12px 'JetBrains Mono';color:#8A8F98;margin-top:4px;")}>{b.name} · +976 {b.phone}{b.moto_model ? ` · ${b.moto_model}` : ""}</div>
                    {b.note && <div style={sx("font:400 12px Roboto;color:#A3A3A3;margin-top:4px;")}>“{b.note}”</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={sx(badge(b.status))}>{b.status}</span>
                    <Select value={b.status} onChange={(v) => changeStatus(b.id, v)} full bg="#050505" options={STATUSES.map((s) => ({ value: s, label: s }))} />
                  </div>
                </div>
              ))}
              {bookings.length === 0 && <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Захиалга алга.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
