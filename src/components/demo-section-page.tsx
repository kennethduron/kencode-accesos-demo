import Link from "next/link";
import { ArrowRight, Construction, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { PageHeader } from "@/components/page-header";

interface DemoSectionPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  previewTitle: string;
  previewItems: string[];
  nextHref?: string;
  nextLabel?: string;
  activeResidentHref?: string;
}

export function DemoSectionPage({
  title,
  description,
  icon: Icon,
  previewTitle,
  previewItems,
  nextHref,
  nextLabel,
  activeResidentHref,
}: DemoSectionPageProps) {
  return (
    <AppShell>
      <PageHeader title={title} description={description} />
      <section className="surface-card overflow-hidden" aria-labelledby="preview-title">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-950 to-blue-950 p-6 text-white sm:p-8">
          <span className="grid size-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <Icon aria-hidden="true" className="size-6 text-cyan-300" />
          </span>
          <h2 id="preview-title" className="mt-5 text-xl font-bold">{previewTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">Estructura preparada para la siguiente fase del demo interactivo.</p>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-8">
          {previewItems.map((item, index) => (
            <div key={item} className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-blue-100 text-xs font-extrabold text-blue-700">{index + 1}</span>
              <span className="text-sm font-semibold text-slate-700">{item}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-500">
            <Construction aria-hidden="true" className="size-4 text-blue-600" />
            Vista conceptual de Fase 0
          </span>
          {nextHref && nextLabel ? (
            <Link href={nextHref} className="primary-button">
              {nextLabel}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          ) : null}
        </div>
      </section>
      {activeResidentHref ? <MobileBottomNav activeHref={activeResidentHref} /> : null}
    </AppShell>
  );
}

