"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { getProfiles, setUserRole, setUserTier, type Profile } from "@/lib/admin";

const ROLES = [
  { value: "customer", label: "Хэрэглэгч" },
  { value: "admin", label: "Админ" },
];
const TIERS = [
  { value: "bronze", label: "Bronze", color: "#cd7f32" },
  { value: "silver", label: "Silver", color: "#c0c0c0" },
  { value: "gold", label: "Gold", color: "#d4af37" },
  { value: "vip", label: "VIP", color: "#E10613" },
];
const SELECT = "background:#050505;border:1px solid #262626;border-radius:8px;padding:8px 10px;color:#fff;font:500 12px Roboto;cursor:pointer;outline:none;";

export default function AdminUsers() {
  const [list, setList] = useState<Profile[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getProfiles().then((p) => { setList(p); setLoaded(true); });
  }, []);

  async function changeRole(id: string, role: string) {
    setList((l) => l.map((u) => (u.id === id ? { ...u, role } : u)));
    await setUserRole(id, role);
  }
  async function changeTier(id: string, tier: string) {
    setList((l) => l.map((u) => (u.id === id ? { ...u, tier } : u)));
    await setUserTier(id, tier);
  }

  const tierOf = (t?: string) => TIERS.find((x) => x.value === t) ?? TIERS[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={sx("font:700 18px Montserrat;color:#fff;")}>Бүртгэлтэй хэрэглэгчид ({list.length})</div>

      <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
        {list.map((u) => {
          const tier = tierOf(u.tier);
          return (
            <div key={u.id} style={sx("display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 18px;border-bottom:1px solid #1c1c1f;")}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 200 }}>
                <span style={sx("width:38px;height:38px;border-radius:50%;background:#E10613;color:#fff;display:flex;align-items:center;justify-content:center;font:800 15px Montserrat;flex-shrink:0;")}>
                  {(u.name || u.phone || "U").trim().charAt(0).toUpperCase()}
                </span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={sx("font:700 14px Montserrat;color:#fff;")}>{u.name || "—"}</span>
                    <span style={{ font: "700 10px Montserrat", letterSpacing: ".05em", padding: "3px 8px", borderRadius: 5, color: tier.color, background: `${tier.color}22`, border: `1px solid ${tier.color}55` }}>{tier.label}</span>
                  </div>
                  <div style={sx("font:400 12px 'JetBrains Mono';color:#8A8F98;margin-top:2px;")}>+976 {u.phone}{u.email ? ` · ${u.email}` : ""}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <label style={sx("font:600 11px 'JetBrains Mono';color:#8A8F98;")}>Түвшин</label>
                <select value={u.tier ?? "bronze"} onChange={(e) => changeTier(u.id, e.target.value)} style={sx(SELECT)}>
                  {TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <label style={sx("font:600 11px 'JetBrains Mono';color:#8A8F98;margin-left:6px;")}>Эрх</label>
                <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)} style={sx(SELECT)}>
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
          );
        })}
        {loaded && list.length === 0 && (
          <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>
            Бүртгэлтэй хэрэглэгч алга. (Шинэ хэрэглэгч /register-ээр бүртгүүлэхэд энд харагдана.)
          </div>
        )}
        {!loaded && <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Ачаалж байна…</div>}
      </div>
    </div>
  );
}
