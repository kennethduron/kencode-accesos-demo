"use client";

import { Clipboard, Download, LoaderCircle, Share2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildAccessShareModel,
  buildAccessShareText,
  getShareCapability,
  isShareCancellation,
  type AccessShareVariant,
} from "@/lib/access-share";
import type { AccessStatus, Authorization } from "@/types/demo";

interface ShareAccessButtonProps {
  authorization: Authorization;
  status: AccessStatus;
  label?: string;
  variant?: AccessShareVariant;
}

export function ShareAccessButton({
  authorization,
  status,
  label = "Compartir acceso",
  variant = "access",
}: ShareAccessButtonProps) {
  const model = useMemo(() => buildAccessShareModel(authorization, status, variant), [authorization, status, variant]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadCode, setDownloadCode] = useState("");
  const [showFallbacks, setShowFallbacks] = useState(false);
  const [fallbackCode, setFallbackCode] = useState("");
  const busyRef = useRef(false);
  const downloadUrlRef = useRef("");
  const downloadCodeRef = useRef("");

  useEffect(() => () => {
    if (downloadUrlRef.current) URL.revokeObjectURL(downloadUrlRef.current);
  }, []);

  function retainDownload(blob: Blob) {
    if (downloadUrlRef.current) URL.revokeObjectURL(downloadUrlRef.current);
    const url = URL.createObjectURL(blob);
    downloadUrlRef.current = url;
    downloadCodeRef.current = model.code;
    setDownloadUrl(url);
    setDownloadCode(model.code);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(model.code);
      setMessage("Código copiado.");
    } catch {
      setMessage("No fue posible copiar automáticamente. Usa el código mostrado en pantalla.");
    }
  }

  async function share() {
    if (busyRef.current || !model.shareable) return;
    busyRef.current = true;
    setBusy(true);
    setShowFallbacks(false);
    setFallbackCode(model.code);
    setMessage("Preparando acceso para compartir…");

    try {
      const { createAccessShareCard } = await import("@/lib/create-access-share-card");
      const blob = await createAccessShareCard(model);
      const file = new File([blob], model.filename, { type: "image/png", lastModified: Date.now() });
      retainDownload(blob);
      setShowFallbacks(true);
      setMessage("Tarjeta lista.");

      const capability = getShareCapability(navigator, [file]);
      const title = `ECOTERRA | ${variant === "family" ? "Permiso de visita" : "Acceso autorizado"}`;
      const text = buildAccessShareText(model);

      if (capability === "files") {
        await navigator.share({ files: [file], title, text });
        setMessage("Compartido correctamente.");
      } else if (capability === "text") {
        await navigator.share({ title, text });
        setMessage("Tarjeta lista. Este navegador compartió el código como texto.");
      } else {
        setShowFallbacks(true);
        setFallbackCode(model.code);
        setMessage("Tarjeta lista. Puedes descargarla o copiar el código.");
      }
    } catch (error) {
      if (isShareCancellation(error)) {
        setMessage(downloadUrlRef.current ? "Tarjeta lista." : "Compartir cancelado.");
      } else {
        setShowFallbacks(true);
        setFallbackCode(model.code);
        setMessage(
          downloadUrlRef.current && downloadCodeRef.current === model.code
            ? "No fue posible compartir la imagen. Puedes descargarla o copiar el código."
            : "No fue posible preparar la imagen. Puedes copiar el código mostrado en pantalla.",
        );
      }
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={() => void share()}
        disabled={busy || !model.shareable}
        aria-busy={busy}
        aria-describedby={`share-status-${authorization.id}`}
        className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-55"
      >
        {busy ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin" /> : <Share2 aria-hidden="true" className="size-5" />}
        {busy ? "Preparando acceso…" : label}
      </button>

      {showFallbacks && model.shareable && fallbackCode === model.code ? (
        <div className={`mt-3 grid gap-2 ${downloadUrl && downloadCode === model.code ? "sm:grid-cols-2" : ""}`}>
          {downloadUrl && downloadCode === model.code ? (
            <a href={downloadUrl} download={model.filename} className="secondary-button inline-flex w-full gap-2">
              <Download aria-hidden="true" className="size-4" />
              Descargar tarjeta
            </a>
          ) : null}
          <button type="button" onClick={() => void copyCode()} className="secondary-button inline-flex w-full gap-2">
            <Clipboard aria-hidden="true" className="size-4" />
            Copiar código
          </button>
        </div>
      ) : null}

      <p
        id={`share-status-${authorization.id}`}
        className={`mt-2 min-h-5 text-center text-xs font-semibold sm:text-left ${model.shareable ? "text-emerald-700" : "text-slate-500"}`}
        aria-live="polite"
      >
        {model.shareable ? message : "Este acceso no está vigente y no puede compartirse."}
      </p>
    </div>
  );
}
