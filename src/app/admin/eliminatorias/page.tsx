import { createClient } from "@/lib/supabase/server";
import EliminatoriasClient from "./EliminatoriasClient";

export default async function EliminatoriasPage() {
  const supabase = await createClient();

  const { data: matches } = await supabase
    .from("matches")
    .select("id, stage, slot_label, home_team, away_team, home_flag, away_flag, scheduled_at, is_played")
    .neq("stage", "group")
    .order("scheduled_at", { ascending: true });

  return <EliminatoriasClient matches={matches ?? []} />;
}
