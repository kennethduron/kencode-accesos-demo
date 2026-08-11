"use client";

import { useRouter } from "next/navigation";
import {
  Bike,
  BriefcaseBusiness,
  CalendarDays,
  Car,
  Clock3,
  Footprints,
  PackageCheck,
  ShieldCheck,
  Smile,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ResidentPageHeader } from "@/components/resident-page-header";
import { ResidentShell } from "@/components/resident-shell";
import { useDemoAccess } from "@/context/demo-access-context";
import {
  entryTypeLabels,
  validateAuthorizationInput,
  validityLabels,
  visitTypeLabels,
  toLocalDateInput,
  toLocalTimeInput,
  type AuthorizationErrors,
} from "@/lib/access";
import type { AuthorizationInput, EntryType, ValidityType, VisitType } from "@/types/demo";

const visitOptions = [
  { value: "uber" as const, icon: Car, tone: "text-blue-700" },
  { value: "delivery" as const, icon: PackageCheck, tone: "text-rose-600" },
  { value: "family" as const, icon: UsersRound, tone: "text-cyan-600" },
  { value: "friend" as const, icon: Smile, tone: "text-emerald-600" },
  { value: "provider" as const, icon: BriefcaseBusiness, tone: "text-violet-600" },
  { value: "other" as const, icon: UserRound, tone: "text-slate-600" },
];

const entryOptions = [
  { value: "car" as const, icon: Car },
  { value: "motorcycle" as const, icon: Bike },
  { value: "pedestrian" as const, icon: Footprints },
];

const validityOptions: ValidityType[] = ["single", "24h", "48h", "custom"];

function initialForm(): AuthorizationInput {
  return {
    visitorName: "María Gómez",
    visitType: "uber",
    entryType: "car",
    vehicle: "Toyota Corolla gris",
    plate: "ABC-123",
    date: "",
    time: "",
    validity: "single",
    customExpiresAt: "",
  };
}

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return <p id={id} role="alert" className="mt-2 text-sm font-semibold text-red-600">{children}</p>;
}

