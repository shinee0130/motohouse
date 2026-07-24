import { notFound } from "next/navigation";
import { getPhotographer } from "@/lib/db/queries";
import { PhotoDetail } from "../PhotoDetail";

export const dynamic = "force-dynamic";

export default async function PhotographerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getPhotographer(Number(id));
  if (!p) notFound();
  return <PhotoDetail p={p} />;
}
