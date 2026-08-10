import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  History,
  KeyRound,
  QrCode,
  ShieldCheck,
  UserRound,
  UsersRound,
  Zap,
} from "lucide-react";
import { ActionCard } from "@/components/action-card";
import { BrandLogo } from "@/components/brand-logo";
import { DemoBadge } from "@/components/demo-badge";
import { DemoNotice } from "@/components/demo-notice";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { demoAccess, demoResident } from "@/data/demo";

const benefits = [
  { icon: KeyRound, title: "Códigos únicos", text: "Autorizaciones identificables para cada visita." },
  { icon: QrCode, title: "Acceso con QR", text: "Una experiencia visual lista para validación rápida." },
  { icon: CalendarClock, title: "Visitas programadas", text: "Organiza accesos antes de la llegada del visitante." },
  { icon: UsersRound, title: "Permisos temporales", text: "Vigencias conceptuales de 24 o 48 horas." },
  { icon: Zap, title: "Validación ágil", text: "Estados claros para apoyar al personal de seguridad." },
  { icon: History, title: "Historial de accesos", text: "Consulta movimientos y autorizaciones desde un solo lugar." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-slate-50">
      <header className="relative z-20 border-b border-white/10 bg-[#030b1d]">
        <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Ken Code, inicio">
            <BrandLogo priority className="w-[132px] sm:w-[164px]" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 md:inline">Control digital de accesos</span>
            <DemoBadge />
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate border-b border-slate-200 bg-white">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_16%,rgba(37,99,235,0.13),transparent_26%),radial-gradient(circle_at_82%_25%,rgba(6,182,212,0.14),transparent_28%),linear-gradient(to_bottom,#ffffff,#f8fafc)]" aria-hidden="true" />
          <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700">
                <ShieldCheck aria-hidden="true" className="size-5" />
                Sistema Digital de Control de Accesos y Visitas
              </p>
              <h1 className="text-balance text-[2.55rem] font-black leading-[1.03] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl">
                Autoriza visitas antes de su llegada.
                <span className="mt-2 block bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent">Valida accesos en segundos.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-slate-600">
                Una demostración interactiva para visualizar una experiencia residencial más ordenada, clara y ágil, desde la autorización hasta el registro de entrada.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="#experiencias" className="primary-button min-w-44">
                  Explorar demo
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
                <Link href="/demo/registro" className="secondary-button inline-flex min-w-44">
                  Ver registro conceptual
                </Link>
              </div>
              <p className="mt-6 text-sm font-medium text-slate-500">Demostración conceptual desarrollada por Ken Code.</p>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:mx-0 lg:ml-auto">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-blue-200/60 to-cyan-100/60 blur-2xl" aria-hidden="true" />
              <div className="surface-card overflow-hidden p-4 sm:p-6">
                <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 p-5 text-white sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Vista del residente</p>
                      <h2 className="mt-2 text-2xl font-extrabold">Hola, {demoResident.firstName}</h2>
                      <p className="mt-1 text-sm text-slate-300">{demoResident.home} · {demoResident.community}</p>
                    </div>
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/10">
                      <UserRound aria-hidden="true" className="size-5 text-cyan-300" />
                    </span>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-white/10 p-3"><span className="text-xl font-black">3</span><span className="mt-1 block text-[10px] text-slate-300">Códigos activos</span></div>
                    <div className="rounded-xl bg-white/10 p-3"><span className="text-xl font-black">5</span><span className="mt-1 block text-[10px] text-slate-300">Visitas hoy</span></div>
                    <div className="rounded-xl bg-white/10 p-3"><span className="text-xl font-black">4:20</span><span className="mt-1 block text-[10px] text-slate-300">Último acceso</span></div>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><CheckCircle2 aria-hidden="true" className="size-6" /></span>
                      <div className="min-w-0"><p className="truncate font-bold text-slate-950">{demoAccess.visitor}</p><p className="text-xs text-slate-500">{demoAccess.visitorType} · {demoAccess.vehicle}</p></div>
                    </div>
                    <StatusBadge status="active" />
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <span className="text-xs font-semibold text-slate-500">Código de acceso</span>
                    <span className="font-mono text-sm font-black tracking-wider text-blue-700">{demoAccess.code}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="experiencias" className="scroll-mt-6 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Tres experiencias conectadas</p>
              <h2 className="mt-3 text-balance text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">Explora el concepto desde cada rol</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">Cada acceso conduce a una vista preparada para evolucionar en las siguientes fases del demo.</p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <ActionCard href="/demo/residente" icon={UserRound} eyebrow="Experiencia 01" title="Residente" description="Autoriza visitas, revisa permisos y consulta accesos desde una experiencia simple." accent="blue" />
              <ActionCard href="/demo/seguridad" icon={ShieldCheck} eyebrow="Experiencia 02" title="Seguridad" description="Valida autorizaciones y reconoce rápidamente el estado de cada código." accent="cyan" />
              <ActionCard href="/demo/admin" icon={Building2} eyebrow="Experiencia 03" title="Administración" description="Visualiza la operación residencial y prepara una gestión centralizada." accent="navy" />
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-700">Concepto digital</p>
                <h2 className="mt-3 text-balance text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">Lo esencial para una llegada más fluida</h2>
                <p className="mt-4 text-base leading-7 text-slate-600">La propuesta visual prioriza claridad, estados reconocibles y acciones rápidas sin representar hardware ni infraestructura física.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard icon={KeyRound} label="Códigos" value="Únicos" tone="blue" />
                <StatCard icon={Clock3} label="Permisos" value="24 / 48 h" tone="green" />
                <StatCard icon={QrCode} label="Validación" value="Ágil" tone="cyan" />
              </div>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <span className="grid size-10 place-items-center rounded-xl bg-white text-blue-700 shadow-sm"><Icon aria-hidden="true" className="size-5" /></span>
                  <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-12">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <DemoNotice />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-[#030b1d] py-8 text-slate-300">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <BrandLogo className="w-[132px]" />
          <p className="text-xs leading-5 text-slate-400">Demostración conceptual · Software de control de accesos y visitas</p>
        </div>
      </footer>
    </div>
  );
}
