"use client";

// Хаягийн 1-р мөр — provider байвал autocomplete санал, байхгүй бол энгийн input.
// Санал сонговол боломжтой талбаруудыг (line1/city/state/postal/country) буцаана.

import { useEffect, useRef, useState } from "react";
import { sx } from "@/lib/sx";
import { useI18n } from "@/lib/i18n";
import { TextField } from "./fields";
import { getAddressProvider, type AddressDetails, type AddressSuggestion } from "@/lib/addressAutocomplete";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSelect: (d: AddressDetails) => void;
  required?: boolean;
  error?: string;
  countryCode?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}

export function AddressAutocomplete({ label, value, onChange, onSelect, required, error, countryCode, inputRef }: Props) {
  const { t } = useI18n();
  const provider = getAddressProvider();
  const [sugs, setSugs] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Provider байхгүй бол энгийн талбар (autocomplete нь зөвхөн нэмэлт сайжруулалт).
  useEffect(() => {
    if (!provider) return;
    if (timer.current) clearTimeout(timer.current);
    if (!value || value.trim().length < 3) { setSugs([]); return; }
    timer.current = setTimeout(async () => {
      try { setSugs(await provider.search(value, countryCode)); setOpen(true); } catch { setSugs([]); }
    }, 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [value, countryCode, provider]);

  if (!provider) {
    return <TextField label={label} value={value} onChange={onChange} required={required} error={error} autoComplete="address-line1" inputRef={inputRef} />;
  }

  async function choose(s: AddressSuggestion) {
    setOpen(false); setSugs([]);
    const d = await provider!.details(s.id);
    if (d) onSelect(d);
  }

  return (
    <div style={{ position: "relative" }}>
      <TextField label={label} value={value} onChange={onChange} required={required} error={error} autoComplete="off" inputRef={inputRef} />
      {open && sugs.length > 0 && (
        <div role="listbox" style={sx("position:absolute;top:100%;left:0;right:0;z-index:5;margin-top:4px;background:#141416;border:1px solid #2f2f33;border-radius:10px;padding:5px;max-height:220px;overflow-y:auto;box-shadow:0 14px 40px rgba(0,0,0,.5);")}>
          {sugs.map((s) => (
            <div key={s.id} role="option" aria-selected={false} onClick={() => choose(s)}
              style={sx("padding:10px 11px;border-radius:8px;cursor:pointer;font:500 13px Roboto;color:#D4D4D4;")}>
              {s.label}
            </div>
          ))}
          <div style={sx("padding:6px 11px;font:500 10px 'JetBrains Mono';color:#6b7280;")}>{t("Санал болгосон хаягаас сонгоно уу")}</div>
        </div>
      )}
    </div>
  );
}
