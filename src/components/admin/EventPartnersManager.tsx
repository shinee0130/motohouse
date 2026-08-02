"use client";

import { useCallback, useEffect, useState } from "react";
import { sx } from "@/lib/ui/sx";
import { getEventPartners, type EventPartner } from "@/lib/db/queries";
import { addEventPartner, updateEventPartner, deleteEventPartner, uploadEventMedia } from "@/lib/db/admin";
import { useConfirm, useAlert } from "@/lib/ui/confirm";

// Түгээмэл үүргүүд — сонгоно, эсвэл өөрөө бичнэ.
const ROLES = ["Зохион байгуулагч", "Албан ёсны хамтрагч", "Дэмжигч хамтрагч", "Медиа хамтрагч"];

const INPUT = "background:#050505;border:1px solid #262626;border-radius:8px;padding:8px 11px;color:#fff;font:400 13px Roboto;outline:none;";

export function EventPartnersManager({ eventId }: { eventId: number }) {
  const [list, setList] = useState<EventPartner[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [busy, setBusy] = useState(false);
  const confirm = useConfirm();
  const alert = useAlert();

  const refresh = useCallback(async () => setList(await getEventPartners(eventId)), [eventId]);
  useEffect(() => { void refresh(); }, [refresh]);

  async function add() {
    const v = name.trim();
    if (!v) return;
    setBusy(true);
    try {
      await addEventPartner({ eventId, name: v, role: role.trim(), sort: list.length });
      setName("");
      await refresh();
    } catch (e) {
      await alert({ title: "Нэмэхэд алдаа гарлаа", message: e instanceof Error ? e.message : String(e), danger: true });
    } finally { setBusy(false); }
  }

  async function onLogo(p: EventPartner, file: File | null) {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadEventMedia(file);
      // Хуучин логог сольж байвал өмнөхийг нь цэвэрлэнэ
      const prev = p.logo;
      await updateEventPartner(p.id, { logo: url });
      if (prev) { try { const { deleteSiteFile } = await import("@/lib/db/admin"); await deleteSiteFile(prev); } catch { /* хуучин файл үлдсэн ч гол ажил бүтсэн */ } }
      await refresh();
    } catch (e) {
      await alert({ title: "Лого оруулахад алдаа гарлаа", message: e instanceof Error ? e.message : String(e), danger: true });
    } finally { setBusy(false); }
  }

  async function remove(p: EventPartner) {
    const ok = await confirm({ title: `“${p.name}”-г устгах уу?`, confirmLabel: "Устгах", danger: true });
    if (!ok) return;
    await deleteEventPartner(p.id, p.logo);
    await refresh();
  }

  return (
    <div style={sx("background:#0e0e10;border:1px solid #262626;border-radius:14px;padding:18px;margin-top:14px;")}>
      <div style={sx("font:700 14px Montserrat;color:#fff;")}>Хамтрагч байгууллагууд ({list.length})</div>
      <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:4px;line-height:1.6;")}>
        Уулзалтын хуудсан дээр үүргээр нь бүлэглэж харагдана. Лого оруулбал логогоор,
        эс бол нэрээр нь харуулна.
      </div>

      {list.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
          {list.map((p) => (
            <div key={p.id} style={sx("display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#050505;border:1px solid #262626;border-radius:10px;padding:10px 12px;")}>
              <div style={sx("width:64px;height:40px;flex:none;border-radius:6px;background:#111113;border:1px solid #262626;display:flex;align-items:center;justify-content:center;overflow:hidden;")}>
                {p.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }} />
                ) : (
                  <span style={sx("font:600 9px Roboto;color:#4b4b50;")}>лого алга</span>
                )}
              </div>
              <input defaultValue={p.name} placeholder="Нэр"
                onBlur={(e) => { if (e.target.value.trim() && e.target.value !== p.name) void updateEventPartner(p.id, { name: e.target.value.trim() }).then(refresh); }}
                style={sx(INPUT + "flex:1;min-width:140px;")} />
              <input defaultValue={p.role ?? ""} placeholder="Үүрэг" list="mh-partner-roles"
                onBlur={(e) => { if (e.target.value !== (p.role ?? "")) void updateEventPartner(p.id, { role: e.target.value.trim() || null }).then(refresh); }}
                style={sx(INPUT + "flex:1;min-width:140px;")} />
              <input defaultValue={p.url ?? ""} placeholder="Холбоос (сонгох)"
                onBlur={(e) => { if (e.target.value !== (p.url ?? "")) void updateEventPartner(p.id, { url: e.target.value.trim() || null }).then(refresh); }}
                style={sx(INPUT + "flex:1;min-width:140px;")} />
              <label style={sx(`cursor:pointer;background:#1a1a1d;border:1px solid #333;color:#fff;font:600 11px Montserrat;padding:8px 12px;border-radius:8px;white-space:nowrap;${busy ? "opacity:.6;" : ""}`)}>
                {p.logo ? "Лого солих" : "Лого"}
                <input type="file" accept="image/*" disabled={busy}
                  onChange={(e) => { void onLogo(p, e.target.files?.[0] ?? null); e.target.value = ""; }}
                  style={{ display: "none" }} />
              </label>
              <button type="button" onClick={() => remove(p)}
                style={sx("width:30px;height:30px;flex:none;border-radius:8px;background:none;border:1px solid #333;color:#ef4444;font:700 14px Montserrat;line-height:1;cursor:pointer;")}>×</button>
            </div>
          ))}
        </div>
      )}

      <datalist id="mh-partner-roles">
        {ROLES.map((r) => <option key={r} value={r} />)}
      </datalist>

      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        <input value={name} onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void add(); } }}
          placeholder="Байгууллагын нэр" style={sx(INPUT + "flex:1;min-width:180px;")} />
        <input value={role} onChange={(e) => setRole(e.target.value)} list="mh-partner-roles"
          placeholder="Үүрэг" style={sx(INPUT + "flex:1;min-width:160px;")} />
        <button type="button" onClick={add} disabled={busy || !name.trim()}
          style={sx(`background:#1a1a1d;border:1px solid #333;color:#fff;font:600 12px Montserrat;padding:9px 16px;border-radius:9px;cursor:pointer;white-space:nowrap;${busy || !name.trim() ? "opacity:.5;" : ""}`)}>
          + Нэмэх
        </button>
      </div>
    </div>
  );
}
