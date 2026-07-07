import { TravelMapClient } from "@/components/TravelMapClient";
import { TourList } from "@/components/TourList";
import { getTours } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function TravelPage() {
  const tours = await getTours();
  return (
    <>
      <TravelMapClient />
      <TourList tours={tours} />
    </>
  );
}
