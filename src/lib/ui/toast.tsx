"use client";

// Богино мэдэгдэл (toast) — "амжилттай хадгаллаа", "зураг орлоо" гэх мэт.
// Яагаад alert биш вэ: 10 зураг оруулахад 10 цонх гарч ирвэл ажил удаашрах тул
// амжилтын мэдэгдлийг хаалтгүй, өөрөө алга болдог мөр болгов. Алдаа болон
// эргэлт буцалтгүй үйлдэл дээр хэвээр useAlert / useConfirm ашиглана.

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { sx } from "@/lib/ui/sx";

type Kind = "ok" | "err";
interface Item { id: number; text: string; kind: Kind }
type ToastFn = (text: string, kind?: Kind) => void;

const ToastContext = createContext<ToastFn | null>(null);

export function useToast() {
  const t = useContext(ToastContext);
  if (!t) throw new Error("useToast must be used inside ToastProvider");
  return t;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const seq = useRef(0);

  const toast = useCallback<ToastFn>((text, kind = "ok") => {
    const id = ++seq.current;
    setItems((prev) => [...prev, { id, text, kind }]);
    setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), 2600);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {items.length > 0 && (
        <div style={sx("position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none;padding:0 16px;max-width:100%;")}>
          {items.map((it) => (
            <div key={it.id}
              style={sx(
                "display:flex;align-items:center;gap:9px;border-radius:11px;padding:11px 16px;" +
                "font:600 13px Roboto;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.5);" +
                "animation:mhfade .22s both;max-width:100%;" +
                (it.kind === "ok"
                  ? "background:#12261a;border:1px solid #1f7a44;"
                  : "background:#2a0f11;border:1px solid #b3272f;"),
              )}
            >
              <span style={sx(`font:700 13px Montserrat;color:${it.kind === "ok" ? "#39d07f" : "#ff6b6b"};`)}>
                {it.kind === "ok" ? "✓" : "!"}
              </span>
              <span>{it.text}</span>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
