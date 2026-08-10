import { QrCode } from "lucide-react";
import { DemoSectionPage } from "@/components/demo-section-page";

export default function CodigoPage() {
  return <DemoSectionPage title="Acceso generado" description="Vista conceptual del código alfanumérico y su representación QR para compartir con el visitante." icon={QrCode} previewTitle="Autorización A7X9-2K4P" previewItems={["Estado activo", "Visitante: María Gómez", "Vehículo: Toyota Corolla", "Vigencia visible"]} nextHref="/demo/seguridad" nextLabel="Ver validación" activeResidentHref="/demo/residente/codigo" />;
}

