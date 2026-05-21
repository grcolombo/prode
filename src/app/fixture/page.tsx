import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FixtureClient from "./FixtureClient";
import RealtimeRefresher from "@/components/RealtimeRefresher";
import TermsOverlay from "@/components/TermsOverlay";

const GROUP_DEADLINE = new Date("2026-06-11T19:00:00Z");

export default async function FixturePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data: profile }, { data: matches }, { data: predictions }] = await Promise.all([
    supabase.from("profiles").select("alias, accepted_terms, is_rezagado").eq("id", user.id).single(),
    supabase
      .from("matches")
      .select("id,stage,group_name,round,match_number,home_team,away_team,home_flag,away_flag,scheduled_at,home_score_real,away_score_real,is_played")
      .order("group_name")
      .order("round")
      .order("match_number"),
    supabase
      .from("predictions")
      .select("match_id,home_score,away_score,points_earned")
      .eq("user_id", user.id),
  ]);

  // Calcular deadline por fase eliminatoria (primer partido de cada fase)
  const now = new Date();
  const stageDeadlines: Record<string, boolean> = { group: now >= GROUP_DEADLINE };
  const knockoutStages = ["R32", "R16", "QF", "SF", "final"];
  for (const stage of knockoutStages) {
    const first = (matches ?? [])
      .filter(m => m.stage === stage)
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0];
    stageDeadlines[stage] = first ? now >= new Date(first.scheduled_at) : false;
  }

  return (
    <>
      {!profile?.accepted_terms && (
        <TermsOverlay isRezagado={profile?.is_rezagado ?? false} />
      )}
      <RealtimeRefresher tables={["matches", "predictions"]} />
      <FixtureClient
        matches={matches ?? []}
        predictions={predictions ?? []}
        stageDeadlines={stageDeadlines}
      />
    </>
  );
}
