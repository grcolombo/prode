"use client";

import { useRouter } from "next/navigation";

type User = { id: string; alias: string; role: string };
type Match = {
  id: number; stage: string; group_name: string | null;
  home_team: string | null; away_team: string | null;
  home_flag: string | null; away_flag: string | null;
  scheduled_at: string; home_score_real: number | null;
  away_score_real: number | null; is_played: boolean;
};
type Prediction = { match_id: number; home_score: number; away_score: number; points_earned: number | null };

function Flag({ code }: { code: string | null }) {
  if (!code) return null;
  const iso = code.split("").map(c => String.fromCodePoint(c.codePointAt(0)! - 0x1f1e6 + 65)).join("").toLowerCase();
  return <img src={`https://flagcdn.com/w20/${iso}.png`} alt={iso} width={16} height={12} className="inline-block rounded-sm" />;
}

function PointsBadge({ points }: { points: number | null }) {
  if (points === null) return <span className="text-[#2d1a5e] text-xs">—</span>;
  const color = points === 12 ? "text-yellow-400" : points >= 5 ? "text-green-400" : points > 0 ? "text-blue-300" : "text-[#4c2a8a]";
  return <span className={`font-bold text-sm ${color}`}>{points}</span>;
}

export default function UsuariosClient({
  users, selectedUserId, matches, predictions,
}: {
  users: User[];
  selectedUserId: string | null;
  matches: Match[];
  predictions: Prediction[];
}) {
  const router = useRouter();
  const predMap = new Map(predictions.map(p => [p.match_id, p]));
  const selectedUser = users.find(u => u.id === selectedUserId);

  const totalPoints = predictions.reduce((s, p) => s + (p.points_earned ?? 0), 0);
  const filled = predictions.length;
  const exactos = predictions.filter(p => p.points_earned === 12).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-black">Usuarios</h1>
        <select
          value={selectedUserId ?? ""}
          onChange={e => router.push(`/admin/usuarios${e.target.value ? `?user_id=${e.target.value}` : ""}`)}
          className="flex-1 bg-[#110828] border border-[#2d1a5e] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#6b3db8]"
        >
          <option value="">— Seleccionar usuario —</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.alias} ({u.role === "employee" ? "emp" : "cli"})
            </option>
          ))}
        </select>
      </div>

      {selectedUser && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#110828] border border-[#1e0e42] rounded-xl p-3 text-center">
              <div className="text-xl font-black text-white">{totalPoints}</div>
              <div className="text-[#4c2a8a] text-[10px]">puntos</div>
            </div>
            <div className="bg-[#110828] border border-[#1e0e42] rounded-xl p-3 text-center">
              <div className="text-xl font-black text-yellow-400">{exactos}</div>
              <div className="text-[#4c2a8a] text-[10px]">exactos</div>
            </div>
            <div className="bg-[#110828] border border-[#1e0e42] rounded-xl p-3 text-center">
              <div className="text-xl font-black text-[#9b6ee0]">{filled}</div>
              <div className="text-[#4c2a8a] text-[10px]">cargados</div>
            </div>
          </div>

          {/* Fixture table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-[#4c2a8a] text-[10px] uppercase tracking-wider">
                  <th className="text-left py-2 font-bold">Partido</th>
                  <th className="text-center py-2 font-bold">Real</th>
                  <th className="text-center py-2 font-bold">Pronóstico</th>
                  <th className="text-center py-2 font-bold">Pts</th>
                </tr>
              </thead>
              <tbody>
                {matches.map(m => {
                  const pred = predMap.get(m.id);
                  return (
                    <tr key={m.id} className="border-t border-[#1e0e42]">
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-1 text-xs">
                          <Flag code={m.home_flag} /> {m.home_team ?? "TBD"}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#9b6ee0]">
                          <Flag code={m.away_flag} /> {m.away_team ?? "TBD"}
                        </div>
                      </td>
                      <td className="text-center text-white font-bold text-sm">
                        {m.is_played ? `${m.home_score_real}-${m.away_score_real}` : <span className="text-[#2d1a5e]">—</span>}
                      </td>
                      <td className="text-center text-[#9b6ee0] font-bold text-sm">
                        {pred ? `${pred.home_score}-${pred.away_score}` : <span className="text-[#2d1a5e]">—</span>}
                      </td>
                      <td className="text-center">
                        {m.is_played ? <PointsBadge points={pred?.points_earned ?? null} /> : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!selectedUser && (
        <p className="text-[#4c2a8a] text-center py-12 text-sm">
          Seleccioná un usuario para ver sus pronósticos
        </p>
      )}
    </div>
  );
}
