import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import RealtimeRefresher from "@/components/RealtimeRefresher";

const DEADLINE = new Date("2026-06-11T19:00:00Z");

type RankingRow = {
  alias: string;
  total_points: number;
  exact_results: number;
  home_goals: number;
  away_goals: number;
};

export default async function RankingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("alias, role")
    .eq("id", user.id)
    .single();

  if (!profile?.alias) redirect("/onboarding");

  const { data: ranking } = await supabase.rpc("get_ranking", {
    p_role: profile.role,
  });

  const rows = (ranking ?? []) as RankingRow[];
  const title =
    profile.role === "employee" ? "Ranking Empleados" : "Ranking Clientes";
  const isPastDeadline = new Date() > DEADLINE;

  const myPosition = rows.findIndex(r => r.alias === profile.alias) + 1;
  const myRow = rows.find(r => r.alias === profile.alias);

  const posColors = ["text-yellow-400", "text-slate-300", "text-amber-600"];
  const posLabels = ["1°", "2°", "3°"];

  return (
    <main className="relative min-h-screen bg-[#0a0614] text-white pb-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#2d1a5e]/40 blur-[100px]" />
      </div>

      <div className="relative max-w-sm mx-auto px-4 py-6 flex flex-col gap-6">

        <div>
          <h1 className="text-2xl font-black tracking-tight">{title}</h1>
          <p className="text-[#9b6ee0] text-xs mt-1">
            Solo ves a los de tu grupo
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="text-[#4c2a8a] text-center py-16 text-sm">
            Todavia no hay participantes
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((row, i) => {
              const pos = i + 1;
              const isMe = row.alias === profile.alias;
              const isTop3 = pos <= 3;

              const href = isMe
                ? "/mis-pronosticos"
                : `/pronosticos/${encodeURIComponent(row.alias)}`;

              const inner = (
                <>
                  <span
                    className={`w-8 shrink-0 text-center text-base font-black ${
                      isTop3 ? posColors[pos - 1] : "text-[#4c2a8a]"
                    }`}
                  >
                    {isTop3 ? posLabels[pos - 1] : `${pos}`}
                  </span>

                  <span
                    className={`flex-1 font-semibold text-sm truncate ${
                      isMe ? "text-white" : "text-[#d4c0f0]"
                    }`}
                  >
                    {row.alias}
                    {isMe && (
                      <span className="ml-2 text-[#9b6ee0] text-xs font-normal">
                        (vos)
                      </span>
                    )}
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-white font-black text-lg leading-none">
                        {row.total_points}
                      </div>
                      <div className="text-[#4c2a8a] text-[10px]">
                        {row.exact_results}{" "}
                        {row.exact_results === 1 ? "exacto" : "exactos"}
                      </div>
                    </div>
                    {(isPastDeadline || isMe) && (
                      <span className="text-[#2d1a5e] text-xs">›</span>
                    )}
                  </div>
                </>
              );

              return isPastDeadline || isMe ? (
                <Link
                  key={row.alias}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                    isMe
                      ? "bg-[#2d1a5e] border-[#6b3db8] hover:bg-[#3a2270]"
                      : "bg-[#110828] border-[#1e0e42] hover:bg-[#1a0a3e] hover:border-[#2d1a5e]"
                  }`}
                >
                  {inner}
                </Link>
              ) : (
                <div
                  key={row.alias}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-[#110828] border-[#1e0e42]"
                >
                  {inner}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-[#6b4fa0] text-xs">
          Desempate: exactos › goles local › goles visitante
        </p>
        {!isPastDeadline && (
          <p className="text-center text-[#6b4fa0] text-xs">
            🔒 Podés ver los pronósticos de todos a partir del 11/06
          </p>
        )}
      </div>

      <RealtimeRefresher tables={["matches", "predictions"]} />
      <BottomNav />
    </main>
  );
}
