"use client";

// Хадгалсан хаягаас сонгох — нэвтэрсэн хэрэглэгчид. Сонгоход form автоматаар бөглөгдөнө.

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { useI18n } from "@/lib/i18n";
import { useConfirm } from "@/lib/confirm";
import { countryByCode } from "@/lib/countries";
import { listAddresses, deleteAddress, type SavedAddress } from "@/lib/addresses";

interface Props {
  selectedId: string | null; // сонгосон хаягийн id, эсвэл null (шинэ)
  onPick: (addr: SavedAddress | null) => void; // null = шинэ хаяг оруулах
  reloadKey?: number; // хадгалсны дараа дахин ачаалах
}

function shortLabel(a: SavedAddress): string {
  return [a.city, a.district, a.addressLine1].filter(Boolean).join(", ");
}

export function SavedAddressSelector({ selectedId, onPick, reloadKey }: Props) {
  const { t } = useI18n();
  const confirm = useConfirm();
  const [list, setList] = useState<SavedAddress[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    listAddresses().then((l) => { setList(l); setLoaded(true); });
  }, [reloadKey]);

  if (loaded && list.length === 0) return null; // хадгалсан хаяг байхгүй бол хэсгийг нуух

  async function remove(a: SavedAddress) {
    const ok = await confirm({ title: t("Хаяг устгах уу?"), message: shortLabel(a), danger: true, confirmLabel: t("Устгах") });
    if (!ok) return;
    await deleteAddress(a.id);
    setList((l) => l.filter((x) => x.id !== a.id));
    if (selectedId === a.id) onPick(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={sx("font:700 11px 'JetBrains Mono';letter-spacing:.1em;color:#8A8F98;text-transform:uppercase;margin-bottom:2px;")}>{t("Хадгалсан хаягаас сонгох")}</div>
      {list.map((a) => {
        const active = a.id === selectedId;
        const c = countryByCode(a.countryCode);
        return (
          <div key={a.id}
            style={sx(`display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:11px;cursor:pointer;${active ? "background:rgba(225,6,19,.1);border:1.5px solid #E10613;" : "background:#0B0B0D;border:1.5px solid #262626;"}`)}
            onClick={() => onPick(a)}
            role="button" aria-pressed={active}
          >
            <span style={{ fontSize: 18 }} aria-hidden="true">{a.label?.toLowerCase().includes("office") || a.label?.includes("Ажил") ? "🏢" : "🏠"}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={sx("font:700 13px Montserrat;color:#fff;display:flex;align-items:center;gap:7px;")}>
                {a.label || t("Хаяг")}
                {a.isDefault && <span style={sx("font:700 9px 'JetBrains Mono';color:#22c55e;border:1px solid rgba(34,197,94,.4);border-radius:5px;padding:1px 5px;")}>{t("Үндсэн")}</span>}
                {c && <span style={{ fontSize: 13 }} aria-hidden="true">{c.flag}</span>}
              </div>
              <div style={sx("font:400 12px Roboto;color:#8A8F98;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px;")}>
                {a.recipientName ? `${a.recipientName} · ` : ""}{shortLabel(a)}
              </div>
            </div>
            <button type="button" onClick={(e) => { e.stopPropagation(); remove(a); }} aria-label={t("Устгах")}
              style={sx("background:none;border:none;color:#6b7280;font:600 14px Montserrat;cursor:pointer;padding:4px;")}>✕</button>
          </div>
        );
      })}
      <button type="button" onClick={() => onPick(null)}
        style={sx(`display:flex;align-items:center;gap:8px;padding:11px 12px;border-radius:11px;cursor:pointer;font:700 13px Montserrat;${selectedId === null ? "background:rgba(225,6,19,.1);border:1.5px solid #E10613;color:#fff;" : "background:#0B0B0D;border:1.5px dashed #333;color:#C8C8C8;"}`)}>
        <span aria-hidden="true">＋</span>{t("Шинэ хаяг оруулах")}
      </button>
    </div>
  );
}
