import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import RealtimeRefresher from "@/components/RealtimeRefresher";
import TermsOverlay from "@/components/TermsOverlay";
import { buildCareerTables, menotistaScore, type RankingRow } from "@/lib/premios";

const DEADLINE = new Date("2026-06-11T19:00:00Z");

const posColors = ["text-yellow-400", "text-slate-300", "text-amber-600"];
const posLabels = ["1°", "2°", "3°"];

function MiniTabla({
  titulo,
  emoji,
  subtitulo,
  sorted,
  myAlias,
  statFn,
  statLabel,
  isPastDeadline,
}: {
  titulo: string;
  emoji: string;
  subtitulo: string;
  sorted: RankingRow[];
  myAlias: string;
  statFn: (r: RankingRow) => number;
  statLabel: string;
  isPastDeadline: boolean;
}) {
  const top5 = sorted.slice(0, 5);
  const myIndex = sorted.findIndex(r => r.alias === myAlias);
  const isInTop5 = myIndex < 5;
  const myRow = myIndex >= 0 ? sorted[myIndex] : null;

  const Fila = ({ row, pos }: { row: RankingRow; pos: number }) => {
    const isMe = row.alias === myAlias;
    const isTop3 = pos <= 3;
    const stat = statFn(row);
    const href = isMe ? "/mis-pronosticos" : `/pronosticos/${encodeURIComponent(row.alias)}`;

    const inner = (
      <>
        <span className={`w-7 shrink-0 text-center text-sm font-black ${isTop3 ? posColors[pos - 1] : "text-[#c4a7f0]"}`}>
          {isTop3 ? posLabels[pos - 1] : `${pos}°`}
        </span>
        <span className={`flex-1 font-semibold text-sm truncate ${isMe ? "text-white" : "text-[#d4c0f0]"}`}>
          {row.alias}
          {isMe && <span className="ml-1.5 text-[#e0d0f8] text-xs font-normal">(vos)</span>}
        </span>
        <span className="shrink-0 text-right">
          <span className="text-white font-black text-base">{stat}</span>
          <span className="text-[#c4a7f0] text-[10px] ml-1">{statLabel}</span>
        </span>
      </>
    );

    const cls = `flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors ${
      isMe ? "bg-[#2d1a5e] border-[#6b3db8]" : "bg-[#1e0e42]/60 border-white/10"
    }`;

    return isPastDeadline || isMe ? (
      <Link key={row.alias} href={href} className={cls}>{inner}</Link>
    ) : (
      <div key={row.alias} className={cls}>{inner}</div>
    );
  };

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <span className="text-base">{emoji}</span>
        <div>
          <h2 className="text-sm font-black text-white">{titulo}</h2>
          <p className="text-[#c4a7f0] text-[10px]">{subtitulo}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {top5.map((row, i) => <Fila key={row.alias} row={row} pos={i + 1} />)}

        {!isInTop5 && myRow && (
          <>
            <div className="text-center text-[#6b4fa0] text-xs py-0.5">· · ·</div>
            <Fila row={myRow} pos={myIndex + 1} />
          </>
        )}
      </div>
    </section>
  );
}

