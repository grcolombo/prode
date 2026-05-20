-- ============================================================
-- SEED DE PRUEBA — 5 usuarios simulados
-- Ejecutar en Supabase SQL Editor
-- Para limpiar después: ejecutar seed_test_users_cleanup.sql
-- ============================================================

do $$
declare
  u1 uuid := 'aaaaaaaa-0001-0001-0001-000000000001';
  u2 uuid := 'aaaaaaaa-0001-0001-0001-000000000002';
  u3 uuid := 'aaaaaaaa-0001-0001-0001-000000000003';
  u4 uuid := 'aaaaaaaa-0001-0001-0001-000000000004';
  u5 uuid := 'aaaaaaaa-0001-0001-0001-000000000005';

  match_ids int[];
  mid int;
begin

  -- ── 1. Insertar en auth.users (requerido por FK) ──
  insert into auth.users (id, email, email_confirmed_at, created_at, updated_at, aud, role)
  values
    (u1, 'elcolo_test@prode.test',     now(), now(), now(), 'authenticated', 'authenticated'),
    (u2, 'labeto_test@prode.test',     now(), now(), now(), 'authenticated', 'authenticated'),
    (u3, 'pepefc_test@prode.test',     now(), now(), now(), 'authenticated', 'authenticated'),
    (u4, 'tigrerojo_test@prode.test',  now(), now(), now(), 'authenticated', 'authenticated'),
    (u5, 'aguilasur_test@prode.test',  now(), now(), now(), 'authenticated', 'authenticated')
  on conflict (id) do nothing;

  -- ── 2. Insertar perfiles ──
  -- (el trigger handle_new_user se dispara con el insert en auth.users
  --  pero como usamos emails @prode.test no están en employee_emails,
  --  así que sobreescribimos el role manualmente)
  insert into public.profiles (id, alias, role, is_admin) values
    (u1, 'ElColo',    'employee', false),
    (u2, 'LaBeto',    'employee', false),
    (u3, 'PepeFC',    'employee', false),
    (u4, 'TigreRojo', 'client',   false),
    (u5, 'AguilaSur', 'client',   false)
  on conflict (id) do update set
    alias    = excluded.alias,
    role     = excluded.role,
    is_admin = excluded.is_admin;

  -- ── 3. Tomar los primeros 8 partidos del fixture ──
  select array_agg(id order by scheduled_at asc)
  into match_ids
  from (select id, scheduled_at from public.matches limit 8) t;

  -- ── 4. Pronósticos por usuario ──
  foreach mid in array match_ids loop
    insert into public.predictions (user_id, match_id, home_score, away_score) values
      (u1, mid, (array[2,1,3,0,2,1,1,0])[array_position(match_ids, mid)],
                (array[1,0,1,0,0,2,1,1])[array_position(match_ids, mid)]),
      (u2, mid, (array[1,2,1,1,3,0,2,1])[array_position(match_ids, mid)],
                (array[0,1,2,0,1,1,0,2])[array_position(match_ids, mid)]),
      (u3, mid, (array[0,1,2,1,1,2,3,0])[array_position(match_ids, mid)],
                (array[0,1,0,1,0,1,1,0])[array_position(match_ids, mid)]),
      (u4, mid, (array[2,0,1,2,1,1,0,2])[array_position(match_ids, mid)],
                (array[2,0,1,1,1,0,0,1])[array_position(match_ids, mid)]),
      (u5, mid, (array[1,1,2,0,2,2,1,1])[array_position(match_ids, mid)],
                (array[1,0,0,0,1,0,2,0])[array_position(match_ids, mid)])
    on conflict do nothing;
  end loop;

  -- ── 5. Marcar 2 partidos como jugados (trigger recalcula puntos) ──
  update public.matches
  set home_score_real = 2, away_score_real = 1, is_played = true
  where id = match_ids[1];

  update public.matches
  set home_score_real = 0, away_score_real = 0, is_played = true
  where id = match_ids[2];

  raise notice 'Seed OK. Match IDs: %', match_ids;
end;
$$;
