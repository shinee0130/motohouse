"use client";

// Сагсны бие — modal болон /cart хуудас 2уланд нь ашиглана.
// Хүргэлтийн хаягийг олон улсын, mobile-first, бүтэцлэсэн form-оор авна.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { sx } from "@/lib/sx";
import { Price } from "@/lib/currency";
import { useAuth } from "@/lib/auth";
import { useAuthModal } from "@/lib/authModal";
import { createOrder, createBonumInvoice } from "@/lib/admin";
import { getCart, setCartQty, removeFromCart, clearCart, CART_EVENT, type CartItem } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { DEFAULT_COUNTRY, countryByCode } from "@/lib/countries";
import {
  callingCodeOf, composeAddress, isValidPhone, splitE164, toE164, validateAddress,
  type AddrFieldKey, type AddressValue, type DeliveryMethod,
} from "@/lib/checkout";
import { saveAddress, toAddressValue, type SavedAddress } from "@/lib/addresses";
import { hasReverseGeocode, getReverseGeocoder } from "@/lib/addressAutocomplete";
import { Section, TextField } from "@/components/checkout/fields";
import { DeliveryMethodSelector } from "@/components/checkout/DeliveryMethodSelector";
import { CountryPicker } from "@/components/checkout/CountryPicker";
import { InternationalPhoneInput } from "@/components/checkout/InternationalPhoneInput";
import { AddressForm } from "@/components/checkout/AddressForm";
import { SavedAddressSelector } from "@/components/checkout/SavedAddressSelector";
import { OrderSummary } from "@/components/checkout/OrderSummary";

// Bonum терминал дээр бодитоор идэвхтэй хэрэгслүүд (QPAY + E_COMMERCE картын суваг)
const PAYMENT_METHODS = [
  { name: "QPay", src: "/assets/payments/qpay.png", width: 44 },
  { name: "SocialPay", src: "/assets/payments/socialpay.png", width: 130 },
  { name: "Visa", src: "/assets/payments/visa.png", width: 64 },
  { name: "Mastercard", src: "/assets/payments/mastercard.png", width: 110 },
];

