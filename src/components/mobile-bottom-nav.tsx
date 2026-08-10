import Link from "next/link";
import { History, Home, PlusCircle, QrCode } from "lucide-react";

const items = [
  { href: "/demo/residente", label: "Inicio", icon: Home },
  { href: "/demo/residente/nueva-visita", label: "Nueva visita", icon: PlusCircle },
  { href: "/demo/residente/codigo", label: "Código", icon: QrCode },
  { href: "/demo/residente/historial", label: "Historial", icon: History },
];

export function MobileBottomNav({ activeHref }: { activeHref: string }) {
  return (
    <nav className="mt-8 grid grid-cols-4 gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:hidden" aria-label="Navegación del residente">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href === activeHref;
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold ${active ? "bg-blue-50 text-blue-700" : "text-slate-500"}`}>
            <Icon aria-hidden="true" className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

