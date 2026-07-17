"use client";

// Checkout-ийн нийтлэг талбарууд — a11y-тэй (label, aria-invalid, aria-describedby),
// touch-friendly (≥44px), MOTO HOUSE загвартай. Бүх section эдгээрийг ашиглана.

import { useId, type ReactNode } from "react";
import { sx } from "@/lib/sx";

export const F_LABEL = "font:600 12px Montserrat;letter-spacing:.02em;color:#C8C8C8;margin-bottom:6px;display:flex;align-items:center;gap:4px;";
export const F_INPUT = "width:100%;min-height:44px;background:#050505;border:1px solid #262626;border-radius:10px;padding:12px 14px;color:#fff;font:400 15px Roboto;outline:none;";
export const F_ERR = "font:500 12px Roboto;color:#ef4444;margin-top:5px;";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string; // аль хэдийн орчуулсан текст
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "tel" | "numeric" | "email";
  autoComplete?: string;
  textarea?: boolean;
  rows?: number;
  disabled?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
}

export function TextField({
  label, value, onChange, required, error, placeholder, type = "text",
  inputMode, autoComplete, textarea, rows = 3, disabled, inputRef,
}: TextFieldProps) {
  const id = useId();
  const errId = `${id}-err`;
  const border = error ? "border-color:#ef4444;" : "";
  return (
    <div>
      <label htmlFor={id} style={sx(F_LABEL)}>
        {label}{required && <span style={{ color: "#E10613" }} aria-hidden="true">*</span>}
      </label>
      {textarea ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          style={sx(F_INPUT + "resize:vertical;" + border)}
        />
      ) : (
        <input
          id={id}
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          style={sx(F_INPUT + border)}
        />
      )}
      {error && <div id={errId} role="alert" style={sx(F_ERR)}>{error}</div>}
    </div>
  );
}

// Дугаартай гарчигтай section (mobile-first, тод heading).
export function Section({ index, title, children }: { index: number; title: string; children: ReactNode }) {
  return (
    <section style={sx("padding:16px 0 18px;")}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={sx("width:22px;height:22px;border-radius:6px;background:#E10613;color:#fff;font:800 11px Montserrat;display:flex;align-items:center;justify-content:center;flex:none;")}>{index}</span>
        <h3 style={sx("font:700 13px Montserrat;letter-spacing:.06em;color:#fff;text-transform:uppercase;")}>{title}</h3>
      </div>
      {children}
    </section>
  );
}

// Хоёр баганат grid (mobile дээр нэг багана).
export function FieldGrid({ children }: { children: ReactNode }) {
  return <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;")}>{children}</div>;
}
