import { History } from "lucide-react";
import { DemoSectionPage } from "@/components/demo-section-page";

export default function HistorialPage() {
  return <DemoSectionPage title="Historial de accesos" description="Consulta conceptual de visitas y movimientos asociados a la vivienda." icon={History} previewTitle="Actividad de Casa 27" previewItems={["Visitas activas", "Códigos utilizados", "Permisos finalizados", "Filtros por estado y fecha"]} activeResidentHref="/demo/residente/historial" />;
}

