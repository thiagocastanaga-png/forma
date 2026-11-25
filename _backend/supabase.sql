-- Forma · cambios de base de datos para Forma Pro mensual/anual y medición
-- Pegalo entero en Supabase > SQL Editor > New query y tocá "Run". Se puede correr más de una vez.

-- 1) Vencimiento de cada compra
alter table public.purchases add column if not exists created_at timestamptz default now();
alter table public.purchases add column if not exists expires_at timestamptz;

-- 2) La app pide las compras de la cuenta con su fecha de vencimiento
drop function if exists public.my_purchases();
create function public.my_purchases()
returns table (product_id text, created_at timestamptz, expires_at timestamptz)
language sql security definer set search_path = public as $$
  select p.product_id::text, p.created_at, p.expires_at
  from public.purchases p
  where lower(p.email) = lower(auth.jwt() ->> 'email');
$$;
grant execute on function public.my_purchases() to authenticated;

-- 3) Medición mínima (embudo): solo eventos, sin lo que escribe la persona
create table if not exists public.events (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid(),
  ev text not null,
  x text,
  at timestamptz not null default now()
);
alter table public.events enable row level security;
drop policy if exists "insertar mis eventos" on public.events;
create policy "insertar mis eventos" on public.events for insert to authenticated with check (user_id = auth.uid());

-- Para mirar el embudo (Supabase > SQL Editor):
-- select ev, count(distinct user_id) personas from public.events where at > now() - interval '14 days' group by ev order by 2 desc;
