-- ============================================================
-- Rezagados: usuarios que se registran después del inicio del torneo
-- ============================================================

-- 1. Nuevas columnas en profiles
alter table public.profiles
  add column if not exists is_rezagado   boolean default false,
  add column if not exists accepted_terms boolean default false;

-- 2. Actualizar el trigger handle_new_user para marcar rezagados automáticamente
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  group_deadline timestamptz := '2026-06-11T19:00:00Z';
  emp_role text;
  rezagado bool;
begin
  -- Determinar rol
  if exists (select 1 from employee_emails where email = new.email) then
    emp_role := 'employee';
  else
    emp_role := 'client';
  end if;

  -- Clientes que se registran después del deadline son rezagados
  rezagado := (emp_role = 'client' and now() > group_deadline);

  insert into public.profiles (id, alias, role, is_rezagado)
  values (new.id, null, emp_role, rezagado)
  on conflict (id) do nothing;

  return new;
end;
$$;

-- 3. Función para el ranking de rezagados (solo puntos de R32 en adelante)
create or replace function get_rezagados_ranking()
returns table (
  alias       text,
  total_points bigint,
  exact_results bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select
      pr.alias,
      coalesce(sum(p.points_earned), 0)::bigint          as total_points,
      count(*) filter (where p.points_earned = 12)::bigint as exact_results
    from profiles pr
    left join predictions p on p.user_id = pr.id
    left join matches m on m.id = p.match_id and m.stage <> 'group'
    where pr.is_rezagado = true
      and pr.role = 'client'
      and pr.alias is not null
    group by pr.alias
    order by total_points desc, exact_results desc;
end;
$$;
