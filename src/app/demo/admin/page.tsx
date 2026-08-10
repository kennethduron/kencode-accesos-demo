"use client";

import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Clock3,
  DoorOpen,
  FileSearch,
  Home,
  LayoutDashboard,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { DemoBadge } from "@/components/demo-badge";
import { DemoNotice } from "@/components/demo-notice";
import {
  adminAccesses,
  adminActivity,
  adminAudit,
  adminHomes,
  adminResidents,
  adminSummary,
  type AdminAccessRecord,
  type AdminAccessState,
} from "@/data/admin-demo";

type AdminTab = "dashboard" | "accesses" | "homes" | "residents" | "audit";
type AccessFilter = "all" | AdminAccessState;

const tabs: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: "dashboard", label: "Resumen", icon: LayoutDashboard },
  { id: "accesses", label: "Accesos", icon: ShieldCheck },
  { id: "homes", label: "Viviendas", icon: Building2 },
  { id: "residents", label: "Residentes", icon: UsersRound },
  { id: "audit", label: "Auditoría", icon: ClipboardList },
];

const accessFilters: Array<{ id: AccessFilter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "inside", label: "Dentro" },
  { id: "active", label: "Activos" },
  { id: "completed", label: "Finalizados" },
  { id: "expired", label: "Vencidos" },
  { id: "cancelled", label: "Cancelados" },
  { id: "used", label: "Utilizados" },
];

const accessLabels: Record<AdminAccessState, string> = {
  inside: "Dentro",
  active: "Activo",
  completed: "Finalizado",
  expired: "Vencido",
  cancelled: "Cancelado",
  used: "Utilizado",
};

const accessTones: Record<AdminAccessState, string> = {
  inside: "bg-cyan-50 text-cyan-800 ring-cyan-200",
  active: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  completed: "bg-slate-100 text-slate-700 ring-slate-200",
  expired: "bg-red-50 text-red-700 ring-red-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
  used: "bg-slate-100 text-slate-700 ring-slate-300",
};

