"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sx } from "@/lib/sx";
import { AuthShell, AUTH_INPUT, AUTH_LABEL, AUTH_BTN } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { useAuth } from "@/lib/auth";
import { upsertProfile } from "@/lib/admin";

type Step = "form" | "otp" | "done";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState<Step>("form");
  const [lastName, setLastName] = useState("");
  const [name, setName] = useState(""); // нэр (first name)
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!lastName.trim()) return setError("Овгоо оруулна уу.");
    if (!name.trim()) return setError("Нэрээ оруулна уу.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("И-мэйл хаягаа зөв оруулна уу.");
    if (phone.replace(/\D/g, "").length !== 8) return setError("Утасны дугаар 8 оронтой байх ёстой.");
    if (password.length < 4) return setError("Нууц үг дор хаяж 4 тэмдэгт.");
    if (password !== confirm) return setError("Нууц үг таарахгүй байна.");
    setStep("otp"); // бодит дээр энд SMS код илгээнэ
  }

  function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (otp.replace(/\D/g, "").length < 4) return setError("4 оронтой кодоо оруулна уу.");
    const cleanPhone = phone.replace(/\D/g, "");
    const fn = name.trim(), ln = lastName.trim(), em = email.trim();
    const fullName = `${ln} ${fn}`.trim();
    login({ name: fullName, firstName: fn, lastName: ln, email: em, phone: cleanPhone, role: "customer" });
    upsertProfile({ name: fullName, first_name: fn, last_name: ln, email: em, phone: cleanPhone, role: "customer" }).catch(() => {});
    setStep("done");
  }

  const phoneClean = phone.replace(/\D/g, "");

  return (
    <AuthShell
      title={step === "otp" ? "Баталгаажуулах" : "Бүртгүүлэх"}
      subtitle={
        step === "otp"
          ? `+976 ${phoneClean} дугаарт илгээсэн кодыг оруулна уу.`
          : "Утасны дугаараараа шинэ бүртгэл үүсгэнэ үү."
      }
      footer={
        step === "form" ? (
          <>
            Бүртгэлтэй юу?{" "}
            <Link href="/login" style={{ color: "#E10613", fontWeight: 700 }}>
              Нэвтрэх
            </Link>
          </>
        ) : (
          <Link href="/login" style={{ color: "#8A8F98" }}>
            ← Нэвтрэх хуудас
          </Link>
        )
      }
    >
      {step === "form" && (
        <form onSubmit={submitForm} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
          <div>
            <label style={sx(AUTH_LABEL)}>Нууц үг давтах</label>
            <PasswordInput value={confirm} onChange={setConfirm} />
          </div>
          {error && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{error}</div>}
          <button type="submit" style={sx(AUTH_BTN)}>
            Код авах
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={submitOtp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={sx(AUTH_LABEL)}>Баталгаажуулах код</label>
            <input
              className="mh-input"
              type="tel"
              inputMode="numeric"
              placeholder="0000"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={sx(AUTH_INPUT + "text-align:center;letter-spacing:.5em;font-size:22px;")}
            />
          </div>
          {error && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{error}</div>}
          <button type="submit" style={sx(AUTH_BTN)}>
            Баталгаажуулах
          </button>
          <div style={sx("font:400 13px Roboto;color:#8A8F98;text-align:center;")}>
            Код ирээгүй юу?{" "}
            <span style={{ color: "#C8C8C8", textDecoration: "underline", cursor: "pointer" }}>Дахин илгээх</span>
          </div>
        </form>
      )}

      {step === "done" && (
        <div style={sx("text-align:center;padding:14px 0;")}>
          <div style={sx("font:700 18px Montserrat;color:#22c55e;")}>✓ Бүртгэл амжилттай!</div>
          <div style={sx("font:400 14px Roboto;color:#A3A3A3;margin-top:8px;")}>
            Тавтай морил, {lastName} {name}.
          </div>
          <button onClick={() => router.push("/account")} style={sx(AUTH_BTN + "display:block;margin-top:20px;")}>
            Миний бүртгэл
          </button>
        </div>
      )}
    </AuthShell>
  );
}
