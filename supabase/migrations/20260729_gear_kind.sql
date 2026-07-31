-- Бараа нь сэлбэг үү, дагалдах хэрэгсэл үү гэдгийг МӨРӨН ДЭЭР нь хадгална.
-- Урьд нь ангиллын хатуу жагсаалтаас (PARTS_CATS) тааж байсан тул админ шинэ
-- ангилал нэмэхэд тэр бараа сэлбэг гэж танигдахгүй байв.
alter table public.gear add column if not exists kind text not null default 'gear'
  check (kind in ('gear','part'));

update public.gear set kind = 'part'
where category in (
  'Яндан','Тос (масло)','Тосны шүүр','Агаарын шүүр',
  'Батерей','Лаа','Дугуй','Дугуйн гэр',
  'Гинж','Гинжний од','Тормозны сэвч','Тормозны диск',
  'Тормозны шингэн','Хөргөлтийн шингэн','Гэрэл','Холхивч',
  'Тросс / кабель','Бусад сэлбэг'
);

create index if not exists gear_kind_idx on public.gear (kind);
