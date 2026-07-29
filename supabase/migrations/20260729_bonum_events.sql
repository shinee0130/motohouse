-- Bonum-ын бүх webhook callback-ийг түүхэнд үлдээнэ. Төлбөр яагаад амжилтгүй
-- болсныг хойно нь харах цорын ганц эх сурвалж (Bonum-ын хариу бүтнээрээ ирдэг).
create table if not exists public.bonum_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  type text,
  status text,
  transaction_id text,
  invoice_id text,
  payload jsonb
);

create index if not exists bonum_events_tx_idx on public.bonum_events (transaction_id);
create index if not exists bonum_events_created_idx on public.bonum_events (created_at desc);

alter table public.bonum_events enable row level security;

-- Зөвхөн админ уншина. INSERT policy огт байхгүй — бичихийг зөвхөн webhook-ийн
-- service_role хийнэ (RLS тойрдог).
drop policy if exists "bonum events read" on public.bonum_events;
create policy "bonum events read" on public.bonum_events
  for select using (private.is_admin());

-- Мэдэгдэл (имэйл) илгээсэн эсэхийг event бүр дээр тэмдэглэнэ. Ингэснээр
-- админы Төлбөрийн лог дээрээс "имэйл явсан уу" гэдгийг шууд харна.
alter table public.bonum_events add column if not exists notify_status text;
