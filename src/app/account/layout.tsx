"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { sx } from "@/lib/sx";
import { useAuth } from "@/lib/auth";

const MENU = [
  { label: "Хяналтын самбар", href: "/account" },
  { label: "Миний захиалга", href: "/account/orders" },
  { label: "Хадгалсан", href: "/account/wishlist" },
  { label: "Профайл", href: "/account/profile" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div style={sx("max-width:1280px;margin:0 auto;padding:80px clamp(20px,4vw,40px);text-align:center;font:500 14px Roboto;color:#8A8F98;")}>
        Уншиж байна…
      </div>
    );
  }

  const initial = (user.name || user.phone || "U").trim().charAt(0).toUpperCase();

  return (
    <div style={sx("max-width:1280px;margin:0 auto;padding:clamp(28px,4vw,48px) clamp(20px,4vw,40px);animation:mhfade .4s both;")}>
      <h1 style={sx("font:800 clamp(26px,4vw,38px) Montserrat;color:#fff;text-transform:uppercase;margin-bottom:24px;")}>
        Миний бүртгэл
      </h1>
      <div style={sx("display:grid;grid-template-columns:minmax(0,260px) minmax(0,1fr);gap:24px;align-items:start;")} className="mh-account-grid">
        {/* sidebar */}
        <aside style={sx("background:#0e0e10;border:1px solid #262626;border-radius:18px;padding:20px;")}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: "1px solid #1c1c1f" }}>
            <span style={sx("width:42px;height:42px;border-radius:50%;background:#E10613;color:#fff;display:flex;align-items:center;justify-content:center;font:800 17px Montserrat;flex-shrink:0;")}>
              {initial}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={sx("font:700 14px Montserrat;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>{user.name || "Хэрэглэгч"}</div>
              <div style={sx("font:400 12px Roboto;color:#8A8F98;")}>+976 {user.phone}</div>
              {(() => {
                const T: Record<string, { l: string; c: string }> = { rookie: { l: "Rookie", c: "#9ca3af" }, bronze: { l: "Bronze", c: "#cd7f32" }, silver: { l: "Silver", c: "#c0c0c0" }, gold: { l: "Gold", c: "#d4af37" }, vip: { l: "VIP", c: "#E10613" } };
                const t = T[user.tier ?? "rookie"] ?? T.rookie;
                return <span style={{ display: "inline-block", marginTop: 6, font: "700 10px Montserrat", letterSpacing: ".05em", padding: "3px 8px", borderRadius: 5, color: t.c, background: `${t.c}22`, border: `1px solid ${t.c}55` }}>{t.l} гишүүн</span>;
              })()}
            </div>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 12 }}>
            {MENU.map((m) => {
              const on = m.href === "/account" ? pathname === "/account" : pathname.startsWith(m.href);
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  style={sx(
                    `padding:11px 14px;border-radius:10px;font:600 14px Montserrat;cursor:pointer;color:${on ? "#fff" : "#A3A3A3"};background:${on ? "#E10613" : "transparent"};`,
                  )}
                >
                  {m.label}
                </Link>
              );
            })}
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              style={sx("margin-top:8px;text-align:left;padding:11px 14px;border-radius:10px;background:none;border:none;cursor:pointer;font:600 14px Montserrat;color:#E10613;")}
            >
              Гарах
            </button>
          </nav>
        </aside>

        {/* content */}
        <section style={{ minWidth: 0 }}>{children}</section>
      </div>
    </div>
  );
}
