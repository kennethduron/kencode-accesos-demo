import type { Metadata } from "next";

export const SITE_URL = "https://kencode-accesos.vercel.app";
export const SOCIAL_IMAGE_PATH = "/social/ecoterra-access-demo-og-v1.jpg";
export const SOCIAL_IMAGE_WIDTH = 1211;
export const SOCIAL_IMAGE_HEIGHT = 636;
export const SOCIAL_IMAGE_ALT =
  "ECOTERRA — Demostración del Sistema Digital de Control de Accesos y Visitas desarrollado por Ken Code";

export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ECOTERRA | Sistema Digital de Control de Accesos",
    template: "%s | ECOTERRA Access Demo",
  },
  description:
    "Demostración conceptual de un sistema digital para autorizar visitantes, validar accesos y registrar entradas y salidas en ECOTERRA, desarrollada por Ken Code.",
  applicationName: "ECOTERRA Access Demo",
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "ECOTERRA Access",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "ECOTERRA Access Demo",
    title: "ECOTERRA | Sistema Digital de Control de Accesos",
    description: "Autoriza visitas antes de su llegada y valida accesos en segundos.",
    locale: "es_HN",
    images: [
      {
        url: SOCIAL_IMAGE_PATH,
        width: SOCIAL_IMAGE_WIDTH,
        height: SOCIAL_IMAGE_HEIGHT,
        alt: SOCIAL_IMAGE_ALT,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ECOTERRA | Sistema Digital de Control de Accesos",
    description: "Autoriza visitas antes de su llegada y valida accesos en segundos.",
    images: [SOCIAL_IMAGE_PATH],
  },
  formatDetection: { telephone: false },
};
