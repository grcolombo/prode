import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PRODE Mundial 2026",
    short_name: "PRODE 2026",
    description: "Juego de pronósticos del Mundial 2026 — Tarifar",
    start_url: "/fixture",
    display: "standalone",
    background_color: "#0a0614",
    theme_color: "#0a0614",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
