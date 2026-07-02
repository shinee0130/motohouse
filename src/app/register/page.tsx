"use client";

import { useState } from "react";
import Link from "next/link";
import { sx } from "@/lib/sx";
import { AuthShell, AUTH_INPUT, AUTH_LABEL, AUTH_BTN } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [lastName, setLastName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!lastName.trim()) return setError("Овгоо оруулна уу.");
    if (!name.trim()) return setError("Нэрээ оруулна уу.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("И-мэйл хаягаа зөв оруулна уу.");
    if (phone.replace(/\D/g, "").length !== 8) return setError("Утасны дугаар 8 оронтой байх ёстой.");
    if (password.length < 6) return setError("Нууц үг дор хаяж 6 тэмдэгт.");
    if (password !== confirm) return setError("Нууц үг таарахгүй байна.");
    setBusy(true);
    try {
      const fn = name.trim(), ln = lastName.trim();
      const { error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/account`,
          data: { first_name: fn, last_name: ln, phone: phone.replace(/\D/g, ""), name: `${ln} ${fn}`.trim() },
        },
      });
      if (err) {
        const m = err.message.toLowerCase();
        setError(m.includes("already") || m.includes("registered") ? "Энэ и-мэйл аль хэдийн бүртгэлтэй байна." : err.message);
        return;
      }
      setDone(true);
    } finally { setBusy(false); }
  }

  return (
    <AuthShell
      title={done ? "И-мэйлээ баталгаажуулна уу" : "Бүртгүүлэх"}
      subtitle={done ? "" : "Мэдээллээ бөглөж бүртгэл үүсгэнэ үү. Дараа нь зөвхөн и-мэйл + нууц үгээрээ нэвтэрнэ."}
      footer={
        done ? (
          <Link href="/login" style={{ color: "#8A8F98" }}>← Нэвтрэх хуудас</Link>
        ) : (
          <>
            Бүртгэлтэй юу?{" "}
            <Link href="/login" style={{ color: "#E10613", fontWeight: 700 }}>Нэвтрэх</Link>
          </>
        )
      }
    >
      {done ? (
        <div style={sx("text-align:center;padding:10px 0;")}>
          <div style={sx("font:700 18px Montserrat;color:#22c55e;")}>✓ Бүртгэл үүслээ!</div>
          <div style={sx("font:400 14px/1.7 Roboto;color:#A3A3A3;margin-top:10px;")}>
            <b style={{ color: "#fff" }}>{email}</b> хаяг руу баталгаажуулах имэйл илгээлээ.
            Имэйл доторх <b style={{ color: "#fff" }}>линк дээр дарж</b> баталгаажуулаад нэвтэрнэ үү.
            <br /><br />
            <span style={{ color: "#8A8F98", fontSize: 13 }}>Энэ баталгаажуулалт зөвхөн нэг удаа. Дараа нь и-мэйл + нууц үгээрээ шууд нэвтэрнэ.</span>
          </div>
          <Link href="/login" style={sx(AUTH_BTN + "display:block;text-decoration:none;margin-top:20px;")}>Нэвтрэх хуудас</Link>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
          <div>
            <label style={sx(AUTH_LABEL)}>Нууц үг</label>
            <PasswordInput value={password} onChange={setPassword} />
          </div>
          <div>
            <label style={sx(AUTH_LABEL)}>Нууц үг давтах</label>
            <PasswordInput value={confirm} onChange={setConfirm} />
          </div>
          {error && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{error}</div>}
          <button type="submit" disabled={busy} style={sx(AUTH_BTN + (busy ? "opacity:.6;" : ""))}>{busy ? "Бүртгэж байна…" : "Бүртгүүлэх"}</button>
        </form>
      )}
    </AuthShell>
  );
}
