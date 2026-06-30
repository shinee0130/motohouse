"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sx } from "@/lib/sx";
import { useAuth } from "@/lib/auth";
import { getParticipants, type Participant } from "@/lib/queries";
import { joinEvent, leaveEvent } from "@/lib/admin";

export function EventParticipate({ eventId, status, initial }: { eventId: number; status: string; initial: Participant[] }) {
  const { user } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<Participant[]>(initial);
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);

  const closed = status === "Winner";

  useEffect(() => {
    if (user) setJoined(initial.some((p) => p.user_phone === user.phone));
  }, [user, initial]);

  async function toggle() {
    if (!user) { router.push("/login"); return; }
    setBusy(true);
    try {
      if (joined) {
        await leaveEvent(eventId, user.phone);
      } else {
        await joinEvent(eventId, user.phone, user.name || user.phone);
      }
      const fresh = await getParticipants(eventId);
      setList(fresh);
      setJoined(!joined);
    } finally { setBusy(false); }
  }

  return (
    <div style={sx("background:#111113;border:1px solid #262626;border-radius:16px;padding:22px;margin-top:24px;")}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={sx("font:700 16px Montserrat;color:#fff;")}>Оролцогчид ({list.length})</div>
        {!closed && (
          <button
            onClick={toggle}
            disabled={busy}
            style={sx(`font:700 13px Montserrat;letter-spacing:.05em;padding:12px 24px;border-radius:10px;cursor:pointer;text-transform:uppercase;${busy ? "opacity:.6;" : ""}${joined ? "background:rgba(34,197,94,.12);border:1px solid #22c55e;color:#22c55e;" : "background:#E10613;border:none;color:#fff;"}`)}
          >
            {busy ? "…" : joined ? "✓ Оролцсон" : user ? "Оролцох" : "Нэвтэрч оролцох"}
          </button>
        )}
        {closed && <span style={sx("font:600 13px Roboto;color:#8A8F98;")}>Энэ giveaway дууссан</span>}
      </div>

      {list.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
          {list.map((p) => (
            <span key={p.user_phone} style={sx("display:inline-flex;align-items:center;gap:8px;background:#0B0B0D;border:1px solid #262626;border-radius:999px;padding:6px 12px 6px 6px;")}>
              <span style={sx("width:24px;height:24px;border-radius:50%;background:#E10613;color:#fff;display:flex;align-items:center;justify-content:center;font:800 11px Montserrat;")}>
                {(p.name || "U").trim().charAt(0).toUpperCase()}
              </span>
              <span style={sx("font:500 13px Roboto;color:#C8C8C8;")}>{p.name || p.user_phone}</span>
            </span>
          ))}
        </div>
      ) : (
        <div style={sx("font:400 13px Roboto;color:#8A8F98;margin-top:14px;")}>Эхний оролцогч нь та байгаарай!</div>
      )}
    </div>
  );
}
