import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FixtureClient from "./FixtureClient";
import RealtimeRefresher from "@/components/RealtimeRefresher";

export default async function FixturePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data: matches }, { data: predictions }] = await Promise.all([
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

  return (
    <>
      <RealtimeRefresher tables={["matches", "predictions"]} />
      <FixtureClient
        matches={matches ?? []}
        predictions={predictions ?? []}
      />
    </>
  );
}
