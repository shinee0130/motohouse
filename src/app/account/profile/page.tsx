"use client";

import { useState } from "react";
import { sx } from "@/lib/sx";
import { useAuth } from "@/lib/auth";
import { AUTH_INPUT, AUTH_LABEL } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";

const CARD = "background:#111113;border:1px solid #262626;border-radius:16px;padding:clamp(18px,3vw,26px);max-width:520px;";
const BTN = "align-self:flex-start;background:#E10613;color:#fff;font:700 14px Montserrat;letter-spacing:.05em;padding:14px 28px;border:none;border-radius:11px;text-transform:uppercase;cursor:pointer;margin-top:4px;";

export default function ProfilePage() {
  const { t } = useI18n();
  const { user, update } = useAuth();
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [firstName, setFirstName] = useState(user?.firstName ?? user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  // Нууц үг солих
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const ln = lastName.trim(), fn = firstName.trim(), ph = phone.replace(/\D/g, "");
    if (!ln) return setErr(t("Овгоо оруулна уу."));
    if (!fn) return setErr(t("Нэрээ оруулна уу."));
    if (ph && ph.length !== 8) return setErr(t("Утасны дугаар 8 оронтой байх ёстой."));
    if (ph) {
      const { data: taken } = await supabase.rpc("phone_taken", { p: ph });
      if (taken) return setErr(t("Энэ утасны дугаар өөр бүртгэлд ашиглагдсан байна."));
    }
    await update({ name: `${ln} ${fn}`.trim(), firstName: fn, lastName: ln, phone: ph });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function changePw(e: React.FormEvent) {
    e.preventDefault();
    setPwErr(""); setPwMsg("");
    if (pw.length < 6) return setPwErr(t("Шинэ нууц үг дор хаяж 6 тэмдэгт."));
    if (pw !== pw2) return setPwErr(t("Нууц үг таарахгүй байна."));
    setPwBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) { setPwErr(error.message); return; }
      setPw(""); setPw2(""); setPwMsg("✓ " + t("Нууц үг шинэчлэгдлээ."));
      setTimeout(() => setPwMsg(""), 3000);
    } finally { setPwBusy(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Хувийн мэдээлэл */}
      <div style={sx(CARD)}>
        <div style={sx("font:700 18px Montserrat;color:#fff;margin-bottom:18px;")}>{t("Профайл")}</div>
        <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={sx(AUTH_LABEL)}>{t("Овог")}</label>
              <input className="mh-input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={t("Овог")} style={sx(AUTH_INPUT)} />
            </div>
            <div>
              <label style={sx(AUTH_LABEL)}>{t("Нэр")}</label>
              <input className="mh-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={t("Нэр")} style={sx(AUTH_INPUT)} />
            </div>
          </div>
          <div>
            <label style={sx(AUTH_LABEL)}>{t("Утасны дугаар")}</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={sx("background:#050505;border:1px solid #262626;border-radius:10px;padding:14px 12px;color:#8A8F98;font:500 15px Roboto;flex-shrink:0;")}>+976</span>
              <input className="mh-input" type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="8800 0000" style={sx(AUTH_INPUT)} />
            </div>
          </div>
          <div>
            <label style={sx(AUTH_LABEL)}>{t("И-мэйл")}</label>
            <input value={user?.email ?? ""} readOnly style={sx(AUTH_INPUT + "color:#8A8F98;cursor:not-allowed;")} />
            <div style={sx("font:400 11px Roboto;color:#8A8F98;margin-top:6px;")}>{t("И-мэйл нь нэвтрэх ID тул өөрчлөгдөхгүй.")}</div>
          </div>
          {err && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{err}</div>}
          <button type="submit" style={sx(BTN)}>{t("Хадгалах")}</button>
          {saved && <div style={sx("font:500 13px Roboto;color:#22c55e;")}>✓ {t("Хадгалагдлаа.")}</div>}
        </form>
      </div>

      {/* Нууц үг солих */}
      <div style={sx(CARD)}>
        <div style={sx("font:700 18px Montserrat;color:#fff;margin-bottom:18px;")}>{t("Нууц үг солих")}</div>
        <form onSubmit={changePw} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={sx(AUTH_LABEL)}>{t("Шинэ нууц үг")}</label>
            <PasswordInput value={pw} onChange={setPw} />
          </div>
          <div>
            <label style={sx(AUTH_LABEL)}>{t("Шинэ нууц үг давтах")}</label>
            <PasswordInput value={pw2} onChange={setPw2} />
          </div>
          {pwErr && <div style={sx("font:500 13px Roboto;color:#ef4444;")}>{pwErr}</div>}
          <button type="submit" disabled={pwBusy} style={sx(BTN + (pwBusy ? "opacity:.6;" : ""))}>{pwBusy ? t("Хадгалж байна…") : t("Нууц үг шинэчлэх")}</button>
          {pwMsg && <div style={sx("font:500 13px Roboto;color:#22c55e;")}>{pwMsg}</div>}
        </form>
      </div>
    </div>
  );
}
