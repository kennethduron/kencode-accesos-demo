"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Download, Share2, Wifi, WifiOff } from "lucide-react";
import { shouldShowIosInstallHelp } from "@/lib/connectivity";
import { useOnlineStatus } from "@/hooks/use-online-status";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface InstallContextValue {
  canPrompt: boolean;
  showIosHelp: boolean;
  installing: boolean;
  promptInstall: () => Promise<void>;
}

const InstallContext = createContext<InstallContextValue>({
  canPrompt: false,
  showIosHelp: false,
  installing: false,
  promptInstall: async () => undefined,
});

function getInstallEnvironment() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return {
    userAgent: navigator.userAgent,
    navigatorStandalone: navigatorWithStandalone.standalone,
    displayModeStandalone: window.matchMedia("(display-mode: standalone)").matches,
  };
}

export function PwaRuntime({ children }: { children: ReactNode }) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [installing, setInstalling] = useState(false);
  const online = useOnlineStatus();

  useEffect(() => {
    const environmentTimer = window.setTimeout(() => {
      setShowIosHelp(shouldShowIosInstallHelp(getInstallEnvironment()));
    }, 0);

    const captureInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const finishInstall = () => {
      setInstallEvent(null);
      setShowIosHelp(false);
    };

    window.addEventListener("beforeinstallprompt", captureInstall);
    window.addEventListener("appinstalled", finishInstall);
    return () => {
      window.clearTimeout(environmentTimer);
      window.removeEventListener("beforeinstallprompt", captureInstall);
      window.removeEventListener("appinstalled", finishInstall);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => undefined);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installEvent || installing) return;
    setInstalling(true);
    try {
      await installEvent.prompt();
      await installEvent.userChoice;
      setInstallEvent(null);
    } finally {
      setInstalling(false);
    }
  }, [installEvent, installing]);

  const value = useMemo(() => ({
    canPrompt: Boolean(installEvent),
    showIosHelp,
    installing,
    promptInstall,
  }), [installEvent, installing, promptInstall, showIosHelp]);

  return (
    <InstallContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`connection-pill ${online ? "connection-pill-online" : "connection-pill-offline"}`}
      >
        {online ? <Wifi aria-hidden="true" className="size-3.5" /> : <WifiOff aria-hidden="true" className="size-3.5" />}
        {online ? "Conectado" : "Sin conexión"}
      </div>
    </InstallContext.Provider>
  );
}

export function InstallDemoAction() {
  const { canPrompt, showIosHelp, installing, promptInstall } = useContext(InstallContext);

  if (canPrompt) {
    return (
      <button type="button" disabled={installing} onClick={() => void promptInstall()} className="secondary-button inline-flex min-w-44 gap-2 disabled:cursor-wait disabled:opacity-60">
        <Download aria-hidden="true" className="size-4" />
        {installing ? "Preparando…" : "Instalar demo"}
      </button>
    );
  }

  if (showIosHelp) {
    return (
      <p className="flex max-w-sm items-start gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-5 text-slate-600 shadow-sm">
        <Share2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-blue-700" />
        En Safari, use Compartir → Agregar a pantalla de inicio.
      </p>
    );
  }

  return null;
}