export default function NuevaVisitaPage() {
  const router = useRouter();
  const { createAccess, error: repositoryError, busy, online } = useDemoAccess();
  const [form, setForm] = useState<AuthorizationInput>(initialForm);
  const [errors, setErrors] = useState<AuthorizationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const vehicleVisible = form.entryType !== "pedestrian";
  const familyMode = form.visitType === "family";
  const minDateTime = `${form.date}T${form.time}`;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const scheduled = new Date();
      scheduled.setSeconds(0, 0);
      setForm((current) => current.date && current.time ? current : { ...current, date: toLocalDateInput(scheduled), time: toLocalTimeInput(scheduled) });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function update<K extends keyof AuthorizationInput>(key: K, value: AuthorizationInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function selectVisitType(value: VisitType) {
    setForm((current) => ({
      ...current,
      visitType: value,
      validity: value === "family" ? "48h" : value === "uber" || value === "delivery" ? "single" : current.validity,
    }));
    setErrors((current) => ({ ...current, validity: undefined }));
  }

  function selectEntryType(value: EntryType) {
    setForm((current) => ({ ...current, entryType: value }));
    setErrors((current) => ({ ...current, plate: undefined }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateAuthorizationInput(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await createAccess(form);
      router.push("/demo/residente/codigo");
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <ResidentShell activeHref="/demo/residente/nueva-visita">
      <ResidentPageHeader title="Nueva visita" description="Completa la información para generar una autorización de acceso." />
      <form onSubmit={submit} noValidate className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]" aria-label="Formulario para crear una visita">
        <div className="space-y-6">
          <fieldset className="surface-card p-5 sm:p-6">
            <legend className="px-1 text-base font-black text-slate-950">Tipo de visita</legend>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6 xl:grid-cols-3">
              {visitOptions.map(({ value, icon: Icon, tone }) => (
                <label key={value} className={`relative flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-2xl border p-2 text-center transition ${form.visitType === value ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white hover:border-blue-200"}`}>
                  <input className="sr-only" type="radio" name="visitType" value={value} checked={form.visitType === value} onChange={() => selectVisitType(value)} />
                  <Icon aria-hidden="true" className={`size-6 ${tone}`} /><span className="mt-2 text-xs font-bold text-slate-700">{visitTypeLabels[value]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="surface-card p-5 sm:p-6">
            <legend className="px-1 text-base font-black text-slate-950">Tipo de ingreso</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {entryOptions.map(({ value, icon: Icon }) => (
                <label key={value} className={`flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 text-sm font-bold transition ${form.entryType === value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"}`}>
                  <input className="sr-only" type="radio" name="entryType" value={value} checked={form.entryType === value} onChange={() => selectEntryType(value)} />
                  <Icon aria-hidden="true" className="size-5" />{entryTypeLabels[value]}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <section className="surface-card p-5 sm:p-7" aria-labelledby="visit-data-title">
          <h2 id="visit-data-title" className="text-lg font-black text-slate-950">Información de la autorización</h2>
          <div className="mt-5 space-y-5">
            <div>
              <label htmlFor="visitorName" className="form-label">Nombre del visitante</label>
              <input id="visitorName" className="form-control" value={form.visitorName} onChange={(event) => update("visitorName", event.target.value)} placeholder="Ej. Juan Pérez" aria-invalid={Boolean(errors.visitorName)} aria-describedby={errors.visitorName ? "visitorName-error" : undefined} autoComplete="off" />
              <FieldError id="visitorName-error">{errors.visitorName}</FieldError>
            </div>

            {vehicleVisible ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="plate" className="form-label">Placa</label>
                  <input id="plate" className="form-control uppercase" value={form.plate} onChange={(event) => update("plate", event.target.value)} placeholder="Ej. ABC-123" aria-invalid={Boolean(errors.plate)} aria-describedby={errors.plate ? "plate-error" : undefined} autoComplete="off" />
                  <FieldError id="plate-error">{errors.plate}</FieldError>
                </div>
                <div>
                  <label htmlFor="vehicle" className="form-label">Modelo o descripción <span className="font-normal text-slate-400">(opcional)</span></label>
                  <input id="vehicle" className="form-control" value={form.vehicle} onChange={(event) => update("vehicle", event.target.value)} placeholder={form.entryType === "motorcycle" ? "Ej. Honda Navi roja" : "Ej. Toyota Corolla gris"} autoComplete="off" />
                </div>
              </div>
            ) : (
              <p className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">Ingreso peatonal seleccionado. No se solicitarán datos de vehículo.</p>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="date" className="form-label"><CalendarDays aria-hidden="true" className="size-4" />Fecha</label>
                <input id="date" type="date" className="form-control" value={form.date} onChange={(event) => update("date", event.target.value)} aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? "date-error" : undefined} />
                <FieldError id="date-error">{errors.date}</FieldError>
              </div>
              <div>
                <label htmlFor="time" className="form-label"><Clock3 aria-hidden="true" className="size-4" />Hora</label>
                <input id="time" type="time" className="form-control" value={form.time} onChange={(event) => update("time", event.target.value)} aria-invalid={Boolean(errors.time)} aria-describedby={errors.time ? "time-error" : undefined} />
                <FieldError id="time-error">{errors.time}</FieldError>
              </div>
            </div>

            <fieldset>
              <legend className="form-label">Duración / vigencia</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {validityOptions.map((value) => {
                  const disabled = familyMode && !["24h", "48h"].includes(value);
                  return (
                    <label key={value} className={`flex min-h-20 flex-col items-center justify-center rounded-2xl border p-2 text-center text-xs font-bold transition ${disabled ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300" : form.validity === value ? "cursor-pointer border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100" : "cursor-pointer border-slate-200 bg-white text-slate-600 hover:border-blue-200"}`}>
                      <input className="sr-only" type="radio" name="validity" value={value} checked={form.validity === value} disabled={disabled} onChange={() => update("validity", value)} />
                      <Clock3 aria-hidden="true" className="mb-2 size-5" />{validityLabels[value]}
                    </label>
                  );
                })}
              </div>
              <FieldError id="validity-error">{errors.validity}</FieldError>
            </fieldset>

            {form.validity === "custom" ? (
              <div>
                <label htmlFor="customExpiresAt" className="form-label">Fecha y hora de expiración</label>
                <input id="customExpiresAt" type="datetime-local" min={minDateTime} className="form-control" value={form.customExpiresAt} onChange={(event) => update("customExpiresAt", event.target.value)} aria-invalid={Boolean(errors.customExpiresAt)} aria-describedby={errors.customExpiresAt ? "customExpiresAt-error" : undefined} />
                <FieldError id="customExpiresAt-error">{errors.customExpiresAt}</FieldError>
              </div>
            ) : null}

            {familyMode ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-800">Los permisos familiares permiten múltiples entradas y salidas durante 24 o 48 horas.</p> : null}

            {repositoryError ? <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{repositoryError}</p> : null}
            <button type="submit" disabled={!online || submitting || busy} className="primary-button min-h-14 w-full text-base disabled:cursor-not-allowed disabled:opacity-70">
              <ShieldCheck aria-hidden="true" className="size-5" />
              {submitting ? "Generando acceso…" : "Generar acceso"}
            </button>
          </div>
        </section>
      </form>
    </ResidentShell>
  );
}
