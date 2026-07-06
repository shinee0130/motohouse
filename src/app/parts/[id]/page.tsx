import { notFound } from "next/navigation";
import { GearDetail } from "@/components/GearDetail";
import { isPart } from "@/lib/data";
import { getGearAll, relatedOf } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PartsDetailPage({ params }: PageProps<"/parts/[id]">) {
  const { id } = await params;
  const parts = (await getGearAll()).filter(isPart);
  const item = parts.find((g) => g.id === Number(id));
  if (!item) notFound();

  const related = relatedOf(item, parts);
  const more = parts.filter((g) => g.id !== item.id).slice(0, 6);

  return <GearDetail item={item} related={related} more={more} baseHref="/parts" baseLabel="Parts" />;
}
