"use client";

import { useState } from "react";
import { sx } from "@/lib/sx";
import { useAuth } from "@/lib/auth";
import { AUTH_INPUT, AUTH_LABEL } from "@/components/AuthShell";

export default function ProfilePage() {
  const { user, update } = useAuth();
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [firstName, setFirstName] = useState(user?.firstName ?? user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saved, setSaved] = useState(false);

  function save(e: React.FormEvent) {
    e.preventDefault();
    const ln = lastName.trim(), fn = firstName.trim(), em = email.trim();
    const fullName = `${ln} ${fn}`.trim();
    update({ name: fullName, firstName: fn, lastName: ln, email: em });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div style={sx("background:#111113;border:1px solid #262626;border-radius:16px;padding:clamp(18px,3vw,26px);max-width:520px;")}>
      <div style={sx("font:700 18px Montserrat;color:#fff;margin-bottom:18px;")}>Профайл</div>
      <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={sx(AUTH_LABEL)}>Овог</label>
            <input className="mh-input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Овог" style={sx(AUTH_INPUT)} />
          </div>
          <div>
            <label style={sx(AUTH_LABEL)}>Нэр</label>
            <input className="mh-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Нэр" style={sx(AUTH_INPUT)} />
          </div>
        </div>
        <div>
          <label style={sx(AUTH_LABEL)}>И-мэйл</label>
          <input className="mh-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" style={sx(AUTH_INPUT)} />
        </div>
        <div>
          <label style={sx(AUTH_LABEL)}>Утасны дугаар</label>
          <input value={`+976 ${user?.phone ?? ""}`} readOnly style={sx(AUTH_INPUT + "color:#8A8F98;cursor:not-allowed;")} />
          <div style={sx("font:400 11px Roboto;color:#8A8F98;margin-top:6px;")}>Утасны дугаар нэвтрэх ID тул өөрчлөгдөхгүй.</div>
        </div>
        <button
          type="submit"
          style={sx("align-self:flex-start;background:#E10613;color:#fff;font:700 14px Montserrat;letter-spacing:.05em;padding:14px 28px;border:none;border-radius:11px;text-transform:uppercase;cursor:pointer;margin-top:4px;")}
        >
          Хадгалах
        </button>
        {saved && <div style={sx("font:500 13px Roboto;color:#22c55e;")}>✓ Хадгалагдлаа.</div>}
      </form>
    </div>
  );
}
