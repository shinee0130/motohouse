import Link from "next/link";
import { sx } from "@/lib/sx";
import { Brand } from "./Brand";

export function Footer() {
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
            Мотоцикл худалдаа, premium gear, performance parts болон expert service.
          </p>
        </div>
        <div>
          <div style={sx("font:600 11px 'JetBrains Mono';letter-spacing:.2em;color:#8A8F98;margin-bottom:12px;")}>
            PAGES
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <Link href="/motorcycles" style={sx("font:500 14px Roboto;color:#C8C8C8;cursor:pointer;")}>Motorcycles</Link>
            <Link href="/gear" style={sx("font:500 14px Roboto;color:#C8C8C8;cursor:pointer;")}>Gear &amp; Parts</Link>
            <Link href="/service" style={sx("font:500 14px Roboto;color:#C8C8C8;cursor:pointer;")}>Service</Link>
            <Link href="/events" style={sx("font:500 14px Roboto;color:#C8C8C8;cursor:pointer;")}>Events</Link>
          </div>
        </div>
        <div>
          <div style={sx("font:600 11px 'JetBrains Mono';letter-spacing:.2em;color:#8A8F98;margin-bottom:12px;")}>
            CONTACT
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, font: "500 14px Roboto", color: "#C8C8C8" }}>
            <a href="tel:+97690117748" style={sx("color:#C8C8C8;")}>+976 9011-7748</a>
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
              <span aria-label="TikTok" style={{ display: "block" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </span>
            </div>
            <span>Улаанбаатар, Монгол</span>
          </div>
        </div>
        <div>
          <div style={sx("font:600 11px 'JetBrains Mono';letter-spacing:.2em;color:#8A8F98;margin-bottom:12px;")}>
            HOURS
          </div>
          <div style={sx("font:500 14px Roboto;color:#C8C8C8;")}>
            Даваа–Бямба
            <br />
            10:00 – 19:00
          </div>
        </div>
      </div>
      <div style={sx("max-width:1280px;margin:0 auto;padding:0 clamp(20px,4vw,40px) clamp(28px,4vw,44px);")}>
        <iframe
          title="MOTO HOUSE байршил"
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
        © 2026 MOTO HOUSE · RIDE. POWER. LIVE.
      </div>
    </div>
  );
}
