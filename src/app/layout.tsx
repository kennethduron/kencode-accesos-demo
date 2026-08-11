import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { PwaRuntime } from "@/components/pwa-runtime";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ken Code Access | Control de Accesos",
    template: "%s | Ken Code Access",
  },
  description: "Demostración conceptual de un sistema digital para autorizar visitantes, validar accesos y registrar entradas y salidas.",
  applicationName: "Ken Code Access Demo",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Ken Code Access",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#071b3a",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es-HN" data-scroll-behavior="smooth">
      <body><PwaRuntime>{children}</PwaRuntime></body>
    </html>
  );
}
