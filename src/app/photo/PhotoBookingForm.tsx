"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/ui/sx";
import { PHOTO_SERVICES } from "@/lib/db/data";
import { useAuth } from "@/lib/auth/auth";
import { useAuthModal } from "@/lib/auth/authModal";
import { createPhotoBooking } from "@/lib/db/admin";
import { supabase } from "@/lib/db/supabase";
import { Calendar } from "@/components/ui/Calendar";
import { useI18n } from "@/lib/i18n";
import { Price } from "@/lib/reference/currency";
import type { PhotographerService } from "@/lib/db/queries";

const INPUT = "background:#050505;border:1px solid #262626;border-radius:9px;padding:13px 15px;color:#fff;font:400 14px Roboto;outline:none;width:100%;";
const LABEL = "font:600 12px Montserrat;letter-spacing:.04em;color:#C8C8C8;margin-bottom:8px;display:block;";
const TIMES = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export function PhotoBookingForm({ photographerName, photographerId, services = [], dailyLimit = 3 }: { photographerName: string; photographerId?: number; services?: PhotographerService[]; dailyLimit?: number }) {
  const { user } = useAuth();
  const { t, loc } = useI18n();
  const authModal = useAuthModal();
  const [serviceType, setServiceType] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [model, setModel] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [dayFull, setDayFull] = useState(false); // тухайн өдөр 3 захиалга дүүрсэн эсэх

  // Зурагчны өөрийн үйлчилгээ; хоосон бол ерөнхий жагсаалт (үнэгүй)
  const serviceList: PhotographerService[] = services.length ? services : PHOTO_SERVICES.map((n) => ({ name: n }));

  // Огноо солигдоход тухайн зурагчны тэр өдрийн захиалгын тоог шалгана
  useEffect(() => {
    if (!date || !photographerId) { setDayFull(false); return; }
    let alive = true;
    supabase.rpc("photo_day_count", { pid: photographerId, d: date }).then(({ data }) => {
      if (alive) setDayFull((data as number ?? 0) >= (dailyLimit || 3));
    });
    return () => { alive = false; };
  }, [date, photographerId, dailyLimit]);

  function chip(active: boolean): string {
    const b = "cursor:pointer;font:600 13px Roboto;padding:11px 14px;border-radius:10px;text-align:center;user-select:none;";
    return active
      ? b + "background:#E10613;color:#fff;border:1px solid #E10613;"
      : b + "background:#111113;color:#C8C8C8;border:1px solid #262626;";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!user) { authModal.open("login"); return; }
    if (!serviceType) return setError(t("Үйлчилгээгээ сонгоно уу."));
    if (!date) return setError(t("Огноогоо сонгоно уу."));
    if (dayFull) return setError(t("Энэ өдөр дүүрсэн байна. Өөр өдөр сонгоно уу."));
    if (!time) return setError(t("Цагаа сонгоно уу."));
    if (!name.trim()) return setError(t("Нэрээ оруулна уу."));
    if (phone.replace(/\D/g, "").length !== 8) return setError(t("Утасны дугаар 8 оронтой байх ёстой."));
    setBusy(true);
    try {
      await createPhotoBooking({
        photographer: photographerName, photographer_id: photographerId ?? null, price,
        service_type: serviceType, booking_date: date, booking_time: time,
        name: name.trim(), phone: phone.replace(/\D/g, ""), moto_model: model.trim(),
        note: note.trim(), user_phone: user?.phone,
      });
      setSent(true);
    } catch (err) {
      if (err instanceof Error && err.message === "PHOTO_DAY_FULL") {
        setDayFull(true);
        setError(t("Уучлаарай, энэ өдөр дөнгөж дүүрлээ. Өөр өдөр сонгоно уу."));
      } else {
        setError(t("Алдаа гарлаа. Дахин оролдоно уу."));
      }
    } finally { setBusy(false); }
  }

  if (sent) {
    return (
      <div style={sx("background:#111113;border:1px solid #262626;border-radius:18px;padding:clamp(28px,5vw,48px);text-align:center;")}>
        <div style={sx("font:800 22px Montserrat;color:#22c55e;")}>✓ {t("Захиалга илгээгдлээ!")}</div>
        <div style={sx("font:400 14px Roboto;color:#A3A3A3;margin-top:10px;")}>
          <b style={{ color: "#fff" }}>{photographerName}</b> — {t(serviceType)}{price ? <> · <Price amount={price} /></> : null}<br />
          {date} {time}<br />
          {t("Бид удахгүй холбогдож баталгаажуулна.")}
        </div>
        <button
          onClick={() => { setSent(false); setServiceType(""); setPrice(null); setDate(""); setTime(""); setModel(""); setNote(""); }}
          style={sx("margin-top:20px;background:#E10613;color:#fff;font:700 13px Montserrat;letter-spacing:.05em;padding:13px 24px;border:none;border-radius:10px;cursor:pointer;")}
        >
          {t("Дахин захиалах")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 26, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div>
          <label style={sx(LABEL)}>{t("1. Үйлчилгээ сонгох")}</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {serviceList.map((s, i) => {
              const label = s.nameEn ? loc(s.name, s.nameEn) : t(s.name);
              const active = serviceType === s.name;
              return (
                <div key={i} onClick={() => { setServiceType(s.name); setPrice(s.price ?? null); }}
                  style={sx(`cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-radius:10px;user-select:none;${active ? "background:#E10613;color:#fff;border:1px solid #E10613;" : "background:#111113;color:#C8C8C8;border:1px solid #262626;"}`)}>
                  <span style={sx("font:600 13px Roboto;")}>{label}</span>
                  {s.price ? <span style={sx(`font:700 13px Montserrat;${active ? "color:#fff;" : "color:#fff;"}`)}><Price amount={s.price} /></span> : null}
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <label style={sx(LABEL)}>{t("2. Огноо")}</label>
          <Calendar value={date} onChange={setDate} />
          {dayFull && <div style={sx("font:500 12px Roboto;color:#f59e0b;margin-top:8px;")}>{t("Энэ өдөр дүүрсэн байна. Өөр өдөр сонгоно уу.")}</div>}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div>
          <label style={sx(LABEL)}>{t("3. Цаг")}</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(72px,1fr))", gap: 8 }}>
            {TIMES.map((slot) => (
              <div key={slot} onClick={() => setTime(slot)} style={sx(chip(time === slot))}>{slot}</div>
            ))}
          </div>
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
          <textarea className="mh-input" placeholder={t("Санаа / нэмэлт тэмдэглэл")} rows={3} value={note} onChange={(e) => setNote(e.target.value)} style={sx(INPUT + "resize:vertical;")} />
        </div>
        {!user && <div style={sx("font:500 12px Roboto;color:#8A8F98;")}>{t("Захиалахын тулд эхлээд нэвтэрсэн байх шаардлагатай.")}</div>}
        {error && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{error}</div>}
        <button type="submit" disabled={busy || dayFull} style={sx(`background:#E10613;color:#fff;font:700 14px Montserrat;letter-spacing:.06em;padding:15px;border:none;border-radius:11px;text-transform:uppercase;cursor:pointer;${busy || dayFull ? "opacity:.6;" : ""}`)}>
          {busy ? t("Илгээж байна…") : user ? t("Захиалга илгээх") : t("Нэвтэрч захиалах")}
        </button>
      </div>
    </form>
  );
}
