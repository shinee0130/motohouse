"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { sx } from "@/lib/sx";
import { Brand } from "./Brand";
import { useAuth } from "@/lib/auth";
import { cartCount, CART_EVENT } from "@/lib/cart";
import { IconHome, IconBike, IconHelmet, IconCog, IconWrench, IconMap, IconFlag, IconGift, IconCart } from "./icons";

const NAV = [
  { label: "Нүүр", href: "/", Icon: IconHome },
  { label: "Мотоцикл", href: "/motorcycles", Icon: IconBike },
  { label: "Дагалдах хэрэгсэл", href: "/gear", Icon: IconHelmet },
  { label: "Сэлбэг", href: "/parts", Icon: IconCog },
  { label: "Засвар", href: "/service", Icon: IconWrench },
  { label: "Аялал", href: "/travel", Icon: IconMap },
  { label: "Events", href: "/events", Icon: IconFlag },
  { label: "Giveaway", href: "/giveaway", Icon: IconGift },
  { label: "Миний сагс", href: "/cart", Icon: IconCart },
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

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready, logout } = useAuth();
  const [open, setOpen] = useState(false); // sidebar
  const [acctOpen, setAcctOpen] = useState(false); // avatar dropdown
  const [cart, setCart] = useState(0); // сагсны тоо

  const loggedIn = ready && !!user;

  // Хуудас солигдоход sidebar хаана
  useEffect(() => { setOpen(false); setAcctOpen(false); }, [pathname]);

  // Сагсны тоог сонсох
  useEffect(() => {
    const load = () => setCart(cartCount());
    load();
    window.addEventListener(CART_EVENT, load);
    window.addEventListener("storage", load);
    return () => { window.removeEventListener(CART_EVENT, load); window.removeEventListener("storage", load); };
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

  return (
    <>
      {/* ===== HEADER (цомхон) ===== */}
      <div style={sx("position:sticky;top:0;z-index:50;background:#070708;border-bottom:1px solid #1c1c1f;")}>
        <div style={sx("max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,32px);height:72px;display:flex;align-items:center;gap:16px;")}>
          {/* цэсний товч */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Цэс нээх"
            style={sx("background:none;border:1px solid #262626;border-radius:10px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-direction:column;gap:4px;flex-shrink:0;")}
          >
            <span style={{ width: 18, height: 2, background: "#fff", display: "block" }} />
            <span style={{ width: 18, height: 2, background: "#E10613", display: "block" }} />
            <span style={{ width: 18, height: 2, background: "#fff", display: "block" }} />
          </button>

          <Link href="/" style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
            <Brand height={44} />
          </Link>

          <div style={{ marginLeft: "auto" }} />

          {/* сагс */}
          <Link href="/cart" aria-label="Миний сагс" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 10, border: "1px solid #262626", color: "#fff", flexShrink: 0 }}>
            <IconCart style={{ width: 21, height: 21 }} />
            {cart > 0 && (
              <span style={sx("position:absolute;top:-6px;right:-6px;background:#E10613;color:#fff;font:800 10px Montserrat;min-width:18px;height:18px;padding:0 5px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;")}>
                {cart}
              </span>
            )}
          </Link>

          {loggedIn ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setAcctOpen((v) => !v)}
                aria-label="Миний бүртгэл"
                style={sx("display:flex;align-items:center;justify-content:center;background:none;border:none;padding:0;cursor:pointer;")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/assets/tiers/${user!.tier ?? "rookie"}.png`} alt="" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              </button>
              {acctOpen && (
                <>
                  <div onClick={() => setAcctOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                  <div style={sx("position:absolute;top:60px;right:0;z-index:50;min-width:210px;background:#111113;border:1px solid #262626;border-radius:14px;padding:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);")}>
                    <div style={sx("padding:10px 12px 12px;border-bottom:1px solid #1c1c1f;margin-bottom:6px;")}>
                      <div style={sx("font:700 14px Montserrat;color:#fff;")}>{user!.name || "Хэрэглэгч"}</div>
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
                    {ACCOUNT_MENU.map((m) => (
                      <Link
                        key={m.href}
                        href={m.href}
                        onClick={() => setAcctOpen(false)}
                        style={sx("display:block;padding:10px 12px;border-radius:8px;font:600 13px Montserrat;color:#C8C8C8;")}
                      >
                        {m.label}
                      </Link>
                    ))}
                    <button
                      onClick={doLogout}
                      style={sx("width:100%;text-align:left;padding:10px 12px;border-radius:8px;background:none;border:none;cursor:pointer;font:600 13px Montserrat;color:#E10613;margin-top:4px;border-top:1px solid #1c1c1f;")}
                    >
                      Гарах
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              style={sx("background:#E10613;color:#fff;font:700 13px Montserrat;letter-spacing:.06em;padding:11px 20px;border-radius:9px;text-transform:uppercase;cursor:pointer;white-space:nowrap;")}
            >
              Нэвтрэх
            </Link>
          )}
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
        {/* дээд хэсэг: лого + хаах */}
        <div style={sx("display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid #1c1c1f;")}>
          <Link href="/" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center" }}>
            <Brand height={38} />
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Хаах"
            style={sx("background:none;border:1px solid #262626;border-radius:8px;width:36px;height:36px;color:#8A8F98;font:600 16px Montserrat;cursor:pointer;")}
          >
            ✕
          </button>
        </div>

        {/* цэс */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "14px 12px", overflowY: "auto", flex: 1 }}>
          {NAV.map((item) => {
            const on = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                style={sx(
                  `display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:11px;cursor:pointer;font:600 15px Montserrat;letter-spacing:.01em;` +
                  (on
                    ? "color:#fff;background:#E10613;"
                    : "color:#A3A3A3;background:transparent;"),
                )}
              >
                <item.Icon style={{ width: 20, height: 20, flexShrink: 0, opacity: on ? 1 : 0.75 }} />
                {item.label}
                {item.href === "/cart" && cart > 0 && (
                  <span style={sx(`margin-left:auto;font:800 11px Montserrat;min-width:22px;height:22px;padding:0 6px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;${on ? "background:#fff;color:#E10613;" : "background:#E10613;color:#fff;"}`)}>
                    {cart}
                  </span>
                )}
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
                    <div style={sx("font:700 13px Montserrat;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>{user!.name || "Хэрэглэгч"}</div>
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
                {ACCOUNT_MENU.map((m) => (
                  <Link
                    key={m.href}
                    href={m.href}
                    onClick={() => setOpen(false)}
                    style={sx("display:block;padding:11px 14px 11px 48px;border-radius:11px;font:600 14px Montserrat;color:#A3A3A3;")}
                  >
                    {m.label}
                  </Link>
                ))}
                <button
                  onClick={doLogout}
                  style={sx("width:100%;text-align:left;padding:12px 14px 12px 48px;border-radius:11px;background:none;border:none;cursor:pointer;font:600 14px Montserrat;color:#E10613;")}
                >
                  Гарах
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                style={sx("display:block;text-align:center;background:#E10613;color:#fff;font:700 14px Montserrat;letter-spacing:.06em;padding:14px;border-radius:11px;text-transform:uppercase;cursor:pointer;margin:4px 2px;")}
              >
                Нэвтрэх
              </Link>
            )}
          </div>
        </nav>

        {/* доод хэсэг */}
        <div style={sx("padding:14px 18px;border-top:1px solid #1c1c1f;font:500 11px 'JetBrains Mono';letter-spacing:.1em;color:#5b5b60;")}>
          RIDE. POWER. LIVE.
        </div>
      </aside>
    </>
  );
}
