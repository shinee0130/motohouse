"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { sx } from "@/lib/ui/sx";
import { useAuth } from "@/lib/auth/auth";
import { useAuthModal } from "@/lib/auth/authModal";
import { getOrderRequests } from "@/lib/db/queries";

const MENU = [
  { label: "Хяналтын самбар", href: "/admin" },
  { label: "Мотоцикл", href: "/admin/motorcycles" },
  { label: "Дагалдах хэрэгсэл", href: "/admin/gear" },
  { label: "Сэлбэг", href: "/admin/parts" },
  { label: "Biker Meeting", href: "/admin/meetings" },
  { label: "Giveaway", href: "/admin/giveaway" },
  { label: "Худалдан авалтын захиалга", href: "/admin/orders" },
  { label: "Захиалгын хүсэлт", href: "/admin/requests" },
  { label: "Төлбөрийн лог", href: "/admin/payments" },
  { label: "Зурагчид", href: "/admin/photographers" },
  { label: "Зураг авалт", href: "/admin/photo" },
  { label: "Хэрэглэгчид", href: "/admin/users" },
  { label: "Home backgrounds", href: "/admin/home" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const authModal = useAuthModal();
  // Шинэ (хариу өгөөгүй) захиалгын хүсэлтийн тоо — цэсэн дээр улаанаар.
  // Ингэснээр админд орсон даруйд хүлээгдэж буй ажил байгааг шууд харна.
  const [openRequests, setOpenRequests] = useState(0);
  const isAdmin = ready && !!user && user.role === "admin";
  const loadCounts = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const rs = await getOrderRequests();
      setOpenRequests(rs.filter((r) => r.status !== "Үнэ өгсөн" && r.status !== "Хаагдсан").length);
    } catch { /* тоолуур гарахгүй нь админыг зогсоохгүй */ }
  }, [isAdmin]);
  useEffect(() => {
    void loadCounts();
    const t = setInterval(() => void loadCounts(), 60_000); // минут тутам сэргээнэ
    return () => clearInterval(t);
  }, [loadCounts, pathname]);

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/"); authModal.open("login"); } // нэвтрэх modal
    else if (user.role !== "admin") router.replace("/account"); // зөвхөн админ
  }, [ready, user, router, authModal]);

  if (!ready || !user || user.role !== "admin") {
    return (
      <div style={sx("max-width:1280px;margin:0 auto;padding:80px clamp(20px,4vw,40px);text-align:center;font:500 14px Roboto;color:#8A8F98;")}>
        Уншиж байна…
      </div>
    );
  }

  return (
    <div style={sx("max-width:1280px;margin:0 auto;padding:clamp(28px,4vw,48px) clamp(20px,4vw,40px);animation:mhfade .4s both;")}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <h1 style={sx("font:800 clamp(26px,4vw,38px) Montserrat;color:#fff;text-transform:uppercase;")}>Admin panel</h1>
        <span style={sx("font:700 10px Montserrat;letter-spacing:.1em;color:#fff;background:#E10613;padding:5px 10px;border-radius:6px;")}>ADMIN</span>
      </div>

      <div style={sx("display:grid;grid-template-columns:minmax(0,240px) minmax(0,1fr);gap:24px;align-items:start;")} className="mh-account-grid">
        <aside style={sx("background:#0e0e10;border:1px solid #262626;border-radius:18px;padding:16px;")}>
          <nav className="mh-admin-nav" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {MENU.map((m) => {
              const on = m.href === "/admin" ? pathname === "/admin" : pathname.startsWith(m.href);
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  style={sx(`display:flex;align-items:center;justify-content:space-between;gap:8px;padding:11px 14px;border-radius:10px;font:600 14px Montserrat;cursor:pointer;color:${on ? "#fff" : "#A3A3A3"};background:${on ? "#E10613" : "transparent"};`)}
                >
                  <span>{m.label}</span>
                  {m.href === "/admin/requests" && openRequests > 0 && (
                    <span style={sx(`flex:none;min-width:20px;height:20px;padding:0 6px;border-radius:999px;display:flex;align-items:center;justify-content:center;font:800 11px Montserrat;${on ? "background:#fff;color:#E10613;" : "background:#E10613;color:#fff;"}`)}>
                      {openRequests}
                    </span>
                  )}
                </Link>
              );
            })}
            <Link href="/" style={sx("padding:11px 14px;border-radius:10px;font:600 14px Montserrat;color:#A3A3A3;")}>
              ← Сайт руу
            </Link>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              style={sx("margin-top:6px;text-align:left;padding:11px 14px;border-radius:10px;background:none;border:none;cursor:pointer;font:600 14px Montserrat;color:#E10613;")}
            >
              Гарах
            </button>
          </nav>
        </aside>

        <section style={{ minWidth: 0 }}>{children}</section>
      </div>
    </div>
  );
}
