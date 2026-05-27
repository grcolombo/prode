import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type RankingRow = {
  alias: string;
  total_points: number;
  exact_results: number;
  correct_winner: number;
  home_goals: number;
  away_goals: number;
  user_id: string;
};

const posColors = ["text-yellow-400", "text-slate-300", "text-amber-600"];
const posLabels = ["1°", "2°", "3°"];

function PremioCard({
  emoji,
  titulo,
  alias,
  stat,
  statLabel,
  nota,
}: {
  emoji: string;
  titulo: string;
  alias: string | null;
  stat: number;
  statLabel: string;
  nota?: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-[#110828] border border-[#1e0e42] rounded-xl px-4 py-3">
      <span className="text-2xl shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[#4c2a8a] uppercase tracking-wider font-bold">{titulo}</p>
        <p className="text-white font-bold text-sm truncate">{alias ?? "—"}</p>
        {nota && <p className="text-[9px] text-[#4c2a8a] mt-0.5">{nota}</p>}
      </div>
      <div className="text-right shrink-0">
        <p className="text-white font-black text-lg leading-none">{stat}</p>
        <p className="text-[#4c2a8a] text-[10px]">{statLabel}</p>
      </div>
    </div>
  );
}

function RankingTable({ rows, title }: { rows: RankingRow[]; title: string }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-black text-[#9b6ee0] uppercase tracking-wider">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-[#2d1a5e] text-xs text-center py-6">Sin participantes</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {rows.map((row, i) => {
            const pos = i + 1;
            const isTop3 = pos <= 3;
            return (
              <Link
                key={row.alias}
                href={`/admin/usuarios?user_id=${row.user_id}`}
                className="flex items-center gap-3 bg-[#110828] border border-[#1e0e42] rounded-xl px-4 py-2.5 hover:bg-[#1a0a3e] hover:border-[#2d1a5e] transition-colors"
              >
                <span className={`w-7 shrink-0 text-center text-sm font-black ${isTop3 ? posColors[pos - 1] : "text-[#4c2a8a]"}`}>
                  {isTop3 ? posLabels[pos - 1] : `${pos}`}
                </span>
                <span className="flex-1 text-sm text-[#d4c0f0] font-semibold truncate">{row.alias}</span>
                <div className="text-right shrink-0 flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-white font-black">{row.total_points}</span>
                    <span className="text-[#4c2a8a] text-[10px] ml-1.5">{row.exact_results} ex</span>
                  </div>
                  <span className="text-[#2d1a5e] text-xs">›</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function calcPremios(rows: RankingRow[]) {
  if (rows.length === 0) return { campeon: null, adivino: null, bilardista: null, menotista: null };

  // 1. Campeón — 1° del ranking (ya viene ordenado por total_points)
  const campeon = rows[0];
  const restaCampeon = rows.slice(1);

  // 2. Adivino — más exactos entre los que no son campeón
  const sortedExactos = [...restaCampeon].sort((a, b) => b.exact_results - a.exact_results);
  const adivino = sortedExactos[0] ?? null;
  const restaAdivino = restaCampeon.filter(r => r.alias !== adivino?.alias);

  // 3. Bilardista — más aciertos de ganador/empate entre los restantes
  const sortedWinner = [...restaAdivino].sort((a, b) => b.correct_winner - a.correct_winner);
  const bilardista = sortedWinner[0] ?? null;
  const restaBilardista = restaAdivino.filter(r => r.alias !== bilardista?.alias);

  // 4. Menotista — más aciertos de goles (local + visita) entre los restantes
  const sortedGoles = [...restaBilardista].sort(
    (a, b) => (b.home_goals + b.away_goals) - (a.home_goals + a.away_goals)
  );
  const menotista = sortedGoles[0] ?? null;

  return { campeon, adivino, bilardista, menotista };
}

export default async function AdminRankingPage() {
  const supabase = await createClient();

  const [{ data: empRanking }, { data: cliRanking }, { data: profiles }] = await Promise.all([
    supabase.rpc("get_ranking", { p_role: "employee" }),
    supabase.rpc("get_ranking", { p_role: "client" }),
    supabase.from("profiles").select("id, alias").not("alias", "is", null),
  ]);

  const aliasToId = new Map((profiles ?? []).map(p => [p.alias, p.id]));

  function enrichRows(rows: Omit<RankingRow, "user_id">[]): RankingRow[] {
    return (rows ?? []).map(r => ({ ...r, user_id: aliasToId.get(r.alias) ?? "" }));
  }

  const employees = enrichRows((empRanking ?? []) as Omit<RankingRow, "user_id">[]);
  const clients = enrichRows((cliRanking ?? []) as Omit<RankingRow, "user_id">[]);

  const empPremios = calcPremios(employees);
  const cliPremios = calcPremios(clients);

  function PremiosSection({ premios, label }: { premios: ReturnType<typeof calcPremios>; label: string }) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-black text-[#9b6ee0] uppercase tracking-wider">Premios — {label}</h2>
        <PremioCard
          emoji="🏆"
          titulo="Carrera de campeones"
          alias={premios.campeon?.alias ?? null}
          stat={premios.campeon?.total_points ?? 0}
          statLabel="puntos"
        />
        <PremioCard
          emoji="🔮"
          titulo="El Adivino"
          alias={premios.adivino?.alias ?? null}
          stat={premios.adivino?.exact_results ?? 0}
          statLabel="exactos"
        />
        <PremioCard
          emoji="🧱"
          titulo="El Bilardista"
          alias={premios.bilardista?.alias ?? null}
          stat={premios.bilardista?.correct_winner ?? 0}
          statLabel="gan/emp"
        />
        <PremioCard
          emoji="⚽"
          titulo="El Menotista"
          alias={premios.menotista?.alias ?? null}
          stat={(premios.menotista?.home_goals ?? 0) + (premios.menotista?.away_goals ?? 0)}
          statLabel="goles exactos"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-xl font-black">Ranking completo</h1>

      {/* Premios especiales */}
      <div className="grid md:grid-cols-2 gap-8">
        <PremiosSection premios={empPremios} label="Empleados" />
        <PremiosSection premios={cliPremios} label="Clientes" />
      </div>

      {/* Tablas completas */}
      <div className="grid md:grid-cols-2 gap-6">
        <RankingTable rows={employees} title={`Empleados (${employees.length})`} />
        <RankingTable rows={clients} title={`Clientes (${clients.length})`} />
      </div>
    </div>
  );
}
