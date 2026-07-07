"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { sx } from "@/lib/sx";
import { Slot } from "@/components/Slot";
import { statusLabel, type GearItem, type Moto } from "@/lib/data";
import { Price } from "@/lib/currency";
import { useAuth } from "@/lib/auth";
import { getSavedItems } from "@/lib/queries";
import { setSaved } from "@/lib/admin";
import { useI18n } from "@/lib/i18n";

export default function WishlistPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [gear, setGear] = useState<GearItem[]>([]);
  const [motos, setMotos] = useState<Moto[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    const s = await getSavedItems(user.phone);
    setGear(s.gear);
    setMotos(s.motos);
    setLoaded(true);
  }, [user]);
  useEffect(() => { refresh(); }, [refresh]);

  async function remove(kind: "gear" | "moto", id: number) {
    if (!user) return;
    if (kind === "gear") setGear((l) => l.filter((g) => g.id !== id));
    else setMotos((l) => l.filter((m) => m.id !== id));
    await setSaved(user.phone, kind, id, false);
  }

  const total = gear.length + motos.length;

  return (
    <div style={sx("background:#111113;border:1px solid #262626;border-radius:16px;padding:clamp(18px,3vw,26px);")}>
      <div style={sx("font:700 18px Montserrat;color:#fff;margin-bottom:18px;")}>{t("Хадгалсан")} ({total})</div>

      <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:18px;")}>
        {motos.map((m) => (
          <SavedCard key={`m${m.id}`} href={`/motorcycles/${m.id}`} img={m.images?.[0]} brand={m.brand} name={m.model} price={m.price} tag={statusLabel(m.status)} onRemove={() => remove("moto", m.id)} cover />
        ))}
        {gear.map((g) => (
          <SavedCard key={`g${g.id}`} href={`/gear/${g.id}`} img={g.images?.[0]} brand={g.brand} name={g.name} price={g.price} onRemove={() => remove("gear", g.id)} />
        ))}
      </div>

      {loaded && total === 0 && (
        <div style={sx("padding:24px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>
          {t("Хадгалсан зүйл алга. Мотоцикл эсвэл барааны хуудаснаас ♥ дарж хадгалаарай.")}
        </div>
      )}
      {!loaded && <div style={sx("padding:24px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>{t("Ачаалж байна…")}</div>}
    </div>
  );
}

function SavedCard({ href, img, brand, name, price, tag, onRemove, cover }: {
  href: string; img?: string; brand: string; name: string; price: number; tag?: string; onRemove: () => void; cover?: boolean;
}) {
  const { t } = useI18n();
  return (
    <div className="mh-card" style={sx("position:relative;background:#0B0B0D;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
      <Link href={href} style={{ display: "block", cursor: "pointer" }}>
        <div style={{ position: "relative", height: 160, background: cover ? "#0d0d0f" : "#fff" }}>
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt={name} style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;")} />
          ) : (
            <Slot label={t("Зураг")} light={!cover} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
          )}
          {tag && <span style={sx("position:absolute;top:10px;left:10px;font:700 10px Montserrat;color:#fff;background:#E10613;padding:4px 9px;border-radius:5px;")}>{tag}</span>}
        </div>
        <div style={{ padding: "13px 15px" }}>
          <div style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.12em;color:#8A8F98;")}>{brand.toUpperCase()}</div>
          <div style={sx("font:700 14px Montserrat;color:#fff;margin-top:3px;")}>{name}</div>
          <div style={sx("font:800 14px Montserrat;color:#E10613;margin-top:8px;")}><Price amount={price} /></div>
        </div>
      </Link>
      <button onClick={onRemove} aria-label={t("Хасах")}
        style={sx("position:absolute;top:10px;right:10px;z-index:2;width:30px;height:30px;border-radius:50%;background:rgba(0,0,0,.55);border:none;cursor:pointer;color:#E10613;font-size:15px;display:flex;align-items:center;justify-content:center;")}>
        ♥
      </button>
    </div>
  );
}
