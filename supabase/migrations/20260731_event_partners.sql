-- Уулзалт/Event-ийн хамтрагч байгууллагууд (зохион байгуулагч, албан ёсны
-- хамтрагч, дэмжигч …). Логотой эсвэл зөвхөн нэрээр.
create table if not exists public.event_partners (
  id bigint generated always as identity primary key,
  event_id bigint not null references public.events(id) on delete cascade,
  name text not null,
  role text,           -- "Зохион байгуулагч", "Албан ёсны хамтрагч" гэх мэт
  logo text,           -- лого зураг (сонгох)
  url text,            -- вэб/facebook хаяг (сонгох)
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists event_partners_event_idx on public.event_partners (event_id, sort, id);

alter table public.event_partners enable row level security;

drop policy if exists "event partners read" on public.event_partners;
create policy "event partners read" on public.event_partners for select using (true);

drop policy if exists "event partners insert" on public.event_partners;
create policy "event partners insert" on public.event_partners for insert with check (private.is_admin());

drop policy if exists "event partners update" on public.event_partners;
create policy "event partners update" on public.event_partners for update using (private.is_admin());

drop policy if exists "event partners delete" on public.event_partners;
create policy "event partners delete" on public.event_partners for delete using (private.is_admin());
