"use client";

import { useState } from "react";
import Link from "next/link";
import { sx } from "@/lib/sx";
import { AuthShell, AUTH_INPUT, AUTH_LABEL, AUTH_BTN } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";

type Step = "phone" | "reset" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");

  function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (phone.replace(/\D/g, "").length !== 8) return setError("Утасны дугаар 8 оронтой байх ёстой.");
    setStep("reset");
  }

  function reset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (otp.replace(/\D/g, "").length < 4) return setError("4 оронтой кодоо оруулна уу.");
    if (pw.length < 4) return setError("Шинэ нууц үг дор хаяж 4 тэмдэгт.");
    if (pw !== pw2) return setError("Нууц үг таарахгүй байна.");
    setStep("done");
  }

  return (
    <AuthShell
      title={step === "done" ? "Амжилттай" : "Нууц үг сэргээх"}
      subtitle={
        step === "phone"
          ? "Бүртгэлтэй утасны дугаараа оруулна уу — баталгаажуулах код илгээнэ."
          : step === "reset"
            ? `+976 ${phone.replace(/\D/g, "")} дугаарт илгээсэн код болон шинэ нууц үгээ оруулна уу.`
            : "Нууц үг шинэчлэгдлээ."
      }
      footer={
        <Link href="/login" style={{ color: "#8A8F98" }}>
          ← Нэвтрэх хуудас
        </Link>
      }
    >
      {step === "phone" && (
        <form onSubmit={sendCode} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={sx(AUTH_LABEL)}>Утасны дугаар</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={sx("background:#050505;border:1px solid #262626;border-radius:10px;padding:14px 12px;color:#8A8F98;font:500 15px Roboto;flex-shrink:0;")}>+976</span>
              <input className="mh-input" type="tel" inputMode="numeric" placeholder="8800 0000" value={phone} onChange={(e) => setPhone(e.target.value)} style={sx(AUTH_INPUT)} />
            </div>
          </div>
          {error && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{error}</div>}
          <button type="submit" style={sx(AUTH_BTN)}>Код авах</button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={reset} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
          <div>
            <label style={sx(AUTH_LABEL)}>Шинэ нууц үг</label>
            <PasswordInput value={pw} onChange={setPw} />
          </div>
          <div>
            <label style={sx(AUTH_LABEL)}>Шинэ нууц үг давтах</label>
            <PasswordInput value={pw2} onChange={setPw2} />
          </div>
          {error && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{error}</div>}
          <button type="submit" style={sx(AUTH_BTN)}>Нууц үг шинэчлэх</button>
        </form>
      )}

      {step === "done" && (
        <div style={sx("text-align:center;padding:14px 0;")}>
          <div style={sx("font:700 18px Montserrat;color:#22c55e;")}>✓ Нууц үг шинэчлэгдлээ</div>
          <div style={sx("font:400 14px Roboto;color:#A3A3A3;margin-top:8px;")}>Шинэ нууц үгээрээ нэвтэрнэ үү.</div>
          <Link href="/login" style={sx(AUTH_BTN + "display:block;text-decoration:none;margin-top:20px;")}>Нэвтрэх</Link>
        </div>
      )}
    </AuthShell>
  );
}
