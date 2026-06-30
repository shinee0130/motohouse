"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sx } from "@/lib/sx";
import { useAuth } from "@/lib/auth";
import { getSavedIds } from "@/lib/queries";
import { createOrder, setSaved } from "@/lib/admin";

export function MotoActions({ id, name, price }: { id: number; name: string; price: number }) {
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSavedState] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) getSavedIds(user.phone, "moto").then((ids) => setSavedState(ids.includes(id)));
  }, [user, id]);

  async function toggleSave() {
    if (!user) { router.push("/login"); return; }
    const next = !saved;
    setSavedState(next);
    await setSaved(user.phone, "moto", id, next);
  }
  async function order() {
    if (!user) { router.push("/login"); return; }
    setBusy(true);
    try {
      const oid = await createOrder({ userPhone: user.phone, item: name, total: price });
      setOrderId(oid);
    } finally { setBusy(false); }
  }

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 22 }}>
        <button
          onClick={order}
          disabled={busy}
          style={sx(`background:#E10613;color:#fff;font:700 14px Montserrat;letter-spacing:.05em;padding:14px 26px;border:none;border-radius:10px;text-transform:uppercase;cursor:pointer;${busy ? "opacity:.6;" : ""}`)}
        >
          {busy ? "Илгээж байна…" : user ? "Сонирхож байна" : "Нэвтэрч захиалах"}
        </button>
        <button
          onClick={toggleSave}
          style={sx(`display:flex;align-items:center;gap:8px;font:700 14px Montserrat;letter-spacing:.05em;padding:14px 22px;border-radius:10px;cursor:pointer;background:${saved ? "rgba(225,6,19,.12)" : "transparent"};border:1px solid ${saved ? "#E10613" : "#444"};color:${saved ? "#E10613" : "#fff"};`)}
        >
          {saved ? "♥ Хадгалсан" : "♡ Хадгалах"}
        </button>
      </div>
      {orderId && (
        <div style={sx("font:500 13px Roboto;color:#22c55e;margin-top:12px;")}>
          ✓ Захиалга #{orderId} үүслээ. <Link href="/account/orders" style={{ color: "#22c55e", textDecoration: "underline" }}>Миний захиалга</Link>
        </div>
      )}
    </>
  );
}
