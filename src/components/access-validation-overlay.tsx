"use client";

import { DoorOpen, LoaderCircle, LogOut, ScanLine, ShieldCheck } from "lucide-react";
import type { ValidationSource } from "@/lib/access-validation-feedback";

interface AccessValidationOverlayProps {
  open: boolean;
  source: ValidationSource;
  mode?: "validation" | "entry" | "exit";
}

const content = {
  validation: {
    title: "Validando acceso…",
    description: "Estamos verificando la autorización del visitante.",
    icon: ShieldCheck,
  },
  entry: {
    title: "Confirmando entrada…",
    description: "Estamos registrando el ingreso de forma segura.",
    icon: DoorOpen,
  },
  exit: {
    title: "Confirmando salida…",
    description: "Estamos registrando la salida del visitante.",
    icon: LogOut,
  },
} as const;

export function AccessValidationOverlay({ open, source, mode = "validation" }: AccessValidationOverlayProps) {
  if (!open) return null;
  const state = content[mode];
  const StateIcon = state.icon;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm sm:p-6">
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-6 text-center shadow-[0_28px_80px_rgba(2,8,23,0.28)] sm:p-8"
      >
        <span className="relative mx-auto grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-700 shadow-inner ring-1 ring-blue-100">
          <StateIcon aria-hidden="true" className="size-9" />
          <LoaderCircle
            aria-hidden="true"
            className="absolute -inset-1 size-[5.5rem] animate-spin text-cyan-500 motion-reduce:animate-none"
            strokeWidth={1.5}
          />
        </span>
        <h2 className="mt-6 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          {state.title}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600 sm:text-base">
          {state.description}
        </p>
        {mode === "validation" && source === "qr" ? (
          <p className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-emerald-50 px-4 text-sm font-extrabold text-emerald-700 ring-1 ring-emerald-200">
            <ScanLine aria-hidden="true" className="size-4" />
            Código detectado correctamente
          </p>
        ) : null}
      </div>
    </div>
  );
}
