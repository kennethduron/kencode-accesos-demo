"use client";

import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-12">
      <section className="surface-card w-full max-w-lg p-6 text-center sm:p-8">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-700">
          <TriangleAlert aria-hidden="true" className="size-7" />
        </span>
        <h1 className="mt-5 text-2xl font-black text-slate-950">No pudimos mostrar esta pantalla</h1>
        <p className="mt-2 leading-7 text-slate-600">Puede intentarlo nuevamente o regresar al inicio de la demostración.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={reset} className="primary-button w-full"><RotateCcw aria-hidden="true" className="size-4" />Intentar nuevamente</button>
          <Link href="/" className="secondary-button inline-flex w-full">Ir al inicio</Link>
        </div>
      </section>
    </main>
  );
}
