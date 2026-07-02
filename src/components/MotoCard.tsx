import Link from "next/link";
import { sx } from "@/lib/sx";
import { Slot } from "./Slot";
import { fmt, badge, statusLabel, type Moto } from "@/lib/data";

// Жагсаалт / онцлох хэсэгт ашиглах мотоциклын карт.
export function MotoCard({ m, showCc = false }: { m: Moto; showCc?: boolean }) {
  const priceEl = m.salePrice ? (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
      <span style={sx("font:500 13px Montserrat;color:#6b7280;text-decoration:line-through;")}>{fmt(m.price)}</span>
      <span style={sx("font:700 17px Montserrat;color:#E10613;")}>{fmt(m.salePrice)}</span>
    </span>
  ) : (
    <span style={sx("font:700 17px Montserrat;color:#E10613;")}>{fmt(m.price)}</span>
  );
  return (
    <Link
      href={`/motorcycles/${m.id}`}
      className="mh-card"
      style={sx(
        "cursor:pointer;background:#111113;border:1px solid #262626;border-radius:16px;overflow:hidden;display:block;",
      )}
    >
      <div style={{ position: "relative", height: 190, background: "#0d0d0f" }}>
        {m.images && m.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.images[0]}
            alt={`${m.brand} ${m.model}`}
            style={sx("position:absolute;inset:0;width:100%;height:100%;object-fit:contain;")}
          />
        ) : (
          <Slot label="Мотоцикл зураг" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        )}
        <span style={{ position: "absolute", top: 12, left: 12, zIndex: 2, ...sx(badge(m.status)) }}>
          {statusLabel(m.status)}
        </span>
      </div>
      <div style={{ padding: "18px 20px" }}>
        <div style={sx("font:700 19px Montserrat;color:#fff;")}>
          {m.brand} {m.model}
        </div>
        <div style={sx("font:400 13px Roboto;color:#8A8F98;margin-top:5px;")}>
          {m.year} · ODO {m.odo.toLocaleString("en-US")}km
        </div>
        {showCc ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            {priceEl}
            <span style={sx("font:600 12px 'JetBrains Mono';color:#8A8F98;")}>{m.cc}cc</span>
          </div>
        ) : (
          <div style={{ marginTop: 10 }}>{priceEl}</div>
        )}
      </div>
    </Link>
  );
}
