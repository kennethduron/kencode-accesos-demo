import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface ActionCardProps {
  href: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  accent: "blue" | "cyan" | "navy";
}

const accents = {
  blue: "from-blue-600 to-blue-500 shadow-blue-950/15",
  cyan: "from-cyan-600 to-blue-600 shadow-cyan-950/15",
  navy: "from-slate-900 to-blue-950 shadow-slate-950/20",
};

export function ActionCard({ href, icon: Icon, eyebrow, title, description, accent }: ActionCardProps) {
  return (
    <Link
      href={href}
      className={`group relative flex min-h-56 flex-col overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300 ${accents[accent]}`}
    >
      <span className="absolute -right-10 -top-12 size-36 rounded-full border border-white/15 bg-white/5" aria-hidden="true" />
      <span className="grid size-12 place-items-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
        <Icon aria-hidden="true" className="size-6" />
      </span>
      <span className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">{eyebrow}</span>
      <span className="mt-2 flex items-center justify-between gap-4 text-xl font-extrabold">
        {title}
        <ArrowRight aria-hidden="true" className="size-5 transition-transform group-hover:translate-x-1" />
      </span>
      <span className="mt-2 max-w-sm text-sm leading-6 text-white/75">{description}</span>
    </Link>
  );
}

