"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sx } from "@/lib/sx";
import { AuthShell, AUTH_INPUT, AUTH_LABEL, AUTH_BTN } from "@/components/AuthShell";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { upsertProfile } from "@/lib/admin";

type Step = "form" | "otp" | "done";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [step, setStep] = useState<Step>("form");
  const [lastName, setLastName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!lastName.trim()) return setError("Овгоо оруулна уу.");
    if (!name.trim()) return setError("Нэрээ оруулна уу.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("И-мэйл хаягаа зөв оруулна уу.");
    if (phone.replace(/\D/g, "").length !== 8) return setError("Утасны дугаар 8 оронтой байх ёстой.");
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          data: { first_name: name.trim(), last_name: lastName.trim(), phone: phone.replace(/\D/g, ""), name: `${lastName.trim()} ${name.trim()}`.trim() },
        },
      });
      if (err) { setError(err.message); return; }
      setStep("otp");
    } finally { setBusy(false); }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (otp.replace(/\D/g, "").length < 6) return setError("6 оронтой кодоо оруулна уу.");
    setBusy(true);
    try {
      const { data, error: err } = await supabase.auth.verifyOtp({
        email: email.trim(), token: otp.trim(), type: "email",
      });
      if (err || !data.user) { setError("Код буруу эсвэл хугацаа дууссан байна."); return; }
      const fn = name.trim(), ln = lastName.trim();
      await upsertProfile({
        id: data.user.id, name: `${ln} ${fn}`.trim(), first_name: fn, last_name: ln,
        email: email.trim(), phone: phone.replace(/\D/g, ""), role: "customer",
      }).catch(() => {});
      await refresh();
      setStep("done");
    } finally { setBusy(false); }
  }

  return (
    <AuthShell
      title={step === "otp" ? "Баталгаажуулах" : "Бүртгүүлэх"}
      subtitle={
        step === "otp"
          ? `${email} хаяг руу илгээсэн 6 оронтой кодыг оруулна уу.`
          : "И-мэйл хаягаараа шинэ бүртгэл үүсгэнэ үү."
      }
      footer={
        step === "form" ? (
          <>
            Бүртгэлтэй юу?{" "}
            <Link href="/login" style={{ color: "#E10613", fontWeight: 700 }}>Нэвтрэх</Link>
          </>
        ) : step === "otp" ? (
          <span onClick={() => { setStep("form"); setOtp(""); setError(""); }} style={{ color: "#8A8F98", cursor: "pointer" }}>← Буцах</span>
        ) : (
          <Link href="/login" style={{ color: "#8A8F98" }}>← Нэвтрэх хуудас</Link>
        )
      }
    >
      {step === "form" && (
        <form onSubmit={sendCode} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={sx(AUTH_LABEL)}>Овог</label>
              <input className="mh-input" placeholder="Овог" value={lastName} onChange={(e) => setLastName(e.target.value)} style={sx(AUTH_INPUT)} />
            </div>
            <div>
              <label style={sx(AUTH_LABEL)}>Нэр</label>
              <input className="mh-input" placeholder="Нэр" value={name} onChange={(e) => setName(e.target.value)} style={sx(AUTH_INPUT)} />
            </div>
          </div>
          <div>
            <label style={sx(AUTH_LABEL)}>И-мэйл</label>
            <input className="mh-input" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={sx(AUTH_INPUT)} />
          </div>
          <div>
            <label style={sx(AUTH_LABEL)}>Утасны дугаар</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={sx("background:#050505;border:1px solid #262626;border-radius:10px;padding:14px 12px;color:#8A8F98;font:500 15px Roboto;flex-shrink:0;")}>+976</span>
              <input className="mh-input" type="tel" inputMode="numeric" placeholder="8800 0000" value={phone} onChange={(e) => setPhone(e.target.value)} style={sx(AUTH_INPUT)} />
            </div>
          </div>
          {error && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{error}</div>}
          <button type="submit" disabled={busy} style={sx(AUTH_BTN + (busy ? "opacity:.6;" : ""))}>{busy ? "Илгээж байна…" : "Код авах"}</button>
        </form>
      )}

      {step === "otp" && (
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
          <button type="submit" disabled={busy} style={sx(AUTH_BTN + (busy ? "opacity:.6;" : ""))}>{busy ? "Шалгаж байна…" : "Баталгаажуулах"}</button>
        </form>
      )}

      {step === "done" && (
        <div style={sx("text-align:center;padding:14px 0;")}>
          <div style={sx("font:700 18px Montserrat;color:#22c55e;")}>✓ Бүртгэл амжилттай!</div>
          <div style={sx("font:400 14px Roboto;color:#A3A3A3;margin-top:8px;")}>Тавтай морил, {lastName} {name}.</div>
          <button onClick={() => router.push("/account")} style={sx(AUTH_BTN + "display:block;margin-top:20px;")}>Миний бүртгэл</button>
        </div>
      )}
    </AuthShell>
  );
}
