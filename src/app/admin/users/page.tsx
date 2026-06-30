"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { getProfiles, type Profile } from "@/lib/admin";

export default function AdminUsers() {
  const [list, setList] = useState<Profile[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getProfiles().then((p) => { setList(p); setLoaded(true); });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={sx("font:700 18px Montserrat;color:#fff;")}>Бүртгэлтэй хэрэглэгчид ({list.length})</div>

      <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
        {list.map((u) => (
          <div key={u.phone} style={sx("display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 18px;border-bottom:1px solid #1c1c1f;")}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={sx("width:38px;height:38px;border-radius:50%;background:#E10613;color:#fff;display:flex;align-items:center;justify-content:center;font:800 15px Montserrat;flex-shrink:0;")}>
                {(u.name || u.phone || "U").trim().charAt(0).toUpperCase()}
              </span>
              <div>
                <div style={sx("font:700 14px Montserrat;color:#fff;")}>{u.name || "—"}</div>
                <div style={sx("font:400 12px 'JetBrains Mono';color:#8A8F98;margin-top:2px;")}>+976 {u.phone}{u.email ? ` · ${u.email}` : ""}</div>
              </div>
            </div>
            <span style={sx(`font:700 11px Montserrat;padding:5px 11px;border-radius:6px;${u.role === "admin" ? "color:#fff;background:#E10613;" : "color:#A3A3A3;background:#1a1a1d;border:1px solid #333;"}`)}>
              {u.role === "admin" ? "ADMIN" : "Хэрэглэгч"}
            </span>
          </div>
        ))}
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
