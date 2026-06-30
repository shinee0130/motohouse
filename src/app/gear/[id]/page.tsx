import { notFound } from "next/navigation";
import { GearDetail } from "@/components/GearDetail";
import { getGearAll, relatedOf } from "@/lib/queries";

export async function generateStaticParams() {
  const gear = await getGearAll();
  return gear.map((g) => ({ id: String(g.id) }));
}

export default async function GearDetailPage({ params }: PageProps<"/gear/[id]">) {
  const { id } = await params;
  const all = await getGearAll();
  const item = all.find((g) => g.id === Number(id));
  if (!item) notFound();

  const related = relatedOf(item, all);
  const more = all.filter((g) => g.id !== item.id).slice(0, 6);

  return <GearDetail item={item} related={related} more={more} />;
}
