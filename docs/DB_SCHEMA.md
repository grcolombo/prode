# DB Schema — PRODE Mundial 2026

Base de datos PostgreSQL en Supabase. Todos los timestamps en UTC.

---

## Tablas

### `employee_emails`
Lista blanca de emails de empleados de Tarifar. Cargada manualmente por el admin.

```sql
create table employee_emails (
  email text primary key
);
```

### `profiles`
Extiende `auth.users` de Supabase. Se crea automáticamente con un trigger al hacer signup.

```sql
create table profiles (
  id          uuid references auth.users primary key,
  alias       text unique not null,
  role        text not null check (role in ('employee', 'client')),
  is_admin    boolean default false,
  created_at  timestamptz default now()
);
```

**Nota**: `role` se determina al crear el perfil chequeando si el email está en `employee_emails`.

### `matches`
Todos los partidos del torneo (grupos + eliminatorias).

```sql
create table matches (
  id              serial primary key,
  stage           text not null check (stage in ('group', 'r32', 'r16', 'qf', 'sf', 'third', 'final')),
  group_name      text,                    -- 'A'–'L', null para eliminatorias
  match_number    int not null,            -- número correlativo global
  round           int,                     -- 1, 2 o 3 dentro de la fase de grupos
  slot_label      text,                    -- 'Ganador Grupo A vs 2do Grupo B' para eliminatorias
  home_team       text,                    -- null hasta que se defina en eliminatorias
  away_team       text,                    -- null hasta que se defina en eliminatorias
  home_flag       text,                    -- emoji de bandera o código ISO
  away_flag       text,
  scheduled_at    timestamptz not null,    -- en UTC
  home_score_real int,                     -- null hasta que se juegue
  away_score_real int,
  is_played       boolean default false,
  created_at      timestamptz default now()
);
```

### `predictions`
Pronósticos de cada usuario por partido. Uno por usuario por partido.

```sql
create table predictions (
  id            serial primary key,
  user_id       uuid references profiles(id) on delete cascade,
  match_id      int references matches(id) on delete cascade,
  home_score    int not null check (home_score >= 0),
  away_score    int not null check (away_score >= 0),
  points_earned int,                  -- null hasta que se cargue resultado real
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(user_id, match_id)
);
```

---

## Triggers

### Crear perfil al hacer signup
```sql
create or replace function handle_new_user()
returns trigger as $$
declare
  user_role text;
begin
  -- Determinar rol según si el email está en employee_emails
  select case
    when exists (select 1 from employee_emails where email = new.email)
    then 'employee'
    else 'client'
  end into user_role;

  -- Insertar perfil sin alias (alias se elige en /onboarding)
  -- NOTA: alias no puede ser null según el schema — usar tabla intermedia
  -- o permitir alias null temporalmente hasta el onboarding
  insert into profiles (id, alias, role)
  values (new.id, null, user_role);   -- ver nota abajo

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

**Nota**: Para permitir alias null temporalmente, cambiar el constraint:
```sql
alias text unique  -- sin NOT NULL, se completa en /onboarding
```
El middleware redirige a `/onboarding` mientras `alias is null`.

### Actualizar `updated_at` en predictions
```sql
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger predictions_updated_at
  before update on predictions
  for each row execute procedure update_updated_at();
```

---

## RLS (Row Level Security)

```sql
-- Habilitar RLS en todas las tablas
alter table profiles    enable row level security;
alter table matches     enable row level security;
alter table predictions enable row level security;
alter table employee_emails enable row level security;

-- profiles: cada usuario ve y edita solo el suyo
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- profiles: admin puede ver todos
create policy "Admin can view all profiles"
  on profiles for select
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- matches: lectura pública para usuarios autenticados
create policy "Authenticated users can read matches"
  on matches for select using (auth.role() = 'authenticated');

-- matches: solo admin puede insertar/actualizar
create policy "Admin can manage matches"
  on matches for all
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- predictions: cada usuario solo ve y edita las suyas
create policy "Users can manage own predictions"
  on predictions for all using (auth.uid() = user_id);

-- predictions: admin puede ver todas
create policy "Admin can view all predictions"
  on predictions for select
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- predictions: admin puede actualizar points_earned
create policy "Admin can update points"
  on predictions for update
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
```

---

## Lógica de cálculo de puntos

Implementar en `src/lib/points.ts` y también como función SQL para consistencia:

```sql
create or replace function calculate_points(
  pred_home int, pred_away int,
  real_home int, real_away int
) returns int as $$
declare
  pts int := 0;
  pred_result text;
  real_result text;
begin
  -- Resultado exacto
  if pred_home = real_home and pred_away = real_away then
    return 12;
  end if;

  -- Determinar ganador/empate
  pred_result := case
    when pred_home > pred_away then 'home'
    when pred_home < pred_away then 'away'
    else 'draw'
  end;
  real_result := case
    when real_home > real_away then 'home'
    when real_home < real_away then 'away'
    else 'draw'
  end;

  -- Acertó ganador o empate
  if pred_result = real_result then
    pts := pts + 5;
  end if;

  -- Acertó goles local
  if pred_home = real_home then
    pts := pts + 2;
  end if;

  -- Acertó goles visitante
  if pred_away = real_away then
    pts := pts + 2;
  end if;

  return pts;
end;
$$ language plpgsql immutable;
```

---

## Queries útiles para el ranking

### Tabla de posiciones por rol
```sql
select
  p.alias,
  p.role,
  coalesce(sum(pr.points_earned), 0) as total_points,
  count(pr.id) filter (where pr.points_earned = 12) as exact_results,
  count(pr.id) filter (where pr.points_earned is not null) as matches_predicted
from profiles p
left join predictions pr on pr.user_id = p.id
where p.role = 'employee'  -- o 'client'
group by p.id, p.alias, p.role
order by total_points desc, exact_results desc;
```

### Premio "más golerero" (top_scorer)
```sql
select p.alias, sum(pr.home_score + pr.away_score) as total_goals_predicted
from profiles p
join predictions pr on pr.user_id = p.id
where p.role = 'employee'  -- filtrar por rol
group by p.alias
order by total_goals_predicted desc
limit 1;
```

### Premio "más conservador" (most_draws)
```sql
select p.alias, count(*) as draw_predictions
from profiles p
join predictions pr on pr.user_id = p.id
where pr.home_score = pr.away_score
  and p.role = 'employee'
group by p.alias
order by draw_predictions desc
limit 1;
```

### Premio "el que más sufrió" (most_suffered)
```sql
select p.alias, count(*) as suffered_count
from profiles p
join predictions pr on pr.user_id = p.id
where pr.points_earned = 5
  and p.role = 'employee'
group by p.alias
order by suffered_count desc
limit 1;
```

### Partido más polémico (mayor varianza)
```sql
select m.id, m.home_team, m.away_team,
  variance(pr.home_score) + variance(pr.away_score) as total_variance
from matches m
join predictions pr on pr.match_id = m.id
group by m.id, m.home_team, m.away_team
order by total_variance desc
limit 1;
```
