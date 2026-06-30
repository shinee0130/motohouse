"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { sx } from "@/lib/sx";
import { Brand } from "./Brand";

const NAV = [
  { label: "Нүүр", href: "/" },
  { label: "Мотоцикл", href: "/motorcycles" },
  { label: "Хэрэгсэл & сэлбэг", href: "/gear" },
  { label: "Засвар", href: "/service" },
  { label: "Эвент", href: "/events" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div
      style={sx(
        "position:sticky;top:0;z-index:50;background:#070708;border-bottom:1px solid #1c1c1f;",
      )}
    >
      <div
        style={sx(
          "max-width:1280px;margin:0 auto;padding:0 clamp(20px,4vw,40px);height:72px;display:flex;align-items:center;justify-content:space-between;gap:20px;",
        )}
      >
        <Link
          href="/"
          onClick={() => setOpen(false)}
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
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
          <Link
            href="/service"
            style={sx(
              "background:#E10613;color:#fff;font:700 13px Montserrat;letter-spacing:.06em;padding:11px 20px;border-radius:9px;text-transform:uppercase;cursor:pointer;",
            )}
          >
            Захиалга
          </Link>
        </div>

        {/* mobile toggle */}
        <button
          className="mh-mobile-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label="Цэс"
          style={sx(
            "background:none;border:1px solid #262626;border-radius:8px;width:44px;height:44px;align-items:center;justify-content:center;cursor:pointer;gap:4px;flex-direction:column;",
          )}
        >
          <span style={{ width: 18, height: 2, background: "#fff", display: "block" }} />
          <span style={{ width: 18, height: 2, background: "#fff", display: "block" }} />
          <span style={{ width: 18, height: 2, background: "#fff", display: "block" }} />
        </button>
      </div>

      {/* mobile menu */}
      {open && (
        <div
          className="mh-mobile-menu"
          style={sx(
            "border-top:1px solid #1c1c1f;padding:12px clamp(20px,4vw,40px) 20px;flex-direction:column;gap:4px;",
          )}
        >
          {NAV.map((item) => {
            const on = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                style={sx(
                  `cursor:pointer;font:600 16px Montserrat;color:${on ? "#E10613" : "#C8C8C8"};padding:12px 4px;border-bottom:1px solid #1c1c1f;`,
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
