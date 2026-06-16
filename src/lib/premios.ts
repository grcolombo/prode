// Lógica de carreras secundarias (premios) en cascada.
//
// Jerarquía: Carrera de Campeones → El Adivino → El Menotista → El Bilardista.
// Cada participante puede liderar UNA sola carrera: el ganador de una carrera
// de mayor jerarquía se excluye de las siguientes. Así nadie aparece primero
// en varias carreras a la vez.

export type RankingRow = {
  alias: string;
  total_points: number;
  exact_results: number;
  correct_winner: number;
  home_goals: number;
  away_goals: number;
};

export const menotistaScore = (r: RankingRow) =>
  r.home_goals + r.away_goals + r.exact_results;

// Cadena de desempate estándar: puntos → exactos → goles local → goles visitante.
function tiebreak(a: RankingRow, b: RankingRow): number {
  return (
    b.total_points - a.total_points ||
    b.exact_results - a.exact_results ||
    b.home_goals - a.home_goals ||
    b.away_goals - a.away_goals
  );
}

export type CareerTables = {
  campeones: RankingRow[];
  adivino: RankingRow[];
  menotista: RankingRow[];
  bilardista: RankingRow[];
};

export function buildCareerTables(rows: RankingRow[]): CareerTables {
  // Carrera de Campeones — todos, por puntos (con desempates).
  const campeones = [...rows].sort(tiebreak);
  const campeon = campeones[0];

  // El Adivino — más exactos, excluyendo al campeón.
  const poolAdivino = campeones.filter((r) => r.alias !== campeon?.alias);
  const adivino = [...poolAdivino].sort(
    (a, b) => b.exact_results - a.exact_results || tiebreak(a, b)
  );
  const ganadorAdivino = adivino[0];

  // El Menotista — más goles acertados, excluyendo campeón y adivino.
  const poolMenotista = poolAdivino.filter((r) => r.alias !== ganadorAdivino?.alias);
  const menotista = [...poolMenotista].sort(
    (a, b) => menotistaScore(b) - menotistaScore(a) || tiebreak(a, b)
  );
  const ganadorMenotista = menotista[0];

  // El Bilardista — más aciertos de ganador/empate, excluyendo los anteriores.
  const poolBilardista = poolMenotista.filter((r) => r.alias !== ganadorMenotista?.alias);
  const bilardista = [...poolBilardista].sort(
    (a, b) => b.correct_winner - a.correct_winner || tiebreak(a, b)
  );

  return { campeones, adivino, menotista, bilardista };
}
