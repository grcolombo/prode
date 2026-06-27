"use client";

import { useState } from "react";
import MatchCard from "./MatchCard";
import BottomNav from "@/components/BottomNav";

const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
const DEADLINE = new Date("2026-06-11T19:00:00Z");

const STAGE_ORDER = ["r32", "r16", "qf", "sf", "third", "final"];
const STAGE_LABELS: Record<string, string> = {
  r32: "Dieciseisavos de Final",
  r16: "Octavos de Final",
  qf: "Cuartos de Final",
  sf: "Semifinales",
  third: "3er Puesto",
  final: "Final",
};

type Match = {
  id: number;
  stage: string;
  group_name: string | null;
  round: number | null;
  match_number: number;
  slot_label: string | null;
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
  alias: string;
};

export default function FixtureClient({ matches, predictions, stageDeadlines, alias }: Props) {
  const knockoutMatches = matches.filter(m => m.stage !== "group");
  const hasKnockout = knockoutMatches.length > 0;

  const [activeTab, setActiveTab] = useState<"grupos" | "eliminatorias">(
    hasKnockout ? "eliminatorias" : "grupos"
  );
  const [activeGroup, setActiveGroup] = useState("A");

  const isPastGroupDeadline = stageDeadlines["group"] ?? (new Date() > DEADLINE);
  const predMap = Object.fromEntries(predictions.map(p => [p.match_id, p]));

  // ── Grupos ──────────────────────────────────────────────────────
  const groupMatches = matches.filter(m => m.stage === "group" && m.group_name === activeGroup);
  const byRound: Record<number, Match[]> = {};
  for (const m of groupMatches) {
    const r = m.round ?? 1;
    if (!byRound[r]) byRound[r] = [];
    byRound[r].push(m);
  }
  const rounds = Object.keys(byRound).map(Number).sort();

  // ── Eliminatorias ───────────────────────────────────────────────
  const byStage: Record<string, Match[]> = {};
  for (const m of knockoutMatches) {
    if (!byStage[m.stage]) byStage[m.stage] = [];
    byStage[m.stage].push(m);
  }
  const activeKnockoutStages = STAGE_ORDER.filter(s => byStage[s]);

  return (
    <main className="min-h-screen bg-[#442d8e] text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#442d8e]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-sm mx-auto px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-black tracking-tight">Fixture</h1>
            {alias && (
              <span className="text-[11px] font-bold text-[#e0d0f8] bg-[#6b3db8]/15 px-2 py-0.5 rounded-full">
                @{alias}
              </span>
            )}
          </div>

          {/* Tab principal: Grupos / Eliminatorias */}
          <div className="flex gap-1 mb-2">
            <button
              onClick={() => setActiveTab("grupos")}
              className={`flex-1 h-8 rounded-xl text-xs font-bold transition-all ${
                activeTab === "grupos"
                  ? "bg-[#6b3db8] text-white shadow-lg shadow-[#6b3db8]/30"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              Fase de Grupos
              {isPastGroupDeadline && <span className="ml-1 text-[10px] text-red-400/80">🔒</span>}
            </button>
            <button
              onClick={() => setActiveTab("eliminatorias")}
              className={`flex-1 h-8 rounded-xl text-xs font-bold transition-all ${
                activeTab === "eliminatorias"
                  ? "bg-[#6b3db8] text-white shadow-lg shadow-[#6b3db8]/30"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              Eliminatorias
              {hasKnockout && activeTab !== "eliminatorias" && (
                <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-green-400 align-middle" />
              )}
            </button>
          </div>

          {/* Sub-tabs de grupos (solo visible en tab grupos) */}
          {activeTab === "grupos" && (
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
          )}
        </div>
      </div>

      <div className="max-w-sm mx-auto px-4 pt-4 space-y-5">

        {/* ── Tab: Grupos ── */}
        {activeTab === "grupos" && (
          <>
            {rounds.length === 0 && (
              <p className="text-white/30 text-sm text-center py-8">Sin partidos en este grupo</p>
            )}
            {rounds.map(r => (
              <div key={r}>
                <p className="text-[#c4a7f0] text-[10px] font-bold uppercase tracking-widest mb-2">
                  Jornada {r}
                </p>
                <div className="space-y-2">
                  {byRound[r].map(m => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      prediction={predMap[m.id] ?? null}
                      locked={isPastGroupDeadline}
                    />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── Tab: Eliminatorias ── */}
        {activeTab === "eliminatorias" && (
          <>
            {!hasKnockout ? (
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-10 text-center">
                <p className="text-white/30 text-sm">Fase eliminatoria</p>
                <p className="text-[#c4a7f0] text-xs mt-1">Disponible tras la fase de grupos</p>
              </div>
            ) : (
              activeKnockoutStages.map(stage => {
                const locked = stageDeadlines[stage] ?? false;
                const firstMatch = [...byStage[stage]].sort(
                  (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
                )[0];
                return (
                  <div key={stage} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[#c4a7f0] text-[10px] font-bold uppercase tracking-widest">
                        {STAGE_LABELS[stage] ?? stage}
                      </p>
                      <span className={`text-[10px] font-medium ${locked ? "text-red-400/70" : "text-green-400/80"}`}>
                        {locked
                          ? "🔒 Cerrado"
                          : firstMatch
                            ? `● Cierra ${new Date(firstMatch.scheduled_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", timeZone: "America/Argentina/Buenos_Aires" })}`
                            : "● Abierto"}
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
              })
            )}
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
