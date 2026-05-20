import { createClient } from "@/lib/supabase/server";
import UsuariosClient from "./UsuariosClient";

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ user_id?: string }>;
}) {
  const supabase = await createClient();
  const { user_id } = await searchParams;

  // Todos los usuarios con alias
  const { data: users } = await supabase
    .from("profiles")
    .select("id, alias, role")
    .not("alias", "is", null)
    .order("alias");

  // Si hay user_id seleccionado, traer sus datos
  let selectedPredictions = null;
  let selectedMatches = null;

  if (user_id) {
    const [{ data: matches }, { data: predictions }] = await Promise.all([
      supabase
        .from("matches")
        .select("id, stage, group_name, home_team, away_team, home_flag, away_flag, scheduled_at, home_score_real, away_score_real, is_played")
        .order("scheduled_at", { ascending: true }),
      supabase
        .from("predictions")
        .select("match_id, home_score, away_score, points_earned")
        .eq("user_id", user_id),
    ]);
    selectedMatches = matches;
    selectedPredictions = predictions;
  }

  return (
    <UsuariosClient
      users={users ?? []}
      selectedUserId={user_id ?? null}
      matches={selectedMatches ?? []}
      predictions={selectedPredictions ?? []}
    />
  );
}