export default async function RankingPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("alias, role, is_rezagado, accepted_terms")
    .eq("id", user.id)
    .single();

  if (!profile?.alias) redirect("/onboarding");

  const rezagadosEnabled = process.env.REZAGADOS_ENABLED === "true";

  const [{ data: ranking }, { data: rezagadosRanking }] = await Promise.all([
    supabase.rpc("get_ranking", { p_role: profile.role }),
    rezagadosEnabled && profile.role === "client"
      ? supabase.rpc("get_rezagados_ranking")
      : Promise.resolve({ data: null }),
  ]);

  const rows = (ranking ?? []) as RankingRow[];
  const rezagadosRows = (rezagadosRanking ?? []) as { alias: string; total_points: number; exact_results: number }[];
  const title = profile.role === "employee" ? "Ranking Empleados" : "Ranking Clientes";
  const isPastDeadline = new Date() > DEADLINE;

  // Tablas en cascada: cada participante lidera una sola carrera (el ganador de
  // una carrera de mayor jerarquía se excluye de las siguientes).
  const { campeones: byPuntos, adivino: byExactos, menotista: byMenotista, bilardista: byBilardista } =
    buildCareerTables(rows);

  return (
    <main className="relative min-h-screen bg-[#442d8e] text-white pb-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#2d1a5e]/40 blur-[100px]" />
      </div>

      <div className="relative max-w-sm mx-auto px-4 py-6 flex flex-col gap-6">

        <div>
          <h1 className="text-2xl font-black tracking-tight">{title}</h1>
          <p className="text-[#e0d0f8] text-xs mt-1">Solo ves a los de tu grupo</p>
        </div>

        {rows.length === 0 ? (
          <p className="text-[#c4a7f0] text-center py-16 text-sm">
            Todavía no hay participantes
          </p>
        ) : (
          <>
            <MiniTabla
              titulo="Carrera de Campeones"
              emoji="🏆"
              subtitulo="Puntos totales acumulados"
              sorted={byPuntos}
              myAlias={profile.alias}
              statFn={r => r.total_points}
              statLabel="pts"
              isPastDeadline={isPastDeadline}
            />

            <MiniTabla
              titulo="El Adivino"
              emoji="🔮"
              subtitulo="Resultados exactos (score + goles)"
              sorted={byExactos}
              myAlias={profile.alias}
              statFn={r => r.exact_results}
              statLabel="exactos"
              isPastDeadline={isPastDeadline}
            />

            <MiniTabla
              titulo="El Menotista"
              emoji="⚽"
              subtitulo="Goles acertados por equipo"
              sorted={byMenotista}
              myAlias={profile.alias}
              statFn={menotistaScore}
              statLabel="pts"
              isPastDeadline={isPastDeadline}
            />

            <MiniTabla
              titulo="El Bilardista"
              emoji="🛡️"
              subtitulo="Aciertos de resultado (ganador o empate)"
              sorted={byBilardista}
              myAlias={profile.alias}
              statFn={r => r.correct_winner}
              statLabel="aciertos"
              isPastDeadline={isPastDeadline}
            />
          </>
        )}

        {!isPastDeadline && (
          <p className="text-center text-[#6b4fa0] text-xs">
            🔒 Podés ver los pronósticos de todos a partir del 11/06
          </p>
        )}

        {/* Ranking Rezagados */}
        {rezagadosEnabled && profile.role === "client" && rezagadosRows.length > 0 && (
          <section className="flex flex-col gap-3 pt-2">
            <div>
              <h2 className="text-lg font-black tracking-tight">Tabla Rezagados</h2>
              <p className="text-[#e0d0f8] text-xs mt-0.5">Solo cuentan puntos de Dieciseisavos en adelante</p>
            </div>
            <div className="flex flex-col gap-1.5">
              {rezagadosRows.map((row, i) => {
                const pos = i + 1;
                const isTop3 = pos <= 3;
                const isMe = row.alias === profile.alias;
                return (
                  <div
                    key={row.alias}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${
                      isMe ? "bg-[#2d1a5e] border-[#6b3db8]" : "bg-[#1e0e42]/60 border-white/10"
                    }`}
                  >
                    <span className={`w-7 shrink-0 text-center text-sm font-black ${isTop3 ? posColors[pos - 1] : "text-[#c4a7f0]"}`}>
                      {isTop3 ? posLabels[pos - 1] : `${pos}°`}
                    </span>
                    <span className={`flex-1 font-semibold text-sm truncate ${isMe ? "text-white" : "text-[#d4c0f0]"}`}>
                      {row.alias}
                      {isMe && <span className="ml-1.5 text-[#e0d0f8] text-xs font-normal">(vos)</span>}
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="text-white font-black text-base">{row.total_points}</span>
                      <span className="text-[#c4a7f0] text-[10px] ml-1">pts</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>

      {!profile.accepted_terms && (
        <TermsOverlay isRezagado={profile.is_rezagado ?? false} />
      )}
      <RealtimeRefresher tables={["matches", "predictions"]} />
      <BottomNav />
    </main>
  );
}
