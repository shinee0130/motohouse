import { MotorcyclesClient } from "@/components/MotorcyclesClient";
import { getMotos } from "@/lib/queries";

// Admin засвар шууд харагдахаар — DB-ээс амьд уншина (cache-гүй)
export const dynamic = "force-dynamic";

export default async function MotorcyclesPage() {
  const motos = await getMotos();
  return <MotorcyclesClient motos={motos} />;
}
