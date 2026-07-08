import { TravelMapClient } from "@/components/TravelMapClient";
import { TourList } from "@/components/TourList";
import { getTours, getRideRoutes } from "@/lib/queries";

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
