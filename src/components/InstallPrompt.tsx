"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // No mostrar si ya está instalada como PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setVisible(false);
    setDeferredPrompt(null);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4">
      <div className="max-w-sm mx-auto bg-[#2d1a5e] border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl">
        <div className="w-10 h-10 rounded-xl bg-[#6b3db8] flex items-center justify-center shrink-0 text-lg">
          ⚽
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold leading-tight">Instalá el Prode</p>
          <p className="text-slate-400 text-xs">Accedé rápido desde tu pantalla de inicio</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setVisible(false)}
            className="text-slate-500 text-xs px-2 py-1 hover:text-slate-300 transition-colors"
          >
            Ahora no
          </button>
          <button
            onClick={handleInstall}
            className="bg-[#6b3db8] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#7c4ac9] transition-colors"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
}
