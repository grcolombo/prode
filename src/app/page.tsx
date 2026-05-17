import Image from "next/image";
import Countdown from "@/components/Countdown";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#0a0614] text-white flex flex-col overflow-hidden">

      {/* Gradientes de fondo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#2d1a5e]/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#4c2a8a]/20 blur-[100px]" />
      </div>

      <div className="relative flex flex-col flex-1 items-center justify-between px-6 py-10 gap-8 max-w-md mx-auto w-full">

        {/* Logo Tarifar */}
        <div className="w-full flex justify-start pt-2">
          <Image
            src="/logo-blanco.png"
            alt="Tarifar"
            width={140}
            height={40}
            className="object-contain"
            priority
          />
        </div>

        {/* Centro */}
        <div className="flex flex-col items-center gap-8 flex-1 justify-center w-full">

          {/* Pelota SVG */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#6b3db8]/30 blur-2xl scale-110" />
            <svg
              viewBox="0 0 100 100"
              className="relative w-28 h-28 sm:w-36 sm:h-36 drop-shadow-2xl"
              aria-hidden="true"
            >
              <circle cx="50" cy="50" r="48" fill="white" stroke="#e5e7eb" strokeWidth="1" />
              {/* Hexágono central */}
              <polygon points="50,28 64,37 64,55 50,64 36,55 36,37" fill="#1a1a2e" />
              {/* Hexágonos secundarios */}
              <polygon points="50,4 62,11 62,25 50,28 38,25 38,11" fill="#1a1a2e" />
              <polygon points="78,19 90,26 90,40 78,43 68,36 70,22" fill="#1a1a2e" />
              <polygon points="82,57 94,64 92,78 80,83 70,76 70,62" fill="#1a1a2e" />
              <polygon points="50,72 62,79 60,93 50,96 38,93 38,79" fill="#1a1a2e" />
              <polygon points="18,57 30,62 30,76 18,83 8,78 6,64" fill="#1a1a2e" />
              <polygon points="22,19 30,22 32,36 22,43 10,40 10,26" fill="#1a1a2e" />
            </svg>
          </div>

          {/* Título */}
          <div className="text-center space-y-1">
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight">
              PRODE
            </h1>
            <p className="text-[#9b6ee0] font-medium text-base tracking-[0.15em] uppercase">
              Mundial 2026
            </p>
          </div>

          {/* Separador */}
          <div className="w-px h-8 bg-white/10" />

          {/* Countdown */}
          <Countdown />

          {/* Separador */}
          <div className="w-px h-8 bg-white/10" />

          {/* Descripción */}
          <p className="text-center text-[#9b6ee0]/70 text-sm leading-relaxed max-w-[260px]">
            Predecí los resultados del Mundial, acumulá puntos y ganá.
          </p>

          {/* Botón */}
          <div className="w-full">
            <GoogleSignInButton />
          </div>

        </div>

        {/* Footer */}
        <p className="text-[#2d1a5e] text-xs">
          Tarifar · Comercio Exterior · {new Date().getFullYear()}
        </p>

      </div>
    </main>
  );
}
