import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Flag from "@/components/Flag";
import RealtimeRefresher from "@/components/RealtimeRefresher";

type PredictionRow = {
  match_id: number;
  home_team: string | null;
  away_team: string | null;
  home_flag: string | null;
  away_flag: string | null;
  scheduled_at: string;
  home_score_real: number | null;
  away_score_real: number | null;
  is_played: boolean;
  stage: string;
  group_name: string | null;
  home_score: number | null;
  away_score: number | null;
  points_earned: number | null;
};

function PointsBadge({ points }: { points: number | null }) {
  if (points === null) return null;
  const color =
    points === 12
      ? "bg-yellow-500/20 text-yellow-400"
      : points >= 5
      ? "bg-green-500/20 text-green-400"
      : points > 0
      ? "bg-blue-500/20 text-blue-300"
      : "bg-[#1e0e42] text-[#4c2a8a]";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {points} pts
    </span>
  );
}

export default async function MisPronosticosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("alias")
    .eq("id", user.id)
    .single();
  if (!profile?.alias) redirect("/onboarding");

  const { data: matches } = await supabase
    .from("matches")
    .select("id, home_team, away_team, home_flag, away_flag, scheduled_at, home_score_real, away_score_real, is_played, stage, group_name")
    .order("scheduled_at", { ascending: true });

  const { data: predictions } = await supabase
    .from("predictions")
    .select("match_id, home_score, away_score, points_earned")
    .eq("user_id", user.id);

  const predMap = new Map(
    (predictions ?? []).map((p) => [p.match_id, p])
  );

  const rows: PredictionRow[] = (matches ?? []).map((m) => {
    const pred = predMap.get(m.id);
    return {
      match_id: m.id,
      home_team: m.home_team,
      away_team: m.away_team,
      home_flag: m.home_flag,
      away_flag: m.away_flag,
      scheduled_at: m.scheduled_at,
      home_score_real: m.home_score_real,
      away_score_real: m.away_score_real,
      is_played: m.is_played,
      stage: m.stage,
      group_name: m.group_name,
      home_score: pred?.home_score ?? null,
      away_score: pred?.away_score ?? null,
      points_earned: pred?.points_earned ?? null,
    };
  });

  const totalMatches = rows.length;
  const filled = rows.filter((r) => r.home_score !== null).length;
  const played = rows.filter((r) => r.is_played).length;
  const totalPoints = rows.reduce((sum, r) => sum + (r.points_earned ?? 0), 0);
  const exactos = rows.filter((r) => r.points_earned === 12).length;

  const playedRows = rows.filter((r) => r.is_played);
  const pendingRows = rows.filter((r) => !r.is_played && r.home_score !== null);

  return (
    <main className="relative min-h-screen bg-[#0a0614] text-white pb-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#2d1a5e]/40 blur-[100px]" />
      </div>

      <div className="relative max-w-sm mx-auto px-4 py-6 flex flex-col gap-6">

        <div>
          <h1 className="text-2xl font-black tracking-tight">Mis pronósticos</h1>
          <p className="text-[#9b6ee0] text-xs mt-1">{profile.alias}</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#110828] border border-[#1e0e42] rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-white">{totalPoints}</div>
            <div className="text-[#4c2a8a] text-[10px] mt-0.5">puntos</div>
          </div>
          <div className="bg-[#110828] border border-[#1e0e42] rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-yellow-400">{exactos}</div>
            <div className="text-[#4c2a8a] text-[10px] mt-0.5">exactos</div>
          </div>
          <div className="bg-[#110828] border border-[#1e0e42] rounded-xl p-3 text-center">
            <div className="text-2xl font-black text-[#9b6ee0]">{filled}<span className="text-sm text-[#4c2a8a]">/{totalMatches}</span></div>
            <div className="text-[#4c2a8a] text-[10px] mt-0.5">cargados</div>
          </div>
        </div>

        {playedRows.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-bold text-[#4c2a8a] uppercase tracking-widest">
              Jugados ({played})
            </h2>
            {playedRows.map((row) => (
              <MatchCard key={row.match_id} row={row} />
            ))}
          </section>
        )}

        {pendingRows.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-bold text-[#4c2a8a] uppercase tracking-widest">
              Pendientes con pronóstico ({pendingRows.length})
            </h2>
            {pendingRows.map((row) => (
              <MatchCard key={row.match_id} row={row} />
            ))}
          </section>
        )}

        {played === 0 && pendingRows.length === 0 && (
          <p className="text-[#4c2a8a] text-center py-16 text-sm">
            Todavía no hay partidos cargados
          </p>
        )}
      </div>

      <RealtimeRefresher tables={["matches", "predictions"]} />
      <BottomNav />
    </main>
  );
}

function MatchCard({ row }: { row: PredictionRow }) {
  const hasPred = row.home_score !== null;

  return (
    <div className="bg-[#110828] border border-[#1e0e42] rounded-xl px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-semibold truncate">
          <Flag code={row.home_flag} />
          <span className="truncate">{row.home_team ?? "TBD"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-semibold truncate mt-0.5">
          <Flag code={row.away_flag} />
          <span className="truncate">{row.away_team ?? "TBD"}</span>
        </div>
      </div>

      {row.is_played && (
        <div className="text-center shrink-0">
          <div className="text-xs text-[#4c2a8a] mb-0.5">real</div>
          <div className="text-white font-black text-base leading-none">
            {row.home_score_real} - {row.away_score_real}
          </div>
        </div>
      )}

      {row.is_played && hasPred && (
        <div className="w-px h-8 bg-[#1e0e42] shrink-0" />
      )}

      <div className="text-center shrink-0">
        <div className="text-xs text-[#4c2a8a] mb-0.5">vos</div>
        {hasPred ? (
          <div className="text-[#9b6ee0] font-black text-base leading-none">
            {row.home_score} - {row.away_score}
          </div>
        ) : (
          <div className="text-[#2d1a5e] text-xs">—</div>
        )}
      </div>

      {row.is_played && (
        <div className="shrink-0">
          <PointsBadge points={row.points_earned} />
        </div>
      )}
    </div>
  );
}
