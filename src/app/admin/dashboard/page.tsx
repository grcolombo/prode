import { createClient } from "@/lib/supabase/server";

type RankingRow = {
  alias: string;
  total_points: number;
  exact_results: number;
  correct_winner: number;
  home_goals: number;
  away_goals: number;
};

type GeneralStats = {
  total_users: number;
  total_predictions: number;
  matches_played: number;
  total_matches: number;
  points_distributed: number;
  users_with_all: number;
  users_partial: number;
  users_empty: number;
  most_predicted_match: { home_team: string; away_team: string; count: number } | null;
  most_exact_match: { home_team: string; away_team: string; home_score_real: number; away_score_real: number; count: number } | null;
};

// ── Lógica de premios en cascada (igual que /admin/ranking) ──────────────────
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

// ── Componentes ──────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[#2d1a5e] border border-white/10 rounded-xl p-4 text-center">
      <div className="text-2xl font-black text-white">{value}</div>
      {sub && <div className="text-[#e0d0f8] text-xs font-semibold mt-0.5">{sub}</div>}
      <div className="text-slate-400 text-[11px] mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}

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
    <div className="flex items-center gap-3 bg-[#2d1a5e] border border-white/10 rounded-xl px-4 py-3">
      <span className="text-2xl shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[#c4a7f0] uppercase tracking-wider font-bold">{titulo}</p>
        <p className="text-white font-bold text-sm truncate">{alias ?? "—"}</p>
        {nota && <p className="text-[9px] text-[#c4a7f0] mt-0.5">{nota}</p>}
      </div>
      <div className="text-right shrink-0">
        <p className="text-white font-black text-lg leading-none">{stat}</p>
        <p className="text-[#c4a7f0] text-[10px]">{statLabel}</p>
      </div>
    </div>
  );
}

function PremiosSection({ rows, label }: { rows: RankingRow[]; label: string }) {
  const premios = calcPremios(rows);
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-bold text-[#c4a7f0] uppercase tracking-widest">{label}</h3>
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

function RankingMiniTable({ rows, title }: { rows: RankingRow[]; title: string }) {
  const posLabels = ["🥇", "🥈", "🥉", "4°", "5°"];
  const posColors = ["text-yellow-400", "text-slate-300", "text-amber-600", "text-[#e0d0f8]", "text-[#e0d0f8]"];
  return (
    <div className="bg-[#2d1a5e] border border-white/10 rounded-xl p-4 flex flex-col gap-2">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-slate-400 text-xs text-center py-2">Sin datos aún</p>
      ) : (
        rows.slice(0, 5).map((r, i) => (
          <div key={r.alias} className="flex items-center gap-2">
            <span className={`text-sm w-6 text-center font-black ${posColors[i]}`}>{posLabels[i]}</span>
            <span className="flex-1 text-sm text-[#d4c0f0] font-semibold truncate">{r.alias}</span>
            <span className="text-white font-black text-sm">{r.total_points}</span>
            <span className="text-slate-400 text-[10px] w-12 text-right">{r.exact_results} ex</span>
          </div>
        ))
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ data: raw }, { data: empRanking }, { data: cliRanking }] = await Promise.all([
    supabase.rpc("get_dashboard_stats"),
    supabase.rpc("get_ranking", { p_role: "employee" }),
    supabase.rpc("get_ranking", { p_role: "client" }),
  ]);

  const stats = raw as GeneralStats | null;
  const employees = (empRanking ?? []) as RankingRow[];
  const clients = (cliRanking ?? []) as RankingRow[];

  if (!stats) {
    return <p className="text-slate-400 text-sm text-center py-16">No se pudieron cargar las estadísticas.</p>;
  }

  const fixtureRows = [
    { label: "Completo",   value: stats.users_with_all, color: "bg-green-500",  textColor: "text-green-400" },
    { label: "Parcial",    value: stats.users_partial,  color: "bg-yellow-500", textColor: "text-yellow-400" },
    { label: "Sin cargar", value: stats.users_empty,    color: "bg-[#2d1a5e]",  textColor: "text-slate-400" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-black">Dashboard</h1>

      {/* Resumen general */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resumen general</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Participantes" value={stats.total_users} />
          <StatCard label="Partidos jugados" value={`${stats.matches_played} / ${stats.total_matches}`} />
          <StatCard label="Puntos repartidos" value={stats.points_distributed} />
          <StatCard
            label="Fixture completo"
            value={stats.users_with_all}
            sub={`${stats.total_users > 0 ? Math.round(stats.users_with_all / stats.total_users * 100) : 0}% del total`}
          />
        </div>

        {/* Desglose fixture */}
        <div className="bg-[#2d1a5e] border border-white/10 rounded-xl p-4 flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estado del fixture</h3>
          {fixtureRows.map((r) => {
            const pct = stats.total_users > 0 ? Math.round((r.value / stats.total_users) * 100) : 0;
            return (
              <div key={r.label} className="flex items-center gap-3">
                <span className={`text-xs font-semibold w-20 shrink-0 ${r.textColor}`}>{r.label}</span>
                <div className="flex-1 h-2 bg-[#1e0e42] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${r.color}`} style={{ width: `${pct}%` }} />
                </div>
                <span className={`text-sm font-black w-6 text-right shrink-0 ${r.textColor}`}>{r.value}</span>
                <span className="text-slate-400 text-[10px] w-8 shrink-0">{pct}%</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Premios especiales — cascada por rol */}
      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Premios especiales</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <PremiosSection rows={employees} label="Empleados" />
          <PremiosSection rows={clients} label="Clientes" />
        </div>
      </section>

      {/* Top 5 rankings */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rankings</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <RankingMiniTable rows={employees} title="Empleados" />
          <RankingMiniTable rows={clients} title="Clientes" />
        </div>
      </section>

      {/* Datos del fixture */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Datos del fixture</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-[#2d1a5e] border border-white/10 rounded-xl p-4 flex flex-col gap-1">
            <div className="text-xs text-slate-400">📊 Partido más pronosticado</div>
            {stats.most_predicted_match ? (
              <>
                <div className="text-white font-bold text-sm">
                  {stats.most_predicted_match.home_team} vs {stats.most_predicted_match.away_team}
                </div>
                <div className="text-[#e0d0f8] text-xs">{stats.most_predicted_match.count} predicciones cargadas</div>
              </>
            ) : <div className="text-slate-400 text-xs">Sin datos aún</div>}
          </div>
          <div className="bg-[#2d1a5e] border border-white/10 rounded-xl p-4 flex flex-col gap-1">
            <div className="text-xs text-slate-400">🎯 Partido más acertado</div>
            {stats.most_exact_match ? (
              <>
                <div className="text-white font-bold text-sm">
                  {stats.most_exact_match.home_team} {stats.most_exact_match.home_score_real}-{stats.most_exact_match.away_score_real} {stats.most_exact_match.away_team}
                </div>
                <div className="text-[#e0d0f8] text-xs">{stats.most_exact_match.count} pronósticos exactos</div>
              </>
            ) : <div className="text-slate-400 text-xs">Sin datos aún</div>}
          </div>
        </div>
      </section>
    </div>
  );
}
