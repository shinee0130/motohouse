"use client";

import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/db/supabase";
import { useState, type FormEvent } from "react";

// Нүүрний newsletter имэйл талбар — placeholder-ыг орчуулахын тулд client wrapper.
export function NewsletterInput() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function subscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)) {
      setState("error");
      return;
    }
    setState("loading");
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: normalized });
    if (error && error.code !== "23505") {
      setState("error");
      return;
    }
    setEmail("");
    setState("success");
  }

  return (
    <form onSubmit={subscribe} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <input
        value={email}
        onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
        placeholder={t("И-мэйл хаяг")}
        className="mh-input"
        type="email"
        required
        aria-label={t("И-мэйл хаяг")}
        style={{ background: "#050505", border: "1px solid #262626", borderRadius: 10, padding: "14px 16px", color: "#fff", font: "400 14px Roboto", width: 240, outline: "none" }}
      />
      <button type="submit" disabled={state === "loading"} style={{ background: "#E10613", color: "#fff", font: "700 14px Montserrat", letterSpacing: ".06em", padding: "14px 26px", border: "none", borderRadius: 10, textTransform: "uppercase", cursor: state === "loading" ? "wait" : "pointer", opacity: state === "loading" ? .7 : 1 }}>
        {state === "loading" ? t("Илгээж байна…") : t("Мэдээ авах")}
      </button>
      {state === "success" && <span role="status" style={{ flexBasis: "100%", color: "#22c55e", font: "500 12px Roboto" }}>{t("Амжилттай бүртгэгдлээ.")}</span>}
      {state === "error" && <span role="alert" style={{ flexBasis: "100%", color: "#ef4444", font: "500 12px Roboto" }}>{t("И-мэйл хаягаа шалгаад дахин оролдоно уу.")}</span>}
    </form>
  );
}
