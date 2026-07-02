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
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <a href="https://www.facebook.com/profile.php?id=61557148658508" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/social/facebook.png" alt="Facebook" width={28} height={28} style={sx("width:28px;height:28px;border-radius:7px;display:block;")} />
              </a>
              <a href="https://www.instagram.com/moto_house_mgl/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/social/instagram.png" alt="Instagram" width={28} height={28} style={sx("width:28px;height:28px;border-radius:7px;display:block;")} />
              </a>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/social/tiktok.png" alt="TikTok" width={28} height={28} style={sx("width:28px;height:28px;border-radius:7px;display:block;")} />
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
