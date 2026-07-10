"use client";

// Бүтэцлэсэн хаягийн form — сонгосон улсаас хамааран талбар/label/required өөрчлөгдөнө.
// line1 талбарт AddressAutocomplete (provider байвал), бусад нь энгийн TextField.

import { sx } from "@/lib/sx";
import { useI18n } from "@/lib/i18n";
import { TextField } from "./fields";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { addressSchema, type AddrFieldKey, type AddressValue } from "@/lib/checkout";
import type { AddressDetails } from "@/lib/addressAutocomplete";

interface Props {
  countryCode: string;
  value: AddressValue;
  onChange: (v: AddressValue) => void;
  onCountry?: (code: string) => void; // autocomplete улс өөрчилвөл
  errors?: Partial<Record<AddrFieldKey, string>>; // MN түлхүүрүүд
}

export function AddressForm({ countryCode, value, onChange, onCountry, errors }: Props) {
  const { t } = useI18n();
  const schema = addressSchema(countryCode);
  const set = (k: AddrFieldKey, v: string) => onChange({ ...value, [k]: v });
  const err = (k: AddrFieldKey) => (errors?.[k] ? t(errors[k]!) : undefined);

  function onAutocomplete(d: AddressDetails) {
    onChange({ ...value, ...d.address });
    if (d.countryCode && onCountry) onCountry(d.countryCode);
  }

  return (
    <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;")}>
      {schema.map((f) => {
        const full = f.key === "line1" || f.key === "line2" || f.key === "note";
        return (
          <div key={f.key} style={full ? { gridColumn: "1 / -1" } : undefined}>
            {f.key === "line1" && f.autocomplete ? (
              <AddressAutocomplete
                label={t(f.label)}
                value={value.line1 || ""}
                onChange={(v) => set("line1", v)}
                onSelect={onAutocomplete}
                required={f.required}
                error={err("line1")}
                countryCode={countryCode}
              />
            ) : (
              <TextField
                label={t(f.label)}
                value={value[f.key] || ""}
                onChange={(v) => set(f.key, v)}
                required={f.required}
                error={err(f.key)}
                textarea={f.key === "note"}
                rows={2}
                inputMode={f.key === "postal" ? "numeric" : "text"}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
