import { getGearAll, getMotos } from "@/lib/db/queries";
import { SearchResults } from "@/components/listing/SearchResults";

export const dynamic = "force-dynamic";

// Хайлт — header-ийн search bar эндэрүү илгээнэ (?q=). Мотоцикл + бараа/сэлбэгээс хайна.
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q || "").trim();
  const [gear, motos] = await Promise.all([getGearAll(), getMotos()]);
  return <SearchResults q={q} gear={gear} motos={motos} />;
}
