"use client";

// RevZilla маягийн жагсаалтын бүтэц — зүүн талд шүүлтүүрийн sidebar (desktop),
// mobile дээр "Шүүлтүүр" товчоор нээгдэх panel. Бүх listing хуудас үүнийг ашиглана.

import { useEffect, useState, type ReactNode } from "react";
import { sx } from "@/lib/sx";
import { useI18n } from "@/lib/i18n";

// Шүүлтүүрийн бүлэг — хураагдаж/дэлгэгддэг
export function FilterGroup({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={sx("border-bottom:1px solid #1c1c1f;padding:14px 0;")}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={sx("width:100%;display:flex;align-items:center;justify-content:space-between;background:none;border:none;cursor:pointer;padding:0;font:700 13px Montserrat;letter-spacing:.05em;color:#fff;text-transform:uppercase;")}
      >
        {title}
        <span style={{ color: "#E10613", transform: open ? "rotate(180deg)" : "none", transition: "transform .18s", fontSize: 13 }}>⌄</span>
      </button>
      {open && <div style={{ marginTop: 11, display: "flex", flexDirection: "column", gap: 2 }}>{children}</div>}
    </div>
  );
}

// Checkbox мөр (тоотой) — RevZilla-ийн "Brand (33)" маягаар
export function CheckRow({ label, count, checked, onToggle }: { label: string; count?: number; checked: boolean; onToggle: () => void }) {
  const dim = count === 0 && !checked;
  return (
    <button
      onClick={onToggle}
      disabled={dim}
      style={sx(`display:flex;align-items:center;gap:9px;width:100%;background:none;border:none;padding:6px 2px;cursor:${dim ? "default" : "pointer"};text-align:left;${dim ? "opacity:.35;" : ""}`)}
    >
      <span style={sx(`width:17px;height:17px;border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;${checked ? "background:#E10613;border:1.5px solid #E10613;" : "background:#0B0B0D;border:1.5px solid #3a3a3d;"}`)}>
        {checked && (
          <svg width="10" height="10" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5l3 3 6-7" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
      </span>
      <span style={sx(`flex:1;font:500 13px Roboto;color:${checked ? "#fff" : "#C8C8C8"};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;`)}>{label}</span>
      {count !== undefined && <span style={sx("font:500 11px 'JetBrains Mono';color:#6b7280;")}>({count})</span>}
    </button>
  );
}

interface ShellProps {
  title: string;
  count: number;        // шүүсний дараах тоо
  sidebar: ReactNode;   // FilterGroup-ууд
  toolbar?: ReactNode;  // sort select г.м (баруун дээд)
  onClear?: () => void; // бүх шүүлтүүр цэвэрлэх
  activeCount?: number; // идэвхтэй шүүлтүүрийн тоо (mobile товчинд)
  children: ReactNode;  // grid
}

export function ListingShell({ title, count, sidebar, toolbar, onClear, activeCount = 0, children }: ShellProps) {
  const { t } = useI18n();
  const [drawer, setDrawer] = useState(false); // mobile шүүлтүүр

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawer]);

  const sidebarInner = (
    <>
      <div style={sx("display:flex;align-items:center;justify-content:space-between;padding-bottom:6px;")}>
        <span style={sx("font:800 14px Montserrat;color:#fff;text-transform:uppercase;letter-spacing:.05em;")}>{t("Шүүлтүүр")}</span>
        {onClear && activeCount > 0 && (
          <button onClick={onClear} style={sx("background:none;border:none;cursor:pointer;font:600 12px Montserrat;color:#E10613;padding:2px;")}>
            {t("Цэвэрлэх")} ({activeCount})
          </button>
        )}
      </div>
      {sidebar}
    </>
  );

  return (
    <div style={sx("max-width:1280px;margin:0 auto;padding:clamp(24px,4vw,44px) clamp(20px,4vw,40px);animation:mhfade .4s both;")}>
      <h1 style={sx("font:800 clamp(28px,4.6vw,42px) Montserrat;color:#fff;text-transform:uppercase;")}>{title}</h1>

      {/* toolbar: эрэмбэ + mobile шүүлтүүр товч */}
      <div style={sx("display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:18px;")}>
        <div />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            className="mh-ls-filterbtn"
            onClick={() => setDrawer(true)}
            style={sx("align-items:center;gap:8px;background:#111113;border:1px solid #333;border-radius:9px;color:#fff;font:700 12px Montserrat;letter-spacing:.04em;padding:11px 16px;cursor:pointer;text-transform:uppercase;")}
          >
            ⚙ {t("Шүүлтүүр")}{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
          {toolbar}
        </div>
      </div>

      {/* sidebar + grid */}
      <div className="mh-ls-grid" style={{ marginTop: 18 }}>
        <aside className="mh-ls-sidebar" style={sx("align-self:start;position:sticky;top:126px;background:#0e0e10;border:1px solid #1c1c1f;border-radius:14px;padding:16px 16px 6px;")}>
          {sidebarInner}
        </aside>
        <div style={{ minWidth: 0 }}>{children}</div>
      </div>

      {/* mobile шүүлтүүр drawer */}
      {drawer && (
        <div onClick={() => setDrawer(false)} style={{ position: "fixed", inset: 0, zIndex: 120, background: "rgba(4,4,5,.7)", backdropFilter: "blur(4px)", animation: "mhfade .2s both" }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={sx("position:absolute;top:0;right:0;bottom:0;width:min(320px,88vw);background:#0e0e10;border-left:1px solid #262626;padding:18px 16px;overflow-y:auto;")}
          >
            <button onClick={() => setDrawer(false)} aria-label={t("Хаах")}
              style={sx("position:absolute;top:12px;right:12px;background:none;border:1px solid #2f2f33;border-radius:8px;width:32px;height:32px;color:#8A8F98;font:600 14px Montserrat;cursor:pointer;")}>✕</button>
            <div style={{ paddingTop: 6 }}>{sidebarInner}</div>
            <button onClick={() => setDrawer(false)}
              style={sx("width:100%;margin-top:16px;background:#E10613;border:none;border-radius:10px;color:#fff;font:700 13px Montserrat;letter-spacing:.05em;padding:13px;cursor:pointer;text-transform:uppercase;")}>
              {t("Үр дүн харах")} ({count})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
