"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { sx } from "@/lib/sx";
import { Brand } from "./Brand";
import { useAuth } from "@/lib/auth";

const NAV = [
  { label: "Нүүр", href: "/" },
  { label: "Мотоцикл", href: "/motorcycles" },
  { label: "Хэрэгсэл & сэлбэг", href: "/gear" },
  { label: "Засвар", href: "/service" },
  { label: "Events & Giveaway", href: "/events" },
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
  const [open, setOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);

  const loggedIn = ready && !!user;

  function doLogout() {
    logout();
    setAcctOpen(false);
    setOpen(false);
    router.push("/");
  }

  return (
    <div style={sx("position:sticky;top:0;z-index:50;background:#070708;border-bottom:1px solid #1c1c1f;")}>
      <div style={sx("max-width:1280px;margin:0 auto;padding:0 clamp(20px,4vw,40px);height:72px;display:flex;align-items:center;justify-content:space-between;gap:20px;")}>
        <Link href="/" onClick={() => setOpen(false)} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
          <Brand height={46} />
        </Link>

        {/* desktop */}
        <div className="mh-desktop-nav" style={{ alignItems: "center", gap: "30px" }}>
          {NAV.map((item) => {
            const on = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={sx(
                  `cursor:pointer;font:600 14px Montserrat;letter-spacing:.02em;color:${on ? "#fff" : "#A3A3A3"};border-bottom:2px solid ${on ? "#E10613" : "transparent"};padding-bottom:4px;`,
                )}
              >
                {item.label}
              </Link>
            );
          })}

          {loggedIn ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setAcctOpen((v) => !v)}
                style={sx("display:flex;align-items:center;gap:10px;background:#111113;border:1px solid #262626;border-radius:999px;padding:6px 12px 6px 6px;cursor:pointer;")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/assets/tiers/${user!.tier ?? "rookie"}.png`} alt="" style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                <span style={sx("font:600 13px Montserrat;color:#fff;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>
                  {user!.name || user!.phone}
                </span>
                <span style={{ color: "#8A8F98", fontSize: 11 }}>▾</span>
              </button>
              {acctOpen && (
                <>
                  <div onClick={() => setAcctOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
                  <div style={sx("position:absolute;top:48px;right:0;z-index:50;min-width:210px;background:#111113;border:1px solid #262626;border-radius:14px;padding:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);")}>
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
                        ⚙ Admin panel
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
              style={sx("background:#E10613;color:#fff;font:700 13px Montserrat;letter-spacing:.06em;padding:11px 20px;border-radius:9px;text-transform:uppercase;cursor:pointer;")}
            >
              Нэвтрэх
            </Link>
          )}
        </div>

        {/* mobile toggle */}
        <button
          className="mh-mobile-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label="Цэс"
          style={sx("background:none;border:1px solid #262626;border-radius:8px;width:44px;height:44px;align-items:center;justify-content:center;cursor:pointer;gap:4px;flex-direction:column;")}
        >
          <span style={{ width: 18, height: 2, background: "#fff", display: "block" }} />
          <span style={{ width: 18, height: 2, background: "#fff", display: "block" }} />
          <span style={{ width: 18, height: 2, background: "#fff", display: "block" }} />
        </button>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="mh-mobile-menu" style={sx("border-top:1px solid #1c1c1f;padding:12px clamp(20px,4vw,40px) 20px;flex-direction:column;gap:4px;")}>
          {NAV.map((item) => {
            const on = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                style={sx(`cursor:pointer;font:600 16px Montserrat;color:${on ? "#E10613" : "#C8C8C8"};padding:12px 4px;border-bottom:1px solid #1c1c1f;`)}
              >
                {item.label}
              </Link>
            );
          })}

          {loggedIn ? (
            <>
              <div style={sx("display:flex;align-items:center;gap:12px;padding:14px 4px 10px;")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/assets/tiers/${user!.tier ?? "rookie"}.png`} alt="" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                <div>
                  <div style={sx("font:700 14px Montserrat;color:#fff;")}>{user!.name || "Хэрэглэгч"}</div>
                  <div style={sx("font:400 12px Roboto;color:#8A8F98;")}>+976 {user!.phone}</div>
                </div>
              </div>
              {user!.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  style={sx("text-align:center;background:#E10613;color:#fff;font:700 14px Montserrat;letter-spacing:.04em;padding:13px;border-radius:10px;margin-bottom:6px;")}
                >
                  ⚙ Admin panel
                </Link>
              )}
              {ACCOUNT_MENU.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={() => setOpen(false)}
                  style={sx("font:600 15px Montserrat;color:#C8C8C8;padding:11px 4px;border-bottom:1px solid #1c1c1f;")}
                >
                  {m.label}
                </Link>
              ))}
              <button
                onClick={doLogout}
                style={sx("margin-top:10px;text-align:center;background:#111113;color:#E10613;border:1px solid #E10613;font:700 14px Montserrat;letter-spacing:.06em;padding:14px;border-radius:10px;text-transform:uppercase;cursor:pointer;")}
              >
                Гарах
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              style={sx("margin-top:10px;text-align:center;background:#E10613;color:#fff;font:700 14px Montserrat;letter-spacing:.06em;padding:14px;border-radius:10px;text-transform:uppercase;cursor:pointer;")}
            >
              Нэвтрэх
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
