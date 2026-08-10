"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { buildQrPayload } from "@/lib/qr";

export function AccessQr({ code, size = 256 }: { code: string; size?: number }) {
  const [source, setSource] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(buildQrPayload(code), {
      errorCorrectionLevel: "M",
      margin: 4,
      width: size,
      color: { dark: "#07142FFF", light: "#FFFFFFFF" },
    })
      .then((value) => {
        if (active) setSource(value);
      })
      .catch(() => {
        if (active) setError("No fue posible generar el QR.");
      });
    return () => {
      active = false;
    };
  }, [code, size]);

  if (error) return <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>;
  if (!source) return <div className="grid aspect-square w-full max-w-64 animate-pulse place-items-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-500">Generando QR…</div>;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- The QR data URL is generated locally at runtime.
    <img src={source} width={size} height={size} alt={`Código QR de acceso ${code}`} className="aspect-square h-auto w-full max-w-64 rounded-2xl bg-white" />
  );
}
