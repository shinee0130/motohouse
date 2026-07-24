"use client";

// Header — RevZilla маягийн бүтэц:
// (0) улаан promo тууз (эргэлддэг) → (1) лого + хайлт + хэрэгслүүд (sticky)
// → (2) ангиллын цэс (sticky) → (3) давуу талын мөр (зөвхөн desktop).
// Зүүн drawer цэс хэвээр (hamburger).

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { sx } from "@/lib/ui/sx";
import { Brand } from "@/components/layout/Brand";
import { useAuth } from "@/lib/auth/auth";
import { cartCount, CART_EVENT } from "@/lib/commerce/cart";
import { LanguageToggle, useI18n } from "@/lib/i18n";
import { CurrencySwitch } from "@/lib/reference/currency";
import { useAuthModal } from "@/lib/auth/authModal";
import { useCartModal } from "@/lib/commerce/cartModal";
import {
  IconHome, IconBike, IconHelmet, IconCog, IconWrench, IconRoute, IconCalendar,
  IconTicket, IconCart, IconPackage, IconRequest, IconTruck, IconCard, IconShield, IconCamera,
} from "@/components/ui/icons";

const NAV = [
  { label: "Нүүр", href: "/", Icon: IconHome },
  { label: "Мотоцикл", href: "/motorcycles", Icon: IconBike },
  { label: "Дагалдах хэрэгсэл", href: "/gear", Icon: IconHelmet },
  { label: "Сэлбэг", href: "/parts", Icon: IconPackage },
  { label: "Захиалгын хүсэлт", href: "/request", Icon: IconRequest },
  { label: "Засвар", href: "/service", Icon: IconWrench },
  { label: "Зураг авалт", href: "/photo", Icon: IconCamera },
  { label: "Аялал", href: "/travel", Icon: IconRoute },
  { label: "Event", href: "/events", Icon: IconCalendar },
  { label: "Giveaway", href: "/giveaway", Icon: IconTicket },
  { label: "Миний сагс", href: "/cart", Icon: IconCart },
];

// Ангиллын мөр (RevZilla-гийн HELMETS/RIDING GEAR/… мэт)
const CATS = [
  { label: "Мотоцикл", href: "/motorcycles" },
  { label: "Дагалдах хэрэгсэл", href: "/gear" },
  { label: "Сэлбэг", href: "/parts" },
  { label: "Засвар", href: "/service" },
  { label: "Зураг авалт", href: "/photo" },
  { label: "Аялал", href: "/travel" },
  { label: "Event", href: "/events" },
  { label: "Giveaway", href: "/giveaway", hot: true }, // SALE шиг улаан
];

// Эргэлдэх promo мессежүүд
const PROMOS = [
  "Онлайн төлбөр — QPay, SocialPay, картаар шууд төлөөрэй",
  "Дотоод болон олон улсын хүргэлт",
  "Даваа–Ням 10:00–21:00 · Uniqcenter, Хан-Уул",
];

