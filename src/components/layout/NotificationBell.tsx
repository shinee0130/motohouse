"use client";

// Толгой хэсгийн мэдэгдлийн хонх. Сайт дээрх бүх мэдэгдэл (notifications
// хүснэгт) энд цуглана — админд "шинэ хүсэлт", хэрэглэгчид "үнийн санал ирлээ"
// гэх мэт. Апп гарахад ижил хүснэгтээс push илгээнэ.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { sx } from "@/lib/ui/sx";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth/auth";
import {
  getNotifications, markNotificationRead, markAllNotificationsRead,
  type AppNotification,
} from "@/lib/db/queries";

// Мэдэгдэл дарахад хаашаа очих вэ
function hrefOf(n: AppNotification): string {
  if (n.audience === "admin") return "/admin/requests";
  if (n.kind === "request_quote") return "/account/requests";
  return "/account";
}
function iconOf(kind: string): string {
  if (kind === "request_new") return "🛎️";
  if (kind === "request_quote") return "💬";
  return "🔔";
}
// "3 цагийн өмнө" маягийн богино огноо
function ago(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "дөнгөж сая";
  if (m < 60) return `${m} мин өмнө`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} цагийн өмнө`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} хоногийн өмнө`;
  return iso.slice(0, 10);
}

export function NotificationBell() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [list, setList] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!user) { setList([]); return; }
    setList(await getNotifications(30));
  }, [user]);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 60_000); // минут тутам
    return () => clearInterval(timer);
  }, [load]);

  // Гадуур дарахад хаах
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!user) return null; // нэвтрээгүй үед хонх хэрэггүй

  const unread = list.filter((n) => !n.readAt);

  async function openOne(n: AppNotification) {
    setOpen(false);
    if (n.readAt) return;
    setList((l) => l.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)));
    try { await markNotificationRead(n.id); } catch { void load(); }
  }
  async function readAll() {
    const ids = unread.map((n) => n.id);
    if (ids.length === 0) return;
    const now = new Date().toISOString();
    setList((l) => l.map((x) => (x.readAt ? x : { ...x, readAt: now })));
    try { await markAllNotificationsRead(ids); } catch { void load(); }
  }

  return (
    <div ref={boxRef} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("Мэдэгдэл")}
        style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: 10, border: "1px solid #262626", background: "none", color: "#fff", cursor: "pointer" }}
      >
        <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" }}>
          <path d="M18 8a6 6 0 10-12 0c0 6-2 7-2 7h16s-2-1-2-7" />
          <path d="M13.7 20a2 2 0 01-3.4 0" />
        </svg>
        {unread.length > 0 && (
          <span style={sx("position:absolute;top:-6px;right:-6px;background:#E10613;color:#fff;font:800 10px Montserrat;min-width:18px;height:18px;padding:0 5px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;")}>
            {unread.length}
          </span>
        )}
      </button>

      {open && (
        <div style={sx("position:absolute;right:0;top:50px;z-index:60;width:min(340px,calc(100vw - 32px));background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;box-shadow:0 18px 46px rgba(0,0,0,.6);")}>
          <div style={sx("display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 15px;border-bottom:1px solid #1c1c1f;")}>
            <span style={sx("font:700 13px Montserrat;color:#fff;")}>{t("Мэдэгдэл")}</span>
            {unread.length > 0 && (
              <button onClick={readAll} style={sx("background:none;border:none;color:#8A8F98;font:600 11px Montserrat;cursor:pointer;")}>
                {t("Бүгдийг уншсан болгох")}
              </button>
            )}
          </div>

          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {list.length === 0 ? (
              <div style={sx("padding:26px 16px;text-align:center;font:400 13px Roboto;color:#8A8F98;")}>
                {t("Мэдэгдэл алга.")}
              </div>
            ) : (
              list.map((n) => (
                <Link key={n.id} href={hrefOf(n)} onClick={() => void openOne(n)}
                  style={sx(`display:flex;gap:10px;padding:12px 15px;border-bottom:1px solid #1c1c1f;text-decoration:none;${n.readAt ? "" : "background:rgba(225,6,19,.06);"}`)}>
                  <span style={{ fontSize: 15, lineHeight: "20px", flexShrink: 0 }}>{iconOf(n.kind)}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={sx(`font:${n.readAt ? "600" : "700"} 13px/1.4 Montserrat;color:${n.readAt ? "#C8C8C8" : "#fff"};`)}>{n.title}</div>
                    {n.body && (
                      <div style={sx("font:400 12px/1.5 Roboto;color:#8A8F98;margin-top:3px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;")}>{n.body}</div>
                    )}
                    <div style={sx("font:400 11px 'JetBrains Mono';color:#6b7280;margin-top:4px;")}>{ago(n.createdAt)}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
