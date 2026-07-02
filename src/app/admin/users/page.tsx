"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { fmt } from "@/lib/data";
import { getProfiles, setUserRole, type Profile } from "@/lib/admin";

const ROLES = [
  { value: "customer", label: "Хэрэглэгч" },
  { value: "admin", label: "Админ" },
];
const TIERS: Record<string, { label: string; color: string; min: number }> = {
  rookie: { label: "Rookie", color: "#9ca3af", min: 0 },
  bronze: { label: "Bronze", color: "#cd7f32", min: 10_000_000 },
  silver: { label: "Silver", color: "#c0c0c0", min: 30_000_000 },
  gold: { label: "Gold", color: "#d4af37", min: 60_000_000 },
  vip: { label: "VIP", color: "#E10613", min: 100_000_000 },
};
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={sx("font:700 18px Montserrat;color:#fff;")}>Бүртгэлтэй хэрэглэгчид ({list.length})</div>
        <div style={sx("font:400 11px 'JetBrains Mono';color:#8A8F98;")}>Түвшин: 10сая→Bronze · 30сая→Silver · 60сая→Gold · 100сая→VIP</div>
      </div>

      <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
        {list.map((u) => {
          const tier = TIERS[u.tier ?? "rookie"] ?? TIERS.rookie;
          return (
            <div key={u.id} style={sx("display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 18px;border-bottom:1px solid #1c1c1f;")}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 200 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/assets/tiers/${u.tier ?? "rookie"}.png`} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={sx("font:700 14px Montserrat;color:#fff;")}>{u.name || "—"}</span>
                    <span style={{ font: "700 10px Montserrat", letterSpacing: ".05em", padding: "3px 8px", borderRadius: 5, color: tier.color, background: `${tier.color}22`, border: `1px solid ${tier.color}55` }}>{tier.label}</span>
                  </div>
                  <div style={sx("font:400 12px 'JetBrains Mono';color:#8A8F98;margin-top:2px;")}>+976 {u.phone}{u.email ? ` · ${u.email}` : ""}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={sx("font:600 9px 'JetBrains Mono';letter-spacing:.1em;color:#8A8F98;")}>ХУДАЛДАН АВАЛТ</div>
                  <div style={sx("font:700 14px Montserrat;color:#fff;margin-top:2px;")}>{fmt(u.spent ?? 0)}</div>
                </div>
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
