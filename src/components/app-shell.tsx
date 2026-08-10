import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { DemoNotice } from "@/components/demo-notice";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="fixed inset-x-0 top-0 z-0 h-72 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.12),transparent_38%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_42%)]" aria-hidden="true" />
      <nav className="relative z-10 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl" aria-label="Navegación principal">
        <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Ir al inicio">
            <BrandLogo className="w-[132px] sm:w-[154px]" />
          </Link>
          <Link href="/" className="secondary-button hidden sm:inline-flex">Ver experiencias</Link>
        </div>
      </nav>
      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {children}
        <div className="mt-8">
          <DemoNotice compact />
        </div>
      </main>
    </div>
  );
}

