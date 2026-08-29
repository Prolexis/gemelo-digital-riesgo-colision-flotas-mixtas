import EquipmentTwinViewer from "@/components/EquipmentTwinViewer";

// En producción: fetch a GET /api/v1/equipment/{id}
const MOCK_STATUS = "alerta" as const;

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen p-8">
      <h1 className="mb-4 text-2xl font-bold">Equipo #{id}</h1>
      <EquipmentTwinViewer status={MOCK_STATUS} />
      <p className="mt-4 text-sm text-slate-400">
        Arrastra para rotar el gemelo digital. El color refleja el estado de condición del
        equipo (óptimo / alerta / crítico).
      </p>
    </main>
  );
}
