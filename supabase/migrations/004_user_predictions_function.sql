-- Función para leer pronósticos de otro usuario (solo post-deadline)
-- security definer: bypasa RLS para leer predictions de cualquier user
create or replace function get_user_predictions(p_alias text)
returns table (
  match_id int,
  home_score int,
  away_score int,
  points_earned int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  deadline timestamptz := '2026-06-11T19:00:00Z';
  target_user_id uuid;
begin
  -- Solo disponible post-deadline
  if now() < deadline then
    raise exception 'Los pronósticos ajenos solo son visibles después del cierre del fixture';
  end if;

  select id into target_user_id from profiles where alias = p_alias;
  if target_user_id is null then
    raise exception 'Usuario no encontrado';
  end if;

  return query
    select p.match_id, p.home_score, p.away_score, p.points_earned
    from predictions p
    where p.user_id = target_user_id;
end;
$$;
