import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingForm from "./OnboardingForm";

const DEADLINE = new Date("2026-06-11T19:00:00Z");

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const rezagadosEnabled = process.env.REZAGADOS_ENABLED === 'true';
  const isPastDeadline = new Date() > DEADLINE;

  if (isPastDeadline && !rezagadosEnabled) {
    return (
      <main className="relative min-h-screen bg-[#442d8e] text-white flex flex-col items-center justify-center px-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#2d1a5e]/40 blur-[100px]" />
        </div>
        <div className="relative w-full max-w-sm flex flex-col gap-6 text-center">
          <div className="text-5xl">🔒</div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight">Inscripción cerrada</h1>
            <p className="text-[#e0d0f8] text-sm">
              El período de inscripción finalizó el 11 de junio de 2026.<br />
              No es posible registrarse una vez iniciado el torneo.
            </p>
          </div>
          <p className="text-[#c4a7f0] text-xs">
            ¿Tenés dudas? Contactá a{" "}
            <span className="text-[#e0d0f8]">gcolombo@tarifar.com</span>
          </p>
        </div>
      </main>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (
    <main className="relative min-h-screen bg-[#442d8e] text-white flex flex-col items-center justify-center px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#2d1a5e]/40 blur-[100px]" />
      </div>
      <div className="relative w-full max-w-sm flex flex-col gap-8">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-black tracking-tight">Elegí tu alias</h1>
          <p className="text-[#e0d0f8] text-sm">
            Es tu nombre público en el PRODE. No se puede cambiar después.
          </p>
        </div>
        <OnboardingForm
          email={user.email!}
          isClient={profile?.role === 'client'}
        />
      </div>
    </main>
  );
}
