import { EventsGrid } from "@/components/EventsGrid";
import { getEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function GiveawayPage() {
  const all = await getEvents();
  return (
    <EventsGrid
      label="WIN BIG"
      title="Сугалаа"
      events={all.filter((e) => e.type.toUpperCase().includes("GIVEAWAY"))}
      emptyText="Одоогоор идэвхтэй giveaway алга. Тун удахгүй!"
    />
  );
}
