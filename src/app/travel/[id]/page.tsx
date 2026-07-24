import { notFound } from "next/navigation";
import { getTour } from "@/lib/db/queries";
import { TourDetail } from "@/components/travel/TourDetail";

export const dynamic = "force-dynamic";

export default async function TourPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await getTour(Number(id));
  if (!tour) notFound();
  return <TourDetail tour={tour} />;
}