function AccessPill({ state }: { state: AdminAccessState }) {
  return <span className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-extrabold ring-1 ${accessTones[state]}`}>{accessLabels[state]}</span>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center sm:p-12">
      <FileSearch aria-hidden="true" className="mx-auto size-9 text-slate-400" />
      <h3 className="mt-4 text-lg font-black text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{eyebrow}</p>
      <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
    </div>
  );
}

function DashboardView({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const statIcons = [Home, UsersRound, CalendarClock, DoorOpen, ShieldCheck, CircleAlert];
  const statTones = {
    blue: "bg-blue-50 text-blue-700",
    cyan: "bg-cyan-50 text-cyan-700",
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    rose: "bg-rose-50 text-rose-700",
  } as const;

  return (
    <div>
      <SectionHeading eyebrow="Operación general" title="Sistema Digital de Control de Accesos" description="Una vista ejecutiva para comprender la operación residencial en segundos. Todos los indicadores corresponden a datos ficticios de demostración." />

      <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" aria-label="Indicadores administrativos de demostración">
        {adminSummary.map((stat, index) => {
          const Icon = statIcons[index];
          return (
            <article key={stat.label} className="surface-card min-w-0 p-5">
              <div className="flex items-start justify-between gap-3"><span className={`grid size-11 place-items-center rounded-2xl ${statTones[stat.tone]}`}><Icon aria-hidden="true" className="size-5" /></span><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">Demo</span></div>
              <p className="mt-5 text-3xl font-black tracking-tight text-slate-950">{stat.value}</p>
              <h3 className="mt-1 text-sm font-extrabold text-slate-800">{stat.label}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">{stat.detail}</p>
            </article>
          );
        })}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="surface-card overflow-hidden" aria-labelledby="activity-title">
          <header className="flex items-center justify-between gap-4 border-b border-slate-200 p-5 sm:p-6">
            <div><p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">Realtime conceptual</p><h3 id="activity-title" className="mt-1 text-xl font-black text-slate-950">Actividad reciente</h3></div>
            <button type="button" onClick={() => onNavigate("audit")} className="inline-flex min-h-11 items-center gap-1 text-sm font-extrabold text-blue-700">Ver auditoría<ChevronRight aria-hidden="true" className="size-4" /></button>
          </header>
          <div className="divide-y divide-slate-100">
            {adminActivity.map((item) => (
              <article key={item.id} className="flex min-h-20 items-center gap-3 px-5 py-4 sm:px-6">
                <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${item.tone === "success" ? "bg-emerald-50 text-emerald-700" : item.tone === "danger" ? "bg-red-50 text-red-700" : item.tone === "info" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}>{item.event.includes("Salida") ? <ArrowDownRight aria-hidden="true" className="size-5" /> : item.event.includes("rechazado") ? <CircleAlert aria-hidden="true" className="size-5" /> : <Activity aria-hidden="true" className="size-5" />}</span>
                <div className="min-w-0 flex-1"><p className="truncate font-extrabold text-slate-950">{item.visitor}</p><p className="mt-0.5 text-sm text-slate-600">{item.event} · {item.home}</p></div>
                <time className="shrink-0 text-xs font-bold text-slate-500">{item.time}</time>
              </article>
            ))}
          </div>
        </section>

        <section className="surface-card p-5 sm:p-6" aria-labelledby="distribution-title">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">Hoy</p>
          <h3 id="distribution-title" className="mt-1 text-xl font-black text-slate-950">Distribución de accesos</h3>
          <div className="mt-6 space-y-5">
            {[
              ["Autorizados", 72, "bg-emerald-500"],
              ["Finalizados", 18, "bg-blue-500"],
              ["Rechazados", 10, "bg-rose-500"],
            ].map(([label, value, tone]) => (
              <div key={String(label)}><div className="flex justify-between gap-3 text-sm"><span className="font-bold text-slate-700">{label}</span><span className="font-black text-slate-950">{value}%</span></div><div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${tone}`} style={{ width: `${value}%` }} /></div></div>
            ))}
          </div>
          <div className="mt-7 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-900"><strong>Lectura ejecutiva:</strong> la mayor parte de los accesos se procesa sin incidencias y con trazabilidad digital.</div>
          <button type="button" onClick={() => onNavigate("accesses")} className="secondary-button mt-5 inline-flex w-full gap-2">Explorar accesos<ArrowRight aria-hidden="true" className="size-4" /></button>
        </section>
      </div>
    </div>
  );
}

function AccessesView({ onOpen }: { onOpen: (record: AdminAccessRecord, trigger: HTMLButtonElement) => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<AccessFilter>("all");
  const records = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    return adminAccesses.filter((record) => {
      const matchesQuery = !normalized || `${record.visitor} ${record.home} ${record.code} ${record.plate}`.toLocaleLowerCase("es").includes(normalized);
      return matchesQuery && (filter === "all" || record.state === filter);
    });
  }, [filter, query]);

  return (
    <div>
      <SectionHeading eyebrow="Control operativo" title="Accesos" description="Consulta autorizaciones ficticias por visitante, vivienda, código y estado operativo." />
      <section className="surface-card mt-7 p-4 sm:p-6" aria-label="Buscar y filtrar accesos">
        <div className="relative"><label htmlFor="admin-access-search" className="sr-only">Buscar accesos</label><Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" /><input id="admin-access-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="form-control pl-12" placeholder="Buscar visitante, casa, código o placa" /></div>
        <fieldset className="mt-4"><legend className="sr-only">Filtrar accesos por estado</legend><div className="flex max-w-full gap-2 overflow-x-auto pb-1">{accessFilters.map((item) => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)} className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-extrabold ${filter === item.id ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"}`}>{item.label}</button>)}</div></fieldset>
      </section>
      <div className="mt-5 flex items-center justify-between gap-4"><h3 className="font-black text-slate-950">Registros</h3><p className="text-sm font-semibold text-slate-500" aria-live="polite">{records.length} resultado{records.length === 1 ? "" : "s"}</p></div>
      {records.length ? <div className="mt-3 grid gap-3 xl:grid-cols-2">{records.map((record) => <button key={record.id} type="button" onClick={(event) => onOpen(record, event.currentTarget)} className="surface-card group flex min-h-32 items-start gap-4 p-4 text-left transition hover:border-blue-200 hover:shadow-lg sm:p-5"><span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${record.state === "inside" ? "bg-cyan-50 text-cyan-700" : record.state === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}><UserRound aria-hidden="true" className="size-6" /></span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-start justify-between gap-2"><span><span className="block font-extrabold text-slate-950">{record.visitor}</span><span className="mt-1 block text-sm text-slate-500">{record.type} · {record.home}</span></span><AccessPill state={record.state} /></span><span className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500"><span className="font-mono text-blue-700">{record.code}</span><span>{record.lastEvent}</span><span>{record.time}</span><span className="ml-auto inline-flex items-center gap-1 text-blue-700">Detalle<ChevronRight aria-hidden="true" className="size-4 transition group-hover:translate-x-0.5" /></span></span></span></button>)}</div> : <div className="mt-3"><EmptyState title="No encontramos accesos" description="Prueba con otro nombre, vivienda, código o estado." /></div>}
    </div>
  );
}

