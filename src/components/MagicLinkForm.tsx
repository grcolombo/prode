"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { validateEmail } from "@/app/actions";

type Status = "idle" | "validating" | "link_sent" | "invalid" | "error";

export default function MagicLinkForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidFormat) return;

    setStatus("validating");

    const result = await validateEmail(email.trim());

    if (result.connectionError) {
      setStatus("error");
      return;
    }

    if (!result.valid) {
      setStatus("invalid");
      return;
    }

    // Usuario válido → enviar magic link
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setStatus(error ? "error" : "link_sent");
  }

  return (
    <>
      {/* Overlay: usuario validado / link enviado */}
      {status === "link_sent" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-20 sm:pb-0">
          <div className="w-full max-w-sm bg-[#110828] border border-[#2d1a5e] rounded-2xl flex flex-col gap-5 p-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-black text-lg">¡Usuario validado!</h2>
                <p className="text-slate-300 text-sm mt-1">
                  Te enviamos el link de acceso a
                </p>
                <p className="text-white font-semibold text-sm">{email.trim()}</p>
              </div>
            </div>
            <div className="bg-[#1a0a3e] border border-[#2d1a5e] rounded-xl px-4 py-3 text-center">
              <p className="text-slate-400 text-xs">
                Abrí el email y hacé clic en el link para ingresar al Prode.
                <br />
                <span className="text-slate-500">Revisá también la carpeta de spam.</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Overlay: email no válido */}
      {status === "invalid" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-20 sm:pb-0">
          <div className="w-full max-w-sm bg-[#110828] border border-[#2d1a5e] rounded-2xl flex flex-col gap-5 p-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-black text-lg">Email no encontrado</h2>
                <p className="text-slate-300 text-sm mt-1">
                  El email <span className="text-white font-semibold">{email.trim()}</span> no
                  corresponde a un usuario activo de Tarifar 4.0.
                </p>
              </div>
            </div>
            <div className="bg-[#1a0a3e] border border-[#2d1a5e] rounded-xl px-4 py-3">
              <p className="text-slate-400 text-xs text-center">
                Revisá los datos ingresados o contactate con el equipo de ventas:
              </p>
              <a
                href="mailto:ventas@tarifar.com?subject=No%20puedo%20inscribirme%20a%20Prode%20Tarifar"
                className="mt-2 flex items-center justify-center gap-1.5 text-[#9b6ee0] font-semibold text-sm hover:text-[#b88ef0] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                ventas@tarifar.com
              </a>
            </div>
            <button
              onClick={() => { setStatus("idle"); }}
              className="w-full border border-[#2d1a5e] text-slate-300 font-semibold py-3 rounded-xl transition-colors hover:bg-white/5 text-sm"
            >
              Intentar con otro email
            </button>
          </div>
        </div>
      )}

      {/* Overlay: error de conexión */}
      {status === "error" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-20 sm:pb-0">
          <div className="w-full max-w-sm bg-[#110828] border border-[#2d1a5e] rounded-2xl flex flex-col gap-4 p-6">
            <div className="text-center">
              <h2 className="text-white font-black text-lg">Error de conexión</h2>
              <p className="text-slate-400 text-sm mt-1">
                No pudimos verificar tu cuenta. Intentá de nuevo en unos minutos.
              </p>
            </div>
            <button
              onClick={() => setStatus("idle")}
              className="w-full border border-[#2d1a5e] text-slate-300 font-semibold py-3 rounded-xl transition-colors hover:bg-white/5 text-sm"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu-email@ejemplo.com"
          disabled={status === "validating"}
          className={`bg-white/5 border border-white/10 rounded-2xl px-4 text-white placeholder-white/30 focus:outline-none focus:border-[#6b3db8] transition-all text-sm text-center disabled:opacity-50 ${
            compact ? "py-2" : "py-3"
          }`}
        />
        <button
          type="submit"
          disabled={!isValidFormat || status === "validating"}
          className={`w-full bg-[#6b3db8] hover:bg-[#7c4ac9] text-white font-semibold rounded-2xl transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed text-sm ${
            compact ? "py-2" : "py-3"
          }`}
        >
          {status === "validating" ? "Verificando..." : "Ingresar →"}
        </button>
      </form>
    </>
  );
}
