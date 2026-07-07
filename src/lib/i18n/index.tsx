"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { EN, tFor, type Lang } from "./dict";
import { sx } from "@/lib/sx";

const STORAGE_KEY = "motohouse.lang";
const COOKIE_KEY = "motohouse_lang";
const WINDOW_NAME_KEY = "motohouse_lang=";

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (text: string) => string;
  // DB контентын хэл сонголт: EN горимд en байвал түүнийг, үгүй бол mn (fallback)
  loc: <T>(mn: T, en?: T | null) => T;
};

function localize<T>(mn: T, en: T | null | undefined, lang: Lang): T {
  if (lang !== "en" || en == null) return mn;
  if (typeof en === "string") return (en.trim() ? en : mn) as T;
  if (Array.isArray(en)) return (en.length ? en : mn) as T;
  return en;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readInitialLang(): Lang {
  if (typeof window === "undefined") return "mn";
  if (document.cookie.split("; ").some((entry) => entry === `${COOKIE_KEY}=en`)) return "en";
  if (window.name.split("|").some((entry) => entry === `${WINDOW_NAME_KEY}en`)) return "en";
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "mn";
  } catch {
    return "mn";
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("mn");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setLangState(readInitialLang());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = lang;
    document.cookie = `${COOKIE_KEY}=${lang};path=/;max-age=31536000;samesite=lax`;
    const rest = window.name.split("|").filter((entry) => !entry.startsWith(WINDOW_NAME_KEY));
    window.name = [...rest, `${WINDOW_NAME_KEY}${lang}`].filter(Boolean).join("|");
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Some embedded browser contexts disable localStorage; the cookie keeps language persistence.
    }
  }, [lang, ready]);

  const value = useMemo<I18nContextValue>(() => {
    const setLang = (next: Lang) => setLangState(next);
    return {
      lang,
      setLang,
      toggleLang: () => setLangState((current) => (current === "mn" ? "en" : "mn")),
      t: tFor(lang),
      loc: <T,>(mn: T, en?: T | null) => localize(mn, en, lang),
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export function T({ children }: { children: string | string[] }) {
  const { t } = useI18n();
  return <>{t(Array.isArray(children) ? children.join("") : children)}</>;
}

// Server component дотор DB контентыг хэлээр сонгож харуулах (EN байвал en, үгүй бол mn)
export function Loc({ mn, en }: { mn: string; en?: string | null }) {
  const { loc } = useI18n();
  return <>{loc(mn, en)}</>;
}

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();
  const options: Lang[] = ["mn", "en"];

  return (
    <div
      aria-label={t("Хэл")}
      style={sx(
        "display:inline-flex;align-items:center;border:1px solid #262626;background:#0B0B0D;border-radius:10px;padding:3px;gap:2px;",
      )}
    >
      {options.map((option) => {
        const active = lang === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLang(option)}
            aria-pressed={active}
            title={option === "mn" ? t("Монгол") : t("Англи")}
            style={sx(
              "border:none;border-radius:7px;cursor:pointer;text-transform:uppercase;font:800 11px Montserrat;letter-spacing:.04em;height:32px;min-width:38px;padding:0 10px;" +
                (active ? "background:#E10613;color:#fff;" : "background:transparent;color:#8A8F98;") +
                (compact ? "height:30px;min-width:34px;padding:0 8px;" : ""),
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export { EN, tFor };
export type { Lang };
