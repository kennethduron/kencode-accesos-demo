import { Building2 } from "lucide-react";
import { DemoSectionPage } from "@/components/demo-section-page";

export default function AdminPage() {
  return <DemoSectionPage title="Administración residencial" description="Punto de partida conceptual para una visión general de accesos, viviendas y actividad operativa." icon={Building2} previewTitle="Resumen administrativo" previewItems={["Actividad general", "Accesos por estado", "Viviendas registradas", "Historial operativo"]} />;
}
