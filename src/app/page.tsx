import Image from "next/image";
import Countdown from "@/components/Countdown";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function Home() {
  return (
    <main className="relative h-screen bg-[#0a0614] text-white flex flex-col overflow-hidden">

      {/* Gradientes de fondo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#2d1a5e]/50 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[300px] h-[300px] rounded-full bg-[#4c2a8a]/20 blur-[80px]" />
      </div>

      <div className="relative flex flex-col h-full max-w-sm mx-auto w-full px-6 py-6 justify-between">

        {/* Header: Logo */}
        <div>
          <Image
            src="/logo-blanco.png"
            alt="Tarifar"
            width={120}
            height={34}
            className="object-contain"
            priority
          />
        </div>

        {/* Centro: imagen + título */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-[#6b3db8]/25 blur-2xl scale-110 rounded-full" />
            <Image
              src="/fifa-wc-2026.png"
              alt="FIFA World Cup 2026"
              width={160}
              height={200}
              className="relative mix-blend-screen"
              priority
            />
          </div>
          <div className="text-center">
            <h1 className="text-5xl font-black tracking-tight leading-none">PRODE</h1>
            <p className="text-[#9b6ee0] text-sm font-medium tracking-[0.2em] uppercase mt-1">
              Mundial 2026
            </p>
          </div>
        </div>

        {/* Countdown */}
        <Countdown />

        {/* CTA */}
        <div className="flex flex-col gap-2">
          <GoogleSignInButton />
          <p className="text-center text-[#4c2a8a] text-xs">
            Ingresá con tu cuenta de Google
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[#2d1a5e] text-[10px]">
          Tarifar · Comercio Exterior · {new Date().getFullYear()}
        </p>

      </div>
    </main>
  );
}
