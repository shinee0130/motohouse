"use client";

// Дахин ашиглагдах custom dropdown — native <select>-ийн оронд бүх газар.
// Хар загварт тааруулсан, гар (keyboard) удирдлагатай, гадуур дарахад хаагдана.

import { useEffect, useRef, useState } from "react";
import { sx } from "@/lib/sx";

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
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1); // highlight index (гарын навигац)
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const selectedIdx = options.findIndex((o) => o.value === value);

  function openMenu() {
    if (disabled) return;
    setHi(selectedIdx >= 0 ? selectedIdx : 0);
    setOpen(true);
  }

  function pick(v: string) {
    onChange(v);
    setOpen(false);
  }

  // нээгдэх үед сонгосон мөр рүү гүйлгэнэ
  useEffect(() => {
    if (open && menuRef.current) {
      const el = menuRef.current.querySelector<HTMLElement>(`[data-i="${hi}"]`);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [open, hi]);

  function onKey(e: React.KeyboardEvent) {
    if (disabled) return;
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setHi((i) => Math.min(options.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); if (options[hi]) pick(options[hi].value); }
    else if (e.key === "Tab") { setOpen(false); }
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
              "position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:1001;background:#141416;border:1px solid #2f2f33;border-radius:12px;padding:5px;max-height:280px;overflow-y:auto;box-shadow:0 16px 44px rgba(0,0,0,.55);animation:mhfade .14s both;",
            )}
          >
            {options.map((o, i) => {
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
