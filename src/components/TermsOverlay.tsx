"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { acceptTerms } from "@/app/fixture/actions";

type Props = {
  isRezagado: boolean;
};

export default function TermsOverlay({ isRezagado }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    setLoading(true);
    await acceptTerms();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-sm bg-[#110828] border border-[#2d1a5e] rounded-2xl flex flex-col gap-5 p-6 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex flex-col gap-2">
          <Image
            src="/logo-blanco.png"
            alt="Tarifar"
            width={200}
            height={64}
            className="object-contain mx-auto"
          />
          <h1 className="text-base font-bold tracking-tight text-white">
            {isRezagado ? "¡Bienvenido, Rezagado!" : "¡Bienvenido al Prode Tarifar!"}
          </h1>
          <p className="text-slate-300 text-sm">
            {isRezagado
              ? "Te uniste después del inicio del torneo. Competís en tu propia tabla."
              : "Mundial 2026 · Pronosticá todos los partidos y ganá."}
          </p>
        </div>

        {/* Aviso rezagado */}
        {isRezagado && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 flex gap-2">
            <span className="text-yellow-400 text-lg shrink-0">⚠️</span>
            <p className="text-yellow-200 text-sm">
              Como te registraste después del inicio del torneo, podrás cargar pronósticos a partir de la{" "}
              <span className="font-bold">Ronda de 32</span>. Competís en la tabla de{" "}
              <span className="font-bold">Rezagados</span>, separada del ranking principal.
            </p>
          </div>
        )}

        {/* Resumen de reglas */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cómo se puntúa</h2>
          <div className="flex flex-col gap-1.5">
            {[
              { key: "exacto",    pts: "12 pts", label: "Resultado exacto (ej: 2-1 = 2-1)" },
              { key: "ganador",   pts: "5 pts",  label: "Acertás ganador o empate" },
              { key: "local",     pts: "2 pts",  label: "Acertás goles del local" },
              { key: "visitante", pts: "2 pts",  label: "Acertás goles del visitante" },
            ].map(({ key, pts, label }) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-white font-black text-sm w-14 shrink-0 text-right">{pts}</span>
                <span className="text-slate-200 text-sm">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-xs mt-1">
            El resultado exacto reemplaza los demás (no se suman).{" "}
            <Link href="/reglas" className="text-[#9b6ee0] underline underline-offset-2">
              Ver reglas completas
            </Link>
          </p>
        </div>

        {/* Redes sociales */}
        <div className="bg-[#1a0a3e] border border-[#2d1a5e] rounded-xl px-4 py-3 flex flex-col gap-2">
          <p className="text-slate-200 text-sm">
            Publicamos el ranking de posiciones todos los días en nuestras redes.
          </p>
          <a
            href="https://www.instagram.com/tarifarcomext"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 self-start"
          >
            {/* Instagram icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="#E1306C" strokeWidth="2"/>
              <circle cx="12" cy="12" r="4" stroke="#E1306C" strokeWidth="2"/>
              <circle cx="17.5" cy="6.5" r="1" fill="#E1306C"/>
            </svg>
            <span className="text-[#E1306C] font-bold text-sm">@tarifarcomext</span>
            <span className="text-slate-400 text-sm">· Seguinos</span>
          </a>
        </div>

        {/* T&C + botón */}
        <div className="flex flex-col gap-3">
          <p className="text-slate-500 text-xs text-center">
            Al continuar aceptás los{" "}
            <Link href="/terminos" className="text-[#9b6ee0] underline underline-offset-2">
              términos y condiciones
            </Link>{" "}
            del torneo.
          </p>
          <button
            onClick={handleAccept}
            disabled={loading}
            className="w-full bg-[#6b3db8] hover:bg-[#7d4ed4] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-base"
          >
            {loading ? "Cargando..." : "Aceptar y jugar →"}
          </button>
        </div>

      </div>
    </div>
  );
}
