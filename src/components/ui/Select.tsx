"use client";

// Дахин ашиглагдах custom dropdown — native <select>-ийн оронд бүх газар.
// Хар загварт тааруулсан, гар (keyboard) удирдлагатай, гадуур дарахад хаагдана.

import { useEffect, useRef, useState } from "react";
import { sx } from "@/lib/ui/sx";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  full?: boolean; // width:100% эсэх (default: auto)
  bg?: string; // товчны дэвсгэр (default #111113)
  disabled?: boolean;
  ariaLabel?: string;
  searchable?: boolean; // олон сонголттой үед (улс гэх мэт) дээр хайх талбар гарна
  searchPlaceholder?: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Сонгох…",
  full = false,
  bg = "#111113",
  disabled = false,
  ariaLabel,
  searchable = false,
  searchPlaceholder = "Хайх…",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1); // highlight index (гарын навигац)
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  // хайлтаар шүүсэн жагсаалт (навигаци, сонголт бүгд үүн дээр)
  const q = query.trim().toLowerCase();
  const list = searchable && q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;

  function openMenu() {
    if (disabled) return;
    setQuery("");
    const idx = options.findIndex((o) => o.value === value);
    setHi(idx >= 0 ? idx : 0);
    setOpen(true);
  }

  function pick(v: string) {
    onChange(v);
    setQuery("");
    setOpen(false);
  }

  // нээгдэх үед сонгосон мөр рүү гүйлгэж, хайх талбарт фокус өгнө
  useEffect(() => {
    if (open && menuRef.current) {
      const el = menuRef.current.querySelector<HTMLElement>(`[data-i="${hi}"]`);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [open, hi]);

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  // навигаци — товч болон хайх талбар 2уланд ажиллана (шүүсэн list дээр)
  function navKey(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setHi((i) => Math.min(list.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); if (list[hi]) pick(list[hi].value); }
    else if (e.key === "Tab") { setOpen(false); }
  }

  function onKey(e: React.KeyboardEvent) {
    if (disabled) return;
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    navKey(e);
  }

  return (
    <div ref={wrapRef} style={{ position: "relative", width: full ? "100%" : "auto", display: full ? "block" : "inline-block" }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        style={sx(
          `display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;background:${bg};border:1px solid ${open ? "#3a3a3d" : "#262626"};border-radius:10px;padding:11px 13px;color:${selected ? "#fff" : "#8A8F98"};font:500 13px Roboto;outline:none;cursor:${disabled ? "not-allowed" : "pointer"};text-align:left;${disabled ? "opacity:.55;" : ""}`,
        )}
      >
        <span style={sx("overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>
          {selected ? selected.label : placeholder}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0, transition: "transform .18s ease", transform: open ? "rotate(180deg)" : "none" }}>
          <path d="M2 4l4 4 4-4" fill="none" stroke="#9a9aa0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          {/* гадуур дарахад хаах давхарга */}
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 1000 }} />
          <div
            ref={menuRef}
            role="listbox"
            style={sx(
              "position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:1001;background:#141416;border:1px solid #2f2f33;border-radius:12px;padding:5px;max-height:300px;overflow-y:auto;box-shadow:0 16px 44px rgba(0,0,0,.55);animation:mhfade .14s both;",
            )}
          >
            {searchable && (
              <div style={sx("position:sticky;top:-5px;z-index:2;background:#141416;padding:2px 2px 6px;margin:-1px 0 2px;")}>
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setHi(0); }}
                  onKeyDown={navKey}
                  placeholder={searchPlaceholder}
                  style={sx("width:100%;background:#050505;border:1px solid #2f2f33;border-radius:9px;padding:9px 11px;color:#fff;font:500 13px Roboto;outline:none;")}
                />
              </div>
            )}
            {list.length === 0 && (
              <div style={sx("padding:12px 11px;font:500 13px Roboto;color:#8A8F98;text-align:center;")}>Илэрц алга</div>
            )}
            {list.map((o, i) => {
              const active = o.value === value;
              const hot = i === hi;
              return (
                <div
                  key={o.value}
                  data-i={i}
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setHi(i)}
                  onClick={() => pick(o.value)}
                  style={sx(
                    `display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 11px;border-radius:8px;cursor:pointer;font:${active ? "700" : "500"} 13px Roboto;color:${active ? "#fff" : "#C8C8C8"};background:${hot ? "#232327" : "transparent"};`,
                  )}
                >
                  <span style={sx("overflow:hidden;text-overflow:ellipsis;white-space:nowrap;")}>{o.label}</span>
                  {active && (
                    <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
                      <path d="M2.5 7.5l3 3 6-7" fill="none" stroke="#E10613" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
