import { EventsGrid } from "@/components/events/EventsGrid";
import { getEvents } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

const isGiveaway = (t: string) => t.toUpperCase().includes("GIVEAWAY");

export default async function EventsPage() {
  const all = await getEvents();
  return (
    <EventsGrid
      label="COMMUNITY"
      title="Event"
      events={all.filter((e) => !isGiveaway(e.type))}
      emptyText="Одоогоор Event алга. Тун удахгүй зарлана!"
    />
  );
}
