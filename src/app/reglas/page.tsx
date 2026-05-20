import BottomNav from "@/components/BottomNav";

const EXAMPLES = [
  { pred: "3-1", pts: 12, label: "Resultado exacto" },
  { pred: "2-1", pts: 7, label: "Ganador + goles visitante" },
  { pred: "2-0", pts: 5, label: "Solo ganador" },
  { pred: "0-1", pts: 2, label: "Solo goles visitante" },
  { pred: "0-0", pts: 0, label: "Sin acierto" },
];

const SCORING = [
  { pts: 12, desc: "Resultado exacto (score exacto)" },
  { pts: 5, desc: "Ganador o empate (sin exacto)" },
  { pts: 2, desc: "Goles equipo local (sin exacto)" },
  { pts: 2, desc: "Goles equipo visitante (sin exacto)" },
];

const TIEBREAKERS = [
  "Más puntos totales",
  "Más resultados exactos",
  "Más aciertos de goles local",
  "Más aciertos de goles visitante",
];

export default function ReglasPage() {
  return (
    <main className="relative min-h-screen bg-[#0a0614] text-white pb-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#2d1a5e]/40 blur-[100px]" />
      </div>

      <div className="relative max-w-sm mx-auto px-4 py-6 flex flex-col gap-8">

        <div>
          <h1 className="text-2xl font-black tracking-tight">Sistema de puntos</h1>
          <p className="text-[#9b6ee0] text-xs mt-1">Mundial 2026</p>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold text-[#4c2a8a] uppercase tracking-widest">
            Puntaje por partido
          </h2>
          <div className="bg-[#110828] border border-[#1e0e42] rounded-xl overflow-hidden">
            {SCORING.map(({ pts, desc }, i) => (
              <div
                key={desc}
                className={`flex items-center gap-4 px-4 py-3 ${
                  i < SCORING.length - 1 ? "border-b border-[#1e0e42]" : ""
                }`}
              >
                <span
                  className={`shrink-0 w-10 text-center font-black text-lg ${
                    pts === 12
                      ? "text-yellow-400"
                      : pts === 5
                      ? "text-green-400"
                      : "text-blue-300"
                  }`}
                >
                  {pts}
                </span>
                <span className="text-sm text-[#d4c0f0]">{desc}</span>
              </div>
            ))}
          </div>
          <p className="text-[#4c2a8a] text-xs px-1">
            El resultado exacto reemplaza todos los demás (no se suman).
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold text-[#4c2a8a] uppercase tracking-widest">
            Ejemplos — resultado real: <span className="text-white normal-case">Argentina 3-1 Nigeria</span>
          </h2>
          <div className="bg-[#110828] border border-[#1e0e42] rounded-xl overflow-hidden">
            {EXAMPLES.map(({ pred, pts, label }, i) => (
              <div
                key={pred}
                className={`flex items-center gap-3 px-4 py-3 ${
                  i < EXAMPLES.length - 1 ? "border-b border-[#1e0e42]" : ""
                }`}
              >
                <span className="w-10 text-center font-mono text-sm text-[#9b6ee0] font-bold">
                  {pred}
                </span>
                <span className="flex-1 text-xs text-[#9b6ee0]">{label}</span>
                <span
                  className={`font-black text-base w-8 text-right ${
                    pts === 12
                      ? "text-yellow-400"
                      : pts >= 5
                      ? "text-green-400"
                      : pts > 0
                      ? "text-blue-300"
                      : "text-[#2d1a5e]"
                  }`}
                >
                  {pts}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold text-[#4c2a8a] uppercase tracking-widest">
            Desempate (en orden)
          </h2>
          <div className="bg-[#110828] border border-[#1e0e42] rounded-xl overflow-hidden">
            {TIEBREAKERS.map((item, i) => (
              <div
                key={item}
                className={`flex items-center gap-4 px-4 py-3 ${
                  i < TIEBREAKERS.length - 1 ? "border-b border-[#1e0e42]" : ""
                }`}
              >
                <span className="shrink-0 w-5 text-center text-[#4c2a8a] font-bold text-sm">
                  {i + 1}
                </span>
                <span className="text-sm text-[#d4c0f0]">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#1a0a3e] border border-[#2d1a5e] rounded-xl px-4 py-4 flex flex-col gap-1">
          <h2 className="text-xs font-bold text-[#9b6ee0] uppercase tracking-widest">
            Cierre de pronósticos
          </h2>
          <p className="text-white font-bold text-sm">
            11 de junio de 2026, 16:00 hs (Argentina)
          </p>
          <p className="text-[#4c2a8a] text-xs">
            Después del cierre el fixture pasa a modo solo lectura y se muestran los resultados reales.
          </p>
        </section>

      </div>

      <BottomNav />
    </main>
  );
}
