import { TravelMapClient } from "@/components/travel/TravelMapClient";
import { TourList } from "@/components/travel/TourList";
import { getTours, getRideRoutes } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function TravelPage() {
  const [tours, routes] = await Promise.all([getTours(), getRideRoutes()]);
  return (
    <>
      <TravelMapClient routes={routes} />
      <TourList tours={tours} />
    </>
  );
}
