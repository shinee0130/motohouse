"use client";

import Link from "next/link";
import { sx } from "@/lib/sx";
import { Brand } from "./Brand";
import { useI18n } from "@/lib/i18n";

// Хөгжүүлэгчийн portfolio холбоос — дараа portfolio хийхэд энд URL-ээ оруулбал
// footer доорх "Scott" автоматаар тухайн хаяг руу үсэрдэг линк болно.
const DEV_PORTFOLIO = "https://www.instagram.com/_shinee999/";

export function Footer() {
  const { t } = useI18n();

  return (
    <div style={sx("border-top:1px solid #1c1c1f;background:#0B0B0D;margin-top:auto;")}>
      <div
        style={sx(
          "max-width:1280px;margin:0 auto;padding:clamp(36px,5vw,56px) clamp(20px,4vw,40px);display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:32px;",
        )}
      >
        <div>
          <Brand height={30} />
          <p style={sx("font:400 13px/1.6 Roboto;color:#8A8F98;margin-top:14px;max-width:260px;")}>
            {t("Монголд суурилсан мотоцикл, riding gear, сэлбэг, засвар үйлчилгээ болон олон улсын захиалгын платформ.")}
          </p>
        </div>
        <div>
          <div style={sx("font:600 11px 'JetBrains Mono';letter-spacing:.2em;color:#8A8F98;margin-bottom:12px;")}>
            PAGES
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[
              { href: "/motorcycles", label: "Мотоцикл" },
              { href: "/gear", label: "Дагалдах хэрэгсэл" },
              { href: "/parts", label: "Сэлбэг" },
              { href: "/service", label: "Засвар" },
              { href: "/travel", label: "Аялал" },
              { href: "/events", label: "Event" },
              { href: "/giveaway", label: "Giveaway" },
            ].map((p) => (
              <Link key={p.href} href={p.href} style={sx("display:flex;align-items:center;gap:8px;font:500 14px Roboto;color:#C8C8C8;cursor:pointer;text-decoration:none;")}>
                <svg width="7" height="10" viewBox="0 0 7 10" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M1.5 1l4 4-4 4" stroke="#E10613" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t(p.label)}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div style={sx("font:600 11px 'JetBrains Mono';letter-spacing:.2em;color:#8A8F98;margin-bottom:12px;")}>
            CONTACT
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, font: "500 14px Roboto", color: "#C8C8C8" }}>
            <a href="tel:+97690117748" style={sx("display:flex;align-items:center;gap:9px;color:#C8C8C8;text-decoration:none;")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E10613" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              +976 9011-7748
            </a>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <a href="https://www.facebook.com/profile.php?id=61557148658508" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ display: "block" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/moto_house_mgl/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ display: "block" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <defs><linearGradient id="ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#feda75"/><stop offset="0.5" stopColor="#d62976"/><stop offset="1" stopColor="#4f5bd5"/></linearGradient></defs>
                  <path fill="url(#ig)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div>
          <div style={sx("font:600 11px 'JetBrains Mono';letter-spacing:.2em;color:#8A8F98;margin-bottom:12px;")}>
            HOURS
          </div>
          <div style={sx("display:flex;align-items:flex-start;gap:8px;font:500 14px Roboto;color:#C8C8C8;")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E10613" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>
              {t("Даваа–Ням")}
              <br />
              10:00 – 21:00
            </span>
          </div>
          <div style={sx("font:600 11px 'JetBrains Mono';letter-spacing:.2em;color:#8A8F98;margin:20px 0 12px;")}>
            {t("ХАЯГ")}
          </div>
          <a
            href="https://www.google.com/maps/search/?api=1&query=47.8993424,106.9309956"
            target="_blank"
            rel="noopener noreferrer"
            style={sx("display:flex;align-items:flex-start;gap:8px;color:#C8C8C8;font:500 13px/1.6 Roboto;text-decoration:none;max-width:270px;")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E10613" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{t("Улаанбаатар хот, Хан-Уул дүүрэг, 18-р хороо, Их Монгол Улсын гудамж, Uniqcenter, 00 тоот, 17013")}</span>
          </a>
        </div>
      </div>
      <div style={sx("max-width:1280px;margin:0 auto;padding:0 clamp(20px,4vw,40px) clamp(28px,4vw,44px);")}>
        <iframe
          title={t("MOTO HOUSE байршил")}
          src="https://www.google.com/maps?q=47.8993424,106.9309956&z=16&hl=mn&output=embed"
          width="100%"
          height="240"
          style={{ border: 0, borderRadius: 14, display: "block", filter: "invert(0.92) hue-rotate(180deg)" }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div
        style={sx(
          "border-top:1px solid #1c1c1f;padding:18px clamp(20px,4vw,40px);text-align:center;font:500 12px 'JetBrains Mono';color:#555;letter-spacing:.1em;",
        )}
      >
        © 2026 MOTO HOUSE · RIDE. POWER. LIVE. · Developed by{" "}
        {DEV_PORTFOLIO ? (
          <a href={DEV_PORTFOLIO} target="_blank" rel="noopener noreferrer" style={sx("color:#E10613;font-weight:700;text-decoration:none;")}>Scott</a>
        ) : (
          <span style={sx("color:#E10613;font-weight:700;")}>Scott</span>
        )}
      </div>
    </div>
  );
}