export function CartBody({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const authModal = useAuthModal();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  // Хүргэлт / хаяг
  const [method, setMethod] = useState<DeliveryMethod>("delivery");
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY);
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<AddressValue>({});
  const [saveThis, setSaveThis] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [reloadKey] = useState(0);

  // Алдаанууд
  const [errName, setErrName] = useState<string>();
  const [errPhone, setErrPhone] = useState<string>();
  const [addrErrors, setAddrErrors] = useState<Partial<Record<AddrFieldKey, string>>>({});
  const [err, setErr] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () => setItems(getCart());
    const initial = window.setTimeout(() => { load(); setReady(true); }, 0);
    window.addEventListener(CART_EVENT, load);
    return () => {
      window.clearTimeout(initial);
      window.removeEventListener(CART_EVENT, load);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const initial = window.setTimeout(() => {
      setRecipientName((n) => n || user.name || "");
      setPhone((p) => p || user.phone || "");
    }, 0);
    return () => window.clearTimeout(initial);
  }, [user]);

  const total = items.reduce((s, x) => s + x.price * x.qty, 0);
  const itemCount = items.reduce((s, x) => s + x.qty, 0);

  function applySaved(a: SavedAddress) {
    setSelectedSavedId(a.id);
    setCountryCode(a.countryCode || DEFAULT_COUNTRY);
    if (a.recipientName) setRecipientName(a.recipientName);
    if (a.phone) setPhone(a.phone);
    setAddress(toAddressValue(a));
    setAddrErrors({});
  }
  function pickSaved(a: SavedAddress | null) {
    if (a) applySaved(a);
    else { setSelectedSavedId(null); setAddress({}); setAddrErrors({}); }
  }

  function useLocation() {
    const geo = getReverseGeocoder();
    if (!geo || typeof navigator === "undefined" || !navigator.geolocation) {
      setErr(t("Байршил тогтоох боломжгүй байна."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const d = await geo.reverse(pos.coords.latitude, pos.coords.longitude);
          if (d) { setAddress((v) => ({ ...v, ...d.address })); if (d.countryCode) setCountryCode(d.countryCode); }
        } catch { setErr(t("Байршлаас хаяг тодорхойлж чадсангүй.")); }
      },
      () => setErr(t("Байршлын зөвшөөрөл өгөгдсөнгүй.")),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  function focusFirstError() {
    setTimeout(() => {
      const el = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      el?.focus();
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 30);
  }

  async function checkout() {
    if (!user) { onNavigate?.(); authModal.open("login"); return; }

    const calling = callingCodeOf(countryCode);
    const { national } = splitE164(phone, calling);

    const nameErr = recipientName.trim() ? undefined : "Заавал бөглөнө үү";
    const phoneErr = !national ? "Заавал бөглөнө үү" : (isValidPhone(calling, national) ? undefined : "Утасны дугаар буруу байна.");
    const aErrs = method === "delivery" ? validateAddress(countryCode, address) : {};

    setErrName(nameErr && t(nameErr));
    setErrPhone(phoneErr && t(phoneErr));
    setAddrErrors(aErrs);

    if (nameErr || phoneErr || Object.keys(aErrs).length) { setErr(""); focusFirstError(); return; }

    setErr(""); setBusy(true);
    try {
      const country = countryByCode(countryCode);
      const e164 = toE164(calling, national);
      const shipCountry = method === "pickup" ? "Дэлгүүрээс авах" : (country?.nameEn || countryCode);
      const shipAddress = method === "pickup"
        ? "MOTO HOUSE — Uniqcenter, Хан-Уул, УБ"
        : composeAddress(country, address);

      // Хаяг хадгалах (сонгосон бол)
      if (method === "delivery" && saveThis) {
        try {
          await saveAddress({
            label: saveLabel.trim() || t("Хаяг"),
            recipientName: recipientName.trim(), phone: e164, countryCode,
            address, isDefault: selectedSavedId === null && reloadKey === 0,
          });
        } catch { /* хадгалалт амжилтгүй ч захиалгыг зогсоохгүй */ }
      }

      const txId = `MH${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
      for (const it of items) {
        const label = `${it.name}${it.meta ? ` (${it.meta})` : ""}${it.qty > 1 ? ` ×${it.qty}` : ""}`;
        await createOrder({
          userPhone: user.phone, item: label, total: it.price * it.qty, transactionId: txId,
          shipCountry, shipName: recipientName.trim(), shipPhone: e164, shipAddress,
          countryCode: method === "pickup" ? undefined : countryCode, deliveryMethod: method,
        });
      }
      const { followUpLink } = await createBonumInvoice(txId);
      clearCart();
      window.location.href = followUpLink;
    } catch (e) {
      setErr(t("Төлбөрийн хуудас үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.") + " " + (e instanceof Error ? e.message : ""));
      setBusy(false);
    }
  }

  if (!ready) return null;

  if (items.length === 0) {
    return (
      <div style={sx("padding:44px 0;text-align:center;")}>
        <div style={sx("font:600 16px Montserrat;color:#C8C8C8;")}>{t("Сагс хоосон байна")} 🛒</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
          <Link href="/gear" onClick={onNavigate} style={sx("background:#E10613;color:#fff;font:700 13px Montserrat;padding:12px 22px;border-radius:10px;cursor:pointer;")}>{t("Дагалдах хэрэгсэл үзэх")}</Link>
          <Link href="/parts" onClick={onNavigate} style={sx("border:1px solid #444;color:#fff;font:700 13px Montserrat;padding:12px 22px;border-radius:10px;cursor:pointer;")}>{t("Сэлбэг үзэх")}</Link>
        </div>
      </div>
    );
  }

  const delivery = method === "delivery";
  const ctaLabel = busy
    ? t("Төлбөр рүү шилжиж байна…")
    : user ? t("Захиалга үргэлжлүүлэх") : t("Нэвтэрч үргэлжлүүлэх");

  return (
    <div ref={formRef} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Барааны жагсаалт */}
      <div style={sx("overflow:hidden;")}>
        {items.map((it) => (
          <div key={`${it.id}-${it.meta ?? ""}`} style={sx("display:flex;align-items:center;gap:14px;padding:0 0 14px;flex-wrap:wrap;")}>
            <div style={sx("width:56px;height:56px;border-radius:10px;overflow:hidden;background:#fff;flex-shrink:0;")}>
              {it.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.image} alt="" style={sx("width:100%;height:100%;object-fit:contain;")} />
              ) : (<div style={sx("width:100%;height:100%;background:#1a1a1d;")} />)}
            </div>
            <div style={{ minWidth: 140, flex: 1 }}>
              <div style={sx("font:700 14px Montserrat;color:#fff;")}>{it.name}</div>
              {it.meta && <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:2px;")}>{it.meta}</div>}
              <div style={sx("font:700 13px Montserrat;color:#E10613;margin-top:4px;")}><Price amount={it.price} /></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setCartQty(it.id, it.meta, it.qty - 1)} aria-label="−" style={sx("width:34px;height:34px;border-radius:8px;background:#0B0B0D;border:1px solid #333;color:#fff;font:700 15px Montserrat;cursor:pointer;")}>−</button>
              <span style={sx("font:700 15px Montserrat;color:#fff;min-width:26px;text-align:center;")}>{it.qty}</span>
              <button onClick={() => setCartQty(it.id, it.meta, it.qty + 1)} aria-label="+" style={sx("width:34px;height:34px;border-radius:8px;background:#0B0B0D;border:1px solid #333;color:#fff;font:700 15px Montserrat;cursor:pointer;")}>+</button>
            </div>
            <div style={sx("font:800 14px Montserrat;color:#fff;min-width:96px;text-align:right;")}><Price amount={it.price * it.qty} /></div>
            <button onClick={() => removeFromCart(it.id, it.meta)} aria-label={t("Устгах")} style={sx("background:none;border:none;color:#ef4444;font:700 16px Montserrat;cursor:pointer;padding:6px;")}>✕</button>
          </div>
        ))}
      </div>

      {/* 1. Авах хэлбэр */}
      <Section index={1} title={t("Авах хэлбэр")}>
        <DeliveryMethodSelector value={method} onChange={setMethod} />
      </Section>

      {/* Хадгалсан хаяг (нэвтэрсэн, хүргэлт) — байхгүй бол өөрөө нуугдана */}
      {user && delivery && (
        <div style={sx("padding:14px 0;")}>
          <SavedAddressSelector selectedId={selectedSavedId} onPick={pickSaved} reloadKey={reloadKey} />
        </div>
      )}

      {/* 2. Хүлээн авагч */}
      <Section index={2} title={t("Хүлээн авагч")}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          <TextField label={t("Хүлээн авагчийн нэр")} value={recipientName} onChange={setRecipientName} required error={errName} autoComplete="name" />
          <InternationalPhoneInput label={t("Утасны дугаар")} value={phone} onChange={setPhone} countryCode={countryCode} required error={errPhone} />
        </div>
      </Section>

      {delivery && (
        <>
          {/* 3. Хүргэлтийн улс */}
          <Section index={3} title={t("Хүргэлтийн улс")}>
            <CountryPicker value={countryCode} onChange={setCountryCode} ariaLabel={t("Хүргэлтийн улс")} />
            {hasReverseGeocode() && (
              <button type="button" onClick={useLocation}
                style={sx("display:inline-flex;align-items:center;gap:7px;margin-top:10px;background:#0B0B0D;border:1px solid #333;color:#C8C8C8;font:600 12px Montserrat;padding:9px 13px;border-radius:9px;cursor:pointer;")}>
                📍 {t("Одоогийн байршлыг ашиглах")}
              </button>
            )}
          </Section>

          {/* 4. Хүргэлтийн хаяг */}
          <Section index={4} title={t("Хүргэлтийн хаяг")}>
            <AddressForm countryCode={countryCode} value={address} onChange={setAddress} onCountry={setCountryCode} errors={addrErrors} />
            {user && (
              <label style={sx("display:flex;align-items:center;gap:9px;margin-top:14px;cursor:pointer;font:500 13px Roboto;color:#C8C8C8;")}>
                <input type="checkbox" checked={saveThis} onChange={(e) => setSaveThis(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#E10613" }} />
                {t("Энэ хаягийг хадгалах")}
              </label>
            )}
            {user && saveThis && (
              <div style={{ marginTop: 10 }}>
                <TextField label={t("Хаягийн нэр (Гэр / Ажил)")} value={saveLabel} onChange={setSaveLabel} placeholder={t("Гэр")} />
              </div>
            )}
          </Section>
        </>
      )}

      {err && <div role="alert" style={sx("font:500 13px Roboto;color:#ef4444;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);border-radius:10px;padding:11px 13px;")}>{err}</div>}

      {/* 6. Захиалгын дүн — sticky */}
      <div style={{ position: "sticky", bottom: 0, zIndex: 3, paddingTop: 4 }}>
        <OrderSummary
          total={total}
          itemCount={itemCount}
          ctaLabel={ctaLabel}
          onCta={checkout}
          busy={busy}
          note={t("Захиалгыг баталгаажуулсны дараа хүргэлтийн үнийг тооцож холбогдоно.")}
        />
      </div>

      {/* Төлбөрийн боломжууд */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", opacity: 0.75 }}>
        {PAYMENT_METHODS.map((m) => (
          <span key={m.name} title={m.name} style={sx(`height:42px;min-width:${m.name === "SocialPay" ? 144 : m.name === "Mastercard" ? 122 : m.name === "QPay" ? 58 : 78}px;display:flex;align-items:center;justify-content:center;padding:4px 8px;background:#fff;border-radius:5px;`)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.src} alt={m.name} style={{ width: m.width, height: 34, objectFit: "contain", display: "block" }} />
          </span>
        ))}
      </div>
    </div>
  );
}
