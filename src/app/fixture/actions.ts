"use server";

import { createClient } from "@/lib/supabase/server";

const DEADLINE = new Date("2026-06-11T19:00:00Z");

export async function savePrediction(matchId: number, homeScore: number, awayScore: number) {
  // Validación server-side del deadline
  if (new Date() > DEADLINE) {
    return { error: "El fixture está cerrado. Ya no se pueden cargar pronósticos." };
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "No autenticado." };
  }

  // Verificar que el partido no esté jugado
  const { data: match } = await supabase
    .from("matches")
    .select("is_played")
    .eq("id", matchId)
    .single();

  if (!match) return { error: "Partido no encontrado." };
  if (match.is_played) return { error: "El partido ya fue jugado." };

  const { error } = await supabase.from("predictions").upsert(
    {
      user_id: user.id,
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
    },
    { onConflict: "user_id,match_id" }
  );

  if (error) return { error: "Error al guardar. Intentá de nuevo." };
  return { error: null };
}
