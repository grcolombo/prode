"use client";

import { useState } from "react";
import { assignTeams } from "../actions";

type Match = {
  id: number;
  stage: string;
  slot_label: string | null;
  home_team: string | null;
  away_team: string | null;
  home_flag: string | null;
  away_flag: string | null;
  scheduled_at: string;
  is_played: boolean;
};

const STAGE_ORDER = ["r32", "r16", "qf", "sf", "third", "final"];
const STAGE_LABEL: Record<string, string> = {
  r32: "Ronda de 32", r16: "Octavos de final", qf: "Cuartos de final",
  sf: "Semifinales", third: "3er puesto", final: "Final",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

function MatchRow({ match }: { match: Match }) {
  const [homeTeam, setHomeTeam] = useState(match.home_team ?? "");
  const [awayTeam, setAwayTeam] = useState(match.away_team ?? "");
  const [homeFlag, setHomeFlag] = useState(match.home_flag ?? "");
  const [awayFlag, setAwayFlag] = useState(match.away_flag ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setLoading(true);
    setError("");
    try {
      await assignTeams(match.id, homeTeam, awayTeam, homeFlag, awayFlag);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  const assigned = match.home_team && match.away_team;

  return (
    <div className={`bg-[#110828] border rounded-xl px-4 py-3 flex flex-col gap-3 ${assigned ? "border-[#2d1a5e]" : "border-[#4c2a8a]/50"}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-[#9b6ee0] font-semibold">
            {match.slot_label ?? `Partido ${match.id}`}
          </span>
          <span className="text-[#4c2a8a] text-xs ml-2">{formatDate(match.scheduled_at)}</span>
        </div>
        {assigned
          ? <span className="text-[10px] text-green-400 font-bold">Asignado</span>
          : <span className="text-[10px] text-yellow-400/70 font-bold">Pendiente</span>
        }
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-[#4c2a8a] font-bold uppercase">Local</label>
          <input
            value={homeTeam}
            onChange={e => setHomeTeam(e.target.value)}
            placeholder="Ej: Argentina"
            disabled={loading}
            className="bg-[#0a0614] border border-[#2d1a5e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#6b3db8] disabled:opacity-50"
          />
          <input
            value={homeFlag}
            onChange={e => setHomeFlag(e.target.value)}
            placeholder="Bandera (emoji)"
            disabled={loading}
            className="bg-[#0a0614] border border-[#2d1a5e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#6b3db8] disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-[#4c2a8a] font-bold uppercase">Visitante</label>
          <input
            value={awayTeam}
            onChange={e => setAwayTeam(e.target.value)}
            placeholder="Ej: Brasil"
            disabled={loading}
            className="bg-[#0a0614] border border-[#2d1a5e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#6b3db8] disabled:opacity-50"
          />
          <input
            value={awayFlag}
            onChange={e => setAwayFlag(e.target.value)}
            placeholder="Bandera (emoji)"
            disabled={loading}
            className="bg-[#0a0614] border border-[#2d1a5e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#6b3db8] disabled:opacity-50"
          />
        </div>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <button
        onClick={handleSave}
        disabled={loading || (!homeTeam && !awayTeam)}
        className={`py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-40 ${
          saved ? "bg-green-600 text-white" : "bg-[#6b3db8] text-white hover:bg-[#7d4ed4]"
        }`}
      >
        {saved ? "Guardado" : loading ? "Guardando..." : "Guardar"}
      </button>
    </div>
  );
}

export default function EliminatoriasClient({ matches }: { matches: Match[] }) {
  const byStage = STAGE_ORDER.reduce<Record<string, Match[]>>((acc, s) => {
    const ms = matches.filter(m => m.stage === s);
    if (ms.length > 0) acc[s] = ms;
    return acc;
  }, {});

  if (matches.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-black">Eliminatorias</h1>
        <p className="text-[#4c2a8a] text-center py-12 text-sm">
          No hay partidos eliminatorios cargados todavía
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-black">Eliminatorias</h1>
      {Object.entries(byStage).map(([stage, ms]) => (
        <section key={stage} className="flex flex-col gap-2">
          <h2 className="text-xs font-bold text-[#4c2a8a] uppercase tracking-widest">
            {STAGE_LABEL[stage]}
          </h2>
          {ms.map(m => <MatchRow key={m.id} match={m} />)}
        </section>
      ))}
    </div>
  );
}
