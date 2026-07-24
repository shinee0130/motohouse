import { GearClient } from "@/components/gear/GearClient";
import { getGearAll } from "@/lib/db/queries";
import { isPart } from "@/lib/db/data";

export const dynamic = "force-dynamic";

export default async function GearPage({ searchParams }: { searchParams: Promise<{ for?: string; brand?: string; cat?: string }> }) {
  const gear = await getGearAll();
  const sp = await searchParams;
  const initialGender = sp.for === "women" || sp.for === "men" ? sp.for : "all";
  const initialBrand = sp.brand || "all";
  const initialCat = sp.cat || "All";
  return (
    <GearClient
      gear={gear.filter((g) => !isPart(g))}
      label="RIDER GEAR"
      title="Дагалдах хэрэгсэл"
      desc="Каск, бээлий, хамгаалалтын хувцас, intercom болон riding gear-ийг Монголд худалдаалж, гадаад захиалгад бэлтгэнэ."
      initialGender={initialGender}
      initialBrand={initialBrand}
      initialCat={initialCat}
    />
  );
}
