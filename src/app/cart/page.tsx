"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sx } from "@/lib/sx";
import { fmt } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { createOrder } from "@/lib/admin";
import { getCart, setCartQty, removeFromCart, clearCart, CART_EVENT, type CartItem } from "@/lib/cart";

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const load = () => setItems(getCart());
    load(); setReady(true);
    window.addEventListener(CART_EVENT, load);
    return () => window.removeEventListener(CART_EVENT, load);
  }, []);

  const total = items.reduce((s, x) => s + x.price * x.qty, 0);

  async function checkout() {
    if (!user) { router.push("/login"); return; }
    setBusy(true);
    try {
      for (const it of items) {
        const label = `${it.name}${it.meta ? ` (${it.meta})` : ""}${it.qty > 1 ? ` ×${it.qty}` : ""}`;
        await createOrder({ userPhone: user.phone, item: label, total: it.price * it.qty });
      }
      clearCart();
      setDone(true);
    } finally { setBusy(false); }
  }

  return (
    <div style={sx("max-width:920px;margin:0 auto;padding:clamp(32px,5vw,56px) clamp(20px,4vw,40px);animation:mhfade .5s both;")}>
      <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.24em;color:#E10613;")}>CART</div>
      <h1 style={sx("font:800 clamp(30px,5vw,46px) Montserrat;color:#fff;margin-top:6px;text-transform:uppercase;")}>
        Миний сагс
      </h1>

      {done ? (
        <div style={sx("background:#111113;border:1px solid #262626;border-radius:18px;padding:clamp(28px,5vw,48px);margin-top:26px;text-align:center;")}>
          <div style={sx("font:800 22px Montserrat;color:#22c55e;")}>✓ Захиалга илгээгдлээ!</div>
          <div style={sx("font:400 14px Roboto;color:#A3A3A3;margin-top:10px;")}>
            Бид удахгүй холбогдож, төлбөр/хүргэлтийг зохицуулна.
          </div>
          <Link href="/account/orders" style={sx("display:inline-block;margin-top:20px;background:#E10613;color:#fff;font:700 13px Montserrat;letter-spacing:.05em;padding:13px 24px;border-radius:10px;text-transform:uppercase;cursor:pointer;")}>
            Миний захиалга
          </Link>
        </div>
      ) : !ready ? null : items.length === 0 ? (
        <div style={sx("background:#111113;border:1px solid #262626;border-radius:18px;padding:44px 24px;margin-top:26px;text-align:center;")}>
          <div style={sx("font:600 16px Montserrat;color:#C8C8C8;")}>Сагс хоосон байна 🛒</div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
            <Link href="/gear" style={sx("background:#E10613;color:#fff;font:700 13px Montserrat;padding:12px 22px;border-radius:10px;cursor:pointer;")}>Дагалдах хэрэгсэл үзэх</Link>
            <Link href="/parts" style={sx("border:1px solid #444;color:#fff;font:700 13px Montserrat;padding:12px 22px;border-radius:10px;cursor:pointer;")}>Сэлбэг үзэх</Link>
          </div>
        </div>
      ) : (
        <>
          <div style={sx("background:#111113;border:1px solid #262626;border-radius:16px;overflow:hidden;margin-top:26px;")}>
            {items.map((it) => (
              <div key={`${it.id}-${it.meta ?? ""}`} style={sx("display:flex;align-items:center;gap:14px;padding:14px 16px;border-bottom:1px solid #1c1c1f;flex-wrap:wrap;")}>
                <div style={sx("width:64px;height:64px;border-radius:10px;overflow:hidden;background:#fff;flex-shrink:0;")}>
                  {it.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image} alt="" style={sx("width:100%;height:100%;object-fit:contain;")} />
                  ) : (
                    <div style={sx("width:100%;height:100%;background:#1a1a1d;")} />
                  )}
                </div>
                <div style={{ minWidth: 160, flex: 1 }}>
                  <div style={sx("font:700 15px Montserrat;color:#fff;")}>{it.name}</div>
                  {it.meta && <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:2px;")}>{it.meta}</div>}
                  <div style={sx("font:700 14px Montserrat;color:#E10613;margin-top:4px;")}>{fmt(it.price)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => setCartQty(it.id, it.meta, it.qty - 1)} style={sx("width:32px;height:32px;border-radius:8px;background:#0B0B0D;border:1px solid #333;color:#fff;font:700 15px Montserrat;cursor:pointer;")}>−</button>
                  <span style={sx("font:700 15px Montserrat;color:#fff;min-width:26px;text-align:center;")}>{it.qty}</span>
                  <button onClick={() => setCartQty(it.id, it.meta, it.qty + 1)} style={sx("width:32px;height:32px;border-radius:8px;background:#0B0B0D;border:1px solid #333;color:#fff;font:700 15px Montserrat;cursor:pointer;")}>+</button>
                </div>
                <div style={sx("font:800 15px Montserrat;color:#fff;min-width:110px;text-align:right;")}>{fmt(it.price * it.qty)}</div>
                <button onClick={() => removeFromCart(it.id, it.meta)} aria-label="Устгах" style={sx("background:none;border:none;color:#ef4444;font:700 16px Montserrat;cursor:pointer;padding:6px;")}>✕</button>
              </div>
            ))}
          </div>

          <div style={sx("display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:20px;")}>
            <div>
              <div style={sx("font:600 11px 'JetBrains Mono';letter-spacing:.12em;color:#8A8F98;")}>НИЙТ ДҮН</div>
              <div style={sx("font:800 26px Montserrat;color:#E10613;margin-top:2px;")}>{fmt(total)}</div>
            </div>
            <button
              onClick={checkout}
              disabled={busy}
              style={sx(`background:#E10613;color:#fff;font:700 15px Montserrat;letter-spacing:.05em;padding:16px 34px;border:none;border-radius:12px;text-transform:uppercase;cursor:pointer;${busy ? "opacity:.6;" : ""}`)}
            >
              {busy ? "Илгээж байна…" : user ? "Захиалах" : "Нэвтэрч захиалах"}
            </button>
          </div>
          <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:12px;")}>
            Захиалга илгээснээр admin холбогдож, төлбөр/хүргэлтийг зохицуулна.
          </div>
        </>
      )}
    </div>
  );
}
