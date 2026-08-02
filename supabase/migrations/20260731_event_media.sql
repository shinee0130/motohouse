-- Event/Meeting бүрийн зураг, видеоны галерей.
-- Biker Meeting #1, #2 … бүрд өөрийн медиа цуглуулгатай байна.
create table if not exists public.event_media (
  id bigint generated always as identity primary key,
  event_id bigint not null references public.events(id) on delete cascade,
  kind text not null default 'photo' check (kind in ('photo','video')),
  url text not null,
  thumb text,          -- видеоны нүүр зураг (сонгох)
  caption text,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists event_media_event_idx on public.event_media (event_id, sort, id);

alter table public.event_media enable row level security;

-- Уншихыг бүгд (сайт дээр ил), бичихийг зөвхөн админ — events-тэй ижил загвар.
drop policy if exists "event media read" on public.event_media;
create policy "event media read" on public.event_media for select using (true);

drop policy if exists "event media insert" on public.event_media;
create policy "event media insert" on public.event_media for insert with check (private.is_admin());

drop policy if exists "event media update" on public.event_media;
create policy "event media update" on public.event_media for update using (private.is_admin());

drop policy if exists "event media delete" on public.event_media;
create policy "event media delete" on public.event_media for delete using (private.is_admin());
