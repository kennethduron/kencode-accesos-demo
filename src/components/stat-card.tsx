import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: "blue" | "cyan" | "green";
}

const toneStyles = {
  blue: "bg-blue-50 text-blue-700",
  cyan: "bg-cyan-50 text-cyan-700",
  green: "bg-emerald-50 text-emerald-700",
};

export function StatCard({ icon: Icon, label, value, tone = "blue" }: StatCardProps) {
  return (
    <article className="surface-card flex min-w-0 items-center gap-3 p-4">
      <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${toneStyles[tone]}`}>
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 text-xl font-extrabold tracking-tight text-slate-950">{value}</p>
      </div>
    </article>
  );
}

