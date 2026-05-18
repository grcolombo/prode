import OnboardingForm from "./OnboardingForm";

export default function OnboardingPage() {
  return (
    <main className="relative min-h-screen bg-[#0a0614] text-white flex flex-col items-center justify-center px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#2d1a5e]/40 blur-[100px]" />
      </div>
      <div className="relative w-full max-w-sm flex flex-col gap-8">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-black tracking-tight">Elegí tu alias</h1>
          <p className="text-[#9b6ee0] text-sm">
            Es tu nombre público en el PRODE. No se puede cambiar después.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </main>
  );
}
