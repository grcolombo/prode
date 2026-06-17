import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildCareerTables, menotistaScore, type RankingRow } from "@/lib/premios";

export const dynamic = "force-dynamic";

const W = 941;
const H = 1672;

type CarreraKey = "campeones" | "adivino" | "menotista" | "bilardista";

// Marco de fondo + recuadro (interior) detectado por carrera.
const CONFIG: Record<
  CarreraKey,
  {
    file: string;
    box: { x: number; y: number; w: number; h: number };
    stat: (r: RankingRow) => number;
    statLabel: string;
    accent: string;
    table: keyof ReturnType<typeof buildCareerTables>;
  }
> = {
  campeones: {
    file: "01-Carrera de campeones.png",
    box: { x: 148, y: 847, w: 649, h: 589 },
    stat: (r) => r.total_points,
    statLabel: "pts",
    accent: "#fbbf24",
    table: "campeones",
  },
  adivino: {
    file: "02-el adivino.png",
    box: { x: 134, y: 966, w: 662, h: 545 },
    stat: (r) => r.exact_results,
    statLabel: "exactos",
    accent: "#d8b4fe",
    table: "adivino",
  },
  bilardista: {
    file: "03-Bilardista.png",
    box: { x: 129, y: 938, w: 672, h: 574 },
    stat: (r) => r.correct_winner,
    statLabel: "aciertos",
    accent: "#fb923c",
    table: "bilardista",
  },
  menotista: {
    file: "04-Menotista.png",
    box: { x: 130, y: 948, w: 675, h: 569 },
    stat: menotistaScore,
    statLabel: "goles",
    accent: "#c084fc",
    table: "menotista",
  },
};

const MEDAL = ["🥇", "🥈", "🥉", "4°", "5°"];
const MEDAL_COLOR = ["#fde047", "#e2e8f0", "#fdba74", "#e6dbff", "#e6dbff"];

function clip(alias: string) {
  return alias.length > 15 ? alias.slice(0, 14) + "…" : alias;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ carrera: string }> }
) {
  const { carrera } = await params;
  const cfg = CONFIG[carrera as CarreraKey];
  if (!cfg) {
    return new Response("Carrera inválida. Usá: campeones, adivino, menotista o bilardista.", { status: 404 });
  }

  const supabase = createAdminClient();
  const { data } = await supabase.rpc("get_ranking", { p_role: "client" });
  const rows = ((data ?? []) as RankingRow[]).map((r) => ({
    alias: r.alias,
    total_points: Number(r.total_points),
    exact_results: Number(r.exact_results),
    correct_winner: Number(r.correct_winner),
    home_goals: Number(r.home_goals),
    away_goals: Number(r.away_goals),
  }));

  const tables = buildCareerTables(rows);
  const top5 = tables[cfg.table].slice(0, 5);

  const frame = readFileSync(join(process.cwd(), "public/marcos", cfg.file));
  const frameSrc = `data:image/png;base64,${frame.toString("base64")}`;

  const pad = 26;
  const inner = {
    left: cfg.box.x + pad,
    top: cfg.box.y + pad,
    width: cfg.box.w - pad * 2,
    height: cfg.box.h - pad * 2,
  };

  return new ImageResponse(
    (
      <div style={{ position: "relative", width: W, height: H, display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={frameSrc} alt="" width={W} height={H} style={{ position: "absolute", top: 0, left: 0 }} />

        {/* Ranking dentro del recuadro */}
        <div
          style={{
            position: "absolute",
            left: inner.left,
            top: inner.top,
            width: inner.width,
            height: inner.height,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {top5.map((r, i) => (
            <div
              key={r.alias}
              style={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                gap: 16,
                borderBottom: i < top5.length - 1 ? "1px solid rgba(255,255,255,0.14)" : "none",
              }}
            >
              <span style={{ width: 70, fontSize: 46, fontWeight: 900, color: MEDAL_COLOR[i] }}>{MEDAL[i]}</span>
              <span style={{ flex: 1, fontSize: 42, fontWeight: 800, color: "#ffffff" }}>{clip(r.alias)}</span>
              <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 50, fontWeight: 900, color: cfg.accent }}>{cfg.stat(r)}</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.65)" }}>{cfg.statLabel}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      headers: {
        "Content-Disposition": `attachment; filename="prode-${carrera}.png"`,
      },
    }
  );
}
