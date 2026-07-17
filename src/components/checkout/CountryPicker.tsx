"use client";

// Улс сонгогч — туг, нэр, ISO код, утасны код; хайлт (нэр/ISO/утасны код/MN нэр);
// бүс нутгаар ангилсан; keyboard навигац; mobile bottom-sheet / desktop төв цонх.
// Cart modal-ийн дээр гарна (z-index өндөр).

import { useEffect, useMemo, useRef, useState } from "react";
import { sx } from "@/lib/sx";
import { useI18n } from "@/lib/i18n";
import {
  POPULAR_COUNTRIES, REGION_ORDER, REGION_LABEL, countriesByRegion, searchCountries,
  countryByCode, type CountryOption,
} from "@/lib/countries";

interface Group { label: string; items: CountryOption[] }

export function CountryPicker({
  value, onChange, ariaLabel, compact = false,
}: { value: string; onChange: (code: string) => void; ariaLabel?: string; compact?: boolean }) {
  const { t, loc } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hi, setHi] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = countryByCode(value);

  const groups: Group[] = useMemo(() => {
    if (query.trim()) return [{ label: "", items: searchCountries(query) }];
    return [
      { label: t("Түгээмэл"), items: POPULAR_COUNTRIES },
      ...REGION_ORDER.map((r) => ({ label: t(REGION_LABEL[r]), items: countriesByRegion(r) })),
    ];
  }, [query, t]);

  // навигацийн flat жагсаалт
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      setQuery("");
      setHi(0);
      searchRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [open]);
  useEffect(() => {
    if (open && listRef.current) listRef.current.querySelector<HTMLElement>(`[data-i="${hi}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, hi]);

  function pick(code: string) { onChange(code); setOpen(false); }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setHi((i) => Math.min(flat.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); if (flat[hi]) pick(flat[hi].code); }
  }

  const name = (c: CountryOption) => loc(c.nameMn, c.nameEn);
  let idx = -1; // flat индекс тоолуур (render үед)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel || t("Хүргэлтийн улс")}
        style={sx(`display:flex;align-items:center;gap:${compact ? 7 : 10}px;width:${compact ? "104px" : "100%"};min-height:44px;background:#050505;border:1px solid #262626;border-radius:10px;padding:11px ${compact ? 10 : 13}px;color:#fff;font:500 15px Roboto;cursor:pointer;text-align:left;`)}
      >
        {selected ? (
          <>
            <span style={{ fontSize: 20, lineHeight: 1 }} aria-hidden="true">{selected.flag}</span>
            {compact ? (
              <span style={sx("flex:1;font:600 13px 'JetBrains Mono';color:#C8C8C8;white-space:nowrap;")}>+{selected.callingCode}</span>
            ) : (
              <>
                <span style={sx("flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>{name(selected)}</span>
                <span style={sx("font:600 12px 'JetBrains Mono';color:#8A8F98;")}>{selected.code} · +{selected.callingCode}</span>
              </>
            )}
          </>
        ) : (
          <span style={sx("flex:1;color:#8A8F98;")}>{t("Улс сонгох…")}</span>
        )}
        <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0 }} aria-hidden="true">
          <path d="M2 4l4 4 4-4" fill="none" stroke="#9a9aa0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t("Улс сонгох")}
          style={{
            position: "fixed", inset: 0, zIndex: 2000, display: "flex", alignItems: "flex-end", justifyContent: "center",
            background: "rgba(4,4,5,.7)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", animation: "mhfade .18s both",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onKey}
            style={sx("width:100%;max-width:460px;max-height:82vh;display:flex;flex-direction:column;background:#0f0f11;border:1px solid #2f2f33;border-radius:18px 18px 0 0;box-shadow:0 -12px 50px rgba(0,0,0,.6);")}
          >
            <div style={{ padding: "14px 14px 10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={sx("font:800 15px Montserrat;color:#fff;")}>{t("Улс сонгох")}</div>
                <button type="button" onClick={() => setOpen(false)} aria-label={t("Хаах")}
                  style={sx("background:none;border:1px solid #2f2f33;border-radius:8px;width:32px;height:32px;color:#8A8F98;font:600 14px Montserrat;cursor:pointer;")}>✕</button>
              </div>
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setHi(0); }}
                placeholder={t("Улс, код, +утас хайх…")}
                aria-label={t("Улс хайх…")}
                style={sx("width:100%;min-height:44px;background:#050505;border:1px solid #2f2f33;border-radius:10px;padding:11px 13px;color:#fff;font:500 15px Roboto;outline:none;")}
              />
            </div>

            <div ref={listRef} role="listbox" aria-label={t("Улс сонгох")} style={sx("overflow-y:auto;padding:0 8px 12px;")}>
              {flat.length === 0 && <div style={sx("padding:20px;text-align:center;font:500 14px Roboto;color:#8A8F98;")}>{t("Илэрц алга")}</div>}
              {groups.map((g) => (
                g.items.length === 0 ? null : (
                  <div key={g.label || "search"}>
                    {g.label && <div style={sx("font:700 10px 'JetBrains Mono';letter-spacing:.14em;color:#8A8F98;text-transform:uppercase;padding:12px 8px 6px;")}>{g.label}</div>}
                    {g.items.map((c) => {
                      idx += 1;
                      const i = idx;
                      const active = c.code === value;
                      const hot = i === hi;
                      return (
                        <div
                          key={g.label + c.code}
                          data-i={i}
                          role="option"
                          aria-selected={active}
                          onMouseEnter={() => setHi(i)}
                          onClick={() => pick(c.code)}
                          style={sx(`display:flex;align-items:center;gap:11px;padding:11px 10px;border-radius:9px;cursor:pointer;background:${active ? "rgba(225,6,19,.18)" : hot ? "#232327" : "transparent"};`)}
                        >
                          <span style={{ fontSize: 20, lineHeight: 1 }} aria-hidden="true">{c.flag}</span>
                          <span style={sx(`flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:${active ? "700" : "500"} 14px Roboto;color:${active ? "#fff" : "#D4D4D4"};`)}>{name(c)}</span>
                          <span style={sx("font:600 11px 'JetBrains Mono';color:#8A8F98;")}>{c.code}</span>
                          <span style={sx("font:600 12px 'JetBrains Mono';color:#C8C8C8;min-width:44px;text-align:right;")}>+{c.callingCode}</span>
                        </div>
                      );
                    })}
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
