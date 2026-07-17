"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { sx } from "@/lib/sx";
import { Slot } from "./Slot";
import { type GearItem } from "@/lib/data";
import { Price } from "@/lib/currency";
import { useAuth } from "@/lib/auth";
import { useAuthModal } from "@/lib/authModal";
import { useCartModal } from "@/lib/cartModal";
import { getSavedIds } from "@/lib/queries";
import { setSaved } from "@/lib/admin";
import { addToCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

// Bonum терминал дээр бодитоор идэвхтэй хэрэгслүүд (QPAY + E_COMMERCE картын суваг)
const PAYMENT_METHODS = [
  { name: "QPay", src: "/assets/payments/qpay.png", width: 34 },
  { name: "SocialPay", src: "/assets/payments/socialpay.png", width: 92 },
  { name: "Visa", src: "/assets/payments/visa.png", width: 48 },
  { name: "Mastercard", src: "/assets/payments/mastercard.png", width: 82 },
];

function Stars({ rating }: { rating: number }) {
  return (
    <span style={sx("font:700 14px Montserrat;letter-spacing:.06em;color:#E10613;")}>
      {"★★★★★".slice(0, rating)}
      <span style={{ color: "#3a3a3f" }}>{"★★★★★".slice(rating)}</span>
    </span>
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
  const { t, loc } = useI18n();
  const authModal = useAuthModal();
  const cartModal = useCartModal();
  const [color, setColor] = useState(item.colors?.[0] ?? "");
  const [size, setSize] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const imgs = item.images ?? [];
  const [saved, setSavedState] = useState(false);
  const [cartMsg, setCartMsg] = useState(false);
  const [qty, setQty] = useState(1);
  const sale = item.oldPrice > item.price ? Math.round((1 - item.price / item.oldPrice) * 100) : 0;

  useEffect(() => {
    if (user) getSavedIds(user.phone, "gear").then((ids) => setSavedState(ids.includes(item.id)));
  }, [user, item.id]);

  async function toggleSave() {
    if (!user) { authModal.open("login"); return; }
    const next = !saved;
    setSavedState(next);
    await setSaved(user.phone, "gear", item.id, next);
  }
  function intoCart() {
    addToCart({
      id: item.id, name: item.name, price: item.price,
      image: item.images?.[0],
      meta: [size, color].filter(Boolean).join(" · ") || undefined,
    }, qty);
  }

  // Шууд худалдан авах — сагсанд хийгээд checkout цонхыг шууд нээнэ.
  function buyNow() {
    intoCart();
    cartModal.open();
  }

  return (
    <div style={sx("max-width:1280px;margin:0 auto;padding:clamp(20px,4vw,40px) clamp(20px,4vw,40px);animation:mhfade .5s both;")}>
      {/* breadcrumb */}
      <div style={sx("font:500 12px Roboto;color:#8A8F98;margin-bottom:18px;")}>
        <Link href={baseHref} style={{ cursor: "pointer" }}>{baseLabel}</Link>
        <span style={{ margin: "0 8px", color: "#3a3a3f" }}>/</span>
        <span>{t(item.category)}</span>
        <span style={{ margin: "0 8px", color: "#3a3a3f" }}>/</span>
        <span style={{ color: "#C8C8C8" }}>{loc(item.name, item.nameEn)}</span>
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

        {/* ===== INFO (RevZilla маягийн дараалал) ===== */}
        <div>
          {/* брэнд — тухайн брэндийн жагсаалт руу */}
          <Link href={`${baseHref}?brand=${encodeURIComponent(item.brand)}`}
            style={sx("font:700 13px Montserrat;letter-spacing:.08em;color:#E10613;text-transform:uppercase;cursor:pointer;")}>
            {item.brand}
          </Link>

          <h1 style={sx("font:800 clamp(25px,3.4vw,36px)/1.15 Montserrat;color:#fff;margin-top:8px;")}>{loc(item.name, item.nameEn)}</h1>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            <Stars rating={item.rating} />
            <span style={sx("font:600 13px Montserrat;color:#fff;")}>{item.rating.toFixed(1)}</span>
            <span style={sx("font:500 13px Roboto;color:#8A8F98;text-decoration:underline;")}>{item.reviews} {t("сэтгэгдэл")}</span>
            {item.bestSeller && (
              <span style={sx("font:700 10px Montserrat;letter-spacing:.08em;color:#0B0B0D;background:#f5c518;padding:4px 9px;border-radius:5px;")}>
                BEST SELLER
              </span>
            )}
          </div>

          {/* үнэ + хэмнэлт */}
          <div style={sx("margin-top:18px;background:#111113;border:1px solid #262626;border-radius:14px;padding:16px 18px;")}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={sx("font:800 30px Montserrat;color:#fff;")}><Price amount={item.price} /></span>
              {item.oldPrice > item.price && (
                <span style={sx("font:400 16px Roboto;color:#8A8F98;text-decoration:line-through;")}><Price amount={item.oldPrice} /></span>
              )}
              <button
                onClick={toggleSave}
                aria-label={t("Хадгалах")}
                title={saved ? t("Хадгалснаас хасах") : t("Хадгалах")}
                style={sx(`margin-left:auto;width:44px;height:44px;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:20px;background:${saved ? "rgba(225,6,19,.12)" : "#0B0B0D"};border:1px solid ${saved ? "#E10613" : "#2a2a2d"};color:${saved ? "#E10613" : "#8A8F98"};`)}
              >
                {saved ? "♥" : "♡"}
              </button>
            </div>
            {sale > 0 && (
              <div style={sx("font:700 13px Montserrat;color:#22c55e;margin-top:6px;")}>
                {t("Та хэмнэж байна")}: <Price amount={item.oldPrice - item.price} /> (-{sale}%)
              </div>
            )}
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

          {/* CTA — тоо ширхэг + худалдан авах */}
          <div style={{ display: "flex", gap: 10, marginTop: 24, alignItems: "stretch" }}>
            <div style={sx("display:flex;align-items:center;gap:2px;background:#111113;border:1px solid #333;border-radius:12px;padding:0 6px;flex-shrink:0;")}>
              <button onClick={() => setQty((v) => Math.max(1, v - 1))} aria-label="−"
                style={sx("width:36px;height:100%;background:none;border:none;color:#fff;font:700 17px Montserrat;cursor:pointer;")}>−</button>
              <span style={sx("font:700 15px Montserrat;color:#fff;min-width:24px;text-align:center;")}>{qty}</span>
              <button onClick={() => setQty((v) => Math.min(99, v + 1))} aria-label="+"
                style={sx("width:36px;height:100%;background:none;border:none;color:#fff;font:700 17px Montserrat;cursor:pointer;")}>+</button>
            </div>
            <button
              onClick={buyNow}
              style={sx("flex:1;background:#E10613;color:#fff;font:700 15px Montserrat;letter-spacing:.04em;padding:17px;border:none;border-radius:12px;text-transform:uppercase;cursor:pointer;")}
            >
              ⚡ {t("Шууд худалдан авах")}
            </button>
          </div>
          <button
            onClick={() => {
              intoCart();
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
          {/* Давуу талууд — RevZilla-ийн perks жагсаалт */}
          <div style={sx("margin-top:18px;background:#0B0B0D;border:1px solid #262626;border-radius:14px;padding:6px 16px;")}>
            {[
              { icon: "🚚", text: "УБ хот дотор 1–2 хоногт хүргэнэ, олон улс руу илгээнэ" },
              { icon: "↩️", text: "14 хоногийн дотор солих, буцаах боломжтой" },
              { icon: "🛡", text: "Баталгаат оригинал бараа" },
              { icon: "💳", text: "QPay · SocialPay · Карт — онлайнаар шууд төлнө" },
            ].map((p) => (
              <div key={p.text} style={sx("display:flex;align-items:center;gap:11px;padding:10px 0;border-bottom:1px solid #151517;")}>
                <span style={{ fontSize: 16, flexShrink: 0 }} aria-hidden="true">{p.icon}</span>
                <span style={sx("font:500 13px Roboto;color:#C8C8C8;")}>{t(p.text)}</span>
              </div>
            ))}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, padding: "10px 0" }}>
              {PAYMENT_METHODS.map((method) => (
                <span key={method.name} title={method.name} style={sx(`height:34px;min-width:${method.name === "SocialPay" ? 106 : method.name === "Mastercard" ? 94 : method.name === "QPay" ? 48 : 62}px;display:flex;align-items:center;justify-content:center;padding:3px 7px;background:#fff;border-radius:5px;`)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={method.src} alt={method.name} style={{ width: method.width, height: 27, objectFit: "contain", display: "block" }} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== ТАЙЛБАР + ОНЦЛОГ (бүтэн өргөн, RevZilla-ийн description хэсэг шиг) ===== */}
      <div style={sx("margin-top:clamp(36px,5vw,56px);background:#111113;border:1px solid #262626;border-radius:18px;padding:clamp(22px,3.4vw,36px);")}>
        <h2 style={sx("font:800 20px Montserrat;color:#fff;text-transform:uppercase;")}>{t("Тайлбар")}</h2>
        <p style={sx("font:400 15px/1.75 Roboto;color:#A3A3A3;margin-top:14px;max-width:860px;")}>{loc(item.desc, item.descEn)}</p>

        {loc(item.features, item.featuresEn).length > 0 && (
          <>
            <h3 style={sx("font:800 15px Montserrat;color:#fff;text-transform:uppercase;margin-top:26px;")}>{t("Онцлог")}</h3>
            <div style={sx("display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:8px 28px;margin-top:14px;")}>
              {loc(item.features, item.featuresEn).map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                  <span style={sx("width:6px;height:6px;border-radius:50%;background:#E10613;flex-shrink:0;margin-top:7px;")} />
                  <span style={sx("font:500 14px/1.55 Roboto;color:#C8C8C8;")}>{f}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={sx("display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-top:26px;padding-top:16px;border-top:1px solid #1c1c1f;")}>
          <span style={sx("font:500 12px 'JetBrains Mono';color:#8A8F98;letter-spacing:.04em;")}>SKU: {item.sku}</span>
          <span style={sx("font:400 12px Roboto;color:#6b7280;")}>
            {t("УБ хот доторх хүргэлт 1–2 хоног. Барааг задлаагүй, гэмтээгүй тохиолдолд 14 хоногийн дотор солих/буцаах боломжтой.")}
          </span>
        </div>
      </div>

      {/* ===== COMPLETE THE LOOK ===== */}
      {related.length > 0 && (
        <div style={{ marginTop: "clamp(40px,6vw,64px)" }}>
          <h2 style={sx("font:800 20px Montserrat;color:#fff;text-transform:uppercase;")}>{t("Хамт авах")}</h2>
          <div className="mh-prod-grid" style={{ marginTop: 18 }}>
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
          <div className="mh-prod-grid" style={{ marginTop: 18 }}>
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
  const { t, loc } = useI18n();
  return (
    <Link
      href={`${baseHref}/${g.id}`}
      className="mh-card"
      style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;display:block;cursor:pointer;")}
    >
      <div className="mh-card-img" style={{ position: "relative", height: 170, background: "#fff" }}>
        {g.images && g.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={g.images[0]} alt={g.name} style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:contain;")} />
        ) : (
          <Slot label={t("Зураг")} light style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        )}
      </div>
      <div className="mh-card-pad" style={{ padding: "13px 15px" }}>
        <div style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.12em;color:#8A8F98;")}>{g.brand.toUpperCase()}</div>
        <div className="mh-card-title" style={sx("font:700 14px Montserrat;color:#fff;margin-top:3px;")}>{loc(g.name, g.nameEn)}</div>
        <div className="mh-card-price" style={sx("font:800 14px Montserrat;color:#fff;margin-top:8px;")}><Price amount={g.price} /></div>
      </div>
    </Link>
  );
}
