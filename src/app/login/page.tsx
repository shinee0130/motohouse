"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sx } from "@/lib/sx";
import { AuthShell, AUTH_INPUT, AUTH_LABEL, AUTH_BTN } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { useAuth, resolveDemo } from "@/lib/auth";
import { upsertProfile } from "@/lib/admin";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const clean = phone.replace(/\D/g, "");
    if (clean.length !== 8) return setError("Утасны дугаар 8 оронтой байх ёстой.");
    if (password.length < 4) return setError("Нууц үг дор хаяж 4 тэмдэгт.");
    // Demo: backend байхгүй тул утсаар role тодорхойлно
    const { name, role } = resolveDemo(clean);
    login({ name, phone: clean, role });
    upsertProfile({ name, phone: clean, role }).catch(() => {});
    router.push(role === "admin" ? "/admin" : "/account");
  }

  return (
    <AuthShell
      title="Нэвтрэх"
      subtitle="Утасны дугаар, нууц үгээрээ нэвтэрнэ үү."
      footer={
        <>
          Бүртгэл байхгүй юу?{" "}
          <Link href="/register" style={{ color: "#E10613", fontWeight: 700 }}>
            Бүртгүүлэх
          </Link>
        </>
      }
    >
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={sx(AUTH_LABEL)}>Утасны дугаар</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={sx("background:#050505;border:1px solid #262626;border-radius:10px;padding:14px 12px;color:#8A8F98;font:500 15px Roboto;flex-shrink:0;")}>
              +976
            </span>
            <input
              className="mh-input"
              type="tel"
              inputMode="numeric"
              placeholder="8800 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={sx(AUTH_INPUT)}
            />
          </div>
        </div>
        <div>
          <label style={sx(AUTH_LABEL)}>Нууц үг</label>
          <PasswordInput value={password} onChange={setPassword} />
        </div>
        <div style={{ textAlign: "right", marginTop: -6 }}>
          <Link href="/forgot-password" style={sx("font:500 12px Roboto;color:#8A8F98;text-decoration:underline;")}>
            Нууц үг мартсан?
          </Link>
        </div>
        {error && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{error}</div>}
        <button type="submit" style={sx(AUTH_BTN)}>
          Нэвтрэх
        </button>
      </form>

      <div style={sx("margin-top:18px;background:#0B0B0D;border:1px solid #262626;border-radius:10px;padding:14px 16px;")}>
        <div style={sx("font:600 11px 'JetBrains Mono';letter-spacing:.1em;color:#E10613;margin-bottom:8px;")}>DEMO БҮРТГЭЛ</div>
        <div style={sx("font:400 13px Roboto;color:#A3A3A3;line-height:1.7;")}>
          <b style={{ color: "#fff" }}>Админ:</b> 8080 8080<br />
          <b style={{ color: "#fff" }}>Хэрэглэгч:</b> 9911 9911<br />
          Нууц үг (хоёулаа): <b style={{ color: "#fff" }}>1234</b>
        </div>
      </div>
    </AuthShell>
  );
}
