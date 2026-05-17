import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRODE Mundial 2026",
  description: "Juego de pronósticos del Mundial 2026",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
