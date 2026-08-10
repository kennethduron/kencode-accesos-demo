import { LayoutDashboard } from "lucide-react";
import { DemoSectionPage } from "@/components/demo-section-page";

export default function ResidentDashboardPage() {
  return <DemoSectionPage title="Hola, Alejandro" description="Panel conceptual para gestionar visitas y permisos de Casa 27 en Residencial Valle Azul." icon={LayoutDashboard} previewTitle="Panel del residente" previewItems={["Crear una nueva visita", "Consultar códigos activos", "Gestionar permisos familiares", "Revisar actividad reciente"]} nextHref="/demo/residente/nueva-visita" nextLabel="Nueva visita" activeResidentHref="/demo/residente" />;
}

