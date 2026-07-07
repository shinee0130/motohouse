"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sx } from "@/lib/sx";
import { AuthShell, AUTH_INPUT, AUTH_LABEL, AUTH_BTN } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const { t } = useI18n();
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
      const u = await refresh();
      router.push(u?.role === "admin" ? "/admin" : "/account");
    } finally { setBusy(false); }
  }

  return (
    <AuthShell
      title={t("Нэвтрэх")}
      subtitle={t("И-мэйл, нууц үгээрээ нэвтэрнэ үү.")}
      footer={
        <>
          {t("Бүртгэл байхгүй юу?")}{" "}
          <Link href="/register" style={{ color: "#E10613", fontWeight: 700 }}>{t("Бүртгүүлэх")}</Link>
        </>
      }
    >
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
          <Link href="/forgot-password" style={sx("font:500 12px Roboto;color:#8A8F98;text-decoration:underline;")}>
            {t("Нууц үг мартсан?")}
          </Link>
        </div>
        {error && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{error}</div>}
        <button type="submit" disabled={busy} style={sx(AUTH_BTN + (busy ? "opacity:.6;" : ""))}>
          {busy ? t("Нэвтэрч байна…") : t("Нэвтрэх")}
        </button>
      </form>
    </AuthShell>
  );
}
