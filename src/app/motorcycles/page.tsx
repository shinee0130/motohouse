import { MotorcyclesClient } from "@/components/MotorcyclesClient";
import { getMotos } from "@/lib/queries";

export default async function MotorcyclesPage() {
  const motos = await getMotos();
  return <MotorcyclesClient motos={motos} />;
}
