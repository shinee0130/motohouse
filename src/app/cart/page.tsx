"use client";

import { sx } from "@/lib/sx";
import { useI18n } from "@/lib/i18n";
import { CartBody } from "@/components/CartBody";

export default function CartPage() {
  const { t } = useI18n();

  return (
    <div style={sx("max-width:920px;margin:0 auto;padding:clamp(32px,5vw,56px) clamp(20px,4vw,40px);animation:mhfade .5s both;")}>
      <div style={sx("font:500 12px 'JetBrains Mono';letter-spacing:.24em;color:#E10613;")}>CART</div>
      <h1 style={sx("font:800 clamp(30px,5vw,46px) Montserrat;color:#fff;margin-top:6px;text-transform:uppercase;margin-bottom:26px;")}>
        {t("Миний сагс")}
      </h1>
      <CartBody />
    </div>
  );
}
