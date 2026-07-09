"use client";

// Сагсны бие — modal болон /cart хуудас 2уланд нь ашиглана.

import { useEffect, useState } from "react";
import Link from "next/link";
import { sx } from "@/lib/sx";
import { Price } from "@/lib/currency";
import { useAuth } from "@/lib/auth";
import { useAuthModal } from "@/lib/authModal";
import { createOrder, createBonumInvoice } from "@/lib/admin";
import { getCart, setCartQty, removeFromCart, clearCart, CART_EVENT, type CartItem } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { Select } from "@/components/Select";

const PAYMENT_METHODS = ["Visa", "Mastercard", "American Express", "UnionPay", "T Card", "Apple Pay", "Google Pay", "WeChat Pay", "QPay", "SocialPay", "HiPay"];
const COUNTRIES = ["Mongolia", "China", "Japan", "South Korea", "Kazakhstan", "Russia", "USA", "Germany", "United Kingdom", "France", "Australia"];
const OTHER = "__other";
const SHIP_INPUT = "background:#050505;border:1px solid #262626;border-radius:10px;padding:12px 14px;color:#fff;font:400 14px Roboto;outline:none;width:100%;";
const SHIP_LABEL = "font:600 11px Montserrat;letter-spacing:.03em;color:#A3A3A3;margin-bottom:6px;display:block;";

