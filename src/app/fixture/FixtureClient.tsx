"use client";

import { useState } from "react";
import MatchCard from "./MatchCard";
import BottomNav from "@/components/BottomNav";

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const DEADLINE = new Date("2026-06-11T19:00:00Z");

type Match = {
  id: number;
  stage: string;
  group_name: string | null;
  round: number | null;
  match_number: number;
  home_team: string | null;
  away_team: string | null;
  home_flag: string | null;
  away_flag: string | null;
  scheduled_at: string;
  home_score_real: number | null;
  away_score_real: number | null;
  is_played: boolean;
};

type Prediction = {
  match_id: number;
  home_score: number;
  away_score: number;
  points_earned: number | null;
};

type Props = {
  matches: Match[];
  predictions: Prediction[];
  stageDeadlines: Record<string, boolean>;
};

export default function FixtureClient({ matches, predictions, stageDeadlines }: Props) {
  const [activeGroup, setActiveGroup] = useState("A");
  const isPastDeadline = stageDeadlines["group"] ?? (new Date() > DEADLINE);

  const predMap = Object.fromEntries(predictions.map(p => [p.match_id, p]));

  const groupMatches = matches.filter(m => m.stage === "group" && m.group_name === activeGroup);

  const byRound: Record<number, Match[]> = {};
  for (const m of groupMatches) {
    const r = m.round ?? 1;
    if (!byRound[r]) byRound[r] = [];
    byRound[r].push(m);
  }
  const rounds = Object.keys(byRound).map(Number).sort();

  const knockoutMatches = matches.filter(m => m.stage !== "group");

  return (
    <main className="min-h-screen bg-[#0a0614] text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0614]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-sm mx-auto px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-black tracking-tight">Fixture</h1>
            <span className={`text-[11px] font-medium ${isPastDeadline ? "text-red-400/70" : "text-[#9b6ee0]"}`}>
              {isPastDeadline ? "🔒 Cerrado" : "● Abierto hasta el 11/06"}
            </span>
          </div>

          {/* Group tabs */}
          <div className="flex gap-0.5">
            {GROUPS.map(g => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={`flex-1 h-7 rounded-lg text-xs font-bold transition-all ${
                  activeGroup === g
                    ? "bg-[#6b3db8] text-white shadow-lg shadow-[#6b3db8]/30"
                    : "text-white/35 hover:text-white/60"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Group matches */}
      <div className="max-w-sm mx-auto px-4 pt-4 space-y-5">
        {rounds.length === 0 && (
          <p className="text-white/30 text-sm text-center py-8">Sin partidos en este grupo</p>
        )}

        {rounds.map(r => (
          <div key={r}>
            <p className="text-[#4c2a8a] text-[10px] font-bold uppercase tracking-widest mb-2">
              Jornada {r}
            </p>
            <div className="space-y-2">
              {byRound[r].map(m => (
                <MatchCard
                  key={m.id}
                  match={m}
                  prediction={predMap[m.id] ?? null}
                  locked={isPastDeadline}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Knockout matches */}
        {knockoutMatches.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-5 text-center">
            <p className="text-white/30 text-sm">Fase eliminatoria</p>
            <p className="text-[#4c2a8a] text-xs mt-1">Disponible tras la fase de grupos</p>
          </div>
        ) : (() => {
          const stageOrder = ["R32", "R16", "QF", "SF", "final"];
          const stageLabels: Record<string, string> = {
            R32: "Ronda de 32",
            R16: "Octavos de Final",
            QF: "Cuartos de Final",
            SF: "Semifinales",
            final: "Final",
          };
          const byStage: Record<string, Match[]> = {};
          for (const m of knockoutMatches) {
            if (!byStage[m.stage]) byStage[m.stage] = [];
            byStage[m.stage].push(m);
          }
          return stageOrder.filter(s => byStage[s]).map(stage => {
            const locked = stageDeadlines[stage] ?? false;
            const deadline = !locked
              ? byStage[stage].sort((a, b) =>
                  new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
                )[0]?.scheduled_at
              : null;
            return (
              <div key={stage} className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[#4c2a8a] text-[10px] font-bold uppercase tracking-widest">
                    {stageLabels[stage] ?? stage}
                  </p>
                  <span className={`text-[10px] font-medium ${locked ? "text-red-400/70" : "text-[#9b6ee0]"}`}>
                    {locked ? "🔒 Cerrado" : deadline ? `● Cierra ${new Date(deadline).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", timeZone: "America/Argentina/Buenos_Aires" })}` : ""}
                  </span>
                </div>
                <div className="space-y-2">
                  {byStage[stage].map(m => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      prediction={predMap[m.id] ?? null}
                      locked={locked}
                    />
                  ))}
                </div>
              </div>
            );
          });
        })()}
      </div>

      <BottomNav />
    </main>
  );
}