function HomesView() {
  const [query, setQuery] = useState("");
  const homes = useMemo(() => adminHomes.filter((home) => `${home.label} ${home.resident} ${home.sector}`.toLocaleLowerCase("es").includes(query.trim().toLocaleLowerCase("es"))), [query]);
  return <div><SectionHeading eyebrow="Directorio conceptual" title="Viviendas" description="Una lectura rápida de viviendas, miembros, vehículos y permisos activos. La edición se reserva para el sistema productivo." /><div className="surface-card mt-7 p-4 sm:p-6"><label htmlFor="home-search" className="sr-only">Buscar vivienda o residente</label><div className="relative"><Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" /><input id="home-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="form-control pl-12" placeholder="Buscar vivienda, familia o sector" /></div></div>{homes.length ? <div className="mt-5 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">{homes.map((home) => <article key={home.id} className="surface-card p-5"><div className="flex items-start justify-between gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-700"><Home aria-hidden="true" className="size-6" /></span><span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ${home.status === "Activa" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-800 ring-amber-200"}`}>{home.status}</span></div><h3 className="mt-5 text-xl font-black text-slate-950">{home.label}</h3><p className="mt-1 font-semibold text-slate-600">{home.resident}</p><p className="mt-1 text-sm text-slate-500">{home.sector}</p><dl className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center"><div><dt className="text-[11px] font-bold text-slate-500">Miembros</dt><dd className="mt-1 text-lg font-black text-slate-950">{home.members}</dd></div><div><dt className="text-[11px] font-bold text-slate-500">Vehículos</dt><dd className="mt-1 text-lg font-black text-slate-950">{home.vehicles}</dd></div><div><dt className="text-[11px] font-bold text-slate-500">Permisos</dt><dd className="mt-1 text-lg font-black text-blue-700">{home.activePermits}</dd></div></dl></article>)}</div> : <div className="mt-5"><EmptyState title="No encontramos viviendas" description="Revisa el número, nombre familiar o sector utilizado en la búsqueda." /></div>}</div>;
}

function ResidentsView() {
  const [query, setQuery] = useState("");
  const residents = useMemo(() => adminResidents.filter((resident) => `${resident.name} ${resident.home} ${resident.status}`.toLocaleLowerCase("es").includes(query.trim().toLocaleLowerCase("es"))), [query]);
  return <div><SectionHeading eyebrow="Directorio conceptual" title="Residentes" description="Información ficticia de residentes y actividad reciente en un formato read-only para presentación." /><div className="surface-card mt-7 p-4 sm:p-6"><label htmlFor="resident-search" className="sr-only">Buscar residente</label><div className="relative"><Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" /><input id="resident-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="form-control pl-12" placeholder="Buscar residente, vivienda o estado" /></div></div>{residents.length ? <div className="mt-5 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">{residents.map((resident) => <article key={resident.id} className="surface-card p-5"><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-700"><UserRound aria-hidden="true" className="size-6" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-black text-slate-950">{resident.name}</h3><span className={`rounded-full px-2 py-1 text-[11px] font-extrabold ${resident.status === "Validado" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{resident.status}</span></div><p className="mt-1 text-sm font-semibold text-blue-700">{resident.home}</p></div></div><dl className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4"><div><dt className="text-xs font-semibold text-slate-500">Miembros</dt><dd className="mt-1 font-black text-slate-950">{resident.members}</dd></div><div><dt className="text-xs font-semibold text-slate-500">Vehículos</dt><dd className="mt-1 font-black text-slate-950">{resident.vehicles}</dd></div></dl><p className="mt-4 flex items-start gap-2 text-sm text-slate-600"><Clock3 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-blue-600" />{resident.lastActivity}</p></article>)}</div> : <div className="mt-5"><EmptyState title="No encontramos residentes" description="No hay coincidencias para los criterios de búsqueda actuales." /></div>}</div>;
}

function AuditView() {
  const [query, setQuery] = useState("");
  const events = useMemo(() => adminAudit.filter((event) => `${event.event} ${event.code} ${event.home} ${event.station}`.toLocaleLowerCase("es").includes(query.trim().toLocaleLowerCase("es"))), [query]);
  return <div><SectionHeading eyebrow="Trazabilidad conceptual" title="Auditoría" description="Secuencia demostrativa de eventos operativos. No representa todavía una auditoría productiva ni sustituye controles de roles reales." /><div className="surface-card mt-7 p-4 sm:p-6"><label htmlFor="audit-search" className="sr-only">Buscar evento de auditoría</label><div className="relative"><Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" /><input id="audit-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="form-control pl-12" placeholder="Buscar evento, código, vivienda o estación" /></div></div>{events.length ? <section className="surface-card mt-5 overflow-hidden" aria-label="Eventos de auditoría"><div className="hidden grid-cols-[0.9fr_1.2fr_0.85fr_0.75fr_1fr] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-black uppercase tracking-wider text-slate-500 md:grid"><span>Fecha y hora</span><span>Evento</span><span>Código</span><span>Vivienda</span><span>Estación</span></div><div className="divide-y divide-slate-100">{events.map((event) => <article key={event.id} className="grid gap-3 p-5 md:grid-cols-[0.9fr_1.2fr_0.85fr_0.75fr_1fr] md:items-center md:gap-4 md:px-6"><time className="text-sm font-semibold text-slate-500">{event.time}</time><div className="flex items-center gap-2"><span className={`size-2.5 shrink-0 rounded-full ${event.tone === "success" ? "bg-emerald-500" : event.tone === "danger" ? "bg-red-500" : event.tone === "warning" ? "bg-amber-500" : "bg-blue-500"}`} /><span className="font-extrabold text-slate-950">{event.event}</span></div><span className="font-mono text-sm font-bold text-blue-700">{event.code}</span><span className="text-sm font-bold text-slate-700">{event.home}</span><span className="text-sm text-slate-600">{event.station}</span></article>)}</div></section> : <div className="mt-5"><EmptyState title="No hay eventos coincidentes" description="Ajusta la búsqueda para consultar la auditoría conceptual." /></div>}</div>;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [selectedAccess, setSelectedAccess] = useState<AdminAccessRecord | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogTitleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedAccess && !dialog.open) dialog.showModal();
    if (!selectedAccess && dialog.open) dialog.close();
  }, [selectedAccess]);

  function openAccess(record: AdminAccessRecord, trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    setSelectedAccess(record);
  }

  function closeAccess() {
    setSelectedAccess(null);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 max-w-[100rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Ken Code, regresar al inicio"><BrandLogo priority className="w-[132px] sm:w-[154px]" /></Link>
          <div className="text-right"><DemoBadge /><p className="mt-1 text-[11px] font-bold text-slate-500 sm:text-xs">Vista administrativa de demostración</p></div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[100rem] grid-cols-[minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="min-w-0 border-b border-slate-200 bg-white lg:min-h-[calc(100vh-5rem)] lg:border-b-0 lg:border-r" aria-label="Navegación administrativa">
          <nav className="flex w-full max-w-full gap-1 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:sticky lg:top-20 lg:flex-col lg:overflow-visible lg:px-5 lg:py-7">
            {tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-current={activeTab === id ? "page" : undefined} onClick={() => setActiveTab(id)} className={`inline-flex min-h-12 shrink-0 items-center gap-3 rounded-xl px-4 text-sm font-extrabold transition lg:w-full ${activeTab === id ? "bg-blue-600 text-white shadow-lg shadow-blue-900/15" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}><Icon aria-hidden="true" className="size-5" />{label}</button>)}
            <div className="mt-4 hidden rounded-2xl bg-slate-950 p-4 text-white lg:block"><BadgeCheck aria-hidden="true" className="size-6 text-cyan-300" /><p className="mt-3 text-sm font-extrabold">Datos de demostración</p><p className="mt-1 text-xs leading-5 text-slate-300">Esta vista presenta escenarios ficticios y no implementa roles administrativos reales.</p></div>
          </nav>
        </aside>

        <main className="min-w-0 px-4 py-7 sm:px-6 sm:py-9 lg:px-8 xl:px-10">
          {activeTab === "dashboard" ? <DashboardView onNavigate={setActiveTab} /> : null}
          {activeTab === "accesses" ? <AccessesView onOpen={openAccess} /> : null}
          {activeTab === "homes" ? <HomesView /> : null}
          {activeTab === "residents" ? <ResidentsView /> : null}
          {activeTab === "audit" ? <AuditView /> : null}
          <div className="mt-10"><DemoNotice compact /></div>
          <p className="mt-4 text-center text-xs font-semibold text-slate-400">Demostración conceptual desarrollada por Ken Code.</p>
        </main>
      </div>

      <dialog ref={dialogRef} aria-labelledby={dialogTitleId} onCancel={(event) => { event.preventDefault(); closeAccess(); }} className="m-auto max-h-[90vh] w-[min(38rem,calc(100%-2rem))] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-0 text-slate-950 shadow-2xl backdrop:bg-slate-950/55 backdrop:backdrop-blur-sm">
        {selectedAccess ? <div><header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-5 sm:p-6"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">Detalle read-only</p><h2 id={dialogTitleId} className="mt-1 text-2xl font-black">{selectedAccess.visitor}</h2></div><button type="button" onClick={closeAccess} className="icon-button shrink-0" aria-label="Cerrar detalle"><X aria-hidden="true" className="size-5" /></button></header><div className="p-5 sm:p-6"><div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4"><span className="font-mono text-xl font-black tracking-wider text-blue-700">{selectedAccess.code}</span><AccessPill state={selectedAccess.state} /></div><dl className="mt-5 divide-y divide-slate-100">{[["Vivienda", selectedAccess.home],["Tipo", selectedAccess.type],["Vehículo", selectedAccess.vehicle],["Placa", selectedAccess.plate],["Último evento", selectedAccess.lastEvent],["Hora", selectedAccess.time]].map(([label, value]) => <div key={label} className="grid grid-cols-[0.85fr_1.15fr] gap-4 py-3 text-sm"><dt className="font-semibold text-slate-500">{label}</dt><dd className="text-right font-bold text-slate-900">{value}</dd></div>)}</dl><p className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-900">Vista conceptual para presentación. Las acciones administrativas y roles reales se implementarán en el producto final.</p></div></div> : null}
      </dialog>
    </div>
  );
}
