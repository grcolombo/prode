-- Función para stats del dashboard admin
-- security definer: puede leer predictions de todos los usuarios
create or replace function get_dashboard_stats()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  select json_build_object(

    -- Resumen general
    'total_users',        (select count(*) from profiles where alias is not null),
    'total_predictions',  (select count(*) from predictions),
    'matches_played',     (select count(*) from matches where is_played = true),
    'total_matches',      (select count(*) from matches),
    'points_distributed', (select coalesce(sum(points_earned), 0) from predictions where points_earned is not null),
    'users_with_all',     (
      select count(*) from (
        select user_id
        from predictions
        group by user_id
        having count(*) = (select count(*) from matches)
      ) t
    ),

    -- Carrera de Campeones — top 5 empleados
    'top_employees', (
      select json_agg(t) from (
        select pr.alias, coalesce(sum(p.points_earned), 0) as pts,
               count(*) filter (where p.points_earned = 12) as exactos
        from profiles pr
        left join predictions p on p.user_id = pr.id
        where pr.role = 'employee' and pr.alias is not null
        group by pr.alias
        order by pts desc, exactos desc
        limit 5
      ) t
    ),

    -- Carrera de Campeones — top 5 clientes
    'top_clients', (
      select json_agg(t) from (
        select pr.alias, coalesce(sum(p.points_earned), 0) as pts,
               count(*) filter (where p.points_earned = 12) as exactos
        from profiles pr
        left join predictions p on p.user_id = pr.id
        where pr.role = 'client' and pr.alias is not null
        group by pr.alias
        order by pts desc, exactos desc
        limit 5
      ) t
    ),

    -- El Menotista — mayor promedio de goles pronosticados
    'menotista', (
      select json_build_object('alias', pr.alias, 'avg_goals', round(avg(p.home_score + p.away_score)::numeric, 2))
      from predictions p
      join profiles pr on pr.id = p.user_id
      where pr.alias is not null
      group by pr.alias
      order by avg(p.home_score + p.away_score) desc
      limit 1
    ),

    -- El Bilardista — menor promedio de goles pronosticados
    'bilardista', (
      select json_build_object('alias', pr.alias, 'avg_goals', round(avg(p.home_score + p.away_score)::numeric, 2))
      from predictions p
      join profiles pr on pr.id = p.user_id
      where pr.alias is not null
      group by pr.alias
      order by avg(p.home_score + p.away_score) asc
      limit 1
    ),

    -- El Adivino — más resultados exactos (con datos de desempate)
    'adivino', (
      select json_build_object('alias', pr.alias, 'exactos', count(*))
      from predictions p
      join profiles pr on pr.id = p.user_id
      where p.points_earned = 12 and pr.alias is not null
      group by pr.alias
      order by count(*) desc
      limit 1
    ),

    -- Tabla de desempate: top participantes con sus criterios de desempate
    'tiebreaker_table', (
      select json_agg(t order by t.pts desc, t.exactos desc, t.home_ok desc, t.away_ok desc)
      from (
        select
          pr.alias,
          coalesce(sum(p.points_earned), 0) as pts,
          count(*) filter (where p.points_earned = 12) as exactos,
          count(*) filter (
            where m.is_played = true
              and p.home_score = m.home_score_real
          ) as home_ok,
          count(*) filter (
            where m.is_played = true
              and p.away_score = m.away_score_real
          ) as away_ok
        from profiles pr
        left join predictions p on p.user_id = pr.id
        left join matches m on m.id = p.match_id
        where pr.alias is not null
          and pr.role = 'client'
        group by pr.alias
        order by pts desc, exactos desc, home_ok desc, away_ok desc
        limit 8
      ) t
    ),

    -- Partido más pronosticado (más predicciones cargadas)
    'most_predicted_match', (
      select json_build_object(
        'home_team', m.home_team,
        'away_team', m.away_team,
        'count', count(*)
      )
      from predictions p
      join matches m on m.id = p.match_id
      group by m.id, m.home_team, m.away_team
      order by count(*) desc
      limit 1
    ),

    -- Usuarios con fixture parcial (tienen al menos 1 pronóstico pero no todos)
    'users_partial', (
      select count(*) from (
        select user_id
        from predictions
        group by user_id
        having count(*) < (select count(*) from matches)
      ) t
    ),

    -- Usuarios sin ningún pronóstico
    'users_empty', (
      select count(*) from profiles
      where alias is not null
        and id not in (select distinct user_id from predictions)
    ),

    -- Partido con más pronósticos exactos
    'most_exact_match', (
      select json_build_object(
        'home_team', m.home_team,
        'away_team', m.away_team,
        'home_score_real', m.home_score_real,
        'away_score_real', m.away_score_real,
        'count', count(*)
      )
      from predictions p
      join matches m on m.id = p.match_id
      where m.is_played = true
        and p.home_score = m.home_score_real
        and p.away_score = m.away_score_real
      group by m.id, m.home_team, m.away_team, m.home_score_real, m.away_score_real
      order by count(*) desc
      limit 1
    )

  ) into result;

  return result;
end;
$$;
