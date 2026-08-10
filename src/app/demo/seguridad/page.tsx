import { ScanLine } from "lucide-react";
import { DemoSectionPage } from "@/components/demo-section-page";

export default function SeguridadPage() {
  return <DemoSectionPage title="Validar acceso" description="Experiencia conceptual para que seguridad revise un QR o código y reconozca su estado en segundos." icon={ScanLine} previewTitle="Validación para seguridad" previewItems={["Escaneo QR conceptual", "Ingreso manual de código", "Estados claros de autorización", "Confirmación de entrada"]} nextHref="/demo/residente/historial" nextLabel="Ver registro resultante" />;
}