const ACCOUNT_MENU = [
  { label: "Миний бүртгэл", href: "/account" },
  { label: "Миний захиалга", href: "/account/orders" },
  { label: "Хадгалсан", href: "/account/wishlist" },
  { label: "Профайл", href: "/account/profile" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function SearchIcon({ size = 16, color = "#8A8F98" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

// Хайлтын мөр — submit хийхэд /search руу
function SearchBar({ big = false }: { big?: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const [v, setV] = useState("");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); const q = v.trim(); if (q) router.push(`/search?q=${encodeURIComponent(q)}`); }}
      role="search"
      style={sx(`display:flex;align-items:center;gap:9px;background:#111113;border:1px solid #2a2a2d;border-radius:10px;padding:0 13px;width:100%;height:${big ? 44 : 40}px;`)}
    >
      <SearchIcon />
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={t("Бараа, мотоцикл хайх…")}
        aria-label={t("Хайлт")}
        style={sx("flex:1;min-width:0;background:transparent;border:none;outline:none;color:#fff;font:400 14px Roboto;")}
      />
      {v && (
        <button type="submit" style={sx("background:#E10613;border:none;border-radius:7px;color:#fff;font:700 11px Montserrat;padding:6px 12px;cursor:pointer;letter-spacing:.04em;")}>
          {t("Хайх")}
        </button>
      )}
    </form>
  );
}

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready, logout } = useAuth();
  const { t } = useI18n();
  const authModal = useAuthModal();
  const cartModal = useCartModal();
  const [open, setOpen] = useState(false); // sidebar
  const [acctOpen, setAcctOpen] = useState(false); // avatar dropdown
  const [cart, setCart] = useState(0); // сагсны тоо
  const [promo, setPromo] = useState(0); // promo индекс

  const loggedIn = ready && !!user;

  // Хуудас солигдоход sidebar хаана
  useEffect(() => {
    const id = window.setTimeout(() => {
      setOpen(false);
      setAcctOpen(false);
    }, 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  // Сагсны тоог сонсох
  useEffect(() => {
    const load = () => setCart(cartCount());
    load();
    window.addEventListener(CART_EVENT, load);
    window.addEventListener("storage", load);
    return () => { window.removeEventListener(CART_EVENT, load); window.removeEventListener("storage", load); };
  }, []);

  // Promo автоматаар эргэлдэнэ
  useEffect(() => {
    const id = window.setInterval(() => setPromo((p) => (p + 1) % PROMOS.length), 5000);
    return () => window.clearInterval(id);
  }, []);

  // Sidebar нээлттэй үед body scroll түгжинэ
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function doLogout() {
    logout();
    setAcctOpen(false);
    setOpen(false);
    router.push("/");
  }

  const wrap = "max-width:1280px;margin:0 auto;padding:0 clamp(14px,3vw,32px);";

  return (
    <>
      {/* ===== (0) PROMO ТУУЗ ===== */}
      <div style={sx("background:#E10613;")}>
        <div style={sx(wrap + "height:36px;display:flex;align-items:center;justify-content:center;gap:10px;")}>
          <button onClick={() => setPromo((p) => (p - 1 + PROMOS.length) % PROMOS.length)} aria-label="‹"
            style={sx("background:none;border:none;color:rgba(255,255,255,.7);font:700 15px Montserrat;cursor:pointer;padding:2px 8px;")}>‹</button>
          <span key={promo} style={sx("font:700 12px Montserrat;letter-spacing:.03em;color:#fff;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;animation:mhfade .35s both;")}>
            {t(PROMOS[promo])}
          </span>
          <button onClick={() => setPromo((p) => (p + 1) % PROMOS.length)} aria-label="›"
            style={sx("background:none;border:none;color:rgba(255,255,255,.7);font:700 15px Montserrat;cursor:pointer;padding:2px 8px;")}>›</button>
        </div>
      </div>

      {/* ===== (1+2) STICKY HEADER ===== */}
      <div style={sx("position:sticky;top:0;z-index:50;background:#070708;border-bottom:1px solid #1c1c1f;")}>
        {/* (1) Үндсэн мөр: цэс + лого + хайлт + хэрэгслүүд */}
        <div className="mh-hd-row1" style={sx(wrap + "height:66px;display:flex;align-items:center;gap:14px;")}>
          <button
            onClick={() => setOpen(true)}
            aria-label={t("Цэс нээх")}
            style={sx("background:none;border:1px solid #262626;border-radius:10px;width:42px;height:42px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-direction:column;gap:4px;flex-shrink:0;")}
          >
            <span style={{ width: 17, height: 2, background: "#fff", display: "block" }} />
            <span style={{ width: 17, height: 2, background: "#E10613", display: "block" }} />
            <span style={{ width: 17, height: 2, background: "#fff", display: "block" }} />
          </button>

          <Link href="/" className="mh-hd-brand" style={{ cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 }}>
            <Brand height={42} />
          </Link>

          {/* Хайлт — desktop */}
          <div className="mh-hd-search-desktop" style={{ flex: 1, maxWidth: 560, margin: "0 auto" }}>
            <SearchBar big />
          </div>

          <div style={{ marginLeft: "auto" }} />

          {/* хэл + валют */}
          <div className="mh-nav-switches" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <LanguageToggle compact />
            <CurrencySwitch compact />
          </div>

          <button onClick={() => cartModal.open()} aria-label={t("Миний сагс")} style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: 10, border: "1px solid #262626", background: "none", color: "#fff", flexShrink: 0, cursor: "pointer" }}>
            <IconCart style={{ width: 20, height: 20 }} />
            {cart > 0 && (
              <span style={sx("position:absolute;top:-6px;right:-6px;background:#E10613;color:#fff;font:800 10px Montserrat;min-width:18px;height:18px;padding:0 5px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;")}>
                {cart}
              </span>
            )}
          </button>

          {loggedIn ? (
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => setAcctOpen((v) => !v)}
                aria-label={t("Миний бүртгэл")}
                style={sx("display:flex;align-items:center;justify-content:center;background:none;border:none;padding:0;cursor:pointer;")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="mh-hd-avatar" src={`/assets/tiers/${user!.tier ?? "rookie"}.png`} alt="" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              </button>
              {acctOpen && (
                <>
                  <div onClick={() => setAcctOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                  <div style={sx("position:absolute;top:58px;right:0;z-index:50;min-width:210px;background:#111113;border:1px solid #262626;border-radius:14px;padding:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);")}>
                    <div style={sx("padding:10px 12px 12px;border-bottom:1px solid #1c1c1f;margin-bottom:6px;")}>
                      <div style={sx("font:700 14px Montserrat;color:#fff;")}>{user!.name || t("Хэрэглэгч")}</div>
                      <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:2px;")}>+976 {user!.phone}</div>
                    </div>
                    {user!.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setAcctOpen(false)}
                        style={sx("display:block;padding:10px 12px;border-radius:8px;font:700 13px Montserrat;color:#fff;background:#E10613;margin-bottom:4px;")}
                      >
                        Admin panel
                      </Link>
                    )}
                    {user!.role === "photographer" && (
                      <Link
                        href="/studio"
                        onClick={() => setAcctOpen(false)}
                        style={sx("display:block;padding:10px 12px;border-radius:8px;font:700 13px Montserrat;color:#fff;background:#E10613;margin-bottom:4px;")}
                      >
                        Studio
                      </Link>
                    )}
                    {ACCOUNT_MENU.map((m) => (
                      <Link
                        key={m.href}
                        href={m.href}
                        onClick={() => setAcctOpen(false)}
                        style={sx("display:block;padding:10px 12px;border-radius:8px;font:600 13px Montserrat;color:#C8C8C8;")}
                      >
                        {t(m.label)}
                      </Link>
                    ))}
                    <button
                      onClick={doLogout}
                      style={sx("width:100%;text-align:left;padding:10px 12px;border-radius:8px;background:none;border:none;cursor:pointer;font:600 13px Montserrat;color:#E10613;margin-top:4px;border-top:1px solid #1c1c1f;")}
                    >
                      {t("Гарах")}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => authModal.open("login")}
              className="mh-hd-login"
              style={sx("background:#E10613;color:#fff;font:700 13px Montserrat;letter-spacing:.06em;padding:11px 20px;border:none;border-radius:9px;text-transform:uppercase;cursor:pointer;white-space:nowrap;flex-shrink:0;")}
            >
              {t("Нэвтрэх")}
            </button>
          )}
        </div>

        {/* Хайлт — mobile (тусдаа мөр) */}
        <div className="mh-hd-search-mobile" style={{ padding: "0 14px 10px" }}>
          <SearchBar />
        </div>

        {/* Mobile utility controls — хайлтны доор үргэлж харагдана */}
        <div className="mh-hd-mobile-tools">
          <div className="mh-hd-mobile-switches">
            <LanguageToggle compact />
            <CurrencySwitch compact />
          </div>
          {!loggedIn && (
            <button
              onClick={() => authModal.open("login")}
              aria-label={t("Нэвтрэх")}
              style={sx("background:#E10613;color:#fff;font:700 11px Montserrat;letter-spacing:.04em;padding:9px 13px;border:none;border-radius:8px;text-transform:uppercase;cursor:pointer;white-space:nowrap;")}
            >
              {t("Нэвтрэх")}
            </button>
          )}
        </div>

        {/* (2) Ангиллын мөр */}
        <div style={sx("border-top:1px solid #141416;")}>
          <nav className="mh-hd-cats" aria-label={t("Ангилал")}
            style={sx(wrap + "height:44px;display:flex;align-items:center;gap:clamp(14px,2.4vw,30px);overflow-x:auto;")}>
            {CATS.map((c) => {
              const on = isActive(pathname, c.href);
              return (
                <Link
                  key={c.href}
                  href={c.href}
                  style={sx(
                    `font:700 12px Montserrat;letter-spacing:.07em;text-transform:uppercase;white-space:nowrap;padding:5px 0;border-bottom:2px solid ${on ? "#E10613" : "transparent"};` +
                    (c.hot ? "color:#E10613;" : on ? "color:#fff;" : "color:#A3A3A3;"),
                  )}
                >
                  {t(c.label)}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ===== (3) ДАВУУ ТАЛЫН МӨР (desktop) ===== */}
      <div className="mh-hd-benefits" style={sx("background:#0B0B0D;border-bottom:1px solid #151517;")}>
        <div style={sx(wrap + "height:46px;display:flex;align-items:center;justify-content:center;gap:clamp(18px,4vw,56px);")}>
          {[
            { Icon: IconTruck, text: "Дотоод ба олон улсын хүргэлт" },
            { Icon: IconCard, text: "Онлайн төлбөр — QPay · Карт" },
            { Icon: IconWrench, text: "Мэргэжлийн засварын баг" },
            { Icon: IconShield, text: "Баталгаат оригинал бараа" },
          ].map(({ Icon, text }) => (
            <span key={text} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Icon style={{ width: 18, height: 18, color: "#E10613", flexShrink: 0 }} />
              <span style={sx("font:700 11px Montserrat;letter-spacing:.05em;color:#C8C8C8;text-transform:uppercase;white-space:nowrap;")}>{t(text)}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ===== SIDEBAR DRAWER ===== */}
      {/* overlay */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 90,
          background: "rgba(0,0,0,.6)", backdropFilter: "blur(2px)",
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transition: "opacity .25s ease",
        }}
      />
      {/* panel */}
      <aside
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 95,
          width: "min(300px, 84vw)",
          background: "#0e0e10", borderRight: "1px solid #1c1c1f",
          display: "flex", flexDirection: "column",
          transform: open ? "translateX(0)" : "translateX(-105%)",
          transition: "transform .28s cubic-bezier(.22,.8,.3,1)",
          boxShadow: open ? "20px 0 60px rgba(0,0,0,.5)" : "none",
        }}
      >
        {/* дээд хэсэг: лого (гадуур дарахад автоматаар хаагдана) */}
        <div style={sx("display:flex;align-items:center;padding:16px 18px;border-bottom:1px solid #1c1c1f;")}>
          <Link href="/" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center" }}>
            <Brand height={38} />
          </Link>
        </div>

        {/* цэс */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "14px 12px", overflowY: "auto", flex: 1 }}>
          {NAV.map((item) => {
            const on = isActive(pathname, item.href);
            const isCart = item.href === "/cart";
            const rowStyle = sx(
              `display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:11px;cursor:pointer;font:600 15px Montserrat;letter-spacing:.01em;width:100%;text-align:left;border:none;` +
              (on ? "color:#fff;background:#E10613;" : "color:#A3A3A3;background:transparent;"),
            );
            const inner = (
              <>
                <item.Icon style={{ width: 20, height: 20, flexShrink: 0, opacity: on ? 1 : 0.75 }} />
                {t(item.label)}
                {isCart && cart > 0 && (
                  <span style={sx(`margin-left:auto;font:800 11px Montserrat;min-width:22px;height:22px;padding:0 6px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;${on ? "background:#fff;color:#E10613;" : "background:#E10613;color:#fff;"}`)}>
                    {cart}
                  </span>
                )}
              </>
            );
            // Сагс — modal нээнэ, бусад нь хуудас руу шилжинэ
            return isCart ? (
              <button key={item.href} onClick={() => { setOpen(false); cartModal.open(); }} style={rowStyle}>
                {inner}
              </button>
            ) : (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={rowStyle}>
                {inner}
              </Link>
            );
          })}

          {/* бүртгэлийн хэсэг */}
          <div style={sx("border-top:1px solid #1c1c1f;margin-top:12px;padding-top:12px;")}>
            {loggedIn ? (
              <>
                <div style={sx("display:flex;align-items:center;gap:12px;padding:6px 14px 12px;")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/assets/tiers/${user!.tier ?? "rookie"}.png`} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={sx("font:700 13px Montserrat;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>{user!.name || t("Хэрэглэгч")}</div>
                    <div style={sx("font:400 11px Roboto;color:#8A8F98;")}>+976 {user!.phone}</div>
                  </div>
                </div>
                {user!.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    style={sx("display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:11px;font:700 14px Montserrat;color:#E10613;")}
                  >
                    <IconCog style={{ width: 20, height: 20, flexShrink: 0 }} /> Admin panel
                  </Link>
                )}
                {user!.role === "photographer" && (
                  <Link
                    href="/studio"
                    onClick={() => setOpen(false)}
                    style={sx("display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:11px;font:700 14px Montserrat;color:#E10613;")}
                  >
                    <IconCamera style={{ width: 20, height: 20, flexShrink: 0 }} /> Studio
                  </Link>
                )}
                {ACCOUNT_MENU.map((m) => (
                  <Link
                    key={m.href}
                    href={m.href}
                    onClick={() => setOpen(false)}
                    style={sx("display:block;padding:11px 14px 11px 48px;border-radius:11px;font:600 14px Montserrat;color:#A3A3A3;")}
                  >
                    {t(m.label)}
                  </Link>
                ))}
                <button
                  onClick={doLogout}
                  style={sx("width:100%;text-align:left;padding:12px 14px 12px 48px;border-radius:11px;background:none;border:none;cursor:pointer;font:600 14px Montserrat;color:#E10613;")}
                >
                  {t("Гарах")}
                </button>
              </>
            ) : (
              <button
                onClick={() => { setOpen(false); authModal.open("login"); }}
                style={sx("display:block;width:calc(100% - 4px);text-align:center;background:#E10613;color:#fff;font:700 14px Montserrat;letter-spacing:.06em;padding:14px;border:none;border-radius:11px;text-transform:uppercase;cursor:pointer;margin:4px 2px;")}
              >
                {t("Нэвтрэх")}
              </button>
            )}
          </div>
        </nav>

        {/* доод хэсэг */}
        <div style={sx("padding:14px 18px;border-top:1px solid #1c1c1f;display:flex;flex-direction:column;gap:12px;")}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <LanguageToggle compact />
            <CurrencySwitch compact />
          </div>
          <span style={sx("font:500 11px 'JetBrains Mono';letter-spacing:.1em;color:#5b5b60;")}>RIDE. POWER. LIVE.</span>
        </div>
      </aside>
    </>
  );
}
