"use client";

// Бараа/сэлбэгийн жагсаалт — RevZilla маягийн sidebar шүүлтүүртэй (олон сонголт,
// тоотой), эрэмбэлэлт, хямдралын шүүлт. /gear болон /parts 2ул ашиглана.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { sx } from "@/lib/sx";
import { Slot } from "@/components/Slot";
import { Select } from "@/components/Select";
import { GENDERS, type GearItem } from "@/lib/data";
import { Price } from "@/lib/currency";
import { useI18n } from "@/lib/i18n";
import { ListingShell, FilterGroup, CheckRow } from "@/components/ListingShell";
import { addToCart, CART_EVENT, getCart, setCartQty } from "@/lib/cart";

type SortKey = "featured" | "priceAsc" | "priceDesc" | "sale";

// Үнийн мужууд (MNT) — label нь dict-д орчуулгатай
const PRICE_RANGES: { key: string; label: string; min: number; max: number }[] = [
  { key: "p1", label: "₮200,000 хүртэл", min: 0, max: 200_000 },
  { key: "p2", label: "₮200,000 – ₮500,000", min: 200_000, max: 500_000 },
  { key: "p3", label: "₮500,000 – ₮1,000,000", min: 500_000, max: 1_000_000 },
  { key: "p4", label: "₮1,000,000-аас дээш", min: 1_000_000, max: Infinity },
];

function toggleSet(s: Set<string>, v: string): Set<string> {
  const n = new Set(s);
  if (n.has(v)) n.delete(v); else n.add(v);
  return n;
}

function GearCartControl({
  id, name, price, image, t,
}: { id: number; name: string; price: number; image?: string; t: (text: string) => string }) {
  const [qty, setQty] = useState(0);

  useEffect(() => {
    const sync = () => setQty(getCart().find((item) => item.id === id && item.meta === undefined)?.qty ?? 0);
    const initial = window.setTimeout(sync, 0);
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.clearTimeout(initial);
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [id]);

  function add() {
    addToCart({ id, name, price, image });
  }

  function change(next: number) {
    setCartQty(id, undefined, next);
  }

  if (!qty) {
    return (
      <button
        type="button"
        className="mh-card-cart"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); add(); }}
        aria-label={`${t("Сагслах")}: ${name}`}
        style={sx("width:100%;margin-top:11px;background:#E10613;border:none;border-radius:8px;color:#fff;font:700 11px Montserrat;letter-spacing:.04em;padding:10px 8px;cursor:pointer;text-transform:uppercase;")}
      >
        🛒 {t("Сагслах")}
      </button>
    );
  }

  return (
    <div className="mh-card-cart" style={sx("display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:11px;background:#0B0B0D;border:1px solid #333;border-radius:8px;padding:3px;")}>
      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); change(qty - 1); }} aria-label="−" style={sx("width:30px;height:30px;border:none;border-radius:6px;background:#1b1b1e;color:#fff;font:700 16px Montserrat;cursor:pointer;")}>−</button>
      <span style={sx("font:800 13px Montserrat;color:#fff;min-width:22px;text-align:center;")}>{qty}</span>
      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); change(qty + 1); }} aria-label="+" style={sx("width:30px;height:30px;border:none;border-radius:6px;background:#E10613;color:#fff;font:700 16px Montserrat;cursor:pointer;")}>+</button>
    </div>
  );
}

