"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { sx } from "@/lib/sx";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { AUTH_INPUT, AUTH_LABEL, AUTH_BTN } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { Brand } from "@/components/Brand";
import { CountryPicker } from "@/components/checkout/CountryPicker";
import { callingCodeOf, isValidPhone, toE164 } from "@/lib/checkout";

type Mode = "login" | "register" | "forgot" | "reset";
type Ctx = { open: (mode?: Mode) => void; close: () => void };
const AuthModalContext = createContext<Ctx | null>(null);

export function useAuthModal() {
  const c = useContext(AuthModalContext);
  if (!c) throw new Error("useAuthModal must be used inside AuthModalProvider");
  return c;
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const value: Ctx = { open: (m = "login") => setMode(m), close: () => setMode(null) };

  // Нууц үг сэргээх и-мэйлийн линкээр орж ирэхэд (recovery session) reset modal автоматаар нээнэ
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("reset");
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {mode && <AuthModal mode={mode} setMode={setMode} close={() => setMode(null)} />}
    </AuthModalContext.Provider>
  );
}

function AuthModal({ mode, setMode, close }: { mode: Mode; setMode: (m: Mode) => void; close: () => void }) {
  const { t } = useI18n();
  const { refresh } = useAuth();

  // нээлттэй үед body scroll түгжинэ + Esc-ээр хаана
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onEsc);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onEsc); };
  }, [close]);

  return (
    <div
      onClick={close}
      style={{
        position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, background: "rgba(4,4,5,.66)", backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)",
        animation: "mhfade .25s both", overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={sx("position:relative;width:100%;max-width:440px;background:#0c0c0e;border:1px solid #262626;border-radius:20px;padding:clamp(24px,4vw,36px);box-shadow:0 24px 70px rgba(0,0,0,.6);margin:auto;")}
      >
        <button onClick={close} aria-label={t("Хаах")}
          style={sx("position:absolute;top:16px;right:16px;background:none;border:1px solid #262626;border-radius:8px;width:34px;height:34px;color:#8A8F98;font:600 15px Montserrat;cursor:pointer;z-index:1;")}>✕</button>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <Brand height={40} />
        </div>
        {mode === "login" && <LoginForm t={t} refresh={refresh} close={close} toRegister={() => setMode("register")} toForgot={() => setMode("forgot")} />}
        {mode === "register" && <RegisterForm t={t} toLogin={() => setMode("login")} />}
        {mode === "forgot" && <ForgotForm t={t} toLogin={() => setMode("login")} />}
        {mode === "reset" && <ResetForm t={t} refresh={refresh} close={close} />}
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function LoginForm({ t, refresh, close, toRegister, toForgot }: { t: (s: string) => string; refresh: () => Promise<any>; close: () => void; toRegister: () => void; toForgot: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError(t("И-мэйл хаягаа зөв оруулна уу."));
    if (!password) return setError(t("Нууц үгээ оруулна уу."));
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) {
        const m = err.message.toLowerCase();
        setError(m.includes("not confirmed")
          ? t("И-мэйлээ эхлээд баталгаажуулна уу (бүртгэлийн имэйл дэх линк).")
          : t("И-мэйл эсвэл нууц үг буруу байна."));
        return;
      }
      await refresh();
      close();
    } finally { setBusy(false); }
  }

  return (
    <>
      <h2 style={sx("font:800 24px Montserrat;color:#fff;")}>{t("Нэвтрэх")}</h2>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={sx(AUTH_LABEL)}>{t("И-мэйл")}</label>
          <input className="mh-input" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={sx(AUTH_INPUT)} />
        </div>
        <div>
          <label style={sx(AUTH_LABEL)}>{t("Нууц үг")}</label>
          <PasswordInput value={password} onChange={setPassword} />
        </div>
        <div style={{ textAlign: "right", marginTop: -6 }}>
          <button type="button" onClick={toForgot} style={sx("background:none;border:none;font:500 12px Roboto;color:#8A8F98;text-decoration:underline;cursor:pointer;padding:0;")}>{t("Нууц үг мартсан?")}</button>
        </div>
        {error && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{error}</div>}
        <button type="submit" disabled={busy} style={sx(AUTH_BTN + (busy ? "opacity:.6;" : ""))}>{busy ? t("Нэвтэрч байна…") : t("Нэвтрэх")}</button>
      </form>
      <div style={sx("font:400 13px Roboto;color:#8A8F98;text-align:center;margin-top:18px;")}>
        {t("Бүртгэл байхгүй юу?")}{" "}
        <button onClick={toRegister} style={sx("background:none;border:none;color:#E10613;font:700 13px Montserrat;cursor:pointer;padding:0;")}>{t("Бүртгүүлэх")}</button>
      </div>
    </>
  );
}

