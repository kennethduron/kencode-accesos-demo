import { CheckCircle2, CircleSlash2, Clock3 } from "lucide-react";
import type { AccessStatus } from "@/types/demo";

const statusConfig = {
  active: { label: "Activo", styles: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  used: { label: "Utilizado", styles: "border-slate-200 bg-slate-100 text-slate-600", icon: CheckCircle2 },
  completed: { label: "Finalizado", styles: "border-slate-200 bg-slate-100 text-slate-600", icon: CheckCircle2 },
  expired: { label: "Vencido", styles: "border-red-200 bg-red-50 text-red-700", icon: Clock3 },
  cancelled: { label: "Cancelado", styles: "border-red-200 bg-red-50 text-red-700", icon: CircleSlash2 },
} satisfies Record<AccessStatus, { label: string; styles: string; icon: typeof CheckCircle2 }>;

export function StatusBadge({ status }: { status: AccessStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${config.styles}`}>
      <Icon aria-hidden="true" className="size-3.5" />
      {config.label}
    </span>
  );
}
