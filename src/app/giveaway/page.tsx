import { EventsGrid } from "@/components/events/EventsGrid";
import { getEvents } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function GiveawayPage() {
  const all = await getEvents();
  return (
    <EventsGrid
      label="WIN BIG"
      title="Giveaway"
      events={all.filter((e) => e.type.toUpperCase().includes("GIVEAWAY"))}
      emptyText="Одоогоор идэвхтэй Giveaway алга. Тун удахгүй!"
    />
  );
}
