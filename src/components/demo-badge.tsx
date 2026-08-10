import { Sparkles } from "lucide-react";

export function DemoBadge() {
  return (
    <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
      <Sparkles aria-hidden="true" className="size-3.5" />
      Demo conceptual
    </span>
  );
}

