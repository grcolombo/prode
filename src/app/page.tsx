import Countdown from "@/components/Countdown";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-green-950/20 to-gray-950 pointer-events-none" />

      <div className="relative flex flex-col flex-1 items-center justify-center px-6 py-12 gap-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="text-6xl mb-2">🏆</div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            PRODE
          </h1>
          <p className="text-green-400 font-semibold text-lg tracking-wide uppercase">
            Mundial 2026
          </p>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            Predecí los resultados, acumulá puntos y ganá el premio de la oficina.
          </p>
        </div>

        {/* Divisor */}
        <div className="w-16 h-px bg-white/10" />

        {/* Countdown */}
        <Countdown />

        {/* Divisor */}
        <div className="w-16 h-px bg-white/10" />

        {/* Grupos del Mundial — decorativo */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs text-gray-600 max-w-xs w-full">
          {["A","B","C","D","E","F","G","H","I","J","K","L"].map((g) => (
            <div key={g} className="bg-white/5 rounded-lg py-1">
              Grupo {g}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="w-full max-w-sm space-y-3">
          <GoogleSignInButton />
          <p className="text-center text-gray-600 text-xs">
            Usá tu cuenta de Google para ingresar
          </p>
        </div>

      </div>

      {/* Footer */}
      <footer className="relative text-center text-gray-700 text-xs py-4">
        PRODE · Mundial 2026 · {new Date().getFullYear()}
      </footer>
    </main>
  );
}
