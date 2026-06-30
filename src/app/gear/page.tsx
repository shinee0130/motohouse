import { GearClient } from "@/components/GearClient";
import { getGearAll } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function GearPage() {
  const gear = await getGearAll();
  return <GearClient gear={gear} />;
}
