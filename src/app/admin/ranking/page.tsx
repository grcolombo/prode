import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type RankingRow = {
  alias: string;
  total_points: number;
  exact_results: number;
  user_id: string;
};

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
              <Link
                key={row.alias}
                href={`/admin/usuarios?user_id=${row.user_id}`}
                className="flex items-center gap-3 bg-[#110828] border border-[#1e0e42] rounded-xl px-4 py-2.5 hover:bg-[#1a0a3e] hover:border-[#2d1a5e] transition-colors"
              >
                <span className={`w-7 shrink-0 text-center text-sm font-black ${isTop3 ? posColors[pos - 1] : "text-[#4c2a8a]"}`}>
                  {isTop3 ? posLabels[pos - 1] : `${pos}`}
                </span>
                <span className="flex-1 text-sm text-[#d4c0f0] font-semibold truncate">{row.alias}</span>
                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <span className="text-white font-black">{row.total_points}</span>
                    <span className="text-[#4c2a8a] text-[10px] ml-1.5">{row.exact_results} ex</span>
                  </div>
                  <span className="text-[#2d1a5e] text-xs">›</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default async function AdminRankingPage() {
  const supabase = await createClient();

  // Fetch ranking + mapeo alias → user_id en paralelo
  const [{ data: empRanking }, { data: cliRanking }, { data: profiles }] = await Promise.all([
    supabase.rpc("get_ranking", { p_role: "employee" }),
    supabase.rpc("get_ranking", { p_role: "client" }),
    supabase.from("profiles").select("id, alias").not("alias", "is", null),
  ]);

  const aliasToId = new Map((profiles ?? []).map(p => [p.alias, p.id]));

  function enrichRows(rows: { alias: string; total_points: number; exact_results: number }[]): RankingRow[] {
    return (rows ?? []).map(r => ({ ...r, user_id: aliasToId.get(r.alias) ?? "" }));
  }

  const employees = enrichRows(empRanking ?? []);
  const clients = enrichRows(cliRanking ?? []);

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
