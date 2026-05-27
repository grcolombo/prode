"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) throw new Error("No autorizado");
  return supabase;
}

// ─── Resultados ───────────────────────────────────────────────

export async function saveResult(
  matchId: number,
  homeScore: number,
  awayScore: number
) {
  const supabase = await assertAdmin();

  const { error } = await supabase
    .from("matches")
    .update({
      home_score_real: homeScore,
      away_score_real: awayScore,
      is_played: true,
    })
    .eq("id", matchId);

  if (error) throw new Error(error.message);
  // El trigger match_result_updated recalcula points_earned automáticamente

  revalidatePath("/admin/resultados");
  revalidatePath("/ranking");
  revalidatePath("/mis-pronosticos");
}

export async function unmarkPlayed(matchId: number) {
  const supabase = await assertAdmin();

  await supabase
    .from("matches")
    .update({ is_played: false, home_score_real: null, away_score_real: null })
    .eq("id", matchId);

  await supabase
    .from("predictions")
    .update({ points_earned: null })
    .eq("match_id", matchId);

  revalidatePath("/admin/resultados");
}

// ─── Eliminatorias ────────────────────────────────────────────

export async function assignTeams(
  matchId: number,
  homeTeam: string,
  awayTeam: string,
  homeFlag: string,
  awayFlag: string
) {
  const supabase = await assertAdmin();

  const { error } = await supabase
    .from("matches")
    .update({
      home_team: homeTeam || null,
      away_team: awayTeam || null,
      home_flag: homeFlag || null,
      away_flag: awayFlag || null,
    })
    .eq("id", matchId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/eliminatorias");
  revalidatePath("/fixture");
}

// ─── Employee Emails ──────────────────────────────────────────

export async function addEmployeeEmail(email: string) {
  const supabase = await assertAdmin();

  const normalized = email.trim().toLowerCase();
  if (!normalized) throw new Error("Email vacío");

  const { error } = await supabase
    .from("employee_emails")
    .insert({ email: normalized });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/emails");
}

export async function deleteEmployeeEmail(email: string) {
  const supabase = await assertAdmin();

  const { error } = await supabase
    .from("employee_emails")
    .delete()
    .eq("email", email);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/emails");
}

// ─── Usuarios ─────────────────────────────────────────────────

export async function changeUserRole(userId: string, newRole: "employee" | "client") {
  await assertAdmin(); // verifica que quien llama es admin
  const adminSupabase = createAdminClient(); // bypasea RLS para editar perfiles ajenos

  const { error } = await adminSupabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/usuarios");
}
