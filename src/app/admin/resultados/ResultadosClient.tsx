"use client";

import { useState } from "react";
import { saveResult, unmarkPlayed } from "../actions";

type Match = {
  id: number;
  stage: string;
  group_name: string | null;
  round: number | null;
  match_number: number;
  home_team: string | null;
  away_team: string | null;
  scheduled_at: string;
  home_score_real: number | null;
  away_score_real: number | null;
  is_played: boolean;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", {
    weekday: "short", day: "2-digit", month: "2-digit",
    hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires",
  });
}

function stageLabel(stage: string, group: string | null) {
  if (stage === "group") return `Grupo ${group}`;
  const map: Record<string, string> = { R32: "Ronda de 32", R16: "Octavos", QF: "Cuartos", SF: "Semis", final: "Final" };
  return map[stage] ?? stage;
}

function MatchRow({ match }: { match: Match }) {
  const [home, setHome] = useState(match.home_score_real?.toString() ?? "");
  const [away, setAway] = useState(match.away_score_real?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const hasTeams = match.home_team && match.away_team;
  const isEditing = match.is_played &&
    (home !== (match.home_score_real?.toString() ?? "") ||
     away !== (match.away_score_real?.toString() ?? ""));

  async function handleSave() {
    const h = parseInt(home);
    const a = parseInt(away);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) {
      setError("Scores inválidos");
      return;
    }
    // Confirmación si se está editando un resultado ya cargado
    if (match.is_played) {
      const ok = window.confirm(
        `¿Confirmar corrección del resultado?\n\nAnterior: ${match.home_score_real}-${match.away_score_real}\nNuevo: ${h}-${a}\n\nEsto recalculará los puntos de todos los participantes.`
      );
      if (!ok) return;
    }
    setLoading(true);
    setError("");
    try {
      await saveResult(match.id, h, a);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnmark() {
    const ok = window.confirm("¿Desmarcar como jugado? Se borrarán los puntos calculados.");
    if (!ok) return;
    setLoading(true);
    try {
      await unmarkPlayed(match.id);
      setHome("");
      setAway("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`bg-[#2d1a5e] border rounded-xl px-4 py-3 flex flex-col gap-2 ${
      isEditing ? "border-yellow-600/50" : match.is_played ? "border-green-800/40" : "border-white/10"
    }`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#c4a7f0] font-bold uppercase tracking-wider">
          {stageLabel(match.stage, match.group_name)} · {formatDate(match.scheduled_at)}
        </span>
        <div className="flex items-center gap-2">
          {isEditing && (
            <span className="text-[10px] text-yellow-400 font-bold">Editando</span>
          )}
          {match.is_played && !isEditing && (
            <span className="text-[10px] text-green-400 font-bold">✓ Cargado</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{match.home_team ?? <span className="text-[#c4a7f0]">TBD</span>}</p>
          <p className="text-sm font-semibold truncate">{match.away_team ?? <span className="text-[#c4a7f0]">TBD</span>}</p>
        </div>

        {hasTeams ? (
          <div className="flex items-center gap-2 shrink-0">
            <input
              type="number" min={0} max={99} value={home}
              onChange={e => setHome(e.target.value)}
              disabled={loading} placeholder="—"
              className="w-12 text-center bg-[#442d8e] border border-white/20 rounded-lg py-1.5 text-white font-bold text-sm focus:outline-none focus:border-[#6b3db8] disabled:opacity-50"
            />
            <span className="text-[#c4a7f0] font-bold">:</span>
            <input
              type="number" min={0} max={99} value={away}
              onChange={e => setAway(e.target.value)}
              disabled={loading} placeholder="—"
              className="w-12 text-center bg-[#442d8e] border border-white/20 rounded-lg py-1.5 text-white font-bold text-sm focus:outline-none focus:border-[#6b3db8] disabled:opacity-50"
            />
            <button
              onClick={handleSave}
              disabled={loading || !home || !away}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-40 ${
                saved ? "bg-green-600 text-white" :
                isEditing ? "bg-yellow-600 text-white hover:bg-yellow-500" :
                "bg-[#6b3db8] text-white hover:bg-[#7d4ed4]"
              }`}
            >
              {saved ? "✓ OK" : loading ? "..." : isEditing ? "Actualizar" : "Guardar"}
            </button>
            {match.is_played && (
              <button
                onClick={handleUnmark}
                disabled={loading}
                className="px-2 py-1.5 rounded-lg text-xs text-[#c4a7f0] hover:text-red-400 transition-colors disabled:opacity-40"
                title="Desmarcar como jugado"
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          <span className="text-[#e0d0f8] text-xs">Equipos sin asignar</span>
        )}
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

export default function ResultadosClient({ matches }: { matches: Match[] }) {
  const [filter, setFilter] = useState<"pending" | "played" | "all">("pending");

  const filtered = matches.filter(m => {
    if (!m.home_team || !m.away_team) return false; // no mostrar sin equipos
    if (filter === "pending") return !m.is_played;
    if (filter === "played") return m.is_played;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black">Resultados</h1>
        <div className="flex gap-1 bg-[#2d1a5e] rounded-xl p-1">
          {(["pending", "played", "all"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === f ? "bg-[#2d1a5e] text-white" : "text-[#c4a7f0] hover:text-[#e0d0f8]"
              }`}
            >
              {f === "pending" ? "Pendientes" : f === "played" ? "Jugados" : "Todos"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-[#c4a7f0] text-center py-12 text-sm">No hay partidos en esta vista</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(m => <MatchRow key={m.id} match={m} />)}
        </div>
      )}
    </div>
  );
}
