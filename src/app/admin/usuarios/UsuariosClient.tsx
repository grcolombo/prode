"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Flag from "@/components/Flag";
import { changeUserRole } from "../actions";

type User = { id: string; alias: string; role: string; email: string };
type Match = {
  id: number; stage: string; group_name: string | null;
  home_team: string | null; away_team: string | null;
  home_flag: string | null; away_flag: string | null;
  scheduled_at: string; home_score_real: number | null;
  away_score_real: number | null; is_played: boolean;
};
type Prediction = { match_id: number; home_score: number; away_score: number; points_earned: number | null };

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
  const [changingRole, setChangingRole] = useState(false);
  const predMap = new Map(predictions.map(p => [p.match_id, p]));
  const selectedUser = users.find(u => u.id === selectedUserId);

  async function handleRoleChange(newRole: "employee" | "client") {
    if (!selectedUser) return;
    setChangingRole(true);
    try {
      await changeUserRole(selectedUser.id, newRole);
      router.refresh();
    } finally {
      setChangingRole(false);
    }
  }

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
              {u.alias} — {u.email} ({u.role === "employee" ? "emp" : "cli"})
            </option>
          ))}
        </select>
      </div>

      {selectedUser && (
        <>
          {/* Info + cambio de rol */}
          <div className="bg-[#110828] border border-[#1e0e42] rounded-xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-white font-bold text-sm">{selectedUser.alias}</p>
              <p className="text-[#4c2a8a] text-xs truncate">{selectedUser.email}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                selectedUser.role === "employee"
                  ? "bg-violet-500/20 text-violet-300"
                  : "bg-blue-500/20 text-blue-300"
              }`}>
                {selectedUser.role === "employee" ? "Empleado" : "Cliente"}
              </span>
              <button
                onClick={() => handleRoleChange(selectedUser.role === "employee" ? "client" : "employee")}
                disabled={changingRole}
                className="text-[10px] font-bold px-2 py-1 rounded-lg border border-[#2d1a5e] text-[#4c2a8a] hover:text-white hover:border-[#6b3db8] transition-colors disabled:opacity-40"
              >
                {changingRole ? "..." : `→ ${selectedUser.role === "employee" ? "Cliente" : "Empleado"}`}
              </button>
            </div>
          </div>

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
