"use client";

import Link from "next/link";
import { Bell, History, Home, PlusCircle, RotateCcw, UserRound, WifiOff, X } from "lucide-react";
import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DemoBadge } from "@/components/demo-badge";
import { DemoNotice } from "@/components/demo-notice";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { useDemoAccess } from "@/context/demo-access-context";

interface ResidentShellProps {
  children: ReactNode;
  activeHref: string;
}

const desktopItems = [
  { href: "/demo/residente", label: "Inicio", icon: Home },
  { href: "/demo/residente/nueva-visita", label: "Visitas", icon: PlusCircle },
  { href: "/demo/residente/historial", label: "Historial", icon: History },
  { href: "/demo/residente#perfil", label: "Perfil", icon: UserRound },
];

export function ResidentShell({ children, activeHref }: ResidentShellProps) {
  const { resetDemo, busy, error, online } = useDemoAccess();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const resetButtonRef = useRef<HTMLButtonElement>(null);

  async function handleReset() {
    const restored = await resetDemo();
    setMessage(restored ? "Los escenarios ficticios del demo fueron restaurados." : "No fue posible restaurar los escenarios.");
  }

  function openReset(event: MouseEvent<HTMLButtonElement>) {
    resetButtonRef.current = event.currentTarget;
    setResetOpen(true);
  }

  return (
    <div className="resident-safe-bottom min-h-screen bg-slate-50">
      <div className="fixed inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_10%_10%,rgba(37,99,235,0.12),transparent_34%),radial-gradient(circle_at_90%_12%,rgba(6,182,212,0.14),transparent_32%)]" aria-hidden="true" />
      <header className="safe-top relative z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/demo/residente" className="shrink-0" aria-label="ECOTERRA Access, inicio del residente">
            <BrandLogo priority className="w-[126px] sm:w-[150px]" />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación del residente">
            {desktopItems.map(({ href, label, icon: Icon }) => {
              const active = href === activeHref;
              return (
                <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold transition-colors ${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>
                  <Icon aria-hidden="true" className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="relative flex items-center gap-2">
            <button type="button" className="icon-button relative" aria-label="Ver notificaciones" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}>
              {notificationsOpen ? <X aria-hidden="true" className="size-5" /> : <Bell aria-hidden="true" className="size-5" />}
              <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-blue-600 text-[10px] font-black text-white" aria-label="2 notificaciones">2</span>
            </button>
            <button type="button" disabled={busy || !online} onClick={openReset} className="hidden min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex">
              <RotateCcw aria-hidden="true" className="size-4" />
              Restablecer escenarios demo
            </button>
            {notificationsOpen ? (
              <section className="absolute right-0 top-14 z-50 w-[min(21rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl" aria-label="Notificaciones conceptuales">
                <div className="flex items-center justify-between gap-3"><h2 className="font-extrabold text-slate-950">Notificaciones</h2><DemoBadge /></div>
                <div className="mt-3 space-y-2 text-sm">
                  <p className="rounded-xl bg-emerald-50 p-3 text-emerald-900"><strong>María Gómez</strong> ingresó a las 4:20 PM.</p>
                  <p className="rounded-xl bg-blue-50 p-3 text-blue-900">El permiso familiar continúa activo.</p>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        {!online ? <p role="alert" className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800"><WifiOff aria-hidden="true" className="size-5 shrink-0" />Sin conexión. Se necesita conexión a internet para crear o actualizar accesos.</p> : null}
        {children}
        <p className="mt-5 text-center text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Experiencia residente · Datos de demostración</p>
        {error ? <p role="alert" className="mx-auto mt-4 max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p> : null}
        <div className="mt-8"><DemoNotice compact /></div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-blue-700"><Home aria-hidden="true" className="size-4" />Volver al inicio del demo</Link>
        <button type="button" disabled={busy || !online} onClick={openReset} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-slate-500 disabled:opacity-60 sm:hidden">
          <RotateCcw aria-hidden="true" className="size-4" />
          Restablecer escenarios demo
        </button>
        </div>
      </main>
      <p className="sr-only" aria-live="polite">{message}</p>
      <MobileBottomNav activeHref={activeHref} />
      <ConfirmDialog open={resetOpen} title="¿Restablecer los escenarios del demo?" description="Se recuperarán únicamente los escenarios ficticios controlados de esta sesión de demostración." confirmLabel={busy ? "Restableciendo…" : "Sí, restablecer demo"} cancelLabel="Cancelar" triggerRef={resetButtonRef} onClose={() => setResetOpen(false)} onConfirm={() => void handleReset()} />
    </div>
  );
}
