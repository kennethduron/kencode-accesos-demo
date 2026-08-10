import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface ResidentPageHeaderProps {
  title: string;
  description: string;
  backHref?: string;
  action?: ReactNode;
}

export function ResidentPageHeader({ title, description, backHref = "/demo/residente", action }: ResidentPageHeaderProps) {
  return (
    <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Link href={backHref} className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-bold text-slate-600 transition-colors hover:text-blue-700">
          <ArrowLeft aria-hidden="true" className="size-5" />
          Volver
        </Link>
        <h1 className="text-balance text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
      </div>
      {action}
    </header>
  );
}
