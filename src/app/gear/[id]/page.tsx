import { notFound } from "next/navigation";
import { GearDetail } from "@/components/gear/GearDetail";
import { getGearAll, relatedOf } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function GearDetailPage({ params }: PageProps<"/gear/[id]">) {
  const { id } = await params;
  const all = await getGearAll();
  const item = all.find((g) => g.id === Number(id));
  if (!item) notFound();

  const related = relatedOf(item, all);
  const more = all.filter((g) => g.id !== item.id).slice(0, 6);

  return <GearDetail item={item} related={related} more={more} />;
}
