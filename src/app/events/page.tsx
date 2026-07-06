import { EventsGrid } from "@/components/EventsGrid";
import { getEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";

const isGiveaway = (t: string) => t.toUpperCase().includes("GIVEAWAY");

export default async function EventsPage() {
  const all = await getEvents();
  return (
    <EventsGrid
      label="COMMUNITY"
      title="Events"
      events={all.filter((e) => !isGiveaway(e.type))}
      emptyText="Одоогоор эвент алга. Тун удахгүй зарлана!"
    />
  );
}
