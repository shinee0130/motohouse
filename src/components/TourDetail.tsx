"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sx } from "@/lib/sx";
import { Slot } from "@/components/Slot";
import { Price } from "@/lib/currency";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { createTourBooking } from "@/lib/admin";
import type { Tour } from "@/lib/queries";

const LABEL = "font:600 11px Montserrat;letter-spacing:.03em;color:#A3A3A3;margin-bottom:6px;display:block;";
const INPUT = "background:#050505;border:1px solid #262626;border-radius:10px;padding:12px 14px;color:#fff;font:400 14px Roboto;outline:none;width:100%;";

export function TourDetail({ tour }: { tour: Tour }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const left = Math.max(0, tour.maxCapacity - tour.booked);
  const soldOut = tour.status !== "Нээлттэй" || left <= 0;

  const [people, setPeople] = useState(1);
  const [motoChoice, setMotoChoice] = useState<"own" | "rental">(tour.rentalAvailable ? "rental" : "own");
  const [motoModel, setMotoModel] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (user) { setName((n) => n || user.name || ""); setPhone((p) => p || user.phone || ""); }
  }, [user]);

  const total = tour.price * people;

  async function book() {
    if (!user) { router.push("/login"); return; }
    if (people < 1) return setErr(t("Хүний тоог оруулна уу."));
    if (people > left) return setErr(t("Сул суудлаас хэтэрсэн байна."));
    if (motoChoice === "own" && !motoModel.trim()) return setErr(t("Өөрийн мотоциклийн моделийг бичнэ үү."));
    if (!name.trim()) return setErr(t("Нэрээ оруулна уу."));
    if (!phone.trim()) return setErr(t("Утасны дугаараа оруулна уу."));
    setErr(""); setBusy(true);
    try {
      const id = await createTourBooking({
        tourId: tour.id, userPhone: user.phone, name: name.trim(), phone: phone.trim(),
        people, motoChoice, motoModel: motoChoice === "own" ? motoModel.trim() : (tour.rentalMoto || t("Түрээсийн мото")),
        note: note.trim(), total,
      });
      setBookingId(id); setDone(true);
    } catch (e) {
      if (e instanceof Error && e.message === "TOUR_FULL") setErr(t("Уучлаарай, суудал дөнгөж дүүрлээ. Хуудсаа шинэчилнэ үү."));
      else setErr(t("Алдаа гарлаа. Дахин оролдоно уу.") + " " + (e instanceof Error ? e.message : ""));
    } finally { setBusy(false); }
  }

  return (
    <div style={sx("max-width:1080px;margin:0 auto;padding:clamp(24px,4vw,44px) clamp(20px,4vw,40px);animation:mhfade .5s both;")}>
      <Link href="/travel" style={sx("font:600 13px Montserrat;color:#8A8F98;cursor:pointer;")}>← {t("Аялал")}</Link>

      {/* hero */}
      <div style={sx("position:relative;height:clamp(200px,32vw,340px);border-radius:18px;overflow:hidden;border:1px solid #262626;margin-top:16px;background:#0d0d0f;")}>
        {tour.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tour.image} alt={tour.title} style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;")} />
        ) : (
          <Slot label={t("Аяллын зураг")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        )}
        <div style={sx("position:absolute;inset:0;background:linear-gradient(to top,rgba(5,5,5,.9),rgba(5,5,5,.1));")} />
        <div style={{ position: "absolute", left: "clamp(16px,3vw,26px)", bottom: "clamp(16px,3vw,26px)", right: 20 }}>
          {tour.region && <div style={sx("font:600 11px 'JetBrains Mono';letter-spacing:.14em;color:#E10613;")}>{tour.region}</div>}
          <h1 style={sx("font:800 clamp(24px,4vw,40px) Montserrat;color:#fff;margin-top:4px;text-transform:uppercase;")}>{tour.title}</h1>
        </div>
      </div>

      <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:clamp(20px,3vw,32px);margin-top:24px;align-items:start;")}>
        {/* мэдээлэл */}
        <div>
          <div style={sx("display:grid;grid-template-columns:1fr 1fr;gap:12px;")}>
            <Metric label={t("Үргэлжлэх хугацаа")} value={`${tour.durationDays} ${t("хоног")}`} />
            <Metric label={t("Огноо")} value={tour.startDate || "—"} />
            <Metric label={t("Сул суудал")} value={soldOut ? t("Дүүрсэн") : `${left} / ${tour.maxCapacity}`} />
            <Metric label={t("1 хүний үнэ")} value={<Price amount={tour.price} />} />
          </div>
          {tour.description && (
            <p style={sx("font:400 15px/1.7 Roboto;color:#A3A3A3;margin-top:18px;white-space:pre-wrap;")}>{tour.description}</p>
          )}
          <div style={sx("margin-top:16px;background:#0B0B0D;border:1px solid #262626;border-radius:12px;padding:14px 16px;")}>
            <div style={sx("font:700 11px Montserrat;letter-spacing:.05em;color:#fff;")}>🏍 {t("Мотоцикл")}</div>
            <div style={sx("font:400 13px/1.6 Roboto;color:#8A8F98;margin-top:6px;")}>
              {tour.rentalAvailable
                ? t("Өөрийн мотоциклоор эсвэл манай түрээсийн мотоциклоор аялж болно (үнэд багтсан).")
                : t("Өөрийн мотоциклоор оролцоно.")}
              {tour.rentalAvailable && tour.rentalMoto ? ` · ${t("Түрээсийн мото")}: ${tour.rentalMoto}` : ""}
            </div>
          </div>
        </div>

        {/* booking */}
        <div style={sx("background:#111113;border:1px solid #262626;border-radius:18px;padding:clamp(18px,3vw,24px);position:sticky;top:88px;")}>
          {done ? (
            <div style={{ textAlign: "center" }}>
              <div style={sx("font:800 20px Montserrat;color:#22c55e;")}>✓ {t("Захиалга илгээгдлээ!")}</div>
              <div style={sx("font:400 13px Roboto;color:#A3A3A3;margin-top:8px;")}>
                {t("Бид удахгүй холбогдож баталгаажуулна.")} <b style={{ color: "#fff" }}>#{bookingId}</b>
              </div>
              <Link href="/account/bookings" style={sx("display:inline-block;margin-top:16px;background:#E10613;color:#fff;font:700 13px Montserrat;padding:12px 22px;border-radius:10px;cursor:pointer;")}>{t("Миний аяллууд")}</Link>
            </div>
          ) : soldOut ? (
            <div style={{ textAlign: "center" }}>
              <div style={sx("font:800 18px Montserrat;color:#C8C8C8;")}>{t("Суудал дүүрсэн")}</div>
              <div style={sx("font:400 13px Roboto;color:#8A8F98;margin-top:8px;")}>{t("Энэ аяллын суудал дүүрсэн байна. Дараагийн аяллыг хүлээгээрэй.")}</div>
            </div>
          ) : (
            <>
              <div style={sx("font:700 16px Montserrat;color:#fff;margin-bottom:16px;")}>{t("Аялал захиалах")}</div>

              {/* хүний тоо */}
              <label style={sx(LABEL)}>{t("Хүний тоо")}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <button type="button" onClick={() => setPeople((p) => Math.max(1, p - 1))} style={sx("width:38px;height:38px;border-radius:9px;background:#0B0B0D;border:1px solid #333;color:#fff;font:700 17px Montserrat;cursor:pointer;")}>−</button>
                <span style={sx("font:800 18px Montserrat;color:#fff;min-width:30px;text-align:center;")}>{people}</span>
                <button type="button" onClick={() => setPeople((p) => Math.min(left, p + 1))} style={sx("width:38px;height:38px;border-radius:9px;background:#0B0B0D;border:1px solid #333;color:#fff;font:700 17px Montserrat;cursor:pointer;")}>+</button>
                <span style={sx("font:400 12px Roboto;color:#8A8F98;")}>{t("Сул")}: {left}</span>
              </div>

              {/* мото сонголт */}
              {tour.rentalAvailable && (
                <>
                  <label style={sx(LABEL)}>{t("Мотоцикл")}</label>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                    {([["rental", t("Түрээсийн мото")], ["own", t("Өөрийн мото")]] as const).map(([val, lbl]) => (
                      <button key={val} type="button" onClick={() => setMotoChoice(val)}
                        style={sx(`flex:1;min-width:120px;cursor:pointer;font:600 13px Montserrat;padding:11px;border-radius:10px;${motoChoice === val ? "background:#E10613;border:1px solid #E10613;color:#fff;" : "background:#0B0B0D;border:1px solid #333;color:#C8C8C8;"}`)}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {(motoChoice === "own" || !tour.rentalAvailable) && (
                <div style={{ marginBottom: 12 }}>
                  <label style={sx(LABEL)}>{t("Таны мотоциклийн модель")}</label>
                  <input value={motoModel} onChange={(e) => setMotoModel(e.target.value)} placeholder={t("Жиш: Honda CB500X")} style={sx(INPUT)} />
                </div>
              )}
              {motoChoice === "rental" && tour.rentalMoto && (
                <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-bottom:12px;")}>{t("Түрээсийн мото")}: <b style={{ color: "#C8C8C8" }}>{tour.rentalMoto}</b> ({t("үнэд багтсан")})</div>
              )}

              <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <label style={sx(LABEL)}>{t("Нэр")}</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} style={sx(INPUT)} />
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <label style={sx(LABEL)}>{t("Утас")}</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} style={sx(INPUT)} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={sx(LABEL)}>{t("Нэмэлт тэмдэглэл (сонгох)")}</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} style={sx(INPUT + "resize:vertical;")} />
              </div>

              {/* нийт */}
              <div style={sx("display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-top:1px solid #1c1c1f;")}>
                <span style={sx("font:600 12px 'JetBrains Mono';letter-spacing:.1em;color:#8A8F98;")}>{t("НИЙТ")} ({people} {t("хүн")})</span>
                <span style={sx("font:800 22px Montserrat;color:#E10613;")}><Price amount={total} /></span>
              </div>

              {err && <div style={sx("font:500 13px Roboto;color:#ef4444;margin-bottom:10px;")}>{err}</div>}
              <button onClick={book} disabled={busy}
                style={sx(`width:100%;background:#E10613;color:#fff;font:700 15px Montserrat;letter-spacing:.04em;padding:16px;border:none;border-radius:12px;text-transform:uppercase;cursor:pointer;${busy ? "opacity:.6;" : ""}`)}>
                {busy ? t("Илгээж байна…") : user ? t("Захиалах") : t("Нэвтэрч захиалах")}
              </button>
              <div style={sx("font:400 11px Roboto;color:#8A8F98;text-align:center;margin-top:10px;")}>
                {t("Захиалснаар суудал захиалагдана — бид холбогдож төлбөр/нөхцөлийг баталгаажуулна.")}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={sx("background:#0B0B0D;border:1px solid #262626;border-radius:12px;padding:12px 14px;")}>
      <div style={sx("font:700 10px 'JetBrains Mono';letter-spacing:.1em;color:#8A8F98;text-transform:uppercase;")}>{label}</div>
      <div style={sx("font:800 15px Montserrat;color:#fff;margin-top:5px;")}>{value}</div>
    </div>
  );
}
