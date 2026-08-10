import { ClipboardCheck } from "lucide-react";
import { DemoSectionPage } from "@/components/demo-section-page";

export default function RegistroPage() {
  return <DemoSectionPage title="Crear cuenta" description="Registro conceptual del residente y su vivienda, sin autenticación ni almacenamiento real en esta fase." icon={ClipboardCheck} previewTitle="Alta del residente" previewItems={["Datos personales básicos", "Información residencial", "Verificación conceptual", "Aviso de privacidad"]} nextHref="/demo/residente" nextLabel="Continuar como residente" />;
}

