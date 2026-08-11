import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";
import { ActionCard } from "@/components/action-card";
import { BrandLogo } from "@/components/brand-logo";
import { DemoBadge } from "@/components/demo-badge";
import { DemoNotice } from "@/components/demo-notice";
import { InstallDemoAction } from "@/components/pwa-runtime";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { demoAccess, demoResident } from "@/data/demo";
import { landingImages } from "@/data/landing-images";

const benefits = [
  { icon: Clock3, title: "Reduce tiempos de espera", text: "El visitante llega con una autorización preparada de antemano." },
  { icon: KeyRound, title: "Menos registros manuales", text: "Códigos únicos sustituyen procesos repetitivos y poco claros." },
  { icon: History, title: "Mantiene historial digital", text: "Entradas y salidas quedan organizadas para consulta posterior." },
  { icon: ShieldCheck, title: "Mejora la trazabilidad", text: "Cada validación comunica un estado reconocible y accionable." },
  { icon: CalendarClock, title: "Autorizaciones anticipadas", text: "El residente programa visitas antes de que lleguen al acceso." },
  { icon: UsersRound, title: "Agiliza visitas frecuentes", text: "Uber, delivery, familiares y proveedores siguen flujos simples." },
];

const demoFlow = [
  { icon: UserRound, title: "Autorice la visita", text: "El residente genera un acceso antes de la llegada." },
  { icon: QrCode, title: "Comparta el QR", text: "El visitante recibe su QR y código." },
  { icon: ShieldCheck, title: "Seguridad valida", text: "El personal valida y registra la entrada en segundos." },
];

