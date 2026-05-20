-- Trigger: recalcula points_earned en todas las predicciones
-- cuando el admin carga el resultado de un partido
-- Ejecutar en Supabase SQL Editor

create or replace function public.recalculate_points_on_result()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.is_played = true
     and new.home_score_real is not null
     and new.away_score_real is not null
  then
    update public.predictions
    set points_earned = calculate_points(
      home_score, away_score,
      new.home_score_real, new.away_score_real
    )
    where match_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists match_result_updated on public.matches;

create trigger match_result_updated
  after update on public.matches
  for each row execute function public.recalculate_points_on_result();
