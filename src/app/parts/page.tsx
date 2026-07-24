import { GearClient } from "@/components/gear/GearClient";
import { getGearAll } from "@/lib/db/queries";
import { isPart } from "@/lib/db/data";

export const dynamic = "force-dynamic";

export default async function PartsPage({ searchParams }: { searchParams: Promise<{ brand?: string }> }) {
  const gear = await getGearAll();
  const initialBrand = (await searchParams).brand || "all";
  return (
    <GearClient
      gear={gear.filter(isPart)}
      label="PERFORMANCE PARTS"
      title="Сэлбэг"
      desc="Яндан, дугуй, батерей болон тогтмол солих сэлбэгүүдийг олон улсын захиалгад тохируулан бэлтгэх боломжтой."
      baseHref="/parts"
      initialBrand={initialBrand}
    />
  );
}
