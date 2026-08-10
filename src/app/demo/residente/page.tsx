"use client";

import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Car,
  CircleHelp,
  Clock3,
  FileClock,
  History,
  KeyRound,
  MapPin,
  PlusCircle,
  UserRound,
  UsersRound,
} from "lucide-react";
import { ResidentShell } from "@/components/resident-shell";
import { StatusBadge } from "@/components/status-badge";
import { useDemoAccess } from "@/context/demo-access-context";
import { resolveAuthorizationStatus, toLocalDateInput, visitTypeLabels } from "@/lib/access";

const quickLinks = [
  { label: "Visitas activas", href: "/demo/residente/historial", icon: UsersRound, tone: "text-blue-700 bg-blue-50" },
  { label: "Familiares", href: "/demo/residente/permiso-familiar", icon: UserRound, tone: "text-cyan-700 bg-cyan-50" },
  { label: "Historial", href: "/demo/residente/historial", icon: History, tone: "text-indigo-700 bg-indigo-50" },
];

const conceptualItems = [
  { label: "Mis vehículos", icon: Car },
  { label: "Mi perfil", icon: UserRound, id: "perfil" },
  { label: "Ayuda", icon: CircleHelp },
];

export default function ResidentDashboardPage() {
  const { authorizations } = useDemoAccess();
  const now = new Date();
  const today = toLocalDateInput(now);
  const activeCount = authorizations.filter((item) => resolveAuthorizationStatus(item, now) === "active").length;
  const todayCount = authorizations.filter((item) => toLocalDateInput(new Date(item.scheduledAt)) === today).length;
  const recent = authorizations.filter((item) => ["seed-family", "seed-uber", "seed-delivery"].includes(item.id));

  return (
    <ResidentShell activeHref="/demo/residente">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-blue-700">Control de Accesos</p>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl">Hola, Alejandro</h1>
              <p className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-600 sm:text-base">
                <MapPin aria-hidden="true" className="size-5 shrink-0 text-blue-600" />
                Casa 27 · Residencial Valle Azul
              </p>
            </div>
            <span className="hidden size-12 place-items-center rounded-2xl bg-blue-50 text-blue-700 sm:grid" aria-label="Dos notificaciones conceptuales"><BellRing aria-hidden="true" className="size-6" /></span>
          </div>

          <Link href="/demo/residente/nueva-visita" className="group mt-8 flex min-h-16 w-full items-center justify-between rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 px-5 text-white shadow-xl shadow-blue-900/15 transition-transform hover:-translate-y-0.5 sm:min-h-20 sm:px-7">
            <span className="flex items-center gap-3 text-lg font-extrabold sm:text-xl"><PlusCircle aria-hidden="true" className="size-7" />Nueva visita</span>
            <ArrowRight aria-hidden="true" className="size-6 transition-transform group-hover:translate-x-1" />
          </Link>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4" aria-label="Resumen de accesos">
            <article className="surface-card min-w-0 p-3 sm:p-5"><KeyRound aria-hidden="true" className="size-5 text-blue-600" /><p className="mt-3 text-[11px] font-semibold leading-4 text-slate-500 sm:text-sm">Códigos activos</p><p className="mt-1 text-2xl font-black text-blue-700">{activeCount}</p></article>
            <article className="surface-card min-w-0 p-3 sm:p-5"><UsersRound aria-hidden="true" className="size-5 text-cyan-600" /><p className="mt-3 text-[11px] font-semibold leading-4 text-slate-500 sm:text-sm">Visitas hoy</p><p className="mt-1 text-2xl font-black text-cyan-700">{todayCount}</p></article>
            <article className="surface-card min-w-0 p-3 sm:p-5"><Clock3 aria-hidden="true" className="size-5 text-emerald-600" /><p className="mt-3 text-[11px] font-semibold leading-4 text-slate-500 sm:text-sm">Último acceso</p><p className="mt-1 whitespace-nowrap text-lg font-black text-emerald-700 sm:text-2xl">4:20 PM</p></article>
          </div>

          <section className="surface-card mt-5 p-4 sm:p-6" aria-labelledby="quick-title">
            <h2 id="quick-title" className="text-lg font-black text-slate-950">Accesos rápidos</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {quickLinks.map(({ label, href, icon: Icon, tone }) => (
                <Link key={label} href={href} className="group flex min-h-28 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-center text-sm font-bold text-slate-800 transition hover:border-blue-200 hover:shadow-md">
                  <span className={`grid size-11 place-items-center rounded-2xl ${tone}`}><Icon aria-hidden="true" className="size-6" /></span><span className="mt-3">{label}</span>
                </Link>
              ))}
              {conceptualItems.map(({ label, icon: Icon, id }) => (
                <div key={label} id={id} className="flex min-h-28 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3 text-center" aria-label={`${label}, función conceptual disponible en una fase posterior`}>
                  <span className="grid size-11 place-items-center rounded-2xl bg-slate-100 text-slate-500"><Icon aria-hidden="true" className="size-6" /></span><span className="mt-3 text-sm font-bold text-slate-600">{label}</span><span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Próximamente</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="surface-card overflow-hidden" aria-labelledby="recent-title">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-5 sm:p-6">
            <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Casa 27</p><h2 id="recent-title" className="mt-1 text-xl font-black text-slate-950">Actividad reciente</h2></div>
            <Link href="/demo/residente/historial" className="inline-flex min-h-11 items-center text-sm font-bold text-blue-700">Ver todo</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recent.map((authorization) => {
              const status = resolveAuthorizationStatus(authorization, now);
              return (
                <Link key={authorization.id} href="/demo/residente/historial" className="group flex min-h-24 items-center gap-3 p-4 transition-colors hover:bg-slate-50 sm:p-5">
                  <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${status === "active" ? "bg-emerald-50 text-emerald-700" : status === "expired" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
                    {authorization.visitType === "uber" ? <Car aria-hidden="true" className="size-6" /> : authorization.visitType === "delivery" ? <FileClock aria-hidden="true" className="size-6" /> : <UserRound aria-hidden="true" className="size-6" />}
                  </span>
                  <span className="min-w-0 flex-1"><span className="block truncate font-extrabold text-slate-950">{authorization.visitorName}</span><span className="mt-1 block text-sm text-slate-500">{authorization.status === "used" ? "Código utilizado" : visitTypeLabels[authorization.visitType]}</span></span>
                  <span className="flex shrink-0 items-center gap-2"><StatusBadge status={status} /><ArrowRight aria-hidden="true" className="hidden size-4 text-slate-400 sm:block" /></span>
                </Link>
              );
            })}
          </div>
        </section>
      </section>
    </ResidentShell>
  );
}
