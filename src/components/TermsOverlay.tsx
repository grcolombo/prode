"use client";

import { useState } from "react";
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
        <div className="flex flex-col gap-1">
          <div className="text-3xl">⚽</div>
          <h1 className="text-xl font-black tracking-tight">
            {isRezagado ? "¡Bienvenido, Rezagado!" : "¡Bienvenido al Prode Tarifar!"}
          </h1>
          <p className="text-[#9b6ee0] text-sm">
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
          <h2 className="text-xs font-bold text-[#9b6ee0] uppercase tracking-wider">Cómo se puntúa</h2>
          <div className="flex flex-col gap-1.5">
            {[
              { pts: "12 pts", label: "Resultado exacto (ej: 2-1 = 2-1)" },
              { pts: "5 pts",  label: "Acertás ganador o empate" },
              { pts: "2 pts",  label: "Acertás goles del local" },
              { pts: "2 pts",  label: "Acertás goles del visitante" },
            ].map(({ pts, label }) => (
              <div key={pts} className="flex items-center gap-3">
                <span className="text-white font-black text-sm w-12 shrink-0 text-right">{pts}</span>
                <span className="text-slate-300 text-sm">{label}</span>
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
        <div className="bg-[#1a0a3e] border border-[#2d1a5e] rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl shrink-0">📸</span>
          <p className="text-slate-300 text-sm">
            Seguinos en Instagram — publicamos el ranking de posiciones todos los días.{" "}
            <a
              href="https://www.instagram.com/tarifarcomext"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#9b6ee0] font-bold underline underline-offset-2"
            >
              @tarifarcomext
            </a>
          </p>
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
            className="w-full bg-[#6b3db8] hover:bg-[#7d4ed4] disabled:opacity-50 text-white font-black py-3 rounded-xl transition-colors text-base"
          >
            {loading ? "Cargando..." : "Aceptar y jugar →"}
          </button>
        </div>

      </div>
    </div>
  );
}
