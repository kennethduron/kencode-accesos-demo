"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";
import type { Authorization } from "@/types/demo";

export function ShareAccessButton({ authorization, label = "Compartir acceso" }: { authorization: Authorization; label?: string }) {
  const [message, setMessage] = useState("");

  async function share() {
    const text = `Acceso de demostración Ken Code\nCódigo: ${authorization.code}\nPresente este código o QR al llegar.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Acceso de visitante", text });
        setMessage("Opciones para compartir abiertas.");
        return;
      }
      await navigator.clipboard.writeText(text);
      setMessage("Código copiado al portapapeles.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("No fue posible compartir. Puedes copiar el código mostrado.");
    }
  }

  return (
    <div>
      <button type="button" onClick={share} className="primary-button w-full sm:w-auto">
        <Share2 aria-hidden="true" className="size-5" />
        {label}
      </button>
      <p className="mt-2 min-h-5 text-center text-xs font-semibold text-emerald-700 sm:text-left" aria-live="polite">{message}</p>
    </div>
  );
}
