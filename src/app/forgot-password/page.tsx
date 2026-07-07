"use client";

import { useState } from "react";
import Link from "next/link";
import { sx } from "@/lib/sx";
import { AuthShell, AUTH_INPUT, AUTH_LABEL, AUTH_BTN } from "@/components/AuthShell";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
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
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) { setError(err.message); return; }
      setSent(true);
    } finally { setBusy(false); }
  }

  return (
    <AuthShell
      title={sent ? t("И-мэйл илгээлээ") : t("Нууц үг сэргээх")}
      subtitle={sent ? "" : t("Бүртгэлтэй и-мэйл хаягаа оруулна уу — нууц үг сэргээх линк илгээнэ.")}
      footer={<Link href="/login" style={{ color: "#8A8F98" }}>← {t("Нэвтрэх хуудас")}</Link>}
    >
      {sent ? (
        <div style={sx("text-align:center;padding:10px 0;")}>
          <div style={sx("font:700 18px Montserrat;color:#22c55e;")}>✓ {t("Линк илгээлээ")}</div>
          <div style={sx("font:400 14px/1.7 Roboto;color:#A3A3A3;margin-top:10px;")}>
            <b style={{ color: "#fff" }}>{email}</b> {t("хаяг руу нууц үг сэргээх линк илгээлээ. Имэйл доторх линк дээр дарж шинэ нууц үгээ тохируулна уу.")}
          </div>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={sx(AUTH_LABEL)}>{t("И-мэйл")}</label>
            <input className="mh-input" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={sx(AUTH_INPUT)} />
          </div>
          {error && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{error}</div>}
          <button type="submit" disabled={busy} style={sx(AUTH_BTN + (busy ? "opacity:.6;" : ""))}>{busy ? t("Илгээж байна…") : t("Сэргээх линк авах")}</button>
        </form>
      )}
    </AuthShell>
  );
}
