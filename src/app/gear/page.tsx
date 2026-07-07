import { GearClient } from "@/components/GearClient";
import { getGearAll } from "@/lib/queries";
import { isPart } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function GearPage({ searchParams }: { searchParams: Promise<{ for?: string }> }) {
  const gear = await getGearAll();
  const forParam = (await searchParams).for;
  const initialGender = forParam === "women" || forParam === "men" ? forParam : "all";
  return (
    <GearClient
      gear={gear.filter((g) => !isPart(g))}
      label="RIDER GEAR"
      title="Дагалдах хэрэгсэл"
      desc="Каск, бээлий, хамгаалалтын хувцас, intercom болон riding gear-ийг Монголд худалдаалж, гадаад захиалгад бэлтгэнэ."
      initialGender={initialGender}
    />
  );
}
