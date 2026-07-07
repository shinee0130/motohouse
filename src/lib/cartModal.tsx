"use client";

// Сагсны modal — login/register modal-тай ижил зарчмаар (blur backdrop, Esc/гадуур дарж хаах).

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { sx } from "@/lib/sx";
import { useI18n } from "@/lib/i18n";
import { Brand } from "@/components/Brand";
import { CartBody } from "@/components/CartBody";

type Ctx = { open: () => void; close: () => void };
const CartModalContext = createContext<Ctx | null>(null);

export function useCartModal() {
  const c = useContext(CartModalContext);
  if (!c) throw new Error("useCartModal must be used inside CartModalProvider");
  return c;
}

export function CartModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value: Ctx = { open: () => setOpen(true), close: () => setOpen(false) };
  return (
    <CartModalContext.Provider value={value}>
      {children}
      {open && <CartModal close={() => setOpen(false)} />}
    </CartModalContext.Provider>
  );
}

function CartModal({ close }: { close: () => void }) {
  const { t } = useI18n();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onEsc);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onEsc); };
  }, [close]);

  return (
    <div
      onClick={close}
      style={{
        position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: 20, background: "rgba(4,4,5,.66)", backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)",
        animation: "mhfade .25s both", overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={sx("position:relative;width:100%;max-width:720px;background:#0c0c0e;border:1px solid #262626;border-radius:20px;padding:clamp(20px,4vw,32px);box-shadow:0 24px 70px rgba(0,0,0,.6);margin:auto;")}
      >
        <button onClick={close} aria-label={t("Хаах")}
          style={sx("position:absolute;top:16px;right:16px;background:none;border:1px solid #262626;border-radius:8px;width:34px;height:34px;color:#8A8F98;font:600 15px Montserrat;cursor:pointer;z-index:1;")}>✕</button>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, paddingRight: 44 }}>
          <Brand height={34} />
          <div>
            <div style={sx("font:500 11px 'JetBrains Mono';letter-spacing:.2em;color:#E10613;")}>CART</div>
            <h2 style={sx("font:800 22px Montserrat;color:#fff;text-transform:uppercase;line-height:1.1;")}>{t("Миний сагс")}</h2>
          </div>
        </div>

        <CartBody onNavigate={close} />
      </div>
    </div>
  );
}
