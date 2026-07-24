"use client";

// MOTO HOUSE загвартай баталгаажуулах / мэдэгдэх цонх (browser confirm/alert-ийн оронд).
// useConfirm() → async confirm(opts): Promise<boolean>; useAlert() → async alert(opts): Promise<void>.

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { sx } from "@/lib/ui/sx";
import { useI18n } from "@/lib/i18n";

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean; // устгах гэх мэт эргэлт буцалтгүй үйлдэл
}

export interface AlertOptions {
  title: string;
  message?: string;
  okLabel?: string;
  danger?: boolean; // алдаа/анхааруулга бол улаан
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;
type AlertFn = (opts: AlertOptions) => Promise<void>;
const ConfirmContext = createContext<ConfirmFn | null>(null);
const AlertContext = createContext<AlertFn | null>(null);

export function useConfirm() {
  const c = useContext(ConfirmContext);
  if (!c) throw new Error("useConfirm must be used inside ConfirmProvider");
  return c;
}

export function useAlert() {
  const c = useContext(AlertContext);
  if (!c) throw new Error("useAlert must be used inside ConfirmProvider");
  return c;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);
  const [alertOpts, setAlertOpts] = useState<AlertOptions | null>(null);
  const alertResolver = useRef<(() => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((o) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => { resolver.current = resolve; });
  }, []);

  const done = useCallback((v: boolean) => {
    resolver.current?.(v);
    resolver.current = null;
    setOpts(null);
  }, []);

  const alert = useCallback<AlertFn>((o) => {
    setAlertOpts(o);
    return new Promise<void>((resolve) => { alertResolver.current = resolve; });
  }, []);

  const alertDone = useCallback(() => {
    alertResolver.current?.();
    alertResolver.current = null;
    setAlertOpts(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      <AlertContext.Provider value={alert}>
        {children}
        {opts && <ConfirmModal opts={opts} onDone={done} />}
        {alertOpts && <AlertModal opts={alertOpts} onClose={alertDone} />}
      </AlertContext.Provider>
    </ConfirmContext.Provider>
  );
}

function ConfirmModal({ opts, onDone }: { opts: ConfirmOptions; onDone: (v: boolean) => void }) {
  const { t } = useI18n();
  const danger = opts.danger ?? false;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDone(false);
      if (e.key === "Enter") onDone(true);
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [onDone]);

  const accent = danger ? "#ef4444" : "#E10613";

  return (
    <div
      onClick={() => onDone(false)}
      style={{
        position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, background: "rgba(4,4,5,.66)", backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)",
        animation: "mhfade .2s both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={sx(`position:relative;width:100%;max-width:400px;background:#0c0c0e;border:1px solid #262626;border-radius:18px;padding:26px 24px 22px;box-shadow:0 24px 70px rgba(0,0,0,.6);`)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${accent}1f`, border: `1px solid ${accent}55` }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4" /><path d="M12 17h.01" />
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
          </div>
          <h2 style={sx("font:800 18px Montserrat;color:#fff;line-height:1.25;")}>{opts.title}</h2>
        </div>

        {opts.message && (
          <p style={sx("font:400 14px/1.6 Roboto;color:#A3A3A3;white-space:pre-line;margin-bottom:20px;")}>{opts.message}</p>
        )}
        {!opts.message && <div style={{ height: 8 }} />}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={() => onDone(false)}
            style={sx("background:none;border:1px solid #333;color:#C8C8C8;font:600 13px Montserrat;padding:11px 18px;border-radius:10px;cursor:pointer;")}
          >
            {opts.cancelLabel || t("Болих")}
          </button>
          <button
            autoFocus
            onClick={() => onDone(true)}
            style={sx(`background:${accent};color:#fff;font:700 13px Montserrat;padding:11px 20px;border:none;border-radius:10px;cursor:pointer;`)}
          >
            {opts.confirmLabel || t("Тийм")}
          </button>
        </div>
      </div>
    </div>
  );
}

function AlertModal({ opts, onClose }: { opts: AlertOptions; onClose: () => void }) {
  const { t } = useI18n();
  const danger = opts.danger ?? false;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" || e.key === "Enter") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  const accent = danger ? "#ef4444" : "#E10613";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, background: "rgba(4,4,5,.66)", backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)",
        animation: "mhfade .2s both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={sx(`position:relative;width:100%;max-width:400px;background:#0c0c0e;border:1px solid #262626;border-radius:18px;padding:26px 24px 22px;box-shadow:0 24px 70px rgba(0,0,0,.6);`)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${accent}1f`, border: `1px solid ${accent}55` }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4" /><path d="M12 17h.01" />
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
          </div>
          <h2 style={sx("font:800 18px Montserrat;color:#fff;line-height:1.25;")}>{opts.title}</h2>
        </div>

        {opts.message && (
          <p style={sx("font:400 14px/1.6 Roboto;color:#A3A3A3;white-space:pre-line;margin-bottom:20px;word-break:break-word;")}>{opts.message}</p>
        )}
        {!opts.message && <div style={{ height: 8 }} />}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            autoFocus
            onClick={onClose}
            style={sx(`background:${accent};color:#fff;font:700 13px Montserrat;padding:11px 22px;border:none;border-radius:10px;cursor:pointer;`)}
          >
            {opts.okLabel || "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}
