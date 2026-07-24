"use client";

import { useEffect, useMemo, useState } from "react";
import { sx } from "@/lib/ui/sx";
import { Select } from "@/components/ui/Select";
import { getOrderRequests, type OrderRequest } from "@/lib/db/queries";
import { updateOrderRequest } from "@/lib/db/admin";

const STATUSES = ["Шинэ", "Хянаж буй", "Үнэ өгсөн", "Хаагдсан"];
type Filter = "all" | "open" | "quoted";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Бүгд" },
  { key: "open", label: "Хүлээгдэж буй" },
  { key: "quoted", label: "Үнэ өгсөн" },
];

function badge(status: string): string {
  const b = "font:700 11px Montserrat;letter-spacing:.03em;padding:6px 12px;border-radius:999px;";
  if (status === "Үнэ өгсөн") return b + "color:#22c55e;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.35);";
  if (status === "Хянаж буй") return b + "color:#fff;background:#E10613;";
  if (status === "Хаагдсан") return b + "color:#8A8F98;background:#1a1a1d;border:1px solid #333;";
  return b + "color:#f59e0b;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.35);";
}

export default function AdminRequests() {
  const [list, setList] = useState<OrderRequest[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  async function refresh() { setList(await getOrderRequests()); setLoaded(true); }
  useEffect(() => { refresh(); }, []);

  async function changeStatus(id: string, status: string) {
    setList((l) => l.map((r) => (r.id === id ? { ...r, status } : r)));
    await updateOrderRequest(id, { status });
  }
  async function saveQuote(id: string) {
    const quote = (drafts[id] ?? "").trim();
    if (!quote) return;
    setSaving(id);
    try {
      await updateOrderRequest(id, { quote, status: "Үнэ өгсөн" });
      setList((l) => l.map((r) => (r.id === id ? { ...r, quote, status: "Үнэ өгсөн" } : r)));
      setDrafts((d) => { const n = { ...d }; delete n[id]; return n; });
    } finally { setSaving(null); }
  }

  const shown = useMemo(() => {
    if (filter === "open") return list.filter((r) => r.status !== "Үнэ өгсөн" && r.status !== "Хаагдсан");
    if (filter === "quoted") return list.filter((r) => r.status === "Үнэ өгсөн");
    return list;
  }, [list, filter]);

  const openCount = list.filter((r) => r.status !== "Үнэ өгсөн" && r.status !== "Хаагдсан").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={sx("font:700 18px Montserrat;color:#fff;")}>Захиалгын хүсэлт ({list.length})</div>
        <div style={sx("font:600 12px Montserrat;color:#f59e0b;")}>Хүлээгдэж буй: {openCount}</div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FILTERS.map((ff) => (
          <button key={ff.key} onClick={() => setFilter(ff.key)}
            style={sx(`cursor:pointer;font:700 12px Montserrat;padding:8px 16px;border-radius:999px;${filter === ff.key ? "background:#E10613;border:1px solid #E10613;color:#fff;" : "background:#111113;border:1px solid #333;color:#C8C8C8;"}`)}>
            {ff.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {shown.map((r) => (
          <div key={r.id} style={sx("background:#111113;border:1px solid #262626;border-radius:14px;padding:16px 18px;")}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
              {r.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <a href={r.image} target="_blank" rel="noreferrer">
                  <img src={r.image} alt="" style={sx("width:80px;height:80px;object-fit:cover;border-radius:10px;border:1px solid #262626;flex-shrink:0;")} />
                </a>
              )}
              <div style={{ minWidth: 220, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={sx("font:700 10px 'JetBrains Mono';letter-spacing:.1em;color:#E10613;")}>{r.category}</span>
                  <span style={sx(badge(r.status))}>{r.status}</span>
                </div>
                <div style={sx("font:500 14px/1.55 Roboto;color:#e8e8e8;margin-top:8px;white-space:pre-wrap;")}>{r.detail}</div>
                <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:8px;")}>
                  {r.name || "Зочин"}{r.phone ? ` · ${r.phone}` : ""} <span style={sx("color:#6b7280;")}>· {r.id} · {r.date}</span>
                </div>
              </div>
              <Select value={r.status} onChange={(v) => changeStatus(r.id, v)} full bg="#050505" options={STATUSES.map((s) => ({ value: s, label: s }))} />
            </div>

            {/* үнийн санал */}
            {r.quote ? (
              <div style={sx("margin-top:12px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.3);border-radius:10px;padding:11px 13px;")}>
                <div style={sx("font:700 10px 'JetBrains Mono';letter-spacing:.1em;color:#22c55e;")}>💬 ӨГСӨН ҮНИЙН САНАЛ</div>
                <div style={sx("font:500 13px/1.5 Roboto;color:#e8e8e8;margin-top:5px;white-space:pre-wrap;")}>{r.quote}</div>
                <button onClick={() => setDrafts((d) => ({ ...d, [r.id]: r.quote ?? "" }))} style={sx("background:none;border:none;color:#8A8F98;font:600 11px Montserrat;cursor:pointer;margin-top:6px;text-decoration:underline;")}>Засах</button>
              </div>
            ) : null}

            {(drafts[r.id] !== undefined || !r.quote) && (
              <div style={{ marginTop: 12 }}>
                <textarea
                  value={drafts[r.id] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                  rows={2}
                  placeholder="Үнийн санал / хариу бичих… (жишээ: Энэ сэлбэг 320,000₮, 2 долоо хоногт ирнэ)"
                  style={sx("background:#050505;border:1px solid #262626;border-radius:9px;padding:10px 12px;color:#fff;font:400 13px Roboto;outline:none;width:100%;resize:vertical;")}
                />
                <button onClick={() => saveQuote(r.id)} disabled={saving === r.id || !(drafts[r.id] ?? "").trim()}
                  style={sx(`margin-top:8px;background:#E10613;color:#fff;font:700 12px Montserrat;padding:9px 16px;border:none;border-radius:8px;cursor:pointer;${saving === r.id || !(drafts[r.id] ?? "").trim() ? "opacity:.6;" : ""}`)}>
                  {saving === r.id ? "Хадгалж байна…" : "Үнийн санал илгээх"}
                </button>
              </div>
            )}
          </div>
        ))}
        {loaded && shown.length === 0 && <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Хүсэлт алга.</div>}
        {!loaded && <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>Ачаалж байна…</div>}
      </div>
    </div>
  );
}
