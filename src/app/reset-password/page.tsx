"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sx } from "@/lib/sx";
import { AuthShell, AUTH_LABEL, AUTH_BTN } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Recovery линкээр session үүссэн эсэхийг шалгах
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setHasSession(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (pw.length < 6) return setError("Шинэ нууц үг дор хаяж 6 тэмдэгт.");
    if (pw !== pw2) return setError("Нууц үг таарахгүй байна.");
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password: pw });
      if (err) { setError(err.message); return; }
      setDone(true);
      setTimeout(() => router.push("/account"), 1500);
    } finally { setBusy(false); }
  }

  return (
    <AuthShell
      title={done ? "Амжилттай" : "Шинэ нууц үг"}
      subtitle={done ? "" : "Шинэ нууц үгээ оруулна уу."}
      footer={<Link href="/login" style={{ color: "#8A8F98" }}>← Нэвтрэх хуудас</Link>}
    >
      {done ? (
        <div style={sx("text-align:center;padding:14px 0;")}>
          <div style={sx("font:700 18px Montserrat;color:#22c55e;")}>✓ Нууц үг шинэчлэгдлээ</div>
          <div style={sx("font:400 14px Roboto;color:#A3A3A3;margin-top:8px;")}>Таныг оруулж байна…</div>
        </div>
      ) : !ready ? (
        <div style={sx("font:500 14px Roboto;color:#8A8F98;text-align:center;padding:14px 0;")}>Уншиж байна…</div>
      ) : !hasSession ? (
        <div style={sx("font:400 14px/1.7 Roboto;color:#A3A3A3;text-align:center;padding:14px 0;")}>
          Сэргээх линк хүчингүй эсвэл хугацаа дууссан байна. <br />
          <Link href="/forgot-password" style={{ color: "#E10613", fontWeight: 700 }}>Дахин линк авах</Link>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={sx(AUTH_LABEL)}>Шинэ нууц үг</label>
            <PasswordInput value={pw} onChange={setPw} />
          </div>
          <div>
            <label style={sx(AUTH_LABEL)}>Шинэ нууц үг давтах</label>
            <PasswordInput value={pw2} onChange={setPw2} />
          </div>
          {error && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{error}</div>}
          <button type="submit" disabled={busy} style={sx(AUTH_BTN + (busy ? "opacity:.6;" : ""))}>{busy ? "Хадгалж байна…" : "Нууц үг шинэчлэх"}</button>
        </form>
      )}
    </AuthShell>
  );
}
