"use client";

import { useEffect, useMemo, useState } from "react";
import { sx } from "@/lib/sx";
import { Select } from "@/components/Select";
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
const PAGE_SIZE = 8;

export default function AdminUsers() {
  const [list, setList] = useState<Profile[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getProfiles().then((p) => { setList(p); setLoaded(true); });
  }, []);

  async function changeRole(id: string, role: string) {
    const u = list.find((x) => x.id === id);
    if (!u || u.role === role) return;
    const name = u.name || "энэ хэрэглэгч";
    // Админ болгох / админ эрхийг хасах бүрд баталгаажуулна
    if (role === "admin") {
      if (!confirm(`${name}-г АДМИН болгох уу?\n\nАдмин нь бүх бараа, захиалга, хэрэглэгчийг засах, устгах эрхтэй болно.`)) return;
    } else if (u.role === "admin") {
      if (!confirm(`${name}-ийн АДМИН эрхийг хасах уу?`)) return;
    }
    setList((l) => l.map((x) => (x.id === id ? { ...x, role } : x)));
    await setUserRole(id, role);
  }

  // хайлт — нэр / имэйл / утас-аар
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((u) =>
      `${u.name ?? ""} ${u.email ?? ""} ${u.phone ?? ""}`.toLowerCase().includes(s),
    );
  }, [list, q]);

  const admins = useMemo(() => filtered.filter((u) => u.role === "admin"), [filtered]);
  const customers = useMemo(() => filtered.filter((u) => u.role !== "admin"), [filtered]);

  // хайлт өөрчлөгдвөл эхний хуудас руу
  useEffect(() => { setPage(1); }, [q]);

  const totalPages = Math.max(1, Math.ceil(customers.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pagedCustomers = customers.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={sx("font:700 18px Montserrat;color:#fff;")}>Бүртгэлтэй хэрэглэгчид ({list.length})</div>
        <div style={sx("font:400 11px 'JetBrains Mono';color:#8A8F98;")}>Түвшин: 10сая→Bronze · 30сая→Silver · 60сая→Gold · 100сая→VIP</div>
      </div>

      {/* хайлт */}
      <div style={{ position: "relative", maxWidth: 420 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Нэр, имэйл эсвэл утсаар хайх…"
          style={sx("background:#050505;border:1px solid #262626;border-radius:10px;padding:12px 38px 12px 14px;color:#fff;font:400 14px Roboto;outline:none;width:100%;")}
        />
        {q && (
          <button onClick={() => setQ("")} aria-label="Цэвэрлэх"
            style={sx("position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;color:#8A8F98;font:600 16px Montserrat;cursor:pointer;padding:4px 6px;")}>✕</button>
        )}
      </div>

      {!loaded ? (
        <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Ачаалж байна…</div>
      ) : list.length === 0 ? (
        <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>
          Бүртгэлтэй хэрэглэгч алга. (Шинэ хэрэглэгч бүртгүүлэхэд энд харагдана.)
        </div>
      ) : filtered.length === 0 ? (
        <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>
          “{q}” — тохирох хэрэглэгч олдсонгүй.
        </div>
      ) : (
        <>
          {/* ==== Админ ==== */}
          {admins.length > 0 && (
            <div>
              <div style={sx("font:700 12px 'JetBrains Mono';letter-spacing:.14em;color:#E10613;text-transform:uppercase;margin-bottom:10px;")}>
                Админ ({admins.length})
              </div>
              <div style={sx("background:#111113;border:1px solid #2a1416;border-radius:14px;overflow:hidden;")}>
                {admins.map((u) => <UserRow key={u.id} u={u} onRole={changeRole} />)}
              </div>
            </div>
          )}

          {/* ==== Хэрэглэгчид ==== */}
          <div>
            <div style={sx("font:700 12px 'JetBrains Mono';letter-spacing:.14em;color:#8A8F98;text-transform:uppercase;margin-bottom:10px;")}>
              Хэрэглэгч ({customers.length})
            </div>
            <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
              {pagedCustomers.map((u) => <UserRow key={u.id} u={u} onRole={changeRole} />)}
              {customers.length === 0 && (
                <div style={sx("padding:24px;text-align:center;font:400 13px Roboto;color:#8A8F98;")}>Энгийн хэрэглэгч алга.</div>
              )}
            </div>

            {/* хуудаслалт */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 14 }}>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageSafe <= 1}
                  style={sx(`background:#1a1a1d;border:1px solid #333;color:#fff;font:600 13px Montserrat;padding:9px 16px;border-radius:9px;cursor:pointer;${pageSafe <= 1 ? "opacity:.4;cursor:not-allowed;" : ""}`)}>
                  ← Өмнөх
                </button>
                <span style={sx("font:600 13px 'JetBrains Mono';color:#A3A3A3;")}>{pageSafe} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={pageSafe >= totalPages}
                  style={sx(`background:#1a1a1d;border:1px solid #333;color:#fff;font:600 13px Montserrat;padding:9px 16px;border-radius:9px;cursor:pointer;${pageSafe >= totalPages ? "opacity:.4;cursor:not-allowed;" : ""}`)}>
                  Дараах →
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function UserRow({ u, onRole }: { u: Profile; onRole: (id: string, role: string) => void }) {
  // Админ хэрэглэгч бүр автоматаар VIP түвшинтэй
  const effTier = u.role === "admin" ? "vip" : (u.tier ?? "rookie");
  const tier = TIERS[effTier] ?? TIERS.rookie;
  return (
    <div style={sx("display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 18px;border-bottom:1px solid #1c1c1f;")}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 200 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/assets/tiers/${effTier}.png`} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
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
        <Select value={u.role} onChange={(v) => onRole(u.id, v)} full bg="#050505" options={ROLES} />
      </div>
    </div>
  );
}
