import type { ReactNode } from "react";
import Link from "next/link";
import { sx } from "@/lib/sx";
import { Brand } from "./Brand";

// Нэвтрэх / бүртгүүлэх хуудасны нийтлэг хүрээ — төвлөрсөн карт.
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div
      style={sx(
        "min-height:calc(100vh - 72px);display:flex;align-items:center;justify-content:center;padding:clamp(24px,5vw,56px) clamp(20px,4vw,40px);",
      )}
    >
      <div
        style={sx(
          "width:100%;max-width:440px;background:#0e0e10;border:1px solid #262626;border-radius:20px;padding:clamp(28px,4vw,40px);animation:mhfade .4s both;",
        )}
      >
        <Link href="/" style={{ display: "inline-flex" }}>
          <Brand height={30} />
        </Link>
        <h1 style={sx("font:800 26px Montserrat;color:#fff;text-transform:uppercase;margin-top:22px;")}>{title}</h1>
        <p style={sx("font:400 14px Roboto;color:#8A8F98;margin-top:6px;")}>{subtitle}</p>
        <div style={{ marginTop: 24 }}>{children}</div>
        <div style={sx("font:400 14px Roboto;color:#A3A3A3;text-align:center;margin-top:22px;")}>{footer}</div>
      </div>
    </div>
  );
}

// Утасны дугаарын талбар (+976 угтвартай).
export const AUTH_INPUT =
  "background:#050505;border:1px solid #262626;border-radius:10px;padding:14px 15px;color:#fff;font:400 15px Roboto;outline:none;width:100%;";
export const AUTH_LABEL = "font:600 12px Montserrat;letter-spacing:.04em;color:#C8C8C8;margin-bottom:8px;display:block;";
export const AUTH_BTN =
  "width:100%;background:#E10613;color:#fff;font:700 15px Montserrat;letter-spacing:.05em;padding:16px;border:none;border-radius:11px;text-transform:uppercase;cursor:pointer;margin-top:8px;";
