import { createClient } from "@/lib/supabase/server";

type RankingRow = {
  alias: string;
  total_points: number;
  exact_results: number;
};

async function getRanking(supabase: Awaited<ReturnType<typeof createClient>>, role: string) {
  const { data } = await supabase.rpc("get_ranking", { p_role: role });
  return (data ?? []) as RankingRow[];
}

const posColors = ["text-yellow-400", "text-slate-300", "text-amber-600"];
const posLabels = ["1°", "2°", "3°"];

function RankingTable({ rows, title }: { rows: RankingRow[]; title: string }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-black text-[#9b6ee0] uppercase tracking-wider">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-[#2d1a5e] text-xs text-center py-6">Sin participantes</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {rows.map((row, i) => {
            const pos = i + 1;
            const isTop3 = pos <= 3;
            return (
              <div key={row.alias} className="flex items-center gap-3 bg-[#110828] border border-[#1e0e42] rounded-xl px-4 py-2.5">
                <span className={`w-7 shrink-0 text-center text-sm font-black ${isTop3 ? posColors[pos - 1] : "text-[#4c2a8a]"}`}>
                  {isTop3 ? posLabels[pos - 1] : `${pos}`}
                </span>
                <span className="flex-1 text-sm text-[#d4c0f0] font-semibold truncate">{row.alias}</span>
                <div className="text-right shrink-0">
                  <span className="text-white font-black">{row.total_points}</span>
                  <span className="text-[#4c2a8a] text-[10px] ml-1.5">{row.exact_results} ex</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default async function AdminRankingPage() {
  const supabase = await createClient();

  const [employees, clients] = await Promise.all([
    getRanking(supabase, "employee"),
    getRanking(supabase, "client"),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-black">Ranking completo</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <RankingTable rows={employees} title={`Empleados (${employees.length})`} />
        <RankingTable rows={clients} title={`Clientes (${clients.length})`} />
      </div>
    </div>
  );
}
