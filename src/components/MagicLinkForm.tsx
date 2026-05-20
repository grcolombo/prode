"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function MagicLinkForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail) return;

    setStatus("sending");
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });

    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <div className="text-center space-y-1 py-1">
        <p className="text-white font-semibold text-sm">Revisá tu email</p>
        <p className="text-[#9b6ee0] text-xs">
          Te mandamos un link a <span className="text-white/70">{email.trim()}</span>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setStatus("idle");
        }}
        placeholder="tu@email.com"
        className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#6b3db8] transition-all text-sm text-center"
      />
      {status === "error" && (
        <p className="text-red-400 text-xs text-center">Error al enviar. Intentá de nuevo.</p>
      )}
      <button
        type="submit"
        disabled={!isValidEmail || status === "sending"}
        className="w-full border border-[#6b3db8]/60 text-[#9b6ee0] font-semibold py-3 rounded-2xl transition-all hover:bg-[#6b3db8]/10 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-sm"
      >
        {status === "sending" ? "Enviando..." : "Ingresar con email"}
      </button>
    </form>
  );
}
