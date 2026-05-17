-- ============================================================
-- PRODE Mundial 2026 — Schema inicial
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ─── TABLAS ──────────────────────────────────────────────────

create table public.employee_emails (
  email text primary key
);

create table public.profiles (
  id         uuid references auth.users on delete cascade primary key,
  alias      text unique,                          -- null hasta completar onboarding
  role       text not null check (role in ('employee', 'client')),
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.matches (
  id              serial primary key,
  stage           text not null check (stage in ('group','r32','r16','qf','sf','third','final')),
  group_name      text,                            -- 'A'–'L', null en eliminatorias
  match_number    int not null,
  round           int,                             -- 1,2,3 en fase de grupos
  slot_label      text,                            -- descripcion del cruce en eliminatorias
  home_team       text,                            -- null hasta que el admin lo asigne
  away_team       text,
  home_flag       text,                            -- emoji bandera
  away_flag       text,
  scheduled_at    timestamptz not null,
  home_score_real int,
  away_score_real int,
  is_played       boolean not null default false,
  created_at      timestamptz not null default now()
);

create table public.predictions (
  id            serial primary key,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  match_id      int  not null references public.matches(id)  on delete cascade,
  home_score    int  not null check (home_score >= 0),
  away_score    int  not null check (away_score >= 0),
  points_earned int,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, match_id)
);

-- ─── FUNCIÓN: calcular puntos ────────────────────────────────

create or replace function public.calculate_points(
  pred_home int, pred_away int,
  real_home int, real_away int
) returns int language plpgsql immutable as $$
declare
  pts         int := 0;
  pred_winner text;
  real_winner text;
begin
  if pred_home = real_home and pred_away = real_away then
    return 12;
  end if;

  pred_winner := case
    when pred_home > pred_away then 'home'
    when pred_home < pred_away then 'away'
    else 'draw'
  end;
  real_winner := case
    when real_home > real_away then 'home'
    when real_home < real_away then 'away'
    else 'draw'
  end;

  if pred_winner = real_winner then pts := pts + 5; end if;
  if pred_home = real_home     then pts := pts + 2; end if;
  if pred_away = real_away     then pts := pts + 2; end if;

  return pts;
end;
$$;

-- ─── FUNCIÓN: updated_at automático ──────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger predictions_updated_at
  before update on public.predictions
  for each row execute procedure public.set_updated_at();

-- ─── TRIGGER: crear perfil al registrarse ───────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  user_role text;
begin
  select case
    when exists (select 1 from public.employee_emails where email = new.email)
    then 'employee'
    else 'client'
  end into user_role;

  insert into public.profiles (id, role)
  values (new.id, user_role);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── RLS ─────────────────────────────────────────────────────

alter table public.employee_emails enable row level security;
alter table public.profiles        enable row level security;
alter table public.matches         enable row level security;
alter table public.predictions     enable row level security;

-- employee_emails: solo admins pueden leer/escribir
create policy "Admin manages employee_emails"
  on public.employee_emails for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- profiles: cada usuario lee y edita el suyo
create policy "User reads own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "User updates own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- profiles: admin lee todos
create policy "Admin reads all profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- matches: cualquier usuario autenticado puede leer
create policy "Authenticated users read matches"
  on public.matches for select
  using (auth.role() = 'authenticated');

-- matches: solo admin escribe
create policy "Admin manages matches"
  on public.matches for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- predictions: cada usuario gestiona las suyas
create policy "User manages own predictions"
  on public.predictions for all
  using (auth.uid() = user_id);

-- predictions: admin lee todas
create policy "Admin reads all predictions"
  on public.predictions for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- predictions: admin actualiza points_earned
create policy "Admin updates points"
  on public.predictions for update
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
