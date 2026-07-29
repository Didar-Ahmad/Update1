-- Add per-poster size/price variants (e.g. A4 £8, A3 £12, A2 £18).
-- Existing single "size"/"price" columns are kept as a fallback for any
-- poster that hasn't been given explicit size options yet.
alter table public.prints
  add column if not exists sizes jsonb not null default '[]'::jsonb;

comment on column public.prints.sizes is
  'Array of {label: text, price: number} size options, e.g. [{"label":"A4","price":8},{"label":"A3","price":12}]';

-- Storage bucket for poster artwork uploaded from the admin dashboard.
insert into storage.buckets (id, name, public)
values ('poster-images', 'poster-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read poster images" on storage.objects;
create policy "Public read poster images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'poster-images');

drop policy if exists "Admins can upload poster images" on storage.objects;
create policy "Admins can upload poster images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'poster-images' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can update poster images" on storage.objects;
create policy "Admins can update poster images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'poster-images' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'poster-images' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can delete poster images" on storage.objects;
create policy "Admins can delete poster images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'poster-images' and public.has_role(auth.uid(), 'admin'));
