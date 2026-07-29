"use client";

import { useState } from "react";
import { sx } from "@/lib/ui/sx";
import { useI18n } from "@/lib/i18n";
import { createBonumInvoice } from "@/lib/db/admin";

// Төлөгдөөгүй захиалга дээр "Төлбөрөө төлөх" — Bonum-д ШИНЭ invoice үүсгэж
// төлбөрийн хуудас руу буцаана. Хуучин invoice 30 минутын дараа хүчингүй болдог
// тул дахин оролдоход шинийг үүсгэх ёстой (edge function өөрөө дүнг DB-ээс авна,
// хэрэглэгч дүнг өөрчилж чадахгүй).
export function PayAgainButton({ transactionId, kind = "order" }: { transactionId: string; kind?: "order" | "photo" }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay() {
    setError("");
    setBusy(true);
    try {
      const { followUpLink } = await createBonumInvoice(transactionId, kind);
      window.location.href = followUpLink;
    } catch {
      setError(t("Төлбөрийн хуудас үүсгэхэд алдаа гарлаа. Дахин оролдоно уу."));
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
      <button
        onClick={pay}
        disabled={busy}
        style={sx(`background:#E10613;color:#fff;font:700 12px Montserrat;letter-spacing:.04em;padding:10px 18px;border:none;border-radius:9px;cursor:pointer;text-transform:uppercase;${busy ? "opacity:.6;" : ""}`)}
      >
        {busy ? t("Төлбөр рүү шилжиж байна…") : t("Төлбөрөө төлөх")}
      </button>
      {error && <div style={sx("font:500 12px Roboto;color:#ef4444;")}>{error}</div>}
    </div>
  );
}
