import { createClient } from "@/lib/supabase/server";
import ResultadosClient from "./ResultadosClient";

export default async function ResultadosPage() {
  const supabase = await createClient();

  const { data: matches } = await supabase
    .from("matches")
    .select("id, stage, group_name, round, match_number, home_team, away_team, scheduled_at, home_score_real, away_score_real, is_played")
    .order("scheduled_at", { ascending: true });

  return <ResultadosClient matches={matches ?? []} />;
}
