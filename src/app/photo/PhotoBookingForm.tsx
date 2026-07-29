"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/ui/sx";
import { useAuth } from "@/lib/auth/auth";
import { useAuthModal } from "@/lib/auth/authModal";
import { createPhotoBooking, createBonumInvoice, PHOTO_DEPOSIT_RATE } from "@/lib/db/admin";
import { supabase } from "@/lib/db/supabase";
import { Calendar } from "@/components/ui/Calendar";
import { useI18n } from "@/lib/i18n";
import { Price } from "@/lib/reference/currency";
import { CountryPicker } from "@/components/checkout/CountryPicker";
import { InternationalPhoneInput } from "@/components/checkout/InternationalPhoneInput";
import { callingCodeOf, isValidPhone, splitE164 } from "@/lib/commerce/checkout";
import type { PhotographerService } from "@/lib/db/queries";

const INPUT = "background:#050505;border:1px solid #262626;border-radius:9px;padding:13px 15px;color:#fff;font:400 14px Roboto;outline:none;width:100%;";
const LABEL = "font:600 12px Montserrat;letter-spacing:.04em;color:#C8C8C8;margin-bottom:8px;display:block;";

export function PhotoBookingForm({ photographerName, photographerId, services = [] }: { photographerName: string; photographerId?: number; services?: PhotographerService[] }) {
  const { user } = useAuth();
  const { t, loc } = useI18n();
  const authModal = useAuthModal();
  const [serviceType, setServiceType] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? ""); // E.164 (+976…, +46… г.м)
  const [phoneCountry, setPhoneCountry] = useState("MN"); // утасны улс — гадаадын хэрэглэгч ч дугаараа оруулна
  const [model, setModel] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dayFull, setDayFull] = useState(false); // тухайн зурагчин тэр өдөр захиалгатай эсэх

  // Зурагчны өөрийн үйлчилгээ; хоосон бол ерөнхий жагсаалт (үнэгүй)
  // Зөвхөн зурагчны өөрийн үйлчилгээ (үнэтэй) — ерөнхий fallback байхгүй
  const serviceList: PhotographerService[] = services;

  // Огноо солигдоход тухайн зурагчны тэр өдрийн захиалгын тоог шалгана
  useEffect(() => {
    if (!date || !photographerId) { setDayFull(false); return; }
    let alive = true;
    supabase.rpc("photo_day_count", { pid: photographerId, d: date }).then(({ data }) => {
      if (alive) setDayFull(Number(data ?? 0) >= 1);
    });
    return () => { alive = false; };
  }, [date, photographerId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!user) { authModal.open("login"); return; }
    if (!serviceType) return setError(t("Үйлчилгээгээ сонгоно уу."));
    if (!price || price <= 0) return setError(t("Энэ үйлчилгээнд үнэ тохируулаагүй байна. Зурагчинтай холбогдоно уу."));
    if (!date) return setError(t("Огноогоо сонгоно уу."));
    if (dayFull) return setError(t("Энэ өдөр дүүрсэн байна. Өөр өдөр сонгоно уу."));
    if (!name.trim()) return setError(t("Нэрээ оруулна уу."));
    const calling = callingCodeOf(phoneCountry);
    const { national } = splitE164(phone, calling);
    if (!national) return setError(t("Утасны дугаараа оруулна уу."));
    if (!isValidPhone(calling, national)) return setError(t("Утасны дугаар буруу байна."));
    setBusy(true);
    try {
      // 1) Захиалга үүсгэнэ (Төлбөр хүлээгдэж буй) → 2) Bonum invoice → 3) төлбөрийн хуудас
      const txId = await createPhotoBooking({
        photographer: photographerName, photographer_id: photographerId ?? null, price,
        service_type: serviceType, booking_date: date,
        name: name.trim(), phone, moto_model: model.trim(),
        note: note.trim(), user_phone: user?.phone,
      });
      const { followUpLink } = await createBonumInvoice(txId, "photo");
      window.location.href = followUpLink; // Bonum төлбөрийн хуудас
    } catch (err) {
      if (err instanceof Error && err.message === "PHOTO_DAY_FULL") {
        setDayFull(true);
        setError(t("Уучлаарай, энэ өдөр дөнгөж дүүрлээ. Өөр өдөр сонгоно уу."));
      } else {
        setError(err instanceof Error && err.message.includes("Төлбөрийн хуудас")
          ? t("Төлбөрийн хуудас үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.")
          : t("Алдаа гарлаа. Дахин оролдоно уу."));
      }
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(280px,100%),1fr))", gap: 26, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div>
          <label style={sx(LABEL)}>{t("1. Үйлчилгээ сонгох")}</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {serviceList.map((s, i) => {
              const label = s.nameEn ? loc(s.name, s.nameEn) : t(s.name);
              const active = serviceType === s.name;
              const priced = !!s.price && s.price > 0;
              // Үнэгүй үйлчилгээг захиалах боломжгүй (урьдчилгаа тооцох боломжгүй)
              return (
                <div key={i} onClick={() => { if (!priced) return; setServiceType(s.name); setPrice(s.price ?? null); }}
                  title={priced ? undefined : t("Үнэ тохируулаагүй")}
                  style={sx(`display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-radius:10px;user-select:none;${!priced ? "cursor:not-allowed;background:#0b0b0d;color:#4b4b50;border:1px solid #1c1c1f;" : active ? "cursor:pointer;background:#E10613;color:#fff;border:1px solid #E10613;" : "cursor:pointer;background:#111113;color:#C8C8C8;border:1px solid #262626;"}`)}>
                  <span style={sx("font:600 13px Roboto;")}>{label}</span>
                  {priced
                    ? <span style={sx("font:700 13px Montserrat;color:#fff;")}><Price amount={s.price as number} /></span>
                    : <span style={sx("font:500 11px Roboto;color:#5b5b60;")}>{t("Үнэ тохируулаагүй")}</span>}
                </div>
              );
            })}
            {serviceList.length === 0 && (
              <div style={sx("font:400 13px Roboto;color:#8A8F98;")}>{t("Энэ зурагчин үйлчилгээгээ хараахан тохируулаагүй байна.")}</div>
            )}
          </div>
        </div>
        <div>
          <label style={sx(LABEL)}>{t("2. Огноо")}</label>
          <Calendar value={date} onChange={setDate} />
          {dayFull && <div style={sx("font:500 12px Roboto;color:#f59e0b;margin-top:8px;")}>{t("Энэ өдөр дүүрсэн байна. Өөр өдөр сонгоно уу.")}</div>}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div><label style={sx(LABEL)}>{t("3. Холбоо барих")}</label>
            <input className="mh-input" placeholder={t("Нэр")} value={name} onChange={(e) => setName(e.target.value)} style={sx(INPUT)} />
          </div>
          <div>
            <div style={sx("font:600 12px Montserrat;letter-spacing:.04em;color:#A3A3A3;margin-bottom:6px;")}>{t("Утасны улс")}</div>
            <CountryPicker value={phoneCountry} onChange={setPhoneCountry} ariaLabel={t("Утасны улс")} />
          </div>
          <InternationalPhoneInput label={t("Утасны дугаар")} value={phone} onChange={setPhone} countryCode={phoneCountry} required />
          <input className="mh-input" placeholder={t("Мотоциклын модель (заавал биш)")} value={model} onChange={(e) => setModel(e.target.value)} style={sx(INPUT)} />
          <textarea className="mh-input" placeholder={t("Санаа / нэмэлт тэмдэглэл")} rows={3} value={note} onChange={(e) => setNote(e.target.value)} style={sx(INPUT + "resize:vertical;")} />
        </div>
        {/* төлбөрийн хураангуй */}
        {price ? (
          <div style={sx("background:#0e0e10;border:1px solid #262626;border-radius:12px;padding:14px 16px;display:flex;flex-direction:column;gap:8px;")}>
            <div style={sx("display:flex;align-items:center;justify-content:space-between;font:500 13px Roboto;color:#A3A3A3;")}>
              <span>{t("Үйлчилгээний үнэ")}</span><span style={sx("color:#fff;font-weight:700;")}><Price amount={price} /></span>
            </div>
            <div style={sx("display:flex;align-items:center;justify-content:space-between;font:600 14px Roboto;color:#fff;border-top:1px solid #1c1c1f;padding-top:8px;")}>
              <span>{t("Одоо төлөх урьдчилгаа")} ({Math.round(PHOTO_DEPOSIT_RATE * 100)}%)</span>
              <span style={sx("color:#E10613;font:800 16px Montserrat;")}><Price amount={Math.round(price * PHOTO_DEPOSIT_RATE)} /></span>
            </div>
            <div style={sx("font:400 11px Roboto;color:#8A8F98;")}>{t("Үлдэгдлийг зураг авалт дээр төлнө. Урьдчилгаа төлөгдмөгц захиалга баталгаажна.")}</div>
          </div>
        ) : null}
        {!user && <div style={sx("font:500 12px Roboto;color:#8A8F98;")}>{t("Захиалахын тулд эхлээд нэвтэрсэн байх шаардлагатай.")}</div>}
        {error && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{error}</div>}
        <button type="submit" disabled={busy || dayFull} style={sx(`background:#E10613;color:#fff;font:700 14px Montserrat;letter-spacing:.06em;padding:15px;border:none;border-radius:11px;text-transform:uppercase;cursor:pointer;${busy || dayFull ? "opacity:.6;" : ""}`)}>
          {busy ? t("Төлбөр рүү шилжиж байна…") : user ? t("Захиалах") : t("Нэвтэрч захиалах")}
        </button>
      </div>
    </form>
  );
}
