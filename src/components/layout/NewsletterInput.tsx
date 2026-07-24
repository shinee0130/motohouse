"use client";

import { sx } from "@/lib/ui/sx";
import { useI18n } from "@/lib/i18n";

// Нүүрний newsletter имэйл талбар — placeholder-ыг орчуулахын тулд client wrapper.
export function NewsletterInput() {
  const { t } = useI18n();
  return (
    <input
      placeholder={t("И-мэйл хаяг")}
      className="mh-input"
      type="email"
      style={sx("background:#050505;border:1px solid #262626;border-radius:10px;padding:14px 16px;color:#fff;font:400 14px Roboto;width:240px;outline:none;")}
    />
  );
}
