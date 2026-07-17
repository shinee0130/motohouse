import { MotorcyclesClient } from "@/components/MotorcyclesClient";
import { getMotos } from "@/lib/queries";

// Admin засвар шууд харагдахаар — DB-ээс амьд уншина (cache-гүй)
export const dynamic = "force-dynamic";

export default async function MotorcyclesPage({ searchParams }: { searchParams: Promise<{ brand?: string }> }) {
  const motos = await getMotos();
  const initialBrand = (await searchParams).brand;
  return <MotorcyclesClient motos={motos} initialBrand={initialBrand} />;
}
