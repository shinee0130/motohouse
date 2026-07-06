import { GearClient } from "@/components/GearClient";
import { getGearAll } from "@/lib/queries";
import { isPart } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PartsPage() {
  const gear = await getGearAll();
  return (
    <GearClient
      gear={gear.filter(isPart)}
      label="PERFORMANCE PARTS"
      title="Сэлбэг"
      desc="Яндан, дугуй, батерей болон performance сэлбэг — тохирох моделиудтай нь."
    />
  );
}
