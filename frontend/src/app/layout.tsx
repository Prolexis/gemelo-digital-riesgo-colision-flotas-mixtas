import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gemelo Digital — Mantenimiento de Carguío",
  description: "Gemelo digital 3D para gestión de mantenimiento de equipos de carguío pesado",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
