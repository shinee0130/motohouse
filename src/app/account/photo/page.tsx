"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sx } from "@/lib/ui/sx";
import { Price } from "@/lib/reference/currency";
import { useAuth } from "@/lib/auth/auth";
import { useI18n } from "@/lib/i18n";
import { getMyPhotoOrders, type PhotoBooking } from "@/lib/db/admin";

// Захиалгын төлөв — badge
function stBadge(status: string): string {
  const b = "font:700 11px Montserrat;letter-spacing:.04em;padding:5px 11px;border-radius:6px;display:inline-block;";
  if (status === "Баталгаажсан") return b + "color:#22c55e;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.35);";
  if (status === "Дууссан") return b + "color:#fff;background:#E10613;";
  if (status === "Цуцлагдсан") return b + "color:#ef4444;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.35);";
  return b + "color:#f59e0b;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.35);";
}

export default function MyPhotoBookingsPage() {
  const { user, ready } = useAuth();
  const { t } = useI18n();
  const [list, setList] = useState<PhotoBooking[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user?.phone) { setLoaded(true); return; }
    getMyPhotoOrders(user.phone).then((r) => { setList(r); setLoaded(true); });
  }, [ready, user?.phone]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1 style={sx("font:800 22px Montserrat;color:#fff;text-transform:uppercase;")}>{t("Зураг авалтын захиалга")}</h1>
        <Link href="/photo" style={sx("font:600 13px Montserrat;color:#E10613;text-decoration:none;")}>{t("Шинэ захиалга")} →</Link>
      </div>

      {!loaded ? (
        <div style={sx("padding:30px;text-align:center;font:400 14px Roboto;color:#8A8F98;")}>{t("Ачаалж байна…")}</div>
      ) : list.length === 0 ? (
        <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;padding:34px;text-align:center;")}>
          <div style={sx("font:400 14px Roboto;color:#8A8F98;")}>{t("Танд зураг авалтын захиалга байхгүй байна.")}</div>
          <Link href="/photo" style={sx("display:inline-block;margin-top:16px;background:#E10613;color:#fff;font:700 13px Montserrat;padding:12px 22px;border-radius:10px;text-decoration:none;")}>
            {t("Зурагчид үзэх")}
          </Link>
        </div>
      ) : (
        <div style={sx("background:#111113;border:1px solid #262626;border-radius:14px;overflow:hidden;")}>
          {list.map((b) => (
            <div key={b.id} style={sx("display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:16px 18px;border-bottom:1px solid #1c1c1f;")}>
              <div style={{ minWidth: 210 }}>
                <div style={sx("font:700 15px Montserrat;color:#fff;")}>📸 {b.photographer}</div>
                <div style={sx("font:500 13px Roboto;color:#C8C8C8;margin-top:3px;")}>{t(b.service_type)}</div>
                <div style={sx("font:600 13px Roboto;color:#E10613;margin-top:3px;")}>📅 {b.booking_date} · {b.booking_time}</div>
                {b.note && <div style={sx("font:400 12px Roboto;color:#8A8F98;margin-top:4px;")}>“{b.note}”</div>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ textAlign: "right" }}>
                  {b.price ? <div style={sx("font:700 15px Montserrat;color:#fff;")}><Price amount={b.price} /></div> : null}
                  {b.deposit ? (
                    <div style={sx("font:500 11px Roboto;color:#8A8F98;margin-top:2px;")}>
                      {b.payment_status === "paid" ? t("Урьдчилгаа төлсөн") : t("Урьдчилгаа")}: <Price amount={b.deposit} />
                    </div>
                  ) : null}
                  {b.price && b.deposit && b.payment_status === "paid" ? (
                    <div style={sx("font:500 11px Roboto;color:#8A8F98;")}>{t("Үлдэгдэл")}: <Price amount={b.price - b.deposit} /></div>
                  ) : null}
                </div>
                <span style={sx(stBadge(b.status))}>{b.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
