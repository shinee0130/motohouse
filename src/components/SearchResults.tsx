"use client";

// Хайлтын үр дүн — мотоцикл + бараа/сэлбэгээс нэр/брэнд/ангиллаар шүүнэ.

import { useMemo } from "react";
import Link from "next/link";
import { sx } from "@/lib/sx";
import { Price } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";
import { isPart, type GearItem, type Moto } from "@/lib/data";
import { Slot } from "./Slot";

function match(q: string, ...fields: (string | undefined)[]): boolean {
  return fields.some((f) => (f || "").toLowerCase().includes(q));
}

export function SearchResults({ q, gear, motos }: { q: string; gear: GearItem[]; motos: Moto[] }) {
  const { t, loc } = useI18n();
  const query = q.toLowerCase();

  const foundMotos = useMemo(
    () => (query ? motos.filter((m) => match(query, m.brand, m.model, `${m.brand} ${m.model}`)) : []),
    [motos, query],
  );
  const foundGear = useMemo(
    () => (query ? gear.filter((g) => match(query, g.name, g.nameEn, g.brand, g.category)) : []),
    [gear, query],
  );
  const total = foundMotos.length + foundGear.length;

  return (
    <div style={sx("max-width:1280px;margin:0 auto;padding:clamp(20px,4vw,40px);animation:mhfade .4s both;min-height:50vh;")}>
      <h1 style={sx("font:800 clamp(24px,4vw,36px) Montserrat;color:#fff;margin-top:6px;text-transform:uppercase;")}>
        {q ? <>&ldquo;{q}&rdquo;</> : t("Хайлт")}
      </h1>
      {q && <div style={sx("font:500 14px Roboto;color:#8A8F98;margin-top:8px;")}>{total} {t("илэрц олдлоо")}</div>}

      {!q && (
        <div style={sx("padding:60px 20px;text-align:center;font:500 15px Roboto;color:#8A8F98;")}>
          {t("Дээрх хайлтын мөрөнд бараа, мотоцикл, брэндийн нэрээ бичээрэй.")}
        </div>
      )}

      {q && total === 0 && (
        <div style={sx("padding:60px 20px;text-align:center;")}>
          <div style={sx("font:600 16px Montserrat;color:#C8C8C8;")}>{t("Илэрц олдсонгүй")} 🔍</div>
          <div style={sx("font:400 14px Roboto;color:#8A8F98;margin-top:8px;")}>{t("Өөр түлхүүр үгээр дахин хайж үзээрэй.")}</div>
        </div>
      )}

      {foundMotos.length > 0 && (
        <section style={{ marginTop: 34 }}>
          <h2 style={sx("font:800 18px Montserrat;color:#fff;text-transform:uppercase;margin-bottom:16px;")}>{t("Мотоцикл")} ({foundMotos.length})</h2>
          <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px;")}>
            {foundMotos.map((m) => (
              <Link key={m.id} href={`/motorcycles/${m.id}`} style={sx("display:block;background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;cursor:pointer;")}>
                <div style={sx("aspect-ratio:4/3;background:#fff;position:relative;")}>
                  {m.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.images[0]} alt={`${m.brand} ${m.model}`} style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;")} />
                  ) : (
                    <Slot label="" light style={{ position: "absolute", inset: 0 }} />
                  )}
                </div>
                <div style={{ padding: "12px 14px 14px" }}>
                  <div style={sx("font:700 14px Montserrat;color:#fff;")}>{m.brand} {m.model}</div>
                  <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:2px;")}>{m.year} · {m.cc}cc</div>
                  <div style={sx("font:800 15px Montserrat;color:#E10613;margin-top:6px;")}><Price amount={m.salePrice ?? m.price} /></div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {foundGear.length > 0 && (
        <section style={{ marginTop: 34 }}>
          <h2 style={sx("font:800 18px Montserrat;color:#fff;text-transform:uppercase;margin-bottom:16px;")}>{t("Бараа, сэлбэг")} ({foundGear.length})</h2>
          <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;")}>
            {foundGear.map((g) => (
              <Link key={g.id} href={`${isPart(g) ? "/parts" : "/gear"}/${g.id}`} style={sx("display:block;background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;cursor:pointer;")}>
                <div style={sx("aspect-ratio:1/1;background:#fff;position:relative;")}>
                  {g.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.images[0]} alt={g.name} style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:contain;")} />
                  ) : (
                    <Slot label="" light style={{ position: "absolute", inset: 0 }} />
                  )}
                </div>
                <div style={{ padding: "12px 14px 14px" }}>
                  <div style={sx("font:700 13px Montserrat;color:#fff;")}>{loc(g.name, g.nameEn)}</div>
                  <div style={sx("font:400 11px Roboto;color:#8A8F98;margin-top:2px;")}>{g.brand} · {t(g.category)}</div>
                  <div style={sx("font:800 14px Montserrat;color:#E10613;margin-top:6px;")}><Price amount={g.price} /></div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
