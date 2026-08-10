import { QrCode } from "lucide-react";

export function QrPlaceholder() {
  return (
    <div className="grid aspect-square w-full max-w-56 place-items-center rounded-3xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 text-center">
      <div>
        <QrCode aria-hidden="true" className="mx-auto size-16 text-blue-600" />
        <p className="mt-3 text-sm font-extrabold text-blue-950">Espacio reservado para QR</p>
        <p className="mt-1 text-xs leading-5 text-blue-700">No escaneable · Disponible en Fase 2</p>
      </div>
    </div>
  );
}
