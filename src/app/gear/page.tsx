import { GearClient } from "@/components/GearClient";
import { getGearAll } from "@/lib/queries";

export default async function GearPage() {
  const gear = await getGearAll();
  return <GearClient gear={gear} />;
}
