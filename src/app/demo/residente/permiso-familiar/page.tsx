"use client";

import { CalendarClock, Car, CheckCircle2, Clock3, DoorOpen, Home, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AccessQr } from "@/components/access-qr";
import { ResidentPageHeader } from "@/components/resident-page-header";
import { ResidentShell } from "@/components/resident-shell";
import { ShareAccessButton } from "@/components/share-access-button";
import { StatusBadge } from "@/components/status-badge";
import { useDemoAccess } from "@/context/demo-access-context";
import { formatDemoDate, formatDemoTime, formatRemainingTime, resolveAuthorizationStatus, validityLabels } from "@/lib/access";

export default function PermisoFamiliarPage() {
  const { authorizations, selectedAuthorization, cancelById, selectAuthorization, online } = useDemoAccess();
  const [now, setNow] = useState(() => new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const revokeButtonRef = useRef<HTMLButtonElement>(null);
  const authorization = useMemo(() => selectedAuthorization?.visitType === "family" ? selectedAuthorization : authorizations.find((item) => item.visitType === "family") ?? null, [authorizations, selectedAuthorization]);

  useEffect(() => {
    if (authorization && selectedAuthorization?.id !== authorization.id) selectAuthorization(authorization.id);
  }, [authorization, selectAuthorization, selectedAuthorization?.id]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!authorization) {
    return <ResidentShell activeHref="/demo/residente/nueva-visita"><ResidentPageHeader title="Permiso para familiar" description="No existe un permiso familiar disponible." /><p className="surface-card p-6 text-slate-600">Crea una visita de tipo Familiar para administrar su permiso temporal.</p></ResidentShell>;
  }

  const status = resolveAuthorizationStatus(authorization, now);
  const canRevoke = status === "active";
  const details = [
    { label: "Familiar", value: authorization.visitorName, icon: UserRound },
    { label: "Vivienda", value: "Casa 27", icon: Home },
    { label: "Vehículo", value: authorization.vehicle, icon: Car },
    { label: "Placa", value: authorization.plate, icon: Car },
    { label: "Duración", value: validityLabels[authorization.validity], icon: Clock3 },
    { label: "Inicio", value: `${formatDemoDate(authorization.scheduledAt)} · ${formatDemoTime(authorization.scheduledAt)}`, icon: CalendarClock },
    { label: "Expira", value: `${formatDemoDate(authorization.expiresAt)} · ${formatDemoTime(authorization.expiresAt)}`, icon: CalendarClock },
    { label: "Presencia", value: authorization.presenceState === "inside" ? "Dentro de la residencial" : "Fuera de la residencial", icon: DoorOpen },
  ];

  return (
    <ResidentShell activeHref="/demo/residente/nueva-visita">
      <ResidentPageHeader title="Permiso para familiar" description="Acceso temporal con entradas y salidas autorizadas durante su vigencia." action={<StatusBadge status={status} />} />
      <section className="surface-card overflow-hidden">
        <div className={`border-b p-5 text-center sm:p-6 ${status === "active" ? "border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50" : "border-slate-200 bg-slate-50"}`}>
          <p className={`inline-flex items-center gap-2 text-2xl font-black uppercase tracking-wide ${status === "active" ? "text-emerald-700" : "text-slate-600"}`}><CheckCircle2 aria-hidden="true" className="size-8" />{status === "active" ? "Activo" : status === "cancelled" ? "Revocado" : status === "expired" ? "Vencido" : "Finalizado"}</p>
        </div>

        <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <dl className="divide-y divide-slate-100">
              {details.map(({ label, value, icon: Icon }) => (
                <div key={label} className="grid min-h-14 grid-cols-[0.8fr_1.2fr] items-center gap-4 py-3 text-sm sm:text-base">
                  <dt className="flex items-center gap-2 font-semibold text-slate-500"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><Icon aria-hidden="true" className="size-4" /></span>{label}</dt>
                  <dd className="text-right font-extrabold text-slate-950">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-800"><ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />Entradas y salidas permitidas durante la vigencia.</p>
            <div className="mt-3 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">Entradas</p><p className="mt-1 text-2xl font-black text-slate-950">{authorization.entryCount}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">Salidas</p><p className="mt-1 text-2xl font-black text-slate-950">{authorization.exitCount}</p></div></div>
          </div>

          <div className="flex flex-col items-center rounded-3xl bg-slate-50 p-4 sm:p-6">
            <AccessQr code={authorization.code} />
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Código de permiso</p>
            <p className="mt-2 break-all text-center font-mono text-3xl font-black tracking-wider text-blue-700 sm:text-4xl">{authorization.code}</p>
            <div className="mt-5 w-full rounded-2xl border border-emerald-200 bg-white p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Tiempo restante</p>
              <p className="mt-1 text-2xl font-black text-emerald-700">{status === "active" ? formatRemainingTime(authorization.expiresAt, now) : status === "expired" ? "Vencido" : "Permiso cerrado"}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:grid-cols-2 sm:p-6">
          <ShareAccessButton authorization={authorization} status={status} label="Compartir permiso" variant="family" />
          <button ref={revokeButtonRef} type="button" disabled={!online || !canRevoke} onClick={() => setDialogOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400">
            <Trash2 aria-hidden="true" className="size-5" />{status === "cancelled" ? "Acceso revocado" : "Revocar acceso"}
          </button>
        </div>
      </section>
      <p className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">Este permiso dejará de ser válido automáticamente al finalizar el período autorizado.</p>

      <ConfirmDialog open={dialogOpen} title="¿Revocar el acceso familiar?" description={`El permiso de ${authorization.visitorName} cambiará a cancelado y permanecerá registrado en el historial.`} confirmLabel="Sí, revocar acceso" triggerRef={revokeButtonRef} onClose={() => setDialogOpen(false)} onConfirm={() => void cancelById(authorization.id)} />
    </ResidentShell>
  );
}
