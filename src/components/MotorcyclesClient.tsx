"use client";

// Мотоциклын жагсаалт — RevZilla маягийн sidebar шүүлтүүр (брэнд/төлөв/багтаамж/үнэ,
// олон сонголт + тоотой), эрэмбэлэлт, model хайлт.

import { useMemo, useState } from "react";
import { sx } from "@/lib/sx";
import { MotoCard } from "@/components/MotoCard";
import { Select } from "@/components/Select";
import { statusLabel, type Moto } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { ListingShell, FilterGroup, CheckRow } from "@/components/ListingShell";

type SortKey = "featured" | "priceAsc" | "priceDesc";

const PRICE_RANGES: { key: string; label: string; min: number; max: number }[] = [
  { key: "p1", label: "₮15 сая хүртэл", min: 0, max: 15_000_000 },
  { key: "p2", label: "₮15 – 30 сая", min: 15_000_000, max: 30_000_000 },
  { key: "p3", label: "₮30 – 60 сая", min: 30_000_000, max: 60_000_000 },
  { key: "p4", label: "₮60 саяас дээш", min: 60_000_000, max: Infinity },
];

const CC_RANGES: { key: string; label: string; min: number; max: number }[] = [
  { key: "c1", label: "400cc хүртэл", min: 0, max: 401 },
  { key: "c2", label: "401 – 700cc", min: 401, max: 701 },
  { key: "c3", label: "701 – 1000cc", min: 701, max: 1001 },
  { key: "c4", label: "1000cc-ээс дээш", min: 1001, max: Infinity },
];

function toggleSet(s: Set<string>, v: string): Set<string> {
  const n = new Set(s);
  if (n.has(v)) n.delete(v); else n.add(v);
  return n;
}

export function MotorcyclesClient({ motos, initialBrand }: { motos: Moto[]; initialBrand?: string }) {
  const { t } = useI18n();
  const [brands, setBrands] = useState<Set<string>>(() => (initialBrand ? new Set([initialBrand]) : new Set()));
  const [statuses, setStatuses] = useState<Set<string>>(new Set());
  const [price, setPrice] = useState<string | null>(null);
  const [cc, setCc] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("featured");
  const [q, setQ] = useState("");

  const allBrands = useMemo(() => Array.from(new Set(motos.map((m) => m.brand))).sort(), [motos]);
  const allStatuses = useMemo(() => Array.from(new Set(motos.map((m) => m.status))), [motos]);
  const eff = (m: Moto) => m.salePrice ?? m.price;

  const applyFilters = useMemo(() => {
    return (items: Moto[], skip?: "brand" | "status" | "price" | "cc") => {
      let l = items;
      if (skip !== "brand" && brands.size) l = l.filter((m) => brands.has(m.brand));
      if (skip !== "status" && statuses.size) l = l.filter((m) => statuses.has(m.status));
      if (skip !== "price" && price) {
        const r = PRICE_RANGES.find((x) => x.key === price)!;
        l = l.filter((m) => eff(m) >= r.min && eff(m) < r.max);
      }
      if (skip !== "cc" && cc) {
        const r = CC_RANGES.find((x) => x.key === cc)!;
        l = l.filter((m) => m.cc >= r.min && m.cc < r.max);
      }
      const query = q.trim().toLowerCase();
      if (query) l = l.filter((m) => `${m.brand} ${m.model}`.toLowerCase().includes(query));
      return l;
    };
  }, [brands, statuses, price, cc, q]);

  const list = useMemo(() => {
    const l = applyFilters(motos).slice();
    if (sort === "priceAsc") l.sort((a, b) => eff(a) - eff(b));
    else if (sort === "priceDesc") l.sort((a, b) => eff(b) - eff(a));
    else l.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return l;
  }, [motos, applyFilters, sort]);

  const activeCount = brands.size + statuses.size + (price ? 1 : 0) + (cc ? 1 : 0);
  const clearAll = () => { setBrands(new Set()); setStatuses(new Set()); setPrice(null); setCc(null); };

  const countBy = (skip: "brand" | "status" | "price" | "cc", pred: (m: Moto) => boolean) =>
    applyFilters(motos, skip).filter(pred).length;

  const sidebar = (
    <>
      <FilterGroup title={t("Брэнд")}>
        {allBrands.map((b) => (
          <CheckRow key={b} label={b} count={countBy("brand", (m) => m.brand === b)} checked={brands.has(b)} onToggle={() => setBrands((s) => toggleSet(s, b))} />
        ))}
      </FilterGroup>
      <FilterGroup title={t("Төлөв")}>
        {allStatuses.map((s) => (
          <CheckRow key={s} label={t(statusLabel(s))} count={countBy("status", (m) => m.status === s)} checked={statuses.has(s)} onToggle={() => setStatuses((x) => toggleSet(x, s))} />
        ))}
      </FilterGroup>
      <FilterGroup title={t("Багтаамж")}>
        {CC_RANGES.map((r) => (
          <CheckRow key={r.key} label={t(r.label)} count={countBy("cc", (m) => m.cc >= r.min && m.cc < r.max)} checked={cc === r.key} onToggle={() => setCc((p) => (p === r.key ? null : r.key))} />
        ))}
      </FilterGroup>
      <FilterGroup title={t("Үнэ")}>
        {PRICE_RANGES.map((r) => (
          <CheckRow key={r.key} label={t(r.label)} count={countBy("price", (m) => eff(m) >= r.min && eff(m) < r.max)} checked={price === r.key} onToggle={() => setPrice((p) => (p === r.key ? null : r.key))} />
        ))}
      </FilterGroup>
    </>
  );

  const toolbar = (
    <>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("Хайх: model...")}
        className="mh-input mh-ls-search"
        style={sx("background:#111113;border:1px solid #262626;border-radius:9px;padding:11px 15px;color:#fff;font:400 14px Roboto;width:170px;outline:none;")}
      />
      <div style={{ minWidth: 175 }}>
        <Select
          value={sort}
          onChange={(v) => setSort(v as SortKey)}
          ariaLabel={t("Эрэмбэлэх")}
          full
          options={[
            { value: "featured", label: t("Онцлох эхэндээ") },
            { value: "priceAsc", label: t("Үнэ: өсөхөөр") },
            { value: "priceDesc", label: t("Үнэ: буурахаар") },
          ]}
        />
      </div>
    </>
  );

  return (
    <ListingShell
      title="Motorcycles"
      count={list.length}
      countLabel={t("мотоцикл олдлоо")}
      sidebar={sidebar}
      toolbar={toolbar}
      onClear={clearAll}
      activeCount={activeCount}
    >
      <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:18px;")}>
        {list.map((m) => (
          <MotoCard key={m.id} m={m} showCc />
        ))}
      </div>
      {list.length === 0 && (
        <div style={sx("padding:50px 20px;text-align:center;font:500 14px Roboto;color:#8A8F98;")}>
          {t("Энэ шүүлтүүрт тохирох мотоцикл алга. Шүүлтүүрээ цэвэрлэж үзээрэй.")}
        </div>
      )}
    </ListingShell>
  );
}
