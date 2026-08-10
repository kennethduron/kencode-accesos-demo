import { UserRoundPlus } from "lucide-react";
import { DemoSectionPage } from "@/components/demo-section-page";

export default function NuevaVisitaPage() {
  return <DemoSectionPage title="Nueva visita" description="Formulario conceptual para preparar una autorización antes de la llegada del visitante." icon={UserRoundPlus} previewTitle="Datos de la autorización" previewItems={["Tipo de visita", "Visitante y vehículo", "Fecha y hora", "Vigencia del permiso"]} nextHref="/demo/residente/codigo" nextLabel="Ver acceso generado" activeResidentHref="/demo/residente/nueva-visita" />;
}

