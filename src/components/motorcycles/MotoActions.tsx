"use client";

// Мотоциклын CTA — "Сонирхож байна" хүсэлт + хадгалах + perks жагсаалт (RevZilla маягийн).
// Мотоцикл өндөр үнэтэй тул онлайн төлбөрөөр биш, сонирхлын хүсэлтээр холбогдоно.

import { useEffect, useState } from "react";
import Link from "next/link";
import { sx } from "@/lib/ui/sx";
import { useAuth } from "@/lib/auth/auth";
import { useAuthModal } from "@/lib/auth/authModal";
import { getSavedIds } from "@/lib/db/queries";
import { createOrderRequest, setSaved } from "@/lib/db/admin";
import { useI18n } from "@/lib/i18n";

export function MotoActions({ id, name, price }: { id: number; name: string; price: number }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const authModal = useAuthModal();
  const [saved, setSavedState] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) getSavedIds(user.phone, "moto").then((ids) => setSavedState(ids.includes(id)));
  }, [user, id]);

  async function toggleSave() {
    if (!user) { authModal.open("login"); return; }
    const next = !saved;
    setSavedState(next);
    await setSaved(user.phone, "moto", id, next);
  }
  async function order() {
    if (!user) { authModal.open("login"); return; }
    setBusy(true);
    try {
      const detail = [
        `Мотоцикл: ${name}`,
        `Үнэ: ${price.toLocaleString("en-US")}₮`,
        user.email ? `И-мэйл: ${user.email}` : "",
        "Хэрэглэгч энэ мотоциклийг сонирхож байна. Нөхцөл болон дэлгэрэнгүй мэдээллээр эргэж холбогдоно уу.",
      ].filter(Boolean).join("\n");
      const rid = await createOrderRequest({
        userPhone: user.phone,
        name: user.name,
        phone: user.phone,
        category: "Мотоцикл",
        detail,
      });
      setRequestId(rid);
    } finally { setBusy(false); }
  }

  return (
    <>
      <div style={{ marginTop: 22 }}>
        <button
          onClick={order}
          disabled={busy || !!requestId}
          style={sx(`width:100%;background:#E10613;color:#fff;font:700 15px Montserrat;letter-spacing:.04em;padding:17px;border:none;border-radius:12px;text-transform:uppercase;cursor:pointer;${busy ? "opacity:.6;" : ""}`)}
        >
          {requestId ? t("Хүсэлт илгээгдлээ!") : busy ? t("Илгээж байна…") : user ? t("Сонирхож байна") : t("Нэвтэрч захиалах")}
        </button>
        <button
          onClick={toggleSave}
          style={sx(`width:100%;margin-top:10px;display:flex;align-items:center;justify-content:center;gap:8px;font:700 14px Montserrat;letter-spacing:.04em;padding:15px;border-radius:12px;cursor:pointer;text-transform:uppercase;background:${saved ? "rgba(225,6,19,.12)" : "#111113"};border:1px solid ${saved ? "#E10613" : "#333"};color:${saved ? "#E10613" : "#fff"};`)}
        >
          {saved ? `♥ ${t("Хадгалсан")}` : `♡ ${t("Хадгалах")}`}
        </button>
      </div>
      {requestId && (
        <div style={sx("font:500 13px Roboto;color:#22c55e;margin-top:12px;")}>
          ✓ {t("Хүсэлт илгээгдлээ — бид тантай удахгүй холбогдоно.")} <Link href="/account/requests" style={{ color: "#22c55e", textDecoration: "underline" }}>{t("Миний хүсэлтүүд")}</Link>
        </div>
      )}

      {/* Давуу талууд (gear-ийн perks-тэй ижил загвар) */}
      <div style={sx("margin-top:18px;background:#0B0B0D;border:1px solid #262626;border-radius:14px;padding:6px 16px;")}>
        {[
          { icon: "🏍", text: "Uniqcenter дэлгүүрт очиж бодитоор үзэх боломжтой" },
          { icon: "📋", text: "Гааль, бүртгэлийн бичиг баримтад зөвлөгөө өгнө" },
          { icon: "🛡", text: "Баталгаат оригинал бараа" },
          { icon: "💬", text: "Сонирхсон бол бид тантай холбогдож нөхцөлийг танилцуулна" },
        ].map((p, i, arr) => (
          <div key={p.text} style={sx(`display:flex;align-items:center;gap:11px;padding:10px 0;${i < arr.length - 1 ? "border-bottom:1px solid #151517;" : ""}`)}>
            <span style={{ fontSize: 16, flexShrink: 0 }} aria-hidden="true">{p.icon}</span>
            <span style={sx("font:500 13px Roboto;color:#C8C8C8;")}>{t(p.text)}</span>
          </div>
        ))}
      </div>
    </>
  );
}
