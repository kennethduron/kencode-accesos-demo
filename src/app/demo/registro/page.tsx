"use client";

import { Building2, CheckCircle2, Home, LockKeyhole, Mail, MapPinned, Phone, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";

export default function RegistroPage() {
  const [submitted, setSubmitted] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setSubmitted(true);
  }

  return (
    <AppShell>
      <PageHeader title="Crear cuenta" description="Registra datos ficticios para conocer cómo sería la solicitud de acceso al sistema residencial." />
      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <aside className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-6 text-white shadow-xl sm:p-8">
          <ShieldCheck aria-hidden="true" className="size-10 text-cyan-300" />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">Registro conceptual</p>
          <h2 className="mt-3 text-3xl font-black">Acceso residencial en tres pasos</h2>
          <ol className="mt-7 space-y-4">
            {["Crear solicitud", "Validación administrativa", "Acceso habilitado"].map((step, index) => <li key={step} className="flex items-center gap-3 text-sm font-bold"><span className={`grid size-8 place-items-center rounded-full ${index === 0 ? "bg-cyan-400 text-slate-950" : "bg-white/10 text-white"}`}>{index + 1}</span>{step}</li>)}
          </ol>
          <p className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm leading-6 text-slate-200">Esta pantalla no crea usuarios reales ni guarda información.</p>
        </aside>

        <form onSubmit={submit} className="surface-card p-5 sm:p-7" aria-label="Registro conceptual del residente">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2"><span className="form-label"><UserRound aria-hidden="true" className="size-4" />Nombre completo</span><input required className="form-control" name="name" placeholder="Ej. Alejandro Rivera" autoComplete="name" /></label>
            <label className="block"><span className="form-label"><Mail aria-hidden="true" className="size-4" />Correo electrónico</span><input required type="email" className="form-control" name="email" placeholder="correo@ejemplo.com" autoComplete="email" /></label>
            <label className="block"><span className="form-label"><Phone aria-hidden="true" className="size-4" />Número de teléfono</span><input required type="tel" className="form-control" name="phone" placeholder="0000-0000" autoComplete="tel" /></label>
            <label className="block"><span className="form-label"><LockKeyhole aria-hidden="true" className="size-4" />Contraseña</span><input required minLength={8} type="password" className="form-control" name="password" autoComplete="new-password" /></label>
            <label className="block"><span className="form-label"><LockKeyhole aria-hidden="true" className="size-4" />Confirmar contraseña</span><input required minLength={8} type="password" className="form-control" name="confirmPassword" autoComplete="new-password" /></label>
          </div>

          <div className="my-7 flex items-center gap-3"><span className="h-px flex-1 bg-slate-200" /><h2 className="text-sm font-black text-blue-700">Información residencial</h2><span className="h-px flex-1 bg-slate-200" /></div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2"><span className="form-label"><Building2 aria-hidden="true" className="size-4" />Residencial</span><select required className="form-control" name="community" defaultValue=""><option value="" disabled>Seleccionar residencial</option><option>Residencial Valle Azul</option></select></label>
            <label className="block"><span className="form-label"><Home aria-hidden="true" className="size-4" />Vivienda</span><input required className="form-control" name="home" placeholder="Ej. Casa 27" /></label>
            <label className="block"><span className="form-label"><MapPinned aria-hidden="true" className="size-4" />Torre / bloque / sector</span><input required className="form-control" name="sector" placeholder="Ej. Sector B" /></label>
          </div>

          <p className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-900">Tu cuenta deberá ser validada antes de poder generar accesos para visitantes.</p>
          <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-700"><input required type="checkbox" className="mt-1 size-5 shrink-0 accent-blue-600" /><span>Acepto los términos de uso y la política de privacidad para esta demostración conceptual.</span></label>

          <button type="submit" className="primary-button mt-6 min-h-14 w-full text-base"><ShieldCheck aria-hidden="true" className="size-5" />Crear solicitud demo</button>
          <div aria-live="polite" className="mt-4 min-h-16">
            {submitted ? <p className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800"><CheckCircle2 aria-hidden="true" className="size-5 shrink-0" />Solicitud de registro creada para demostración. No se almacenó información.</p> : null}
          </div>
        </form>
      </div>
    </AppShell>
  );
}
