"use client";

import Link from "next/link";
import { CalendarDays, Clock3, Search, UserRound, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ResidentPageHeader } from "@/components/resident-page-header";
import { ResidentShell } from "@/components/resident-shell";
import { StatusBadge } from "@/components/status-badge";
import { useDemoAccess } from "@/context/demo-access-context";
import { entryTypeLabels, filterAuthorizations, formatDemoDate, formatDemoTime, resolveAuthorizationStatus, validityLabels, visitTypeLabels, type HistoryFilter } from "@/lib/access";
import type { Authorization } from "@/types/demo";

const filters: Array<{ value: HistoryFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "finalized", label: "Finalizados" },
  { value: "expired", label: "Vencidos" },
  { value: "cancelled", label: "Cancelados" },
];

export default function HistorialPage() {
  const { authorizations, selectAuthorization } = useDemoAccess();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [date, setDate] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [detail, setDetail] = useState<Authorization | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (detail && !dialog.open) dialog.showModal();
    if (!detail && dialog.open) dialog.close();
  }, [detail]);

  const records = useMemo(() => filterAuthorizations(authorizations, query, filter, date, now), [authorizations, date, filter, now, query]);
  const todayKey = new Intl.DateTimeFormat("en-CA").format(now);
  const visitsToday = authorizations.filter((item) => new Intl.DateTimeFormat("en-CA").format(new Date(item.scheduledAt)) === todayKey).length;
  const active = authorizations.filter((item) => resolveAuthorizationStatus(item, now) === "active").length;
  const finalized = authorizations.filter((item) => ["used", "completed"].includes(resolveAuthorizationStatus(item, now))).length;

  function openDetail(authorization: Authorization, trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    selectAuthorization(authorization.id);
    setDetail(authorization);
  }

  function closeDetail() {
    setDetail(null);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }

  return (
    <ResidentShell activeHref="/demo/residente/historial">
      <ResidentPageHeader title="Historial de accesos" description="Consulta las visitas y movimientos relacionados con Casa 27." />

      <section className="grid grid-cols-3 gap-2 sm:gap-4" aria-label="Indicadores del historial">
        <article className="surface-card p-3 sm:p-5"><UserRound aria-hidden="true" className="size-5 text-blue-600" /><p className="mt-3 text-[11px] font-semibold text-slate-500 sm:text-sm">Visitas hoy</p><p className="mt-1 text-2xl font-black text-blue-700">{visitsToday}</p></article>
        <article className="surface-card p-3 sm:p-5"><Clock3 aria-hidden="true" className="size-5 text-emerald-600" /><p className="mt-3 text-[11px] font-semibold text-slate-500 sm:text-sm">Activas</p><p className="mt-1 text-2xl font-black text-emerald-700">{active}</p></article>
        <article className="surface-card p-3 sm:p-5"><CalendarDays aria-hidden="true" className="size-5 text-slate-600" /><p className="mt-3 text-[11px] font-semibold text-slate-500 sm:text-sm">Finalizadas</p><p className="mt-1 text-2xl font-black text-slate-700">{finalized}</p></article>
      </section>

      <section className="surface-card mt-5 p-4 sm:p-6" aria-label="Buscar y filtrar historial">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <label htmlFor="history-search" className="sr-only">Buscar visitante o código</label>
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input id="history-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="form-control pl-12" placeholder="Buscar visitante o código" />
          </div>
          <div>
            <label htmlFor="history-date" className="sr-only">Filtrar por fecha</label>
            <input id="history-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="form-control min-w-48" />
          </div>
        </div>
        <fieldset className="mt-4 min-w-0 max-w-full">
          <legend className="sr-only">Filtrar registros por estado</legend>
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
            {filters.map((item) => (
              <button key={item.value} type="button" onClick={() => setFilter(item.value)} aria-pressed={filter === item.value} className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-bold transition ${filter === item.value ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"}`}>{item.label}</button>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="mt-5" aria-labelledby="records-title">
        <div className="flex items-center justify-between gap-4"><h2 id="records-title" className="text-lg font-black text-slate-950">Registros</h2><p className="text-sm font-semibold text-slate-500" aria-live="polite">{records.length} resultado{records.length === 1 ? "" : "s"}</p></div>
        {records.length > 0 ? (
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {records.map((authorization) => {
              const status = resolveAuthorizationStatus(authorization, now);
              return (
                <button key={authorization.id} type="button" onClick={(event) => openDetail(authorization, event.currentTarget)} className="surface-card group flex min-h-32 w-full items-start gap-4 p-4 text-left transition hover:border-blue-200 hover:shadow-lg sm:p-5">
                  <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${status === "active" ? "bg-emerald-50 text-emerald-700" : status === "expired" || status === "cancelled" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}><UserRound aria-hidden="true" className="size-6" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-start justify-between gap-2"><span className="min-w-0"><span className="block truncate font-extrabold text-slate-950">{authorization.visitorName}</span><span className="mt-1 block text-sm text-slate-500">{visitTypeLabels[authorization.visitType]} · {authorization.code}</span></span><StatusBadge status={status} /></span>
                    <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500"><span>{formatDemoDate(authorization.scheduledAt)}</span><span>{formatDemoTime(authorization.scheduledAt)}</span><span className="text-blue-700">Ver detalles</span></span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="surface-card mt-3 p-8 text-center"><Search aria-hidden="true" className="mx-auto size-8 text-slate-400" /><p className="mt-3 font-bold text-slate-800">No encontramos registros con esos filtros.</p><button type="button" onClick={() => { setQuery(""); setFilter("all"); setDate(""); }} className="secondary-button mt-4 inline-flex">Limpiar filtros</button></div>
        )}
      </section>

      <dialog ref={dialogRef} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); closeDetail(); }} className="m-auto max-h-[90vh] w-[min(42rem,calc(100%-2rem))] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-0 text-slate-950 shadow-2xl backdrop:bg-slate-950/55 backdrop:backdrop-blur-sm">
        {detail ? (
          <div>
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5 sm:p-6">
              <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Detalle de acceso</p><h2 id={titleId} className="mt-1 text-2xl font-black">{detail.visitorName}</h2></div>
              <button type="button" className="icon-button shrink-0" onClick={closeDetail} aria-label="Cerrar detalle"><X aria-hidden="true" className="size-5" /></button>
            </header>
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4"><span className="font-mono text-xl font-black tracking-wider text-blue-700">{detail.code}</span><StatusBadge status={resolveAuthorizationStatus(detail, now)} /></div>
              <dl className="mt-4 divide-y divide-slate-100">
                {[
                  ["Tipo", visitTypeLabels[detail.visitType]],
                  ["Fecha", formatDemoDate(detail.scheduledAt)],
                  ["Hora programada", formatDemoTime(detail.scheduledAt)],
                  ["Hora de entrada", detail.entryAt ? formatDemoTime(detail.entryAt) : "Sin registrar"],
                  ["Hora de salida", detail.exitAt ? formatDemoTime(detail.exitAt) : "Sin registrar"],
                  ["Tipo de ingreso", entryTypeLabels[detail.entryType]],
                  ["Vehículo", detail.vehicle],
                  ["Placa", detail.plate],
                  ["Vigencia", validityLabels[detail.validity]],
                ].map(([label, value]) => <div key={label} className="grid grid-cols-[0.9fr_1.1fr] gap-4 py-3 text-sm"><dt className="font-semibold text-slate-500">{label}</dt><dd className="text-right font-bold text-slate-900">{value}</dd></div>)}
              </dl>
              <Link href="/demo/residente/codigo" className="primary-button mt-5 w-full">Ver autorización</Link>
            </div>
          </div>
        ) : null}
      </dialog>
    </ResidentShell>
  );
}
