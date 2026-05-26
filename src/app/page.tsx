import Image from "next/image";
import Countdown from "@/components/Countdown";
import MagicLinkForm from "@/components/MagicLinkForm";

export default function Home() {
  return (
    <main className="relative h-screen bg-[#0a0614] text-white flex flex-col overflow-hidden">

      {/* Gradientes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#2d1a5e]/50 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[300px] h-[300px] rounded-full bg-[#4c2a8a]/20 blur-[80px]" />
      </div>

      <div className="relative flex flex-col h-full max-w-sm mx-auto w-full px-6 py-4 justify-between">

        {/* Header: Logo Tarifar */}
        <div className="flex justify-center">
          <Image
            src="/logo-blanco.png"
            alt="Tarifar"
            width={220}
            height={64}
            className="object-contain"
            priority
          />
        </div>

        {/* Centro: copa + título */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-[#6b3db8]/25 blur-2xl scale-110 rounded-full" />
            <Image
              src="/fifa-wc-2026.png"
              alt="FIFA World Cup 2026"
              width={120}
              height={150}
              className="relative mix-blend-screen"
              priority
            />
          </div>
          <div className="text-center">
            <h1 className="text-5xl font-black tracking-tight leading-none">PRODE</h1>
            <p className="text-slate-300 text-sm font-medium tracking-[0.2em] uppercase mt-1">
              Mundial 2026
            </p>
          </div>
        </div>

        {/* Countdown */}
        <Countdown />

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <div className="text-center space-y-0.5">
            <p className="text-white font-semibold text-sm">Ingresá con tu cuenta de Tarifar 4.0</p>
            <p className="text-slate-400 text-xs">Te enviamos un link a tu email para acceder</p>
          </div>
          <MagicLinkForm />
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-[10px]">
          Tarifar · Comercio Exterior · {new Date().getFullYear()}
        </p>

      </div>
    </main>
  );
}
