"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sx } from "@/lib/sx";
import { AuthShell, AUTH_INPUT, AUTH_LABEL, AUTH_BTN } from "@/components/AuthShell";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type Step = "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("И-мэйл хаягаа зөв оруулна уу.");
    setBusy(true);
    try {
      // shouldCreateUser:false → зөвхөн бүртгэлтэй хэрэглэгч нэвтэрнэ
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: false },
      });
      if (err) {
        setError(err.status === 422 || err.message.toLowerCase().includes("signups not allowed")
          ? "Энэ и-мэйлээр бүртгэл олдсонгүй. Эхлээд бүртгүүлнэ үү."
          : err.message);
        return;
      }
      setStep("otp");
    } finally { setBusy(false); }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (otp.replace(/\D/g, "").length < 6) return setError("6 оронтой кодоо оруулна уу.");
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.verifyOtp({
        email: email.trim(), token: otp.trim(), type: "email",
      });
      if (err) { setError("Код буруу эсвэл хугацаа дууссан байна."); return; }
      const u = await refresh();
      router.push(u?.role === "admin" ? "/admin" : "/account");
    } finally { setBusy(false); }
  }

  return (
    <AuthShell
      title={step === "otp" ? "Баталгаажуулах" : "Нэвтрэх"}
      subtitle={
        step === "otp"
          ? `${email} хаяг руу илгээсэн 6 оронтой кодыг оруулна уу.`
          : "И-мэйл хаягаа оруулбал нэг удаагийн код илгээнэ."
      }
      footer={
        step === "email" ? (
          <>
            Бүртгэл байхгүй юу?{" "}
            <Link href="/register" style={{ color: "#E10613", fontWeight: 700 }}>Бүртгүүлэх</Link>
          </>
        ) : (
          <span onClick={() => { setStep("email"); setOtp(""); setError(""); }} style={{ color: "#8A8F98", cursor: "pointer" }}>
            ← И-мэйл солих
          </span>
        )
      }
    >
      {step === "email" ? (
        <form onSubmit={sendCode} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={sx(AUTH_LABEL)}>И-мэйл</label>
            <input className="mh-input" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={sx(AUTH_INPUT)} />
          </div>
          {error && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{error}</div>}
          <button type="submit" disabled={busy} style={sx(AUTH_BTN + (busy ? "opacity:.6;" : ""))}>
            {busy ? "Илгээж байна…" : "Код авах"}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={sx(AUTH_LABEL)}>Баталгаажуулах код</label>
            <input
              className="mh-input" type="tel" inputMode="numeric" placeholder="000000" maxLength={6}
              value={otp} onChange={(e) => setOtp(e.target.value)}
              style={sx(AUTH_INPUT + "text-align:center;letter-spacing:.5em;font-size:22px;")}
            />
          </div>
          {error && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{error}</div>}
          <button type="submit" disabled={busy} style={sx(AUTH_BTN + (busy ? "opacity:.6;" : ""))}>
            {busy ? "Шалгаж байна…" : "Нэвтрэх"}
          </button>
          <div style={sx("font:400 13px Roboto;color:#8A8F98;text-align:center;")}>
            Код ирээгүй юу?{" "}
            <span onClick={() => { if (!busy) sendCode({ preventDefault() {} } as React.FormEvent); }} style={{ color: "#C8C8C8", textDecoration: "underline", cursor: "pointer" }}>Дахин илгээх</span>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
