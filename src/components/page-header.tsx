import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DemoBadge } from "@/components/demo-badge";

interface PageHeaderProps {
  title: string;
  description: string;
  backHref?: string;
}

export function PageHeader({ title, description, backHref = "/" }: PageHeaderProps) {
  return (
    <header className="mb-7">
      <div className="mb-5 flex items-center justify-between gap-4">
        <Link href={backHref} className="icon-button" aria-label="Volver">
          <ArrowLeft aria-hidden="true" className="size-5" />
        </Link>
        <DemoBadge />
      </div>
      <h1 className="text-balance text-3xl font-extrabold tracking-[-0.035em] text-slate-950 sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-pretty text-base leading-7 text-slate-600">{description}</p>
    </header>
  );
}

