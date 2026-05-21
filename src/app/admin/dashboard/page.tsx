import { createClient } from "@/lib/supabase/server";

type TiebreakerRow = { alias: string; pts: number; exactos: number; home_ok: number; away_ok: number };

type DashboardStats = {
  total_users: number;
  total_predictions: number;
  matches_played: number;
  total_matches: number;
  points_distributed: number;
  users_with_all: number;
  users_partial: number;
  users_empty: number;
  top_employees: { alias: string; pts: number; exactos: number }[];
  top_clients: { alias: string; pts: number; exactos: number }[];
  menotista: { alias: string; avg_goals: number } | null;
  bilardista: { alias: string; avg_goals: number } | null;
  adivino: { alias: string; exactos: number } | null;
  tiebreaker_table: TiebreakerRow[] | null;
  most_predicted_match: { home_team: string; away_team: string; count: number } | null;
  most_exact_match: { home_team: string; away_team: string; home_score_real: number; away_score_real: number; count: number } | null;
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[#110828] border border-[#1e0e42] rounded-xl p-4 text-center">
      <div className="text-2xl font-black text-white">{value}</div>
      {sub && <div className="text-[#9b6ee0] text-xs font-semibold mt-0.5">{sub}</div>}
      <div className="text-slate-400 text-[11px] mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}

// 🥇 Card principal — líder de la Carrera de Campeones
function GoldCard({ rows, title }: { rows: { alias: string; pts: number; exactos: number }[]; title: string }) {
  const leader = rows?.[0];
  const tied = rows?.filter(r => r.pts === leader?.pts) ?? [];
  const posLabels = ["🥇", "🥈", "🥉", "4°", "5°"];
  const posColors = ["text-yellow-400", "text-slate-300", "text-amber-600", "text-[#9b6ee0]", "text-[#9b6ee0]"];

  return (
    <div className="bg-[#1a1000] border border-yellow-500/30 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🥇</span>
        <div>
          <h3 className="text-base font-black text-yellow-400 uppercase tracking-wide">Carrera de Campeones</h3>
          <p className="text-slate-400 text-[10px]">{title}</p>
        </div>
      </div>

      {!leader ? (
        <p className="text-slate-400 text-xs text-center py-2">Sin datos aún</p>
      ) : (
        <>
          {/* Líder destacado */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">🥇</span>
            <div className="flex-1">
              <div className="text-yellow-400 font-black text-lg leading-none">{leader.alias}</div>
              {tied.length > 1 && (
                <div className="text-yellow-400/60 text-[10px] mt-0.5">
                  Empate con {tied.slice(1).map(r => r.alias).join(", ")} · desempate por exactos
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-yellow-400 font-black text-2xl leading-none">{leader.pts}</div>
              <div className="text-slate-400 text-[10px]">puntos</div>
            </div>
          </div>

          {/* Resto del top 5 */}
          <div className="flex flex-col gap-1.5">
            {rows.slice(1).map((r, i) => (
              <div key={r.alias} className="flex items-center gap-2">
                <span className={`w-6 text-center text-sm font-black ${posColors[i + 1]}`}>{posLabels[i + 1]}</span>
                <span className="flex-1 text-sm text-[#d4c0f0] font-semibold truncate">{r.alias}</span>
                <span className="text-white font-black text-sm">{r.pts}</span>
                <span className="text-slate-400 text-[10px] w-12 text-right">{r.exactos} ex</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Regla general de desempate (banner)
function TiebreakerRules() {
  return (
    <div className="bg-slate-400/5 border border-slate-400/15 rounded-xl px-4 py-3 flex flex-wrap gap-2 items-center">
      <span className="text-slate-400 text-[11px] mr-1">Desempate:</span>
      {["1° Exactos (12pts)", "2° Goles local acertados", "3° Goles visitante acertados"].map((r) => (
        <span key={r} className="text-[11px] bg-slate-400/10 text-slate-300 px-2 py-0.5 rounded-full">{r}</span>
      ))}
    </div>
  );
}

// 🥈 Card — El Adivino
function SilverCard({ adivino, rows }: { adivino: { alias: string; exactos: number } | null; rows: TiebreakerRow[] | null }) {
  return (
    <div className="bg-[#0f0f18] border border-slate-400/30 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">🥈</span>
        <div>
          <h3 className="text-sm font-black text-slate-300">El Adivino</h3>
          <p className="text-slate-400 text-[11px]">Más resultados exactos · criterio de desempate</p>
        </div>
      </div>

      {adivino ? (
        <div className="flex items-center justify-between bg-slate-400/5 border border-slate-400/10 rounded-lg px-3 py-2">
          <span className="text-slate-200 font-bold">{adivino.alias}</span>
          <div>
            <span className="text-slate-300 font-black text-lg">{adivino.exactos}</span>
            <span className="text-slate-400 text-[11px] ml-1">exactos</span>
          </div>
        </div>
      ) : (
        <p className="text-slate-500 text-xs text-center py-1">Sin datos aún</p>
      )}

      {/* Tabla de desempate */}
      {rows && rows.length > 0 && (
        <div className="overflow-x-auto mt-1">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase tracking-wider">
                <th className="text-left py-1.5 font-semibold">#</th>
                <th className="text-left py-1.5 font-semibold">Alias</th>
                <th className="text-center py-1.5 font-semibold">Pts</th>
                <th className="text-center py-1.5 font-semibold">Exactos</th>
                <th className="text-center py-1.5 font-semibold">G.Loc</th>
                <th className="text-center py-1.5 font-semibold">G.Vis</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.alias} className="border-t border-slate-400/10">
                  <td className="py-1.5 text-slate-400">{i + 1}</td>
                  <td className="py-1.5 text-slate-200 font-semibold">{r.alias}</td>
                  <td className="text-center py-1.5 text-white font-black">{r.pts}</td>
                  <td className="text-center py-1.5 text-yellow-400 font-bold">{r.exactos}</td>
                  <td className="text-center py-1.5 text-slate-300">{r.home_ok}</td>
                  <td className="text-center py-1.5 text-slate-300">{r.away_ok}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// 🥉 Cards — Menotista / Bilardista
function BronzeCard({ emoji, title, description, alias, stat, statLabel }: {
  emoji: string; title: string; description: string;
  alias: string | null; stat: number | null; statLabel: string;
}) {
  return (
    <div className="bg-[#120a00] border border-amber-700/30 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">🥉</span>
        <span className="text-lg">{emoji}</span>
        <div>
          <h3 className="text-sm font-black text-amber-600">{title}</h3>
          <p className="text-slate-400 text-[10px]">{description}</p>
        </div>
      </div>
      {alias ? (
        <div className="flex items-center justify-between bg-amber-600/5 border border-amber-600/10 rounded-lg px-3 py-2">
          <span className="text-amber-200/80 font-bold text-sm">{alias}</span>
          <div>
            <span className="text-amber-500 font-black">{stat}</span>
            <span className="text-slate-400 text-[10px] ml-1">{statLabel}</span>
          </div>
        </div>
      ) : (
        <p className="text-slate-400 text-xs text-center py-1">Sin datos aún</p>
      )}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: raw } = await supabase.rpc("get_dashboard_stats");
  const stats = raw as DashboardStats | null;

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
          <StatCard label="Fixture completo" value={stats.users_with_all}
            sub={`${stats.total_users > 0 ? Math.round(stats.users_with_all / stats.total_users * 100) : 0}% del total`} />
        </div>

        {/* Desglose fixture */}
        <div className="bg-[#110828] border border-[#1e0e42] rounded-xl p-4 flex flex-col gap-3">
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

      {/* 🥇 Carrera de Campeones — solo clientes */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Podio</h2>
        <GoldCard rows={stats.top_clients ?? []} title="Clientes · puntos totales" />
      </section>

      {/* Regla general de desempate */}
      <TiebreakerRules />

      {/* 🥈 El Adivino + tabla de desempate */}
      <section>
        <SilverCard adivino={stats.adivino ?? null} rows={stats.tiebreaker_table ?? null} />
      </section>

      {/* 🥉 Menotista + Bilardista */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estilos de juego</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <BronzeCard
            emoji="⚽" title="El Menotista"
            description="Pronostica más goles por partido · fútbol de ataque"
            alias={stats.menotista?.alias ?? null}
            stat={stats.menotista?.avg_goals ?? null}
            statLabel="goles/partido en promedio"
          />
          <BronzeCard
            emoji="🧱" title="El Bilardista"
            description="Pronostica menos goles por partido · resultadista puro"
            alias={stats.bilardista?.alias ?? null}
            stat={stats.bilardista?.avg_goals ?? null}
            statLabel="goles/partido en promedio"
          />
        </div>
      </section>

      {/* Datos del fixture */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Datos del fixture</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-[#110828] border border-[#1e0e42] rounded-xl p-4 flex flex-col gap-1">
            <div className="text-xs text-slate-400">📊 Partido más pronosticado</div>
            {stats.most_predicted_match ? (
              <>
                <div className="text-white font-bold text-sm">
                  {stats.most_predicted_match.home_team} vs {stats.most_predicted_match.away_team}
                </div>
                <div className="text-[#9b6ee0] text-xs">{stats.most_predicted_match.count} predicciones cargadas</div>
              </>
            ) : <div className="text-slate-400 text-xs">Sin datos aún</div>}
          </div>
          <div className="bg-[#110828] border border-[#1e0e42] rounded-xl p-4 flex flex-col gap-1">
            <div className="text-xs text-slate-400">🎯 Partido más acertado</div>
            {stats.most_exact_match ? (
              <>
                <div className="text-white font-bold text-sm">
                  {stats.most_exact_match.home_team} {stats.most_exact_match.home_score_real}-{stats.most_exact_match.away_score_real} {stats.most_exact_match.away_team}
                </div>
                <div className="text-[#9b6ee0] text-xs">{stats.most_exact_match.count} pronósticos exactos</div>
              </>
            ) : <div className="text-slate-400 text-xs">Sin datos aún</div>}
          </div>
        </div>
      </section>

      {/* Ranking empleados (solo admin, no se comparte) */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Ranking Empleados <span className="text-slate-500 normal-case font-normal tracking-normal">· uso interno</span>
        </h2>
        <div className="bg-[#110828] border border-[#1e0e42] rounded-xl p-4 flex flex-col gap-1.5">
          {(stats.top_employees ?? []).length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-2">Sin datos aún</p>
          ) : (
            stats.top_employees.map((r, i) => (
              <div key={r.alias} className="flex items-center gap-2">
                <span className="text-sm w-6 text-center">{["🥇","🥈","🥉","4°","5°"][i]}</span>
                <span className="flex-1 text-sm text-[#d4c0f0] font-semibold truncate">{r.alias}</span>
                <span className="text-white font-black text-sm">{r.pts}</span>
                <span className="text-slate-400 text-[10px] w-12 text-right">{r.exactos} ex</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
