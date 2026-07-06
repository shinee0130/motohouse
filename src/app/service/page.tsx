"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sx } from "@/lib/sx";
import { SERVICES } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { createBooking } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import { Calendar } from "@/components/Calendar";
import { useI18n } from "@/lib/i18n";

const INPUT = "background:#050505;border:1px solid #262626;border-radius:9px;padding:13px 15px;color:#fff;font:400 14px Roboto;outline:none;width:100%;";
const LABEL = "font:600 12px Montserrat;letter-spacing:.04em;color:#C8C8C8;margin-bottom:8px;display:block;";
const TIMES = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export default function ServicePage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [serviceType, setServiceType] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [model, setModel] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [booked, setBooked] = useState<string[]>([]); // тухайн өдрийн авагдсан цагууд

  // Огноо солигдоход тухайн өдрийн авагдсан цагийг татна
  useEffect(() => {
    if (!date) { setBooked([]); return; }
    let alive = true;
    supabase.rpc("booked_times", { d: date }).then(({ data }) => {
      if (!alive) return;
      const taken = (data ?? []) as string[];
      setBooked(taken);
      setTime((cur) => (taken.includes(cur) ? "" : cur)); // авагдсан бол сонголтыг арилгана
    });
    return () => { alive = false; };
  }, [date]);

  function chip(active: boolean): string {
    const base = "cursor:pointer;font:600 13px Roboto;padding:11px 14px;border-radius:10px;text-align:center;user-select:none;";
    return active
      ? base + "background:#E10613;color:#fff;border:1px solid #E10613;"
      : base + "background:#111113;color:#C8C8C8;border:1px solid #262626;";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!user) { router.push("/login"); return; }
    if (!serviceType) return setError("Үйлчилгээний төрлөө сонгоно уу.");
    if (!date) return setError("Огноогоо сонгоно уу.");
    if (!time) return setError("Цагаа сонгоно уу.");
    if (!name.trim()) return setError("Нэрээ оруулна уу.");
    if (phone.replace(/\D/g, "").length !== 8) return setError("Утасны дугаар 8 оронтой байх ёстой.");
    setBusy(true);
    try {
      // Давхар захиалгаас сэргийлэх — сүүлийн байдлаар шалгах
      const { data: taken } = await supabase.rpc("booked_times", { d: date });
      if (((taken ?? []) as string[]).includes(time)) {
        setBooked((taken ?? []) as string[]); setTime("");
        setError("Уучлаарай, энэ цаг дөнгөж авагдлаа. Өөр цаг сонгоно уу.");
        return;
      }
      await createBooking({
        service_type: serviceType, booking_date: date, booking_time: time,
        name: name.trim(), phone: phone.replace(/\D/g, ""), moto_model: model.trim(),
        note: note.trim(), user_phone: user?.phone,
      });
      setSent(true);
    } catch {
      setError("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally { setBusy(false); }
  }

  return (
    <div style={sx("max-width:1280px;margin:0 auto;padding:clamp(32px,5vw,56px) clamp(20px,4vw,40px);")}>
      <div style={{ animation: "mhfade .5s both" }}>
        <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.24em;color:#E10613;")}>EXPERT SERVICE</div>
        <h1 style={sx("font:800 clamp(30px,5vw,46px) Montserrat;color:#fff;margin-top:6px;text-transform:uppercase;")}>
          {t("Засварын цаг захиалга")}
        </h1>
        <p style={sx("font:400 14px Roboto;color:#8A8F98;margin-top:8px;max-width:560px;")}>
          {t("Үйлчилгээний төрөл, огноо, цагаа сонгож цаг захиална. Бид баталгаажуулж холбогдоно.")}
        </p>

        {sent ? (
          <div style={sx("background:#111113;border:1px solid #262626;border-radius:18px;padding:clamp(28px,5vw,48px);margin-top:28px;text-align:center;max-width:560px;")}>
            <div style={sx("font:800 22px Montserrat;color:#22c55e;")}>✓ {t("Цаг захиалагдлаа!")}</div>
            <div style={sx("font:400 14px Roboto;color:#A3A3A3;margin-top:10px;")}>
              <b style={{ color: "#fff" }}>{t(serviceType)}</b> — {date} {time}<br />
              {t("Бид удахгүй холбогдож баталгаажуулна.")}
            </div>
            <button
              onClick={() => { setSent(false); setServiceType(""); setDate(""); setTime(""); setModel(""); setNote(""); }}
              style={sx("margin-top:20px;background:#E10613;color:#fff;font:700 13px Montserrat;letter-spacing:.05em;padding:13px 24px;border:none;border-radius:10px;cursor:pointer;")}
            >
              {t("Дахин захиалах")}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px;margin-top:28px;align-items:start;")}>
            {/* Зүүн: төрөл + огноо */}
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div>
                <label style={sx(LABEL)}>{t("1. Үйлчилгээний төрөл")}</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {SERVICES.map((s) => (
                    <div key={s} onClick={() => setServiceType(s)} style={sx(chip(serviceType === s))}>{t(s)}</div>
                  ))}
                </div>
              </div>
              <div>
                <label style={sx(LABEL)}>{t("2. Огноо")}</label>
                <Calendar value={date} onChange={setDate} />
              </div>
            </div>

            {/* Баруун: цаг + холбоо */}
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div>
                <label style={sx(LABEL)}>{t("3. Цаг")} {date && booked.length > 0 && <span style={sx("color:#8A8F98;font-weight:400;")}>· {t("авагдсан цаг саарал")}</span>}</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(72px,1fr))", gap: 8 }}>
                  {TIMES.map((slot) => {
                    const taken = booked.includes(slot);
                    return taken ? (
                      <div key={slot} title={t("Авагдсан")} style={sx("font:600 13px Roboto;padding:11px 14px;border-radius:10px;text-align:center;background:#0b0b0d;color:#4b4b50;border:1px solid #1c1c1f;text-decoration:line-through;cursor:not-allowed;")}>{slot}</div>
                    ) : (
                      <div key={slot} onClick={() => setTime(slot)} style={sx(chip(time === slot))}>{slot}</div>
                    );
                  })}
                </div>
                {date && booked.length >= TIMES.length && (
                  <div style={sx("font:500 12px Roboto;color:#f59e0b;margin-top:8px;")}>{t("Энэ өдрийн бүх цаг авагдсан байна. Өөр өдөр сонгоно уу.")}</div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div><label style={sx(LABEL)}>{t("4. Холбоо барих")}</label>
                  <input className="mh-input" placeholder={t("Нэр")} value={name} onChange={(e) => setName(e.target.value)} style={sx(INPUT)} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={sx("background:#050505;border:1px solid #262626;border-radius:9px;padding:13px 12px;color:#8A8F98;font:500 14px Roboto;flex-shrink:0;")}>+976</span>
                  <input className="mh-input" type="tel" inputMode="numeric" placeholder={t("Утас")} value={phone} onChange={(e) => setPhone(e.target.value)} style={sx(INPUT)} />
                </div>
                <input className="mh-input" placeholder={t("Мотоциклын модель (заавал биш)")} value={model} onChange={(e) => setModel(e.target.value)} style={sx(INPUT)} />
                <textarea className="mh-input" placeholder={t("Асуудал / нэмэлт тэмдэглэл")} rows={3} value={note} onChange={(e) => setNote(e.target.value)} style={sx(INPUT + "resize:vertical;")} />
              </div>
              {!user && <div style={sx("font:500 12px Roboto;color:#8A8F98;")}>{t("Цаг захиалахын тулд эхлээд нэвтэрсэн байх шаардлагатай.")}</div>}
              {error && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{error}</div>}
              <button type="submit" disabled={busy} style={sx(`background:#E10613;color:#fff;font:700 14px Montserrat;letter-spacing:.06em;padding:15px;border:none;border-radius:11px;text-transform:uppercase;cursor:pointer;${busy ? "opacity:.6;" : ""}`)}>
                {busy ? t("Илгээж байна…") : user ? t("Цаг захиалах") : t("Нэвтэрч захиалах")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