// onNavigate: сагснаас өөр хуудас руу шилжих/захиалга дуусах үед дуудна (modal бол хаана).
export function CartBody({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const authModal = useAuthModal();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  // хүргэлтийн хаяг (олон улсын захиалга)
  const [shipCountry, setShipCountry] = useState("");
  const [customCountry, setCustomCountry] = useState("");
  const [shipName, setShipName] = useState("");
  const [shipPhone, setShipPhone] = useState("");
  const [shipAddress, setShipAddress] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = () => setItems(getCart());
    load(); setReady(true);
    window.addEventListener(CART_EVENT, load);
    return () => window.removeEventListener(CART_EVENT, load);
  }, []);

  useEffect(() => {
    if (user) { setShipName((n) => n || user.name || ""); setShipPhone((p) => p || user.phone || ""); }
  }, [user]);

  const total = items.reduce((s, x) => s + x.price * x.qty, 0);

  async function checkout() {
    if (!user) { onNavigate?.(); authModal.open("login"); return; }
    const country = shipCountry === OTHER ? customCountry.trim() : shipCountry;
    if (!country) return setErr(t("Хүргэх улсаа сонгоно уу."));
    if (!shipName.trim()) return setErr(t("Хүлээн авагчийн нэрээ оруулна уу."));
    if (!shipPhone.trim()) return setErr(t("Утасны дугаараа оруулна уу."));
    if (!shipAddress.trim()) return setErr(t("Хүргэх хаягаа оруулна уу."));
    setErr(""); setBusy(true);
    try {
      // Нэг checkout = нэг transactionId (Bonum-д дамжина, webhook үүгээр захиалгыг олно)
      const txId = `MH${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
      for (const it of items) {
        const label = `${it.name}${it.meta ? ` (${it.meta})` : ""}${it.qty > 1 ? ` ×${it.qty}` : ""}`;
        await createOrder({
          userPhone: user.phone, item: label, total: it.price * it.qty, transactionId: txId,
          shipCountry: country, shipName: shipName.trim(), shipPhone: shipPhone.trim(), shipAddress: shipAddress.trim(),
        });
      }
      // Bonum төлбөрийн хуудас үүсгэж, тийш чиглүүлнэ (төлмөгц webhook захиалгыг "Төлсөн" болгоно)
      const { followUpLink } = await createBonumInvoice(txId);
      clearCart();
      window.location.href = followUpLink;
    } catch (e) {
      setErr(t("Төлбөрийн хуудас үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.") + " " + (e instanceof Error ? e.message : ""));
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div style={sx("background:#111113;border:1px solid #262626;border-radius:18px;padding:clamp(28px,5vw,48px);text-align:center;")}>
        <div style={sx("font:800 22px Montserrat;color:#22c55e;")}>✓ {t("Захиалга илгээгдлээ!")}</div>
        <div style={sx("font:400 14px Roboto;color:#A3A3A3;margin-top:10px;")}>
          {t("Захиалгыг баталгаажуулсны дараа төлбөр/хүргэлтийг тохирно. Олон улсын карт болон digital wallet төлбөрүүдийг дэмжинэ.")}
        </div>
        <Link href="/account/orders" onClick={onNavigate} style={sx("display:inline-block;margin-top:20px;background:#E10613;color:#fff;font:700 13px Montserrat;letter-spacing:.05em;padding:13px 24px;border-radius:10px;text-transform:uppercase;cursor:pointer;")}>
          {t("Миний захиалга")}
        </Link>
      </div>
    );
  }

  if (!ready) return null;

  if (items.length === 0) {
    return (
      <div style={sx("background:#111113;border:1px solid #262626;border-radius:18px;padding:44px 24px;text-align:center;")}>
        <div style={sx("font:600 16px Montserrat;color:#C8C8C8;")}>{t("Сагс хоосон байна")} 🛒</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
          <Link href="/gear" onClick={onNavigate} style={sx("background:#E10613;color:#fff;font:700 13px Montserrat;padding:12px 22px;border-radius:10px;cursor:pointer;")}>{t("Дагалдах хэрэгсэл үзэх")}</Link>
          <Link href="/parts" onClick={onNavigate} style={sx("border:1px solid #444;color:#fff;font:700 13px Montserrat;padding:12px 22px;border-radius:10px;cursor:pointer;")}>{t("Сэлбэг үзэх")}</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={sx("background:#111113;border:1px solid #262626;border-radius:16px;overflow:hidden;")}>
        {items.map((it) => (
          <div key={`${it.id}-${it.meta ?? ""}`} style={sx("display:flex;align-items:center;gap:14px;padding:14px 16px;border-bottom:1px solid #1c1c1f;flex-wrap:wrap;")}>
            <div style={sx("width:64px;height:64px;border-radius:10px;overflow:hidden;background:#fff;flex-shrink:0;")}>
              {it.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.image} alt="" style={sx("width:100%;height:100%;object-fit:contain;")} />
              ) : (
                <div style={sx("width:100%;height:100%;background:#1a1a1d;")} />
              )}
            </div>
            <div style={{ minWidth: 160, flex: 1 }}>
              <div style={sx("font:700 15px Montserrat;color:#fff;")}>{it.name}</div>
              {it.meta && <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:2px;")}>{it.meta}</div>}
              <div style={sx("font:700 14px Montserrat;color:#E10613;margin-top:4px;")}><Price amount={it.price} /></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setCartQty(it.id, it.meta, it.qty - 1)} style={sx("width:32px;height:32px;border-radius:8px;background:#0B0B0D;border:1px solid #333;color:#fff;font:700 15px Montserrat;cursor:pointer;")}>−</button>
              <span style={sx("font:700 15px Montserrat;color:#fff;min-width:26px;text-align:center;")}>{it.qty}</span>
              <button onClick={() => setCartQty(it.id, it.meta, it.qty + 1)} style={sx("width:32px;height:32px;border-radius:8px;background:#0B0B0D;border:1px solid #333;color:#fff;font:700 15px Montserrat;cursor:pointer;")}>+</button>
            </div>
            <div style={sx("font:800 15px Montserrat;color:#fff;min-width:110px;text-align:right;")}><Price amount={it.price * it.qty} /></div>
            <button onClick={() => removeFromCart(it.id, it.meta)} aria-label={t("Устгах")} style={sx("background:none;border:none;color:#ef4444;font:700 16px Montserrat;cursor:pointer;padding:6px;")}>✕</button>
          </div>
        ))}
      </div>

      {/* хүргэлтийн хаяг */}
      <div style={sx("background:#111113;border:1px solid #262626;border-radius:16px;padding:18px 18px 20px;margin-top:20px;")}>
        <div style={sx("font:700 11px 'JetBrains Mono';letter-spacing:.14em;color:#E10613;text-transform:uppercase;")}>{t("Хүргэлтийн хаяг")}</div>
        <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:6px;margin-bottom:14px;")}>{t("Улс болон хаягаа оруулаарай — admin хүргэлтийн үнийг тооцож холбогдоно.")}</div>
        <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;")}>
          <div>
            <label style={sx(SHIP_LABEL)}>{t("Хүргэх улс")}</label>
            <Select
              value={shipCountry}
              onChange={setShipCountry}
              placeholder={t("Улс сонгох…")}
              ariaLabel={t("Хүргэх улс")}
              full
              bg="#050505"
              options={[...COUNTRIES.map((c) => ({ value: c, label: c })), { value: OTHER, label: t("Бусад…") }]}
            />
            {shipCountry === OTHER && (
              <input value={customCountry} onChange={(e) => setCustomCountry(e.target.value)} placeholder={t("Улсын нэр")} style={sx(SHIP_INPUT + "margin-top:8px;")} />
            )}
          </div>
          <div>
            <label style={sx(SHIP_LABEL)}>{t("Хүлээн авагчийн нэр")}</label>
            <input value={shipName} onChange={(e) => setShipName(e.target.value)} style={sx(SHIP_INPUT)} />
          </div>
          <div>
            <label style={sx(SHIP_LABEL)}>{t("Утасны дугаар")}</label>
            <input value={shipPhone} onChange={(e) => setShipPhone(e.target.value)} style={sx(SHIP_INPUT)} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={sx(SHIP_LABEL)}>{t("Хүргэх хаяг (хот, гудамж, шуудангийн код)")}</label>
          <textarea value={shipAddress} onChange={(e) => setShipAddress(e.target.value)} rows={3} style={sx(SHIP_INPUT + "resize:vertical;")} />
        </div>
        {err && <div style={sx("font:500 13px Roboto;color:#ef4444;margin-top:10px;")}>{err}</div>}
      </div>

      <div style={sx("display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:20px;")}>
        <div>
          <div style={sx("font:600 11px 'JetBrains Mono';letter-spacing:.12em;color:#8A8F98;")}>{t("НИЙТ ДҮН")}</div>
          <div style={sx("font:800 26px Montserrat;color:#E10613;margin-top:2px;")}><Price amount={total} /></div>
        </div>
        <button
          onClick={checkout}
          disabled={busy}
          style={sx(`background:#E10613;color:#fff;font:700 15px Montserrat;letter-spacing:.05em;padding:16px 34px;border:none;border-radius:12px;text-transform:uppercase;cursor:pointer;${busy ? "opacity:.6;" : ""}`)}
        >
          {busy ? t("Төлбөр рүү шилжиж байна…") : user ? t("Төлбөр төлөх") : t("Нэвтэрч төлөх")}
        </button>
      </div>
      <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:12px;")}>
        {t("Захиалгыг баталгаажуулсны дараа төлбөр/хүргэлтийг тохирно. Олон улсын карт болон digital wallet төлбөрүүдийг дэмжинэ.")}
      </div>
      <div style={sx("background:#0B0B0D;border:1px solid #262626;border-radius:14px;padding:14px 16px;margin-top:14px;")}>
        <div style={sx("font:700 11px 'JetBrains Mono';letter-spacing:.12em;color:#E10613;text-transform:uppercase;")}>{t("Төлбөрийн боломжууд")}</div>
        <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:7px;")}>
          {t("Visa, Mastercard, American Express, UnionPay, T Card, Apple Pay, Google Pay, WeChat Pay, QPay, SocialPay, HiPay дэмжинэ.")}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
          {PAYMENT_METHODS.map((method) => (
            <span key={method} style={sx("font:700 10px Montserrat;color:#C8C8C8;border:1px solid #333;background:#111113;border-radius:999px;padding:6px 9px;")}>
              {method}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
