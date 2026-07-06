import { GearClient } from "@/components/GearClient";
import { getGearAll } from "@/lib/queries";
import { isPart } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function GearPage() {
  const gear = await getGearAll();
  return (
    <GearClient
      gear={gear.filter((g) => !isPart(g))}
      label="RIDER GEAR"
      title="Дагалдах хэрэгсэл"
      desc="Каск, хувцас, бээлий, хамгаалалт, intercom — албан ёсны брэндүүд."
    />
  );
}
