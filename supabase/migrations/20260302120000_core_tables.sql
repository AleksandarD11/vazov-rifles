-- 20260302120000_core_tables.sql
-- Core tables used by the app: orders, arsenal, services, gallery, site_settings

-- ORDERS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text,
  name text,
  phone text,
  email text,
  address text,
  category text,
  details text,
  total_price text,
  status text default 'pending',
  is_manual boolean default false,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Ensure columns exist even if table already exists (safe on existing DB)
alter table public.orders add column if not exists order_number text;
alter table public.orders add column if not exists name text;
alter table public.orders add column if not exists phone text;
alter table public.orders add column if not exists email text;
alter table public.orders add column if not exists address text;
alter table public.orders add column if not exists category text;
alter table public.orders add column if not exists details text;
alter table public.orders add column if not exists total_price text;
alter table public.orders add column if not exists status text;
alter table public.orders add column if not exists is_manual boolean;
alter table public.orders add column if not exists created_at timestamptz;

create unique index if not exists orders_order_number_uidx on public.orders(order_number);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);

-- NOTE: Admin панелът ви в момента НЕ ползва Supabase Auth (само “VAZOV” парола в UI),
-- затова временно оставяме политики "отворени", за да не счупим текущата работа.
-- В стъпка 2 ще ги заключим към has_role(auth.uid(),'admin') и ще добавим реален login.

drop policy if exists "TEMP public insert orders" on public.orders;
create policy "TEMP public insert orders"
on public.orders for insert
to anon, authenticated
with check (true);

drop policy if exists "TEMP public read orders" on public.orders;
create policy "TEMP public read orders"
on public.orders for select
to anon, authenticated
using (true);

drop policy if exists "TEMP public update orders" on public.orders;
create policy "TEMP public update orders"
on public.orders for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "TEMP public delete orders" on public.orders;
create policy "TEMP public delete orders"
on public.orders for delete
to anon, authenticated
using (true);


-- ARSENAL
create table if not exists public.arsenal (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price text,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.arsenal enable row level security;

alter table public.arsenal add column if not exists title text;
alter table public.arsenal add column if not exists description text;
alter table public.arsenal add column if not exists price text;
alter table public.arsenal add column if not exists image_url text;
alter table public.arsenal add column if not exists created_at timestamptz;

create index if not exists arsenal_created_at_idx on public.arsenal(created_at desc);

drop policy if exists "TEMP public read arsenal" on public.arsenal;
create policy "TEMP public read arsenal"
on public.arsenal for select
to anon, authenticated
using (true);

drop policy if exists "TEMP public write arsenal" on public.arsenal;
create policy "TEMP public write arsenal"
on public.arsenal for insert
to anon, authenticated
with check (true);

drop policy if exists "TEMP public update arsenal" on public.arsenal;
create policy "TEMP public update arsenal"
on public.arsenal for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "TEMP public delete arsenal" on public.arsenal;
create policy "TEMP public delete arsenal"
on public.arsenal for delete
to anon, authenticated
using (true);


-- SERVICES
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

alter table public.services enable row level security;

alter table public.services add column if not exists title text;
alter table public.services add column if not exists description text;
alter table public.services add column if not exists created_at timestamptz;

create index if not exists services_created_at_idx on public.services(created_at desc);

drop policy if exists "TEMP public read services" on public.services;
create policy "TEMP public read services"
on public.services for select
to anon, authenticated
using (true);

drop policy if exists "TEMP public write services" on public.services;
create policy "TEMP public write services"
on public.services for insert
to anon, authenticated
with check (true);

drop policy if exists "TEMP public update services" on public.services;
create policy "TEMP public update services"
on public.services for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "TEMP public delete services" on public.services;
create policy "TEMP public delete services"
on public.services for delete
to anon, authenticated
using (true);


-- GALLERY
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text not null,
  created_at timestamptz not null default now()
);

alter table public.gallery enable row level security;

alter table public.gallery add column if not exists title text;
alter table public.gallery add column if not exists image_url text;
alter table public.gallery add column if not exists created_at timestamptz;

create index if not exists gallery_created_at_idx on public.gallery(created_at desc);

drop policy if exists "TEMP public read gallery" on public.gallery;
create policy "TEMP public read gallery"
on public.gallery for select
to anon, authenticated
using (true);

drop policy if exists "TEMP public write gallery" on public.gallery;
create policy "TEMP public write gallery"
on public.gallery for insert
to anon, authenticated
with check (true);

drop policy if exists "TEMP public update gallery" on public.gallery;
create policy "TEMP public update gallery"
on public.gallery for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "TEMP public delete gallery" on public.gallery;
create policy "TEMP public delete gallery"
on public.gallery for delete
to anon, authenticated
using (true);


-- SITE SETTINGS
create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  description text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

alter table public.site_settings add column if not exists value text;
alter table public.site_settings add column if not exists description text;
alter table public.site_settings add column if not exists updated_at timestamptz;

drop policy if exists "TEMP public read site_settings" on public.site_settings;
create policy "TEMP public read site_settings"
on public.site_settings for select
to anon, authenticated
using (true);

drop policy if exists "TEMP public write site_settings" on public.site_settings;
create policy "TEMP public write site_settings"
on public.site_settings for insert
to anon, authenticated
with check (true);

drop policy if exists "TEMP public update site_settings" on public.site_settings;
create policy "TEMP public update site_settings"
on public.site_settings for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "TEMP public delete site_settings" on public.site_settings;
create policy "TEMP public delete site_settings"
on public.site_settings for delete
to anon, authenticated
using (true);


-- OPTIONAL: tighten old reservations leak (таблицата изглежда legacy)
-- В момента имате policy "Anyone can view reservations" (public select). :contentReference[oaicite:7]{index=7}
-- Ако не я ползвате, по-добре я махнете още сега:
drop policy if exists "Anyone can view reservations" on public.reservations;