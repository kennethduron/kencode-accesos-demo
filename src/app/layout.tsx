import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Control de Accesos | Ken Code",
    template: "%s | Ken Code",
  },
  description: "Demostración conceptual de un sistema digital de control de accesos y visitas desarrollado por Ken Code.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