function RegisterForm({ t, toLogin }: { t: (s: string) => string; toLogin: () => void }) {
  const [lastName, setLastName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("MN");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!lastName.trim()) return setError(t("Овгоо оруулна уу."));
    if (!name.trim()) return setError(t("Нэрээ оруулна уу."));
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError(t("И-мэйл хаягаа зөв оруулна уу."));
    const calling = callingCodeOf(countryCode);
    if (!isValidPhone(calling, phone)) return setError(t("Утасны дугаар буруу байна."));
    const e164 = toE164(calling, phone);
    if (password.length < 6) return setError(t("Нууц үг дор хаяж 6 тэмдэгт."));
    if (password !== confirm) return setError(t("Нууц үг таарахгүй байна."));
    setBusy(true);
    try {
      const { data: phoneTaken } = await supabase.rpc("phone_taken", { p: e164 });
      if (phoneTaken) { setError(t("Энэ утасны дугаар өөр бүртгэлд ашиглагдсан байна.")); return; }
      const fn = name.trim(), ln = lastName.trim();
      const { error: err } = await supabase.auth.signUp({
        email: email.trim(), password,
        options: {
          emailRedirectTo: `${window.location.origin}/account`,
          data: { first_name: fn, last_name: ln, phone: e164, phone_country: countryCode, name: `${ln} ${fn}`.trim() },
        },
      });
      if (err) {
        const m = err.message.toLowerCase();
        if (m.includes("already") || m.includes("registered")) setError(t("Энэ и-мэйл аль хэдийн бүртгэлтэй байна."));
        else if (m.includes("database") || m.includes("duplicate")) setError(t("И-мэйл эсвэл утас давхардаж байна. Дахин шалгана уу."));
        else setError(err.message);
        return;
      }
      setDone(true);
    } finally { setBusy(false); }
  }

  if (done) {
    return (
      <div style={sx("text-align:center;padding:6px 0;")}>
        <h2 style={sx("font:800 20px Montserrat;color:#22c55e;")}>✓ {t("Бүртгэл үүслээ!")}</h2>
        <div style={sx("font:400 14px/1.7 Roboto;color:#A3A3A3;margin-top:12px;")}>
          <b style={{ color: "#fff" }}>{email}</b> {t("хаяг руу баталгаажуулах имэйл илгээлээ.")}
          {" "}{t("Имэйл доторх")} <b style={{ color: "#fff" }}>{t("линк дээр дарж")}</b> {t("баталгаажуулаад нэвтэрнэ үү.")}
          <br /><br />
          <span style={{ color: "#8A8F98", fontSize: 13 }}>{t("Энэ баталгаажуулалт зөвхөн нэг удаа. Дараа нь и-мэйл + нууц үгээрээ шууд нэвтэрнэ.")}</span>
        </div>
        <button onClick={toLogin} style={sx(AUTH_BTN + "display:block;width:100%;margin-top:20px;")}>{t("Нэвтрэх")}</button>
      </div>
    );
  }

  return (
    <>
      <h2 style={sx("font:800 24px Montserrat;color:#fff;")}>{t("Бүртгүүлэх")}</h2>
      <p style={sx("font:400 13px Roboto;color:#8A8F98;margin-top:6px;margin-bottom:20px;")}>{t("Мэдээллээ бөглөж бүртгэл үүсгэнэ үү. Дараа нь зөвхөн и-мэйл + нууц үгээрээ нэвтэрнэ.")}</p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={sx(AUTH_LABEL)}>{t("Овог")}</label>
            <input className="mh-input" placeholder={t("Овог")} value={lastName} onChange={(e) => setLastName(e.target.value)} style={sx(AUTH_INPUT)} />
          </div>
          <div>
            <label style={sx(AUTH_LABEL)}>{t("Нэр")}</label>
            <input className="mh-input" placeholder={t("Нэр")} value={name} onChange={(e) => setName(e.target.value)} style={sx(AUTH_INPUT)} />
          </div>
        </div>
        <div>
          <label style={sx(AUTH_LABEL)}>{t("И-мэйл")}</label>
          <input className="mh-input" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={sx(AUTH_INPUT)} />
        </div>
        <div>
          <label style={sx(AUTH_LABEL)}>{t("Утасны дугаар")}</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CountryPicker compact value={countryCode} onChange={setCountryCode} ariaLabel={t("Улсын код")} />
            <input className="mh-input" type="tel" inputMode="numeric" placeholder="8800 0000" value={phone} onChange={(e) => setPhone(e.target.value)} style={sx(AUTH_INPUT)} />
          </div>
        </div>
        <div>
          <label style={sx(AUTH_LABEL)}>{t("Нууц үг")}</label>
          <PasswordInput value={password} onChange={setPassword} />
        </div>
        <div>
          <label style={sx(AUTH_LABEL)}>{t("Нууц үг давтах")}</label>
          <PasswordInput value={confirm} onChange={setConfirm} />
        </div>
        {error && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{error}</div>}
        <button type="submit" disabled={busy} style={sx(AUTH_BTN + (busy ? "opacity:.6;" : ""))}>{busy ? t("Бүртгэж байна…") : t("Бүртгүүлэх")}</button>
      </form>
      <div style={sx("font:400 13px Roboto;color:#8A8F98;text-align:center;margin-top:16px;")}>
        {t("Бүртгэлтэй юу?")}{" "}
        <button onClick={toLogin} style={sx("background:none;border:none;color:#E10613;font:700 13px Montserrat;cursor:pointer;padding:0;")}>{t("Нэвтрэх")}</button>
      </div>
    </>
  );
}

