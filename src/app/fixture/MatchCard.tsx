"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePrediction } from "./actions";

const SUBDIVISION_FLAGS: Record<string, string> = {
  "🏴󠁧󠁢󠁳󠁣󠁴󠁿": "gb-sct",
  "🏴󠁧󠁢󠁥󠁮󠁧󠁿": "gb-eng",
  "🏴󠁧󠁢󠁷󠁬󠁳󠁿": "gb-wls",
};

function flagUrl(emoji: string): string {
  if (SUBDIVISION_FLAGS[emoji]) {
    return `https://flagcdn.com/32x24/${SUBDIVISION_FLAGS[emoji]}.png`;
  }
  const chars = [...emoji];
  if (chars.length === 2) {
    const code = chars
      .map(c => String.fromCharCode(c.codePointAt(0)! - 0x1F1E6 + 65))
      .join("")
      .toLowerCase();
    return `https://flagcdn.com/32x24/${code}.png`;
  }
  return "";
}

function Flag({ emoji }: { emoji: string }) {
  const url = flagUrl(emoji);
  if (!url) return <span className="w-6 h-4 bg-white/10 rounded-sm inline-block" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={emoji} className="w-6 h-4 object-cover rounded-sm shrink-0" />
  );
}

type Match = {
  id: number;
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
  match: Match;
  prediction: Prediction | null;
  locked: boolean;
};

const ART = "America/Argentina/Buenos_Aires";

function formatDate(iso: string) {
  const d = new Date(iso);
  const day = d.toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: ART });
  const time = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ART });
  return `${day} · ${time}`;
}

export default function MatchCard({ match, prediction, locked }: Props) {
  const router = useRouter();
  const [home, setHome] = useState(prediction?.home_score?.toString() ?? "");
  const [away, setAway] = useState(prediction?.away_score?.toString() ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const hasPrediction = prediction !== null || status === "saved";
  const canSave = home !== "" && away !== "" && !locked && !match.is_played;

  async function handleSave() {
    if (!canSave) return;
    setStatus("saving");

    const result = await savePrediction(match.id, parseInt(home), parseInt(away));

    if (result.error) { setStatus("error"); return; }
    setStatus("saved");
    router.refresh(); // refresca predMap del servidor para que al cambiar de grupo se vean los datos guardados
    setTimeout(() => setStatus("idle"), 2500);
  }

  const pts = prediction?.points_earned;

  return (
    <div className={`rounded-2xl px-3 pt-2.5 pb-2 border transition-colors ${
      match.is_played
        ? "bg-[#0a1a10]/60 border-[#1a3d25]/60"
        : hasPrediction
          ? "bg-[#160b2e] border-[#6b3db8]/40"
          : "bg-white/[0.03] border-white/5"
    }`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[#c4a7f0] text-[10px]">{formatDate(match.scheduled_at)}</p>
        {match.is_played && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-green-500/70 bg-green-500/10 px-1.5 py-0.5 rounded-full">
            FIN
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Home */}
        <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
          <span className="text-white/90 text-xs font-medium text-right leading-tight truncate">
            {match.home_team ?? "Por definir"}
          </span>
          {match.home_flag && <Flag emoji={match.home_flag} />}
        </div>

        {/* Score inputs / display */}
        <div className="flex items-center gap-1 shrink-0">
          {locked || match.is_played ? (
            <>
              <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-black ${
                match.is_played
                  ? "bg-green-900/30 text-white text-base"
                  : "bg-white/5 text-white/80 text-sm"
              }`}>
                {match.is_played ? match.home_score_real ?? "-" : (home || "-")}
              </span>
              <span className={`text-xs ${match.is_played ? "text-green-500/50" : "text-white/20"}`}>:</span>
              <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-black ${
                match.is_played
                  ? "bg-green-900/30 text-white text-base"
                  : "bg-white/5 text-white/80 text-sm"
              }`}>
                {match.is_played ? match.away_score_real ?? "-" : (away || "-")}
              </span>
            </>
          ) : (
            <>
              <input
                type="number" min="0" max="20" value={home}
                onChange={e => { setHome(e.target.value); setStatus("idle"); }}
                className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg text-center text-sm font-bold text-white focus:outline-none focus:border-[#6b3db8] focus:bg-[#6b3db8]/10 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-white/20 text-xs">:</span>
              <input
                type="number" min="0" max="20" value={away}
                onChange={e => { setAway(e.target.value); setStatus("idle"); }}
                className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg text-center text-sm font-bold text-white focus:outline-none focus:border-[#6b3db8] focus:bg-[#6b3db8]/10 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 flex items-center gap-1.5 min-w-0">
          {match.away_flag && <Flag emoji={match.away_flag} />}
          <span className="text-white/90 text-xs font-medium leading-tight truncate">
            {match.away_team ?? "Por definir"}
          </span>
        </div>
      </div>

      {/* Footer: save button or points */}
      <div className="mt-2 flex justify-center min-h-[20px]">
        {match.is_played && pts !== undefined && pts !== null ? (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            pts === 12
              ? "bg-yellow-500/15 text-yellow-400"
              : pts > 0
                ? "bg-green-500/15 text-green-400"
                : "text-white/20"
          }`}>
            {pts === 12 ? "⭐ 12 pts" : pts > 0 ? `+${pts} pts` : "0 pts"}
          </span>
        ) : !locked && !match.is_played ? (
          <button
            onClick={handleSave}
            disabled={!canSave || status === "saving"}
            className={`text-[11px] px-3 py-0.5 rounded-lg transition-all ${
              status === "saved" ? "text-green-400" :
              status === "error" ? "text-red-400" :
              canSave ? "text-[#e0d0f8] hover:text-white active:scale-95" :
              "text-white/20 cursor-not-allowed"
            }`}
          >
            {status === "saving" ? "Guardando..." :
             status === "saved" ? "✓ Guardado" :
             status === "error" ? "Error, reintentá" :
             "Guardar"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
