import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Flag from "@/components/Flag";

const DEADLINE = new Date("2026-06-11T19:00:00Z");

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
      {points === 12 ? "⭐ 12" : `${points} pts`}
    </span>
  );
}

export default async function PronosticosAjenosPage({
  params,
}: {
  params: { alias: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Verificar que el usuario tiene alias (onboarding completo)
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("alias")
    .eq("id", user.id)
    .single();
  if (!myProfile?.alias) redirect("/onboarding");

  const alias = decodeURIComponent(params.alias);

  // Pre-deadline: no disponible
  if (new Date() < DEADLINE) {
    return (
      <main className="relative min-h-screen bg-[#0a0614] text-white pb-16">
        <div className="relative max-w-sm mx-auto px-4 py-6 flex flex-col gap-6 items-center justify-center min-h-[60vh]">
          <div className="text-5xl">🔒</div>
          <h1 className="text-xl font-black text-center">Fixture cerrado</h1>
          <p className="text-[#9b6ee0] text-sm text-center">
            Los pronósticos de otros participantes se revelan cuando cierra el fixture el{" "}
            <span className="text-white font-semibold">11 de junio</span>.
          </p>
          <Link href="/ranking" className="text-[#6b3db8] text-sm underline underline-offset-2">
            Volver al ranking
          </Link>
        </div>
        <BottomNav />
      </main>
    );
  }

  // Post-deadline: buscar perfil del alias
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id, alias, role")
    .eq("alias", alias)
    .single();

  if (!targetProfile) notFound();

  // Si es el propio usuario, redirigir a mis-pronosticos
  if (targetProfile.id === user.id) redirect("/mis-pronosticos");

  // Obtener predicciones via función segura
  const { data: predictions, error } = await supabase.rpc("get_user_predictions", {
    p_alias: alias,
  });

  if (error) {
    return (
      <main className="relative min-h-screen bg-[#0a0614] text-white pb-16">
        <div className="relative max-w-sm mx-auto px-4 py-6 text-center">
          <p className="text-red-400 text-sm">Error al cargar pronósticos.</p>
        </div>
        <BottomNav />
      </main>
    );
  }

  // Obtener partidos
  const { data: matches } = await supabase
    .from("matches")
    .select("id, home_team, away_team, home_flag, away_flag, scheduled_at, home_score_real, away_score_real, is_played, stage, group_name")
    .order("scheduled_at", { ascending: true });

  const predMap = new Map((predictions ?? []).map((p) => [p.match_id, p]));

  const allRows = (matches ?? []).map((m) => {
    const pred = predMap.get(m.id);
    return { ...m, pred: pred ?? null };
  });

  const playedRows = allRows.filter((r) => r.is_played);
  const pendingRows = allRows.filter((r) => !r.is_played);

  const totalPoints = (predictions ?? []).reduce((s, p) => s + (p.points_earned ?? 0), 0);
  const exactos = (predictions ?? []).filter((p) => p.points_earned === 12).length;
  const filled = (predictions ?? []).length;

  return (
    <main className="relative min-h-screen bg-[#0a0614] text-white pb-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#2d1a5e]/40 blur-[100px]" />
      </div>

      <div className="relative max-w-sm mx-auto px-4 py-6 flex flex-col gap-6">
        <div>
          <Link href="/ranking" className="text-[#4c2a8a] text-xs mb-2 inline-block">
            ← Ranking
          </Link>
          <h1 className="text-2xl font-black tracking-tight">{alias}</h1>
          <p className="text-[#9b6ee0] text-xs mt-1">
            {targetProfile.role === "employee" ? "Empleado" : "Cliente"}
          </p>
        </div>

        {/* Stats */}
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
            <div className="text-2xl font-black text-[#9b6ee0]">{filled}</div>
            <div className="text-[#4c2a8a] text-[10px] mt-0.5">cargados</div>
          </div>
        </div>

        {/* Partidos jugados */}
        {playedRows.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-bold text-[#4c2a8a] uppercase tracking-widest">
              Jugados ({playedRows.length})
            </h2>
            {playedRows.map((row) => {
              const pred = row.pred;
              return (
                <div key={row.id} className="bg-[#0a1a10]/60 border border-[#1a3d25]/60 rounded-xl px-4 py-3 flex items-center gap-3">
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

                  <div className="text-center shrink-0">
                    <div className="text-[10px] text-[#4c2a8a] mb-0.5">real</div>
                    <div className="text-white font-black text-base leading-none">
                      {row.home_score_real} - {row.away_score_real}
                    </div>
                  </div>

                  <div className="w-px h-8 bg-[#1e0e42] shrink-0" />

                  <div className="text-center shrink-0">
                    <div className="text-[10px] text-[#4c2a8a] mb-0.5">pronóstico</div>
                    {pred ? (
                      <div className="text-[#9b6ee0] font-black text-base leading-none">
                        {pred.home_score} - {pred.away_score}
                      </div>
                    ) : (
                      <div className="text-[#2d1a5e] text-xs">—</div>
                    )}
                  </div>

                  <div className="shrink-0">
                    <PointsBadge points={pred?.points_earned ?? null} />
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Partidos pendientes con pronóstico */}
        {pendingRows.filter(r => r.pred).length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs font-bold text-[#4c2a8a] uppercase tracking-widest">
              Pendientes
            </h2>
            {pendingRows.filter(r => r.pred).map((row) => (
              <div key={row.id} className="bg-[#160b2e] border border-[#6b3db8]/40 rounded-xl px-4 py-3 flex items-center gap-3">
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
                <div className="text-center shrink-0">
                  <div className="text-[10px] text-[#4c2a8a] mb-0.5">pronóstico</div>
                  <div className="text-[#9b6ee0] font-black text-base leading-none">
                    {row.pred!.home_score} - {row.pred!.away_score}
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
