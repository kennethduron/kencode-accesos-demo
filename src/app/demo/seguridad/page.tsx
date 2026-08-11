"use client";

import Link from "next/link";
import {
  AlertCircle,
  CalendarClock,
  Camera,
  CameraOff,
  Car,
  CheckCircle2,
  ClockAlert,
  DoorOpen,
  Home,
  Keyboard,
  LogOut,
  RotateCcw,
  SearchX,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { AccessValidationOverlay } from "@/components/access-validation-overlay";
import { DemoBadge } from "@/components/demo-badge";
import { entryTypeLabels, formatDemoDate, formatDemoTime, normalizeAccessCode, validateAccess, visitTypeLabels } from "@/lib/access";
import { createAccessValidationGate, type ValidationSource } from "@/lib/access-validation-feedback";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { parseQrPayload } from "@/lib/qr";
import { getAccessRepository } from "@/repositories";
import type { AccessValidationResult, Authorization, ValidationResultCode } from "@/types/demo";

type ScanControls = { stop: () => void };

const resultContent: Record<ValidationResultCode, { title: string; description: string; tone: string; icon: typeof CheckCircle2 }> = {
  AUTHORIZED: { title: "ACCESO AUTORIZADO", description: "El visitante puede ingresar.", tone: "border-emerald-200 bg-emerald-50 text-emerald-800", icon: CheckCircle2 },
  INSIDE: { title: "VISITANTE DENTRO", description: "Este visitante tiene una entrada activa en la residencial.", tone: "border-cyan-200 bg-cyan-50 text-cyan-900", icon: DoorOpen },
  EXPIRED: { title: "ACCESO VENCIDO", description: "La vigencia de este permiso finalizó.", tone: "border-red-200 bg-red-50 text-red-800", icon: ClockAlert },
  USED: { title: "CÓDIGO YA UTILIZADO", description: "Este permiso de un ingreso ya fue consumido.", tone: "border-slate-300 bg-slate-100 text-slate-800", icon: AlertCircle },
  CANCELLED: { title: "ACCESO CANCELADO", description: "El residente revocó esta autorización.", tone: "border-red-200 bg-red-50 text-red-800", icon: XCircle },
  NOT_FOUND: { title: "CÓDIGO NO ENCONTRADO", description: "No existe una autorización asociada a este código.", tone: "border-amber-200 bg-amber-50 text-amber-900", icon: SearchX },
  INVALID_FORMAT: { title: "FORMATO NO VÁLIDO", description: "Revise el código o escanee un QR válido de esta demostración.", tone: "border-amber-200 bg-amber-50 text-amber-900", icon: AlertCircle },
  NOT_YET_VALID: { title: "ACCESO TODAVÍA NO VIGENTE", description: "La autorización aún no ha alcanzado su hora de inicio.", tone: "border-blue-200 bg-blue-50 text-blue-900", icon: CalendarClock },
};

function AuthorizationDetails({ authorization }: { authorization: Authorization }) {
  const rows = [
    ["Visitante", authorization.visitorName, UserRound],
    ["Vivienda", authorization.residenceLabel, Home],
    ["Tipo de visita", visitTypeLabels[authorization.visitType], ShieldCheck],
    ["Tipo de ingreso", entryTypeLabels[authorization.entryType], Car],
    ["Vehículo", authorization.vehicle, Car],
    ["Placa", authorization.plate, Car],
    ["Vigencia", `${formatDemoDate(authorization.scheduledAt)} · ${formatDemoTime(authorization.scheduledAt)} a ${formatDemoTime(authorization.expiresAt)}`, CalendarClock],
    ["Código", authorization.code, ShieldCheck],
  ] as const;
  return <dl className="mt-5 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-4">{rows.map(([label, value, Icon]) => <div key={label} className="grid min-h-14 grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-center gap-3 py-3 text-sm"><dt className="flex items-center gap-2 font-semibold text-slate-500"><Icon aria-hidden="true" className="size-4 shrink-0 text-blue-600" />{label}</dt><dd className="break-words text-right font-extrabold text-slate-950">{value}</dd></div>)}</dl>;
}

export default function SeguridadPage() {
  const online = useOnlineStatus();
  const [method, setMethod] = useState<"scan" | "manual">("scan");
  const [code, setCode] = useState("");
  const [validationState, setValidation] = useState<AccessValidationResult | null>(null);
  const [connecting, setConnecting] = useState(true);
  const [validating, setValidating] = useState(false);
  const [validationSource, setValidationSource] = useState<ValidationSource>("manual");
  const [operation, setOperation] = useState<"entry" | "exit" | null>(null);
  const [confirmed, setConfirmed] = useState<"entry" | "exit" | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraMessage, setCameraMessage] = useState("");
  const [serviceError, setServiceError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<ScanControls | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanRequestRef = useRef(0);
  const scanProcessingRef = useRef(false);
  const [validationGate] = useState(() => createAccessValidationGate());
  const [operationGate] = useState(() => createAccessValidationGate());

  useEffect(() => {
    if (navigator.onLine === false) {
      window.setTimeout(() => setConnecting(false), 0);
      return;
    }
    getAccessRepository().initialize().then(() => setConnecting(false)).catch(() => {
      setConnecting(false);
      setServiceError("No fue posible conectar el servicio de demostración. Intente nuevamente.");
    });
  }, []);

  const stopCamera = useCallback(() => {
    scanRequestRef.current += 1;
    controlsRef.current?.stop();
    controlsRef.current = null;
    const streams = [streamRef.current, videoRef.current?.srcObject].filter((stream): stream is MediaStream => stream instanceof MediaStream);
    streams.forEach((stream) => stream.getTracks().forEach((track) => track.stop()));
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  }, []);

  useEffect(() => stopCamera, [stopCamera]);

  useEffect(() => {
    if (online) return;
    const offlineTimer = window.setTimeout(() => {
      stopCamera();
      setValidation(null);
      setConfirmed(null);
      setServiceError("");
      setCameraMessage("");
    }, 0);
    return () => window.clearTimeout(offlineTimer);
  }, [online, stopCamera]);

  async function validateCode(rawCode: string, source: ValidationSource) {
    if (!online) {
      setValidation(null);
      setConfirmed(null);
      setServiceError("Sin conexión. Se necesita conexión a internet para validar accesos.");
      return;
    }
    try {
      const outcome = await validationGate.run(async () => {
        const normalized = normalizeAccessCode(rawCode);
        const formatResult = validateAccess(normalized, null);
        if (formatResult.code === "INVALID_FORMAT") {
          return { normalized, result: formatResult };
        }

        const authorization = await getAccessRepository().getAuthorizationByCode(normalized);
        if (navigator.onLine === false) throw new Error("Offline validation is not allowed");
        return { normalized, result: validateAccess(normalized, authorization) };
      }, () => {
        stopCamera();
        setValidation(null);
        setConfirmed(null);
        setServiceError("");
        setValidationSource(source);
        setValidating(true);
        if (source === "qr") setCameraMessage("Código QR detectado correctamente.");
      }, () => {
        scanProcessingRef.current = false;
        setValidating(false);
      });

      if (!outcome.started) return;
      if (navigator.onLine === false) {
        setValidation(null);
        setConfirmed(null);
        setServiceError("Sin conexión. Se necesita conexión a internet para validar accesos.");
        return;
      }
      setCode(outcome.value.normalized);
      setValidation(outcome.value.result);
    } catch {
      setServiceError("No fue posible consultar el acceso. Verifique la conexión e intente nuevamente.");
    }
  }

  async function startCamera() {
    if (!online) {
      setCameraMessage("Sin conexión. Se necesita internet antes de iniciar una validación.");
      return;
    }
    if (validationGate.isProcessing() || operationGate.isProcessing()) return;
    const requestId = scanRequestRef.current + 1;
    scanRequestRef.current = requestId;
    scanProcessingRef.current = false;
    setCameraMessage("");
    setValidation(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraMessage("Este navegador no permite usar la cámara. Ingrese el código manualmente.");
      return;
    }
    try {
      setScanning(true);
      setCameraMessage("Solicitando acceso a la cámara…");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      if (requestId !== scanRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
        return;
      }
      streamRef.current = stream;
      if (!videoRef.current) throw new Error("Video unavailable");
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      if (requestId !== scanRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
        return;
      }
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader(undefined, { delayBetweenScanAttempts: 180 });
      setCameraMessage("Apunte la cámara al código QR de ECOTERRA Access.");
      const controls = await reader.decodeFromStream(stream, videoRef.current, (result, _error, callbackControls) => {
        if (!result || scanProcessingRef.current || validationGate.isProcessing() || operationGate.isProcessing()) return;
        scanProcessingRef.current = true;
        callbackControls.stop();
        const parsed = parseQrPayload(result.getText());
        if (!parsed) {
          stopCamera();
          scanProcessingRef.current = false;
          setCameraMessage("El QR detectado no pertenece a esta demostración. Puede intentar nuevamente o ingresar el código.");
          return;
        }
        void validateCode(parsed, "qr");
      });
      if (requestId !== scanRequestRef.current) {
        controls.stop();
        stream.getTracks().forEach((track) => track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
        return;
      }
      controlsRef.current = controls;
    } catch (error) {
      if (requestId !== scanRequestRef.current) return;
      stopCamera();
      scanProcessingRef.current = false;
      const name = error instanceof DOMException ? error.name : "";
      const messages: Record<string, string> = {
        NotAllowedError: "Permiso de cámara denegado. Habilítelo en el navegador o use el código manual.",
        NotFoundError: "No se encontró una cámara disponible. Use el código manual.",
        NotReadableError: "La cámara está ocupada por otra aplicación. Ciérrela o use el código manual.",
      };
      setCameraMessage(messages[name] ?? "No fue posible iniciar la cámara. Use el código manual e intente nuevamente.");
    }
  }

  function changeMethod(next: "scan" | "manual") {
    if (validationGate.isProcessing() || operationGate.isProcessing()) return;
    if (next === "manual") stopCamera();
    setMethod(next);
    setCameraMessage("");
    setValidation(null);
    setConfirmed(null);
  }

  async function confirmEntry() {
    if (!online || !validation?.authorization || validation.code !== "AUTHORIZED") return;
    try {
      const outcome = await operationGate.run(
        () => getAccessRepository().confirmEntry(validation.normalizedCode),
        () => { setServiceError(""); setOperation("entry"); },
        () => setOperation(null),
      );
      if (!outcome.started) return;
      const result = outcome.value;
      if (result.validation.code === "AUTHORIZED" && result.authorization) {
        setValidation({ ...result.validation, authorization: result.authorization });
        setConfirmed("entry");
      } else setValidation(result.validation);
    } catch {
      setServiceError("No fue posible confirmar la entrada. Intente nuevamente.");
    }
  }

  async function confirmExit() {
    if (!online || !validation?.authorization || validation.code !== "INSIDE") return;
    try {
      const outcome = await operationGate.run(
        () => getAccessRepository().confirmExit(validation.normalizedCode),
        () => { setServiceError(""); setOperation("exit"); },
        () => setOperation(null),
      );
      if (!outcome.started) return;
      const result = outcome.value;
      if (result.confirmed && result.authorization) {
        setValidation(validateAccess(result.authorization.code, result.authorization));
        setConfirmed("exit");
      } else if (result.authorization) {
        setValidation(validateAccess(result.authorization.code, result.authorization));
      }
    } catch {
      setServiceError("No fue posible confirmar la salida. Intente nuevamente.");
    }
  }

  const validation: AccessValidationResult = validationState ?? { code: "INVALID_FORMAT", normalizedCode: "", authorization: null };
  const content = validationState ? resultContent[validationState.code] : null;
  const ResultIcon = content?.icon;
  const busy = validating || operation !== null;

  return (
    <div className="min-h-screen bg-slate-50">
      <AccessValidationOverlay open={busy} source={validationSource} mode={operation ?? "validation"} />
      <header className="safe-top border-b border-slate-200 bg-white"><div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"><Link href="/" aria-label="Ken Code, regresar al inicio"><BrandLogo priority className="w-[132px] sm:w-[150px]" /></Link><div className="flex items-center gap-3"><Link href="/" className="hidden min-h-11 items-center text-sm font-bold text-blue-700 sm:inline-flex">Inicio del demo</Link><div className="text-right"><DemoBadge /><p className="mt-1 text-xs font-bold text-slate-500">ECOTERRA · Puesto de Seguridad</p></div></div></div></header>
      <main aria-busy={busy} className="mx-auto grid w-full max-w-7xl gap-7 px-4 py-7 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-10 lg:px-8">
        <section>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-700">Puesto Principal</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Validar acceso</h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">Escanee el QR o ingrese el código del visitante.</p>

          <div className="mt-7 grid grid-cols-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm" role="tablist" aria-label="Método de validación">
            <button type="button" role="tab" aria-selected={method === "scan"} disabled={busy} onClick={() => changeMethod("scan")} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-extrabold disabled:cursor-wait disabled:opacity-60 ${method === "scan" ? "bg-blue-600 text-white" : "text-slate-600"}`}><Camera aria-hidden="true" className="size-5" />Escanear QR</button>
            <button type="button" role="tab" aria-selected={method === "manual"} disabled={busy} onClick={() => changeMethod("manual")} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-sm font-extrabold disabled:cursor-wait disabled:opacity-60 ${method === "manual" ? "bg-blue-600 text-white" : "text-slate-600"}`}><Keyboard aria-hidden="true" className="size-5" />Ingresar código</button>
          </div>

          <div className="surface-card mt-4 overflow-hidden p-5 sm:p-6">
            {method === "scan" ? <div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-950">
                <video ref={videoRef} muted playsInline aria-label="Vista previa de la cámara para escanear QR" className={`h-full w-full object-cover ${scanning ? "block" : "hidden"}`} />
                {!scanning ? <div className="absolute inset-0 grid place-items-center p-6 text-center text-white"><div><span className="mx-auto grid size-16 place-items-center rounded-3xl bg-white/10"><Camera aria-hidden="true" className="size-8 text-cyan-300" /></span><p className="mt-4 font-extrabold">La cámara permanece apagada</p><p className="mt-1 text-sm text-slate-300">Solo se activará cuando usted lo solicite.</p></div></div> : <div aria-hidden="true" className="pointer-events-none absolute inset-[14%] rounded-3xl border-2 border-cyan-300 shadow-[0_0_0_999px_rgba(2,8,23,0.38)]" />}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button type="button" disabled={!online || scanning || connecting || busy} onClick={() => void startCamera()} className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-60"><Camera aria-hidden="true" className="size-5" />Escanear QR</button>
                <button type="button" disabled={!scanning || busy} onClick={() => { stopCamera(); setCameraMessage("Cámara detenida."); }} className="secondary-button inline-flex w-full gap-2 disabled:cursor-not-allowed disabled:opacity-50"><CameraOff aria-hidden="true" className="size-5" />Detener cámara</button>
              </div>
              <p className="mt-3 min-h-6 text-sm font-semibold text-slate-600" aria-live="polite">{cameraMessage}</p>
            </div> : <form onSubmit={(event) => { event.preventDefault(); void validateCode(code, "manual"); }} noValidate>
              <label htmlFor="security-code" className="form-label text-base">Código de acceso</label>
              <input id="security-code" value={code} disabled={!online || busy || connecting} onChange={(event) => setCode(normalizeAccessCode(event.target.value))} inputMode="text" autoCapitalize="characters" autoComplete="off" maxLength={9} placeholder="A7X9-2K4P" className="form-control min-h-16 font-mono text-2xl font-black uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-60" />
              <p className="mt-2 text-sm text-slate-500">Puede escribir o pegar el código completo.</p>
              <button type="submit" disabled={!online || busy || connecting} className="primary-button mt-5 min-h-14 w-full text-base disabled:cursor-not-allowed disabled:opacity-60"><ShieldCheck aria-hidden="true" className="size-5" />Validar código</button>
            </form>}
          </div>
        </section>

        <section className="lg:pt-20" aria-live="polite">
          {serviceError ? <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{serviceError}</p> : null}
          {confirmed && validation.authorization ? (
            <div className="surface-card p-6 text-center sm:p-8">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                {confirmed === "entry" ? <DoorOpen aria-hidden="true" className="size-9" /> : <LogOut aria-hidden="true" className="size-9" />}
              </span>
              <h2 className="mt-5 text-3xl font-black text-emerald-700">{confirmed === "entry" ? "ENTRADA CONFIRMADA" : "SALIDA CONFIRMADA"}</h2>
              <p className="mt-2 text-slate-600">El registro ya está disponible para el residente en tiempo real.</p>
              <p className="mt-5 text-lg font-extrabold text-slate-950">
                {validation.authorization.visitorName} · {confirmed === "entry" ? `${validation.authorization.entryCount} entrada${validation.authorization.entryCount === 1 ? "" : "s"}` : `${validation.authorization.exitCount} salida${validation.authorization.exitCount === 1 ? "" : "s"}`}
              </p>
              <button type="button" onClick={() => { setValidation(null); setConfirmed(null); setCode(""); }} className="secondary-button mt-6 inline-flex gap-2"><RotateCcw aria-hidden="true" className="size-5" />Validar otro acceso</button>
            </div>
          ) : content && ResultIcon ? (
            <div className={`rounded-3xl border p-5 shadow-sm sm:p-7 ${content.tone}`}>
              <div className="flex items-start gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/80"><ResultIcon aria-hidden="true" className="size-8" /></span>
                <div><h2 className="text-2xl font-black sm:text-3xl">{content.title}</h2><p className="mt-1 font-semibold">{content.description}</p></div>
              </div>
              {validation.authorization ? <AuthorizationDetails authorization={validation.authorization} /> : null}
              {validation.code === "INSIDE" && validation.authorization?.lastEntryAt ? <p className="mt-4 rounded-2xl bg-white p-4 font-bold">Entrada registrada: {formatDemoDate(validation.authorization.lastEntryAt)} · {formatDemoTime(validation.authorization.lastEntryAt)}</p> : null}
              {validation.code === "NOT_YET_VALID" && validation.authorization ? <p className="mt-4 rounded-2xl bg-white p-4 font-bold">Inicia: {formatDemoDate(validation.authorization.scheduledAt)} · {formatDemoTime(validation.authorization.scheduledAt)}</p> : null}
              {validation.code === "EXPIRED" && validation.authorization ? <p className="mt-4 rounded-2xl bg-white p-4 font-bold">Expiró: {formatDemoDate(validation.authorization.expiresAt)} · {formatDemoTime(validation.authorization.expiresAt)}</p> : null}
              {validation.code === "USED" && validation.authorization?.lastEntryAt ? <p className="mt-4 rounded-2xl bg-white p-4 font-bold">Última entrada: {formatDemoDate(validation.authorization.lastEntryAt)} · {formatDemoTime(validation.authorization.lastEntryAt)}</p> : null}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {validation.code === "AUTHORIZED" ? <button type="button" disabled={!online || busy} onClick={() => void confirmEntry()} className="primary-button min-h-14 w-full text-base disabled:cursor-not-allowed disabled:opacity-60"><DoorOpen aria-hidden="true" className="size-5" />CONFIRMAR ENTRADA</button> : null}
                {validation.code === "INSIDE" ? <button type="button" disabled={!online || busy} onClick={() => void confirmExit()} className="primary-button min-h-14 w-full text-base disabled:cursor-not-allowed disabled:opacity-60"><LogOut aria-hidden="true" className="size-5" />CONFIRMAR SALIDA</button> : null}
                <button type="button" disabled={busy} onClick={() => { setValidation(null); setCode(""); }} className="secondary-button inline-flex min-h-14 w-full gap-2 disabled:opacity-60"><RotateCcw aria-hidden="true" className="size-5" />{validation.code === "NOT_FOUND" ? "Intentar nuevamente" : "Cancelar validación"}</button>
              </div>
            </div>
          ) : (
            <div className="surface-card overflow-hidden">
              <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_38%),linear-gradient(145deg,#eff6ff,#ffffff_72%)] p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-900/15"><ShieldCheck aria-hidden="true" className="size-7" /></span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Estado de la estación</p>
                    <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">Listo para validar un acceso</h2>
                    <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600 sm:text-base">Escanee el QR del visitante o ingrese su código para comprobar la autorización.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Flujo de validación</p>
                <ol className="mt-4 grid gap-3">
                  {["Escanee o ingrese el código.", "Revise la autorización.", "Confirme entrada o salida."].map((step, index) => (
                    <li key={step} className="flex min-h-14 items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">{index + 1}</span>
                      <span className="text-sm font-bold text-slate-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
