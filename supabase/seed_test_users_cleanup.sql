-- ============================================================
-- CLEANUP — elimina los usuarios de prueba y sus datos
-- También revierte los 2 partidos marcados como jugados
-- ============================================================

do $$
declare
  test_ids uuid[] := array[
    'aaaaaaaa-0001-0001-0001-000000000001'::uuid,
    'aaaaaaaa-0001-0001-0001-000000000002'::uuid,
    'aaaaaaaa-0001-0001-0001-000000000003'::uuid,
    'aaaaaaaa-0001-0001-0001-000000000004'::uuid,
    'aaaaaaaa-0001-0001-0001-000000000005'::uuid
  ];
begin
  -- Borrar predicciones (cascade lo haría igual, pero explícito)
  delete from public.predictions where user_id = any(test_ids);

  -- Borrar perfiles
  delete from public.profiles where id = any(test_ids);

  -- Revertir partidos jugados (los 2 primeros)
  update public.matches
  set home_score_real = null, away_score_real = null, is_played = false
  where id in (
    select id from public.matches order by scheduled_at asc limit 2
  );

  raise notice 'Cleanup completado';
end;
$$;
