"use server";

import { createClient } from "@/lib/supabase/server";

// Deadline global: inicio del primer partido de la fase de grupos
const GROUP_DEADLINE = new Date("2026-06-11T19:00:00Z");

export async function savePrediction(matchId: number, homeScore: number, awayScore: number) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  // Traer el partido con su stage
  const { data: match } = await supabase
    .from("matches")
    .select("is_played, stage")
    .eq("id", matchId)
    .single();

  if (!match) return { error: "Partido no encontrado." };
  if (match.is_played) return { error: "El partido ya fue jugado." };

  const now = new Date();

  if (match.stage === "group") {
    // Fase de grupos: deadline global
    if (now >= GROUP_DEADLINE) {
      return { error: "El fixture de grupos está cerrado." };
    }
  } else {
    // Fases eliminatorias: deadline = inicio del primer partido de esa fase
    const { data: firstMatch } = await supabase
      .from("matches")
      .select("scheduled_at")
      .eq("stage", match.stage)
      .order("scheduled_at", { ascending: true })
      .limit(1)
      .single();

    if (firstMatch && now >= new Date(firstMatch.scheduled_at)) {
      return { error: "Los pronósticos de esta fase ya están cerrados." };
    }
  }

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
