"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingForm() {
  const [alias, setAlias] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "saving" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const isValid = alias.trim().length >= 3 && /^[a-zA-Z0-9_\-áéíóúüñÁÉÍÓÚÜÑ ]+$/.test(alias.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setStatus("checking");
    setErrorMsg("");
    const supabase = createClient();

    // Verificar unicidad
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("alias", alias.trim())
      .maybeSingle();

    if (existing) {
      setErrorMsg("Ese alias ya está en uso. Elegí otro.");
      setStatus("error");
      return;
    }

    setStatus("saving");
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setErrorMsg("Sesión inválida. Volvé a ingresar.");
      setStatus("error");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ alias: alias.trim() })
      .eq("id", user.id);

    if (error) {
      setErrorMsg("Ocurrió un error. Intentá de nuevo.");
      setStatus("error");
      return;
    }

    router.push("/fixture");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={alias}
          onChange={(e) => {
            setAlias(e.target.value);
            setStatus("idle");
            setErrorMsg("");
          }}
          placeholder="ej: ElPibe10"
          maxLength={20}
          className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#6b3db8] focus:bg-white/8 transition-all text-center text-lg tracking-wide"
        />
        <div className="flex justify-between text-xs px-1">
          <span className={errorMsg ? "text-red-400" : "text-[#9b6ee0]/50"}>
            {errorMsg || "Mínimo 3 caracteres"}
          </span>
          <span className="text-[#9b6ee0]/30">{alias.length}/20</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!isValid || status === "checking" || status === "saving"}
        className="w-full bg-[#6b3db8] hover:bg-[#7c4ac9] text-white font-semibold py-3.5 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {status === "checking" && "Verificando..."}
        {status === "saving" && "Guardando..."}
        {(status === "idle" || status === "error") && "Confirmar alias"}
      </button>

      <p className="text-center text-[#4c2a8a] text-xs">
        Tu nombre real nunca será visible para otros participantes.
      </p>
    </form>
  );
}
