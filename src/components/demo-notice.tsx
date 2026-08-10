import { Info } from "lucide-react";
import { demoNotice } from "@/data/demo";

interface DemoNoticeProps {
  compact?: boolean;
}

export function DemoNotice({ compact = false }: DemoNoticeProps) {
  return (
    <aside
      className={`flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/80 text-slate-600 ${
        compact ? "p-4 text-xs" : "p-5 text-sm"
      }`}
      aria-label="Aviso sobre los datos de demostración"
    >
      <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-blue-600" />
      <p>
        <span className="font-bold text-slate-800">Demostración conceptual desarrollada por Ken Code.</span>{" "}
        {demoNotice}
      </p>
    </aside>
  );
}