export function GearClient({
  gear,
  title = "Хэрэгсэл ба сэлбэг",
  baseHref = "/gear",
  initialGender = "all",
  initialBrand = "all",
  initialCat = "All",
}: {
  gear: GearItem[];
  label?: string; // хуучин prop — ашиглагдахаа больсон (устгаагүй нь call site-уудыг эвдэхгүйн тулд)
  title?: string;
  desc?: string;  // мөн адил
  baseHref?: "/gear" | "/parts";
  initialGender?: string;
  initialBrand?: string;
  initialCat?: string;
}) {
  const { t, loc } = useI18n();
  const [cats, setCats] = useState<Set<string>>(() => (initialCat !== "All" ? new Set([initialCat]) : new Set()));
  const [brands, setBrands] = useState<Set<string>>(() => (initialBrand !== "all" ? new Set([initialBrand]) : new Set()));
  const [genders, setGenders] = useState<Set<string>>(() => (initialGender !== "all" ? new Set([initialGender]) : new Set()));
  const [price, setPrice] = useState<string | null>(null);
  const [saleOnly, setSaleOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");

  const allCats = useMemo(() => Array.from(new Set(gear.map((g) => g.category))), [gear]);
  const allBrands = useMemo(() => Array.from(new Set(gear.map((g) => g.brand).filter(Boolean))).sort(), [gear]);
  const hasGendered = useMemo(() => gear.some((g) => g.gender === "women" || g.gender === "men"), [gear]);

  // Нэг бүлгээс бусад шүүлтүүрээр шүүх (тоо нь контекстээ дагаж өөрчлөгдөнө)
  const applyFilters = useMemo(() => {
    return (items: GearItem[], skip?: "cat" | "brand" | "gender" | "price" | "sale") => {
      let l = items;
      if (skip !== "cat" && cats.size) l = l.filter((g) => cats.has(g.category));
      if (skip !== "brand" && brands.size) l = l.filter((g) => brands.has(g.brand));
      if (skip !== "gender" && genders.size) l = l.filter((g) => genders.has(g.gender ?? "unisex"));
      if (skip !== "price" && price) {
        const r = PRICE_RANGES.find((x) => x.key === price)!;
        l = l.filter((g) => g.price >= r.min && g.price < r.max);
      }
      if (skip !== "sale" && saleOnly) l = l.filter((g) => g.oldPrice > g.price);
      return l;
    };
  }, [cats, brands, genders, price, saleOnly]);

  const list = useMemo(() => {
    const l = applyFilters(gear).slice();
    if (sort === "priceAsc") l.sort((a, b) => a.price - b.price);
    else if (sort === "priceDesc") l.sort((a, b) => b.price - a.price);
    else if (sort === "sale") l.sort((a, b) => (b.oldPrice > b.price ? 1 : 0) - (a.oldPrice > a.price ? 1 : 0));
    else l.sort((a, b) => (b.bestSeller ? 1 : 0) - (a.bestSeller ? 1 : 0));
    return l;
  }, [gear, applyFilters, sort]);

  const activeCount = cats.size + brands.size + genders.size + (price ? 1 : 0) + (saleOnly ? 1 : 0);
  const clearAll = () => { setCats(new Set()); setBrands(new Set()); setGenders(new Set()); setPrice(null); setSaleOnly(false); };

  const countBy = (skip: "cat" | "brand" | "gender" | "price" | "sale", pred: (g: GearItem) => boolean) =>
    applyFilters(gear, skip).filter(pred).length;

  const sidebar = (
    <>
      <FilterGroup title={t("Ангилал")}>
        {allCats.map((c) => (
          <CheckRow key={c} label={t(c)} count={countBy("cat", (g) => g.category === c)} checked={cats.has(c)} onToggle={() => setCats((s) => toggleSet(s, c))} />
        ))}
      </FilterGroup>
      {allBrands.length > 1 && (
        <FilterGroup title={t("Брэнд")}>
          {allBrands.map((b) => (
            <CheckRow key={b} label={b} count={countBy("brand", (g) => g.brand === b)} checked={brands.has(b)} onToggle={() => setBrands((s) => toggleSet(s, b))} />
          ))}
        </FilterGroup>
      )}
      {hasGendered && (
        <FilterGroup title={t("Хэнд зориулсан")}>
          {GENDERS.map((g) => (
            <CheckRow key={g.v} label={t(g.mn)} count={countBy("gender", (x) => (x.gender ?? "unisex") === g.v)} checked={genders.has(g.v)} onToggle={() => setGenders((s) => toggleSet(s, g.v))} />
          ))}
        </FilterGroup>
      )}
      <FilterGroup title={t("Үнэ")}>
        {PRICE_RANGES.map((r) => (
          <CheckRow key={r.key} label={t(r.label)} count={countBy("price", (g) => g.price >= r.min && g.price < r.max)} checked={price === r.key} onToggle={() => setPrice((p) => (p === r.key ? null : r.key))} />
        ))}
      </FilterGroup>
      <FilterGroup title={t("Хямдрал")}>
        <CheckRow label={t("Зөвхөн хямдралтай")} count={countBy("sale", (g) => g.oldPrice > g.price)} checked={saleOnly} onToggle={() => setSaleOnly((v) => !v)} />
      </FilterGroup>
    </>
  );

  const toolbar = (
    <div style={{ minWidth: 190 }}>
      <Select
        value={sort}
        onChange={(v) => setSort(v as SortKey)}
        ariaLabel={t("Эрэмбэлэх")}
        full
        options={[
          { value: "featured", label: t("Онцлох эхэндээ") },
          { value: "priceAsc", label: t("Үнэ: өсөхөөр") },
          { value: "priceDesc", label: t("Үнэ: буурахаар") },
          { value: "sale", label: t("Хямдралтай эхэндээ") },
        ]}
      />
    </div>
  );

  return (
    <ListingShell
      title={t(title)}
      count={list.length}
      sidebar={sidebar}
      toolbar={toolbar}
      onClear={clearAll}
      activeCount={activeCount}
    >
      <div className="mh-prod-grid">
        {list.map((g) => {
          const sale = g.oldPrice > g.price ? Math.round((1 - g.price / g.oldPrice) * 100) : 0;
          return (
            <Link
              key={g.id}
              href={`${baseHref}/${g.id}`}
              className="mh-card"
              style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;display:block;cursor:pointer;")}
            >
              <div className="mh-card-img" style={{ position: "relative", height: 190, background: "#fff" }}>
                {g.images && g.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.images[0]} alt={g.name} style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:contain;")} />
                ) : (
                  <Slot label={t("Бүтээгдэхүүн зураг")} light style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
                )}
                {sale > 0 && (
                  <span style={sx("position:absolute;top:10px;left:10px;z-index:2;font:800 11px Montserrat;letter-spacing:.04em;color:#fff;background:#E10613;padding:5px 9px;border-radius:4px;")}>
                    SALE -{sale}%
                  </span>
                )}
                {g.bestSeller && sale === 0 && (
                  <span style={sx("position:absolute;top:10px;left:10px;z-index:2;font:800 10px Montserrat;letter-spacing:.06em;color:#0B0B0D;background:#f5c518;padding:5px 9px;border-radius:4px;")}>
                    BEST SELLER
                  </span>
                )}
              </div>
              <div className="mh-card-pad" style={{ padding: "13px 15px 15px" }}>
                <div style={sx("font:600 10px 'JetBrains Mono';letter-spacing:.12em;color:#8A8F98;")}>
                  {g.brand.toUpperCase()} · {t(g.category)}
                </div>
                <div className="mh-card-title" style={sx("font:700 14px Montserrat;color:#fff;margin-top:4px;")}>{loc(g.name, g.nameEn)}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                  <span style={sx("font:700 12px Montserrat;letter-spacing:.08em;color:#E10613;")}>{"★★★★★".slice(0, g.rating)}</span>
                  {g.reviews > 0 && <span style={sx("font:400 11px Roboto;color:#6b7280;")}>({g.reviews})</span>}
                </div>
                <div className="mh-pricerow" style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 9 }}>
                  {g.oldPrice > g.price && (
                    <span className="mh-oldprice" style={sx("font:400 13px Roboto;color:#8A8F98;text-decoration:line-through;")}><Price amount={g.oldPrice} /></span>
                  )}
                  <span className="mh-card-price" style={sx("font:800 16px Montserrat;color:#fff;")}><Price amount={g.price} /></span>
                </div>
                <GearCartControl id={g.id} name={loc(g.name, g.nameEn)} price={g.price} image={g.images?.[0]} t={t} />
              </div>
            </Link>
          );
        })}
      </div>

      {list.length === 0 && (
        <div style={sx("padding:50px 20px;text-align:center;font:500 14px Roboto;color:#8A8F98;")}>
          {t("Энэ шүүлтүүрт тохирох бараа алга. Шүүлтүүрээ цэвэрлэж үзээрэй.")}
        </div>
      )}

      {/* дэлгүүрт байхгүй бол захиалах */}
      <div style={sx("margin-top:28px;background:linear-gradient(120deg,#1a0405,#111113 70%);border:1px solid #262626;border-radius:16px;padding:clamp(20px,3vw,28px);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;")}>
        <div>
          <div style={sx("font:800 clamp(17px,2.4vw,22px) Montserrat;color:#fff;")}>{t("Хайж байгаа зүйл олдсонгүй юу?")}</div>
          <div style={sx("font:400 13px Roboto;color:#A3A3A3;margin-top:5px;max-width:520px;")}>{t("Дэлгүүрт байхгүй сэлбэг, каск, хувцас болон бусад зүйлийг захиалж, үнийн санал аваарай.")}</div>
        </div>
        <Link href="/request" style={sx("background:#E10613;color:#fff;font:700 13px Montserrat;letter-spacing:.05em;padding:14px 24px;border-radius:10px;text-transform:uppercase;cursor:pointer;white-space:nowrap;")}>
          {t("Захиалгын хүсэлт")}
        </Link>
      </div>
    </ListingShell>
  );
}
