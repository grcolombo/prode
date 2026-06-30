import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FixtureClient from "./FixtureClient";
import RealtimeRefresher from "@/components/RealtimeRefresher";
import TermsOverlay from "@/components/TermsOverlay";
import KnockoutBanner from "@/components/KnockoutBanner";

const GROUP_DEADLINE = new Date("2026-06-11T19:00:00Z");

export default async function FixturePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data: profile }, { data: matches }, { data: predictions }] = await Promise.all([
    supabase.from("profiles").select("alias, accepted_terms, is_rezagado").eq("id", user.id).single(),
    supabase
      .from("matches")
      .select("id,stage,group_name,round,match_number,slot_label,home_team,away_team,home_flag,away_flag,scheduled_at,home_score_real,away_score_real,is_played")
      .order("group_name")
      .order("round")
      .order("match_number"),
    supabase
      .from("predictions")
      .select("match_id,home_score,away_score,points_earned")
      .eq("user_id", user.id),
  ]);

  // Gracia eliminatorias: ventana excepcional para carga tardía (30/06/2026 13:30 AR = 16:30 UTC)
  const KNOCKOUT_GRACE = new Date("2026-06-30T16:30:00Z");

  // Calcular deadline por fase eliminatoria (primer partido de cada fase)
  const now = new Date();
  const isRezagado = profile?.is_rezagado ?? false;
  const stageDeadlines: Record<string, boolean> = { group: now >= GROUP_DEADLINE };
  const knockoutStages = ["r32", "r16", "qf", "sf", "third", "final"];
  for (const stage of knockoutStages) {
    const stageMatches = (matches ?? []).filter(m => m.stage === stage);
    if (now < KNOCKOUT_GRACE || isRezagado) {
      // Dentro de la gracia o rezagado: bloqueado solo si todos los partidos ya jugaron
      stageDeadlines[stage] = stageMatches.length > 0 && stageMatches.every(m => m.is_played);
    } else {
      const first = stageMatches.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0];
      stageDeadlines[stage] = first ? now >= new Date(first.scheduled_at) : false;
    }
  }

  const hasKnockout = (matches ?? []).some(m => m.stage !== "group");

  return (
    <>
      {!profile?.accepted_terms && (
        <TermsOverlay isRezagado={profile?.is_rezagado ?? false} />
      )}
      {profile?.accepted_terms && hasKnockout && <KnockoutBanner />}
      <RealtimeRefresher tables={["matches", "predictions"]} />
      <FixtureClient
        matches={matches ?? []}
        predictions={predictions ?? []}
        stageDeadlines={stageDeadlines}
        alias={profile?.alias ?? ""}
      />
    </>
  );
}
