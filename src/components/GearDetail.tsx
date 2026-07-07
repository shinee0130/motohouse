"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sx } from "@/lib/sx";
import { Slot } from "./Slot";
import { type GearItem } from "@/lib/data";
import { Price } from "@/lib/currency";
import { useAuth } from "@/lib/auth";
import { getSavedIds } from "@/lib/queries";
import { createOrder, setSaved } from "@/lib/admin";
import { addToCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

const PAYMENT_METHODS = ["Visa", "Mastercard", "American Express", "UnionPay", "T Card", "Apple Pay", "Google Pay", "WeChat Pay", "QPay", "SocialPay", "HiPay"];

function Stars({ rating }: { rating: number }) {
  return (
    <span style={sx("font:700 14px Montserrat;letter-spacing:.06em;color:#E10613;")}>
      {"★★★★★".slice(0, rating)}
      <span style={{ color: "#3a3a3f" }}>{"★★★★★".slice(rating)}</span>
    </span>
  );
}

function Accordion({ title, children, open: openDefault = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(openDefault);
  return (
    <div style={sx("border-bottom:1px solid #1c1c1f;")}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={sx("width:100%;display:flex;align-items:center;justify-content:space-between;background:none;border:none;cursor:pointer;padding:18px 0;color:#fff;font:700 15px Montserrat;text-align:left;")}
      >
        {title}
        <span style={{ color: "#E10613", transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}>⌄</span>
      </button>
      {open && <div style={{ paddingBottom: 18 }}>{children}</div>}
    </div>
  );
}

export function GearDetail({
  item,
  related,
  more,
  baseHref = "/gear",
  baseLabel = "Gear",
}: {
  item: GearItem;
  related: GearItem[];
  more: GearItem[];
  baseHref?: "/gear" | "/parts";
  baseLabel?: string;
}) {
  const { user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [color, setColor] = useState(item.colors?.[0] ?? "");
  const [size, setSize] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const imgs = item.images ?? [];
  const [orderId, setOrderId] = useState<string | null>(null);
  const [saved, setSavedState] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cartMsg, setCartMsg] = useState(false);
  const sale = item.oldPrice > item.price ? Math.round((1 - item.price / item.oldPrice) * 100) : 0;

  useEffect(() => {
    if (user) getSavedIds(user.phone, "gear").then((ids) => setSavedState(ids.includes(item.id)));
  }, [user, item.id]);

  async function toggleSave() {
    if (!user) { router.push("/login"); return; }
    const next = !saved;
    setSavedState(next);
    await setSaved(user.phone, "gear", item.id, next);
  }
  async function order() {
    if (!user) { router.push("/login"); return; }
    setBusy(true);
    try {
      const id = await createOrder({ userPhone: user.phone, item: `${item.name}${size ? ` (${size})` : ""}`, total: item.price });
      setOrderId(id);
    } finally { setBusy(false); }
  }

  return (
    <div style={sx("max-width:1280px;margin:0 auto;padding:clamp(20px,4vw,40px) clamp(20px,4vw,40px);animation:mhfade .5s both;")}>
      {/* breadcrumb */}
      <div style={sx("font:500 12px Roboto;color:#8A8F98;margin-bottom:18px;")}>
        <Link href={baseHref} style={{ cursor: "pointer" }}>{baseLabel}</Link>
        <span style={{ margin: "0 8px", color: "#3a3a3f" }}>/</span>
        <span>{item.category}</span>
        <span style={{ margin: "0 8px", color: "#3a3a3f" }}>/</span>
        <span style={{ color: "#C8C8C8" }}>{item.name}</span>
      </div>

      <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:clamp(24px,4vw,48px);align-items:start;")}>
        {/* ===== GALLERY ===== */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
            {(imgs.length ? imgs : [0, 1, 2]).map((src, i) => (
              <button
                key={i}
                onClick={() => imgs.length && setActiveImg(i)}
                style={sx(`width:64px;height:64px;border-radius:10px;overflow:hidden;padding:0;cursor:${imgs.length ? "pointer" : "default"};border:2px solid ${i === activeImg && imgs.length ? "#E10613" : "#262626"};background:#fff;`)}
              >
                {imgs.length ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src as string} alt="" style={sx("width:100%;height:100%;object-fit:cover;display:block;")} />
                ) : (
                  <Slot label="" light style={{ width: "100%", height: "100%" }} />
                )}
              </button>
            ))}
          </div>
          <div style={sx("position:relative;flex:1;border-radius:16px;overflow:hidden;border:1px solid #262626;background:#fff;aspect-ratio:1/1;")}>
            {imgs.length ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgs[Math.min(activeImg, imgs.length - 1)]} alt={item.name} style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:contain;")} />
            ) : (
              <Slot label={t("Бүтээгдэхүүн зураг")} light style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
            )}
            {sale > 0 && (
              <span style={sx("position:absolute;top:14px;left:14px;font:800 12px Montserrat;letter-spacing:.04em;color:#fff;background:#E10613;padding:6px 11px;border-radius:5px;")}>
                SALE -{sale}%
              </span>
            )}
          </div>
        </div>

        {/* ===== INFO ===== */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Stars rating={item.rating} />
            <span style={sx("font:600 13px Montserrat;color:#fff;")}>{item.rating.toFixed(1)}</span>
            <span style={sx("font:500 13px Roboto;color:#8A8F98;text-decoration:underline;")}>{item.reviews} сэтгэгдэл</span>
          </div>

          {item.bestSeller && (
            <span style={sx("display:inline-block;margin-top:14px;font:700 11px Montserrat;letter-spacing:.08em;color:#fff;background:#E10613;padding:5px 11px;border-radius:5px;")}>
              BEST SELLER
            </span>
          )}

          <h1 style={sx("font:800 clamp(26px,3.5vw,38px) Montserrat;color:#fff;margin-top:14px;")}>{item.name}</h1>
          <div style={sx("font:500 14px Roboto;color:#8A8F98;margin-top:4px;")}>{item.brand} · {item.category}</div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
            <span style={sx("font:800 28px Montserrat;color:#fff;")}><Price amount={item.price} /></span>
            {item.oldPrice > item.price && (
              <span style={sx("font:400 16px Roboto;color:#8A8F98;text-decoration:line-through;")}><Price amount={item.oldPrice} /></span>
            )}
            <button
              onClick={toggleSave}
              aria-label={t("Хадгалах")}
              title={saved ? t("Хадгалснаас хасах") : t("Хадгалах")}
              style={sx(`margin-left:auto;width:44px;height:44px;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:20px;background:${saved ? "rgba(225,6,19,.12)" : "#111113"};border:1px solid ${saved ? "#E10613" : "#262626"};color:${saved ? "#E10613" : "#8A8F98"};`)}
            >
              {saved ? "♥" : "♡"}
            </button>
          </div>

          {/* colors */}
          {item.colors && item.colors.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={sx("font:600 13px Montserrat;color:#fff;margin-bottom:10px;")}>
                {t("Өнгө")}: <span style={{ color: "#A3A3A3", fontWeight: 400 }}>{color}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {item.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={sx(
                      `cursor:pointer;font:600 13px Montserrat;padding:9px 16px;border-radius:999px;background:${c === color ? "#fff" : "#111113"};color:${c === color ? "#0B0B0D" : "#C8C8C8"};border:1px solid ${c === color ? "#fff" : "#262626"};`,
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* sizes */}
          {item.sizes && item.sizes.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={sx("font:600 13px Montserrat;color:#fff;")}>{t("Хэмжээ")}</span>
                <span style={sx("font:500 12px Roboto;color:#8A8F98;text-decoration:underline;cursor:pointer;")}>{t("Хэмжээний заавар")}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {item.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    style={sx(
                      `cursor:pointer;min-width:54px;font:600 14px Montserrat;padding:11px 16px;border-radius:10px;background:${s === size ? "#fff" : "#111113"};color:${s === size ? "#0B0B0D" : "#C8C8C8"};border:1px solid ${s === size ? "#fff" : "#262626"};`,
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={order}
            disabled={busy}
            style={sx(`width:100%;margin-top:26px;background:#E10613;color:#fff;font:700 15px Montserrat;letter-spacing:.04em;padding:17px;border:none;border-radius:12px;text-transform:uppercase;cursor:pointer;${busy ? "opacity:.6;" : ""}`)}
          >
            {busy ? t("Илгээж байна…") : user ? t("Захиалга өгөх") : t("Нэвтэрч захиалах")}
          </button>
          <button
            onClick={() => {
              addToCart({
                id: item.id, name: item.name, price: item.price,
                image: item.images?.[0],
                meta: [size, color].filter(Boolean).join(" · ") || undefined,
              });
              setCartMsg(true);
              setTimeout(() => setCartMsg(false), 2200);
            }}
            style={sx("width:100%;margin-top:10px;background:#111113;color:#fff;border:1px solid #333;font:700 14px Montserrat;letter-spacing:.04em;padding:15px;border-radius:12px;text-transform:uppercase;cursor:pointer;")}
          >
            🛒 {t("Сагслах")}
          </button>
          {cartMsg && (
            <div style={sx("font:500 13px Roboto;color:#22c55e;text-align:center;margin-top:10px;")}>
              ✓ {t("Сагсанд нэмэгдлээ.")} <Link href="/cart" style={{ color: "#22c55e", textDecoration: "underline" }}>{t("Сагс үзэх")}</Link>
            </div>
          )}
          {orderId && (
            <div style={sx("font:500 13px Roboto;color:#22c55e;text-align:center;margin-top:12px;")}>
              ✓ {t("Захиалга")} #{orderId} {t("үүслээ.")} <Link href="/account/orders" style={{ color: "#22c55e", textDecoration: "underline" }}>{t("Миний захиалга")}</Link>
            </div>
          )}
          <div style={sx("font:400 12px Roboto;color:#8A8F98;text-align:center;margin-top:12px;")}>
            {t("Захиалгыг баталгаажуулсны дараа төлбөр/хүргэлтийг тохирно. Олон улсын карт болон digital wallet төлбөрүүдийг дэмжинэ.")}
          </div>
          <div style={sx("background:#0B0B0D;border:1px solid #262626;border-radius:14px;padding:14px;margin-top:14px;")}>
            <div style={sx("font:700 11px 'JetBrains Mono';letter-spacing:.12em;color:#E10613;text-transform:uppercase;")}>{t("Төлбөрийн боломжууд")}</div>
            <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:7px;")}>
              {t("Visa, Mastercard, American Express, UnionPay, T Card, Apple Pay, Google Pay, WeChat Pay, QPay, SocialPay, HiPay дэмжинэ.")}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
              {PAYMENT_METHODS.map((method) => (
                <span key={method} style={sx("font:700 10px Montserrat;color:#C8C8C8;border:1px solid #333;background:#111113;border-radius:999px;padding:6px 9px;")}>
                  {method}
                </span>
              ))}
            </div>
          </div>

          {/* accordions */}
          <div style={{ marginTop: 28 }}>
            <Accordion title={t("Тайлбар")} open>
              <p style={sx("font:400 14px/1.7 Roboto;color:#A3A3A3;")}>{item.desc}</p>
            </Accordion>
            <Accordion title={t("Онцлог")}>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {item.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <span style={sx("width:6px;height:6px;border-radius:50%;background:#E10613;flex-shrink:0;")} />
                    <span style={sx("font:500 14px Roboto;color:#C8C8C8;")}>{f}</span>
                  </div>
                ))}
              </div>
            </Accordion>
            <Accordion title={t("Хүргэлт & буцаалт")}>
              <p style={sx("font:400 14px/1.7 Roboto;color:#A3A3A3;")}>
                {t("УБ хот доторх хүргэлт 1–2 хоног. Барааг задлаагүй, гэмтээгүй тохиолдолд 14 хоногийн дотор солих/буцаах боломжтой.")}
              </p>
            </Accordion>
            <div style={sx("font:500 12px 'JetBrains Mono';color:#8A8F98;padding:16px 0;letter-spacing:.04em;")}>
              SKU: {item.sku}
            </div>
          </div>
        </div>
      </div>

      {/* ===== COMPLETE THE LOOK ===== */}
      {related.length > 0 && (
        <div style={{ marginTop: "clamp(40px,6vw,64px)" }}>
          <h2 style={sx("font:800 20px Montserrat;color:#fff;text-transform:uppercase;")}>Хамт авах</h2>
          <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:18px;margin-top:18px;")}>
            {related.map((g) => (
              <GearMini key={g.id} g={g} baseHref={baseHref} />
            ))}
          </div>
        </div>
      )}

      {/* ===== YOU MAY ALSO LIKE ===== */}
      {more.length > 0 && (
        <div style={{ marginTop: "clamp(36px,5vw,56px)" }}>
          <h2 style={sx("font:800 20px Montserrat;color:#fff;text-transform:uppercase;")}>{t("Танд таалагдаж магадгүй")}</h2>
          <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:18px;margin-top:18px;")}>
            {more.map((g) => (
              <GearMini key={g.id} g={g} baseHref={baseHref} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GearMini({ g, baseHref }: { g: GearItem; baseHref: "/gear" | "/parts" }) {
  const { t } = useI18n();
  return (
    <Link
      href={`${baseHref}/${g.id}`}
      className="mh-card"
      style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;display:block;cursor:pointer;")}
    >
      <div style={{ position: "relative", height: 170, background: "#fff" }}>
        {g.images && g.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={g.images[0]} alt={g.name} style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:contain;")} />
        ) : (
          <Slot label={t("Зураг")} light style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        )}
      </div>
      <div style={{ padding: "13px 15px" }}>
        <div style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.12em;color:#8A8F98;")}>{g.brand.toUpperCase()}</div>
        <div style={sx("font:700 14px Montserrat;color:#fff;margin-top:3px;")}>{g.name}</div>
        <div style={sx("font:800 14px Montserrat;color:#fff;margin-top:8px;")}><Price amount={g.price} /></div>
      </div>
    </Link>
  );
}
