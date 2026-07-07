"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { sx } from "@/lib/sx";
import { formatPrice, FALLBACK_RATES, type Currency, type Rates } from "@/lib/fx";

const STORAGE_KEY = "motohouse.ccy";
const COOKIE_KEY = "motohouse_ccy";

const CCY_ORDER: Currency[] = ["MNT", "USD", "EUR"];
const CCY_LABEL: Record<Currency, string> = { MNT: "₮", USD: "$", EUR: "€" };

type CurrencyContextValue = {
  ccy: Currency;
  setCcy: (c: Currency) => void;
  rates: Rates;
  price: (mnt: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readInitialCcy(): Currency {
  if (typeof window === "undefined") return "MNT";
  const fromCookie = document.cookie.split("; ").find((e) => e.startsWith(`${COOKIE_KEY}=`))?.split("=")[1];
  if (fromCookie && CCY_ORDER.includes(fromCookie as Currency)) return fromCookie as Currency;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v && CCY_ORDER.includes(v as Currency)) return v as Currency;
  } catch {
    // localStorage disabled — cookie/default fallback
  }
  return "MNT";
}

export function CurrencyProvider({ rates, children }: { rates?: Rates; children: ReactNode }) {
  const [ccy, setCcyState] = useState<Currency>("MNT");
  const [ready, setReady] = useState(false);
  const activeRates = rates ?? FALLBACK_RATES;

  useEffect(() => {
    const id = window.setTimeout(() => {
      setCcyState(readInitialCcy());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.cookie = `${COOKIE_KEY}=${ccy};path=/;max-age=31536000;samesite=lax`;
    try {
      window.localStorage.setItem(STORAGE_KEY, ccy);
    } catch {
      // cookie нь хадгална
    }
  }, [ccy, ready]);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      ccy,
      setCcy: setCcyState,
      rates: activeRates,
      price: (mnt: number) => formatPrice(mnt, ccy, activeRates),
    }),
    [ccy, activeRates],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}

// ₮ (MNT) утгыг сонгосон валютаар харуулах — server component дотор ч ажиллана.
export function Price({ amount }: { amount: number }) {
  const { price } = useCurrency();
  return <>{price(amount)}</>;
}

export function CurrencySwitch({ compact = false }: { compact?: boolean }) {
  const { ccy, setCcy } = useCurrency();
  return (
    <div
      aria-label="Currency"
      style={sx("display:inline-flex;align-items:center;border:1px solid #262626;background:#0B0B0D;border-radius:10px;padding:3px;gap:2px;")}
    >
      {CCY_ORDER.map((option) => {
        const active = ccy === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setCcy(option)}
            aria-pressed={active}
            style={sx(
              "border:none;border-radius:7px;cursor:pointer;font:800 13px Montserrat;height:32px;min-width:34px;padding:0 8px;" +
                (active ? "background:#E10613;color:#fff;" : "background:transparent;color:#8A8F98;") +
                (compact ? "height:30px;min-width:30px;padding:0 7px;" : ""),
            )}
          >
            {CCY_LABEL[option]}
          </button>
        );
      })}
    </div>
  );
}
