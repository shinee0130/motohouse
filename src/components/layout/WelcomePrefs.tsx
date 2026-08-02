"use client";

// Анх зочлоход хэл + мөнгөн тэмдэгтээ сонгуулах цонх (олон улсын сайтуудын
// нийтлэг зан). Нэг л удаа гарна; дараа нь зүүн дээд булангийн ☰ цэс болон
// footer-ээс өөрчилнө.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { sx } from "@/lib/ui/sx";
import { useI18n, type Lang } from "@/lib/i18n";
import { useCurrency } from "@/lib/reference/currency";
import type { Currency } from "@/lib/reference/fx";

const KEY = "motohouse.prefs.v1";

const LANGS: { v: Lang; label: string; sub: string }[] = [
  { v: "mn", label: "Монгол", sub: "Монгол хэл" },
  { v: "en", label: "English", sub: "English" },
];
const CCYS: { v: Currency; label: string; sub: string }[] = [
  { v: "MNT", label: "₮", sub: "Төгрөг" },
  { v: "USD", label: "$", sub: "US Dollar" },
  { v: "EUR", label: "€", sub: "Euro" },
];

export function WelcomePrefs() {
  const { lang, setLang } = useI18n();
  const { ccy, setCcy } = useCurrency();
  const [open, setOpen] = useState(false);
  const [pickLang, setPickLang] = useState<Lang>("mn");
  const [pickCcy, setPickCcy] = useState<Currency>("MNT");

  useEffect(() => {
    // localStorage хаагдсан browser-т ч сайт эвдрэхгүй — цонх зүгээр гарахгүй.
    try {
      if (window.localStorage.getItem(KEY)) return;
    } catch { return; }
    setPickLang(lang);
    setPickCcy(ccy);
    setOpen(true);
    // Зөвхөн эхний render дээр шийднэ — сонголт өөрчлөгдөхөд дахин нээгдэхгүй.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Цонх нээлттэй үед арын гүйлгээг зогсооно
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  function save() {
    setLang(pickLang);
    setCcy(pickCcy);
    try { window.localStorage.setItem(KEY, `${pickLang}|${pickCcy}`); } catch { /* хадгалагдаагүй ч үргэлжилнэ */ }
    setOpen(false);
  }

  const card = (on: boolean) =>
    "flex:1;min-width:96px;cursor:pointer;border-radius:12px;padding:14px 12px;text-align:center;" +
    (on ? "background:rgba(225,6,19,.12);border:1px solid #E10613;" : "background:#0B0B0D;border:1px solid #262626;");

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      style={sx("position:fixed;inset:0;z-index:9998;background:rgba(4,4,5,.78);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;")}
    >
      <div style={sx("width:100%;max-width:420px;background:#111113;border:1px solid #262626;border-radius:18px;padding:24px;animation:mhfade .3s both;")}>
        <div style={sx("font:500 11px 'JetBrains Mono';letter-spacing:.2em;color:#E10613;")}>MOTO HOUSE</div>
        <h2 style={sx("font:800 22px Montserrat;color:#fff;margin-top:8px;")}>Тавтай морил · Welcome</h2>
        <p style={sx("font:400 13px/1.6 Roboto;color:#8A8F98;margin-top:6px;")}>
          Хэл болон мөнгөн тэмдэгтээ сонгоно уу.<br />
          Choose your language and currency.
        </p>

        <div style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.16em;color:#8A8F98;margin-top:20px;")}>ХЭЛ · LANGUAGE</div>
        <div style={{ display: "flex", gap: 10, marginTop: 9 }}>
          {LANGS.map((l) => (
            <button key={l.v} type="button" onClick={() => setPickLang(l.v)} style={sx(card(pickLang === l.v))}>
              <div style={sx(`font:800 15px Montserrat;color:${pickLang === l.v ? "#fff" : "#C8C8C8"};`)}>{l.label}</div>
              <div style={sx("font:400 11px Roboto;color:#8A8F98;margin-top:3px;")}>{l.sub}</div>
            </button>
          ))}
        </div>

        <div style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.16em;color:#8A8F98;margin-top:18px;")}>МӨНГӨН ТЭМДЭГТ · CURRENCY</div>
        <div style={{ display: "flex", gap: 10, marginTop: 9 }}>
          {CCYS.map((c) => (
            <button key={c.v} type="button" onClick={() => setPickCcy(c.v)} style={sx(card(pickCcy === c.v))}>
              <div style={sx(`font:800 18px Montserrat;color:${pickCcy === c.v ? "#fff" : "#C8C8C8"};`)}>{c.label}</div>
              <div style={sx("font:400 11px Roboto;color:#8A8F98;margin-top:3px;")}>{c.sub}</div>
            </button>
          ))}
        </div>

        <button type="button" onClick={save}
          style={sx("width:100%;margin-top:22px;background:#E10613;color:#fff;border:none;border-radius:11px;padding:14px;font:700 14px Montserrat;letter-spacing:.04em;cursor:pointer;text-transform:uppercase;")}>
          Үргэлжлүүлэх · Continue
        </button>
        <div style={sx("font:400 11px Roboto;color:#6b7280;margin-top:10px;text-align:center;")}>
          Дараа нь ☰ цэс эсвэл хуудасны хөлнөөс өөрчилж болно.
        </div>
      </div>
    </div>,
    document.body,
  );
}
