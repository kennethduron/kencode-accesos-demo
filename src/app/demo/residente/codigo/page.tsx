"use client";

import Link from "next/link";
import { CalendarClock, Car, CheckCircle2, Clock3, Home, ShieldCheck, Trash2, UserRound, UsersRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AccessQr } from "@/components/access-qr";
import { ResidentPageHeader } from "@/components/resident-page-header";
import { ResidentShell } from "@/components/resident-shell";
import { ShareAccessButton } from "@/components/share-access-button";
import { StatusBadge } from "@/components/status-badge";
import { useDemoAccess } from "@/context/demo-access-context";
import { entryTypeLabels, formatDemoDate, formatDemoTime, formatRemainingTime, resolveAuthorizationStatus, validityLabels, visitTypeLabels } from "@/lib/access";

export default function CodigoPage() {
  const { selectedAuthorization, cancelById, hydrated, busy, error } = useDemoAccess();
  const [now, setNow] = useState(() => new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!hydrated) {
    return <ResidentShell activeHref="/demo/residente/nueva-visita"><section className="surface-card p-8 text-center font-bold text-slate-600" aria-live="polite">Conectando con el servicio de demostración…</section></ResidentShell>;
  }

  if (!selectedAuthorization) {
    return (
      <ResidentShell activeHref="/demo/residente/nueva-visita">
        <ResidentPageHeader title="Acceso generado" description="Todavía no existe una autorización seleccionada." />
        <section className="surface-card p-7 text-center"><p className="text-slate-600">Crea una visita para visualizar su código de acceso.</p><Link href="/demo/residente/nueva-visita" className="primary-button mt-5">Crear visita</Link></section>
      </ResidentShell>
    );
  }

  const authorization = selectedAuthorization;
  const status = resolveAuthorizationStatus(authorization, now);
  const canCancel = status === "active";

  const details = [
    { label: "Visitante", value: authorization.visitorName, icon: UserRound },
    { label: "Tipo de visita", value: visitTypeLabels[authorization.visitType], icon: UsersRound },
    { label: "Vivienda", value: "Casa 27", icon: Home },
    { label: "Ingreso", value: entryTypeLabels[authorization.entryType], icon: Car },
    { label: "Vehículo", value: authorization.vehicle, icon: Car },
    { label: "Placa", value: authorization.plate, icon: Car },
    { label: "Programado", value: `${formatDemoDate(authorization.scheduledAt)} · ${formatDemoTime(authorization.scheduledAt)}`, icon: CalendarClock },
    { label: "Vigencia", value: validityLabels[authorization.validity], icon: Clock3 },
  ];

  return (
    <ResidentShell activeHref="/demo/residente/nueva-visita">
      <ResidentPageHeader title="Acceso generado" description="Comparte este código con tu visitante antes de su llegada." action={<StatusBadge status={status} />} />

      <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <section className="surface-card flex flex-col items-center p-5 text-center sm:p-7" aria-labelledby="access-code-title">
          <AccessQr code={authorization.code} />
          <p id="access-code-title" className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Código alfanumérico</p>
          <p className="mt-2 break-all font-mono text-4xl font-black tracking-[0.08em] text-blue-700 sm:text-5xl">{authorization.code}</p>
          <div className="mt-4"><StatusBadge status={status} /></div>
          <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-slate-600">Presente este QR o código al personal de seguridad.</p>
          <div className={`mt-6 w-full rounded-2xl border p-4 text-left ${authorization.usageMode === "multiple-entry" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-blue-200 bg-blue-50 text-blue-900"}`}>
            <p className="flex items-start gap-2 text-sm font-bold"><CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0" />{authorization.usageMode === "multiple-entry" ? "Múltiples entradas durante la vigencia" : "Permiso válido para un ingreso"}</p>
          </div>
          <div className="mt-4 w-full rounded-2xl bg-slate-950 p-4 text-left text-white">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-300">Tiempo restante</p>
            <p className="mt-1 text-2xl font-black">{status === "active" ? formatRemainingTime(authorization.expiresAt, now) : status === "expired" ? "Vencido" : "Permiso cerrado"}</p>
          </div>
        </section>

        <section className="surface-card overflow-hidden" aria-labelledby="visit-info-title">
          <div className="border-b border-slate-200 p-5 sm:p-6"><h2 id="visit-info-title" className="text-xl font-black text-slate-950">Información de la visita</h2></div>
          <dl className="divide-y divide-slate-100 px-5 sm:px-6">
            {details.map(({ label, value, icon: Icon }) => (
              <div key={label} className="grid min-h-14 grid-cols-[1fr_auto] items-center gap-4 py-3 text-sm">
                <dt className="flex items-center gap-2 font-semibold text-slate-500"><Icon aria-hidden="true" className="size-4 text-blue-600" />{label}</dt>
                <dd className="max-w-[58vw] text-right font-bold text-slate-900 sm:max-w-sm">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="grid gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:grid-cols-2 sm:p-6">
            <ShareAccessButton authorization={authorization} />
            <button ref={cancelButtonRef} type="button" disabled={!canCancel} onClick={() => setDialogOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400">
              <Trash2 aria-hidden="true" className="size-5" />
              {status === "cancelled" ? "Permiso cancelado" : "Cancelar permiso"}
            </button>
          </div>
          {error ? <p role="alert" className="mx-5 mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 sm:mx-6">{error}</p> : null}
          {authorization.visitType === "family" ? (
            <div className="border-t border-slate-200 p-5 sm:p-6"><Link href="/demo/residente/permiso-familiar" className="secondary-button inline-flex w-full gap-2"><ShieldCheck aria-hidden="true" className="size-5 text-blue-600" />Administrar permiso familiar</Link></div>
          ) : null}
        </section>
      </div>

      <ConfirmDialog open={dialogOpen} title="¿Cancelar este permiso?" description={`El código ${authorization.code} dejará de ser válido, pero permanecerá visible en el historial.`} confirmLabel={busy ? "Cancelando…" : "Sí, cancelar permiso"} triggerRef={cancelButtonRef} onClose={() => setDialogOpen(false)} onConfirm={() => void cancelById(authorization.id)} />
    </ResidentShell>
  );
}
