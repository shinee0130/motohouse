"use client";

import { useState } from "react";
import { sx } from "@/lib/ui/sx";
import { AUTH_INPUT } from "@/components/auth/AuthShell";

export function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        className="mh-input"
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={sx(AUTH_INPUT + "padding-right:48px;")}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Нууц үг нуух" : "Нууц үг харах"}
        style={sx(
          "position:absolute;top:50%;right:6px;transform:translateY(-50%);width:38px;height:38px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;color:#8A8F98;",
        )}
      >
        {show ? (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.2A9.5 9.5 0 0 1 12 5c5 0 9 4.5 9 7 0 1-.7 2.3-1.9 3.5M6.1 6.2C3.8 7.6 2 9.9 2 12c0 2.5 4 7 10 7 1.6 0 3-.3 4.3-.9" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
