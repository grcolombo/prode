-- Agrega correct_winner al ranking para el premio Bilardista
-- Cuenta predicciones donde el resultado (victoria local/visita/empate) fue correcto

create or replace function public.get_ranking(p_role text)
returns table(
  alias           text,
  total_points    bigint,
  exact_results   bigint,
  correct_winner  bigint,
  home_goals      bigint,
  away_goals      bigint
)
language plpgsql security definer set search_path = public as $$
begin
  return query
  select
    pr.alias,
    coalesce(sum(pred.points_earned) filter (where m.is_played), 0)::bigint            as total_points,
    count(pred.id)  filter (where pred.points_earned = 12 and m.is_played)              as exact_results,
    count(pred.id)  filter (where m.is_played and (
      (pred.home_score  > pred.away_score  and m.home_score_real  > m.away_score_real)  -- local gana
      or (pred.home_score  < pred.away_score  and m.home_score_real  < m.away_score_real)  -- visita gana
      or (pred.home_score  = pred.away_score  and m.home_score_real  = m.away_score_real)  -- empate
    ))                                                                                   as correct_winner,
    count(pred.id)  filter (where pred.home_score = m.home_score_real and m.is_played)  as home_goals,
    count(pred.id)  filter (where pred.away_score = m.away_score_real and m.is_played)  as away_goals
  from public.profiles pr
  left join public.predictions pred on pred.user_id = pr.id
  left join public.matches      m   on m.id = pred.match_id
  where pr.role  = p_role
    and pr.alias is not null
  group by pr.alias
  order by total_points desc, exact_results desc, home_goals desc, away_goals desc;
end;
$$;

grant execute on function public.get_ranking(text) to authenticated;
