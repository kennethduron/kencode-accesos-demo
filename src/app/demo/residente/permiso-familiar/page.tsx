import { UsersRound } from "lucide-react";
import { DemoSectionPage } from "@/components/demo-section-page";

export default function PermisoFamiliarPage() {
  return <DemoSectionPage title="Permiso para familiar" description="Permiso temporal conceptual con múltiples entradas y salidas durante una vigencia de 24 o 48 horas." icon={UsersRound} previewTitle="Permiso temporal activo" previewItems={["Familiar: María Gómez", "Vivienda: Casa 27", "Duración: 48 horas", "Entradas y salidas permitidas"]} nextHref="/demo/residente/historial" nextLabel="Consultar historial" activeResidentHref="/demo/residente" />;
}

