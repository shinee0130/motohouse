"use client";

// Олон улсын утасны талбар — сонгосон улсын утасны код (+976 г.м) автоматаар таарна.
// E.164 форматад хадгална (+<code><national>). Улс солиход үндэсний дугаарыг хадгална.

import { useEffect, useId, useRef, useState } from "react";
import { sx } from "@/lib/sx";
import { useI18n } from "@/lib/i18n";
import { countryByCode } from "@/lib/countries";
import { callingCodeOf, digitsOnly, splitE164, toE164 } from "@/lib/checkout";

interface Props {
  value: string;          // E.164 (+976...)
  onChange: (e164: string) => void;
  countryCode: string;    // хүргэлтийн улсаас
  label: string;
  required?: boolean;
  error?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}

export function InternationalPhoneInput({ value, onChange, countryCode, label, required, error, inputRef }: Props) {
  const { t } = useI18n();
  const id = useId();
  const errId = `${id}-err`;
  const calling = callingCodeOf(countryCode) || "";
  const country = countryByCode(countryCode);
  const [national, setNational] = useState(() => splitE164(value, calling).national);
  const prevCountry = useRef(countryCode);

  // Гаднаас value өөрчлөгдвөл (autofill / saved address) үндэсний дугаарыг дахин задална.
  useEffect(() => {
    setNational(splitE164(value, calling).national);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Улс (утасны код) солигдвол үндэсний дугаарыг хадгалаад E.164-г шинэчилнэ.
  useEffect(() => {
    if (prevCountry.current !== countryCode) {
      prevCountry.current = countryCode;
      onChange(toE164(calling, national));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  function handle(v: string) {
    const nat = digitsOnly(v);
    setNational(nat);
    onChange(toE164(calling, nat));
  }

  const border = error ? "border-color:#ef4444;" : "";
  return (
    <div>
      <label htmlFor={id} style={sx("font:600 12px Montserrat;letter-spacing:.02em;color:#C8C8C8;margin-bottom:6px;display:flex;align-items:center;gap:4px;")}>
        {label}{required && <span style={{ color: "#E10613" }} aria-hidden="true">*</span>}
      </label>
      <div style={sx(`display:flex;align-items:stretch;background:#050505;border:1px solid #262626;border-radius:10px;overflow:hidden;${border}`)}>
        <span style={sx("display:flex;align-items:center;gap:6px;padding:0 11px;background:#0d0d0f;border-right:1px solid #262626;font:600 14px 'JetBrains Mono';color:#C8C8C8;white-space:nowrap;")}>
          <span style={{ fontSize: 17 }} aria-hidden="true">{country?.flag}</span>+{calling}
        </span>
        <input
          id={id}
          ref={inputRef}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={national}
          onChange={(e) => handle(e.target.value)}
          placeholder={t("Утасны дугаар")}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          style={sx("flex:1;min-height:44px;background:transparent;border:none;padding:12px 14px;color:#fff;font:400 15px Roboto;outline:none;")}
        />
      </div>
      {error && <div id={errId} role="alert" style={sx("font:500 12px Roboto;color:#ef4444;margin-top:5px;")}>{error}</div>}
    </div>
  );
}
