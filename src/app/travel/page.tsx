import { EventsGrid } from "@/components/EventsGrid";
import { getEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";

// Аялал — admin дээр Төрөл нь "АЯЛАЛ" (эсвэл RIDE/TRAVEL/TOUR) гэсэн эвентүүд энд гарна.
const isTravel = (t: string) => {
  const u = t.toUpperCase();
  return u.includes("АЯЛАЛ") || u.includes("RIDE") || u.includes("TRAVEL") || u.includes("TOUR");
};

export default async function TravelPage() {
  const all = await getEvents();
  return (
    <EventsGrid
      label="GROUP RIDE"
      title="Аялал"
      events={all.filter((e) => isTravel(e.type))}
      emptyText="Одоогоор товлогдсон аялал алга. Тун удахгүй зарлана — хамт аялцгаая! 🏍"
    />
  );
}
