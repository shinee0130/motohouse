import { EventsGrid } from "@/components/EventsGrid";
import { TravelMapClient } from "@/components/TravelMapClient";
import { getEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";

// Аялал — admin дээр Төрөл нь "АЯЛАЛ" (эсвэл RIDE/TRAVEL/TOUR) гэсэн эвентүүд энд гарна.
const isTravel = (t: string) => {
  const u = t.toUpperCase();
  return u.includes("АЯЛАЛ") || u.includes("RIDE") || u.includes("TRAVEL") || u.includes("TOUR");
};

export default async function TravelPage() {
  const all = await getEvents();
  const travelEvents = all.filter((e) => isTravel(e.type));
  return (
    <>
      <TravelMapClient />
      <EventsGrid
        label="UPCOMING RIDES"
        title="Товлогдсон аяллууд"
        events={travelEvents}
        emptyText="Одоогоор товлогдсон аялал алга. Map дээрх route-уудаас аяллын санаа аваарай."
      />
    </>
  );
}
