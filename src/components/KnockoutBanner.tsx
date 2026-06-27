"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "knockout_banner_dismissed_v1";

export default function KnockoutBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-24">
      <div className="w-full max-w-sm bg-[#2d1a5e] border border-[#6b3db8]/60 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl">

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚽</span>
            <h2 className="text-white font-black text-base leading-tight">
              ¡Arranca la fase eliminatoria!
            </h2>
          </div>
          <button
            onClick={dismiss}
            className="text-white/30 hover:text-white/70 transition-colors text-xl leading-none shrink-0 mt-0.5"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <p className="text-[#e0d0f8] text-sm leading-relaxed">
          Ya podés cargar tus pronósticos para los <span className="font-bold text-white">Dieciseisavos de Final</span>.
          Los cruces que aún no tienen equipos definidos se irán completando a medida que se confirmen.
        </p>

        <div className="bg-yellow-500/10 border border-yellow-500/25 rounded-xl px-3 py-2.5">
          <p className="text-yellow-200 text-xs">
            El cierre para pronosticar el <span className="font-bold">primer partido</span> es el{" "}
            <span className="font-bold">domingo 28/6 a las 16:00 hs</span>.
          </p>
        </div>

        <button
          onClick={dismiss}
          className="w-full bg-[#6b3db8] hover:bg-[#7d4ed4] active:scale-95 text-white font-bold py-3 rounded-xl transition-all text-sm"
        >
          Ir a pronosticar →
        </button>

      </div>
    </div>
  );
}
