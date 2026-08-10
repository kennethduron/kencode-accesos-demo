import Link from "next/link";
import { History, Home, PlusCircle, UserRound } from "lucide-react";

const items = [
  { href: "/demo/residente", label: "Inicio", icon: Home },
  { href: "/demo/residente/nueva-visita", label: "Visitas", icon: PlusCircle },
  { href: "/demo/residente/historial", label: "Historial", icon: History },
  { href: "/demo/residente#perfil", label: "Perfil", icon: UserRound },
];

export function MobileBottomNav({ activeHref }: { activeHref: string }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 gap-1 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_35px_-25px_rgba(15,23,42,0.5)] backdrop-blur-xl md:hidden" aria-label="Navegación del residente">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href === activeHref;
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition-colors ${active ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}>
            <Icon aria-hidden="true" className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