const commercialBenefits = [
  { icon: CalendarClock, text: "Autorizaciones preparadas antes de la llegada." },
  { icon: ShieldCheck, text: "Validación clara para el personal de seguridad." },
  { icon: History, text: "Registro digital de entradas y salidas." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-slate-50">
      <header className="safe-top relative z-20 border-b border-white/10 bg-[#030b1d]">
        <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Ken Code, inicio">
            <BrandLogo priority className="w-[132px] sm:w-[164px]" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 md:inline">ECOTERRA Access Demo</span>
            <DemoBadge />
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate border-b border-slate-200 bg-white">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_16%,rgba(37,99,235,0.13),transparent_26%),radial-gradient(circle_at_82%_25%,rgba(6,182,212,0.14),transparent_28%),linear-gradient(to_bottom,#ffffff,#f8fafc)]" aria-hidden="true" />
          <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-black uppercase tracking-[0.16em] text-blue-800">
                <ShieldCheck aria-hidden="true" className="size-5" />
                ECOTERRA
              </p>
              <h1 className="text-balance text-[2.55rem] font-black leading-[1.03] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl">
                Sistema Digital de
                <span className="mt-2 block bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 bg-clip-text text-transparent">Control de Accesos y Visitas</span>
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-xl font-bold leading-8 text-slate-800">
                Autoriza visitas antes de su llegada y valida accesos en segundos.
              </p>
              <p className="mt-3 max-w-2xl text-pretty text-base leading-7 text-slate-600">
                Una demostración interactiva creada para visualizar una experiencia más ordenada, clara y ágil en ECOTERRA.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="#experiencias" className="primary-button min-w-44">
                  Explorar demo
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
                <Link href="/demo/registro" className="secondary-button inline-flex min-w-44">
                  Ver registro conceptual
                </Link>
                <InstallDemoAction />
              </div>
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

        <section aria-labelledby="residential-experience-title" className="border-b border-slate-200 bg-slate-50 py-16 sm:py-20">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-14 lg:px-8">
            <div className="max-w-xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Una operación conectada</p>
              <h2 id="residential-experience-title" className="mt-3 text-balance text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">
                Una experiencia residencial más ágil
              </h2>
              <p className="mt-5 text-pretty text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Desde una visita familiar hasta una entrega o servicio, ECOTERRA puede centralizar las autorizaciones y mantener un registro digital de cada acceso.
              </p>
              <ul className="mt-7 space-y-3">
                {commercialBenefits.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <span className="text-sm font-semibold leading-6 text-slate-700">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-3 sm:grid-cols-[3fr_2fr] sm:items-center">
              <figure className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-slate-200 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.6)] sm:aspect-[4/5]">
                <Image
                  src={landingImages.residence.src}
                  alt={landingImages.residence.alt}
                  fill
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 55vw, 36vw"
                  className="object-cover saturate-[0.92] contrast-[1.04]"
                  loading="eager"
                  quality={75}
                />
                <figcaption className="absolute bottom-3 right-3 rounded-full bg-slate-950/75 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm">
                  Imagen ilustrativa
                </figcaption>
              </figure>
              <figure className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-slate-200 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.65)] sm:aspect-[4/5]">
                <Image
                  src={landingImages.access.src}
                  alt={landingImages.access.alt}
                  fill
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 40vw, 28vw"
                  className="object-cover saturate-[0.9] contrast-[1.05]"
                  quality={75}
                />
                <figcaption className="absolute bottom-3 right-3 rounded-full bg-slate-950/75 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm">
                  Imagen ilustrativa
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section id="experiencias" className="relative scroll-mt-6 overflow-hidden bg-slate-50 py-16 sm:py-20">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_88%_18%,rgba(34,211,238,0.09),transparent_24%)]" />
          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Tres experiencias conectadas</p>
              <h2 className="mt-3 text-balance text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">Explora el concepto desde cada rol</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">Cada acceso conduce a una experiencia conectada y lista para una presentación comercial guiada.</p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <ActionCard href="/demo/residente" icon={UserRound} eyebrow="Experiencia 01" title="Residente" description="Autoriza visitas, revisa permisos y consulta accesos desde una experiencia simple." accent="blue" />
              <ActionCard href="/demo/seguridad" icon={ShieldCheck} eyebrow="Experiencia 02" title="Seguridad" description="Valida autorizaciones y reconoce rápidamente el estado de cada código." accent="cyan" />
              <ActionCard href="/demo/admin" icon={Building2} eyebrow="Experiencia 03" title="Administración" description="Visualiza la operación residencial y prepara una gestión centralizada." accent="navy" />
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#030b1d] py-16 text-white sm:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.28),transparent_30%),radial-gradient(circle_at_85%_30%,rgba(6,182,212,0.2),transparent_28%)]" aria-hidden="true" />
          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-300">Flujo de acceso</p><h2 className="mt-3 text-balance text-3xl font-black tracking-[-0.04em] sm:text-5xl">Cómo funciona</h2><p className="mt-4 text-base leading-7 text-slate-300">Tres pasos conectan al residente, el visitante y el personal de seguridad.</p></div>
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {demoFlow.map(({ icon: Icon, title, text }, index) => <li key={title} className="relative rounded-3xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-sm"><div className="flex items-center justify-between gap-4"><span className="grid size-11 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-300"><Icon aria-hidden="true" className="size-5" /></span><span className="text-3xl font-black text-white/15">0{index + 1}</span></div><h3 className="mt-5 text-lg font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{text}</p></li>)}
            </ol>
          </div>
        </section>

        <section className="relative overflow-hidden border-y border-slate-200 bg-white py-16 sm:py-20">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_8%_22%,rgba(37,99,235,0.08),transparent_26%)]" />
          <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:gap-14">
              <div className="lg:pt-2">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-700">Operación residencial</p>
                <h2 className="mt-3 text-balance text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">Diseñado para una operación residencial moderna</h2>
                <p className="mt-4 text-base leading-7 text-slate-600">Una experiencia digital orientada a reducir fricción, ordenar la operación y facilitar decisiones durante cada acceso.</p>
                <div aria-hidden="true" className="mt-8 hidden h-px w-24 bg-gradient-to-r from-blue-700 to-cyan-400 lg:block" />
              </div>
              <div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <StatCard icon={KeyRound} label="Códigos" value="Únicos" tone="blue" />
                  <StatCard icon={Clock3} label="Permisos" value="24 / 48 h" tone="green" />
                  <StatCard icon={QrCode} label="Validación" value="Ágil" tone="cyan" />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {benefits.map(({ icon: Icon, title, text }) => (
                    <article key={title} className="rounded-2xl border border-slate-200 bg-slate-50/90 p-5">
                      <span className="grid size-10 place-items-center rounded-xl bg-white text-blue-700 shadow-sm"><Icon aria-hidden="true" className="size-5" /></span>
                      <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                    </article>
                  ))}
                </div>
              </div>
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
          <p className="text-xs leading-5 text-slate-400">Sistema digital de control de accesos y visitas</p>
        </div>
      </footer>
    </div>
  );
}