function ForgotForm({ t, toLogin }: { t: (s: string) => string; toLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError(t("И-мэйл хаягаа зөв оруулна уу."));
    setBusy(true);
    try {
      // Бүртгэлгүй имэйл бол шууд анхааруулна
      const { data: exists } = await supabase.rpc("email_taken", { e: email.trim() });
      if (!exists) { setError(t("Энэ и-мэйл бүртгэлгүй байна.")); return; }
      // recovery линк нүүр рүү авчирна — тэнд PASSWORD_RECOVERY эвент reset modal-ыг нээнэ
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/`,
      });
      if (err) { setError(err.message); return; }
      setSent(true);
    } finally { setBusy(false); }
  }

  if (sent) {
    return (
      <div style={sx("text-align:center;padding:6px 0;")}>
        <h2 style={sx("font:800 20px Montserrat;color:#22c55e;")}>✓ {t("Линк илгээлээ")}</h2>
        <div style={sx("font:400 14px/1.7 Roboto;color:#A3A3A3;margin-top:12px;")}>
          <b style={{ color: "#fff" }}>{email}</b> {t("хаяг руу нууц үг сэргээх линк илгээлээ. Имэйл доторх линк дээр дарж шинэ нууц үгээ тохируулна уу.")}
        </div>
        <button onClick={toLogin} style={sx(AUTH_BTN + "display:block;width:100%;margin-top:20px;")}>{t("Нэвтрэх")}</button>
      </div>
    );
  }

  return (
    <>
      <h2 style={sx("font:800 24px Montserrat;color:#fff;")}>{t("Нууц үг сэргээх")}</h2>
      <p style={sx("font:400 13px Roboto;color:#8A8F98;margin-top:6px;margin-bottom:20px;")}>{t("Бүртгэлтэй и-мэйл хаягаа оруулна уу — нууц үг сэргээх линк илгээнэ.")}</p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={sx(AUTH_LABEL)}>{t("И-мэйл")}</label>
          <input className="mh-input" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={sx(AUTH_INPUT)} />
        </div>
        {error && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{error}</div>}
        <button type="submit" disabled={busy} style={sx(AUTH_BTN + (busy ? "opacity:.6;" : ""))}>{busy ? t("Илгээж байна…") : t("Сэргээх линк авах")}</button>
      </form>
      <div style={sx("font:400 13px Roboto;color:#8A8F98;text-align:center;margin-top:18px;")}>
        <button onClick={toLogin} style={sx("background:none;border:none;color:#8A8F98;font:500 13px Roboto;cursor:pointer;padding:0;")}>← {t("Нэвтрэх")}</button>
      </div>
    </>
  );
}

function ResetForm({ t, refresh, close }: { t: (s: string) => string; refresh: () => Promise<any>; close: () => void }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (pw.length < 6) return setError(t("Шинэ нууц үг дор хаяж 6 тэмдэгт."));
    if (pw !== pw2) return setError(t("Нууц үг таарахгүй байна."));
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password: pw });
      if (err) { setError(err.message); return; }
      setDone(true);
      await refresh();
      setTimeout(close, 1200);
    } finally { setBusy(false); }
  }

  if (done) {
    return (
      <div style={sx("text-align:center;padding:14px 0;")}>
        <h2 style={sx("font:800 20px Montserrat;color:#22c55e;")}>✓ {t("Нууц үг шинэчлэгдлээ")}</h2>
        <div style={sx("font:400 14px Roboto;color:#A3A3A3;margin-top:8px;")}>{t("Таныг оруулж байна…")}</div>
      </div>
    );
  }

  return (
    <>
      <h2 style={sx("font:800 24px Montserrat;color:#fff;")}>{t("Шинэ нууц үг")}</h2>
      <p style={sx("font:400 13px Roboto;color:#8A8F98;margin-top:6px;margin-bottom:20px;")}>{t("Шинэ нууц үгээ оруулна уу.")}</p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={sx(AUTH_LABEL)}>{t("Шинэ нууц үг")}</label>
          <PasswordInput value={pw} onChange={setPw} />
        </div>
        <div>
          <label style={sx(AUTH_LABEL)}>{t("Нууц үг давтах")}</label>
          <PasswordInput value={pw2} onChange={setPw2} />
        </div>
        {error && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{error}</div>}
        <button type="submit" disabled={busy} style={sx(AUTH_BTN + (busy ? "opacity:.6;" : ""))}>{busy ? t("Хадгалж байна…") : t("Нууц үг шинэчлэх")}</button>
      </form>
    </>
  );
}
