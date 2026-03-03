-- 20260303170000_admin_god_tier.sql
-- God Tier Admin: extra roles + audit logs + admin manage user_roles

------------------------------------------------------------
-- 1) Extend roles (optional but recommended)
-- Safe add values only if missing
------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'app_role' and e.enumlabel = 'manager'
  ) then
    alter type public.app_role add value 'manager';
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'app_role' and e.enumlabel = 'editor'
  ) then
    alter type public.app_role add value 'editor';
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'app_role' and e.enumlabel = 'staff'
  ) then
    alter type public.app_role add value 'staff';
  end if;
end $$;

------------------------------------------------------------
-- 2) user_roles: allow admins to fully manage
------------------------------------------------------------
alter table public.user_roles enable row level security;

drop policy if exists "Admins can read user_roles" on public.user_roles;
create policy "Admins can read user_roles"
on public.user_roles
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can write user_roles" on public.user_roles;
create policy "Admins can write user_roles"
on public.user_roles
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can update user_roles" on public.user_roles;
create policy "Admins can update user_roles"
on public.user_roles
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can delete user_roles" on public.user_roles;
create policy "Admins can delete user_roles"
on public.user_roles
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

------------------------------------------------------------
-- 3) audit_logs table
------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  actor_user_id uuid,
  actor_email text,

  action text not null,          -- e.g. "order.status.update", "user.invite"
  entity text not null,          -- e.g. "orders", "arsenal", "auth.users"
  entity_id text,                -- uuid/text id
  meta jsonb not null default '{}'::jsonb,

  ip inet,
  user_agent text
);

create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_actor_idx on public.audit_logs (actor_user_id);
create index if not exists audit_logs_entity_idx on public.audit_logs (entity, entity_id);

alter table public.audit_logs enable row level security;

drop policy if exists "Admins can read audit_logs" on public.audit_logs;
create policy "Admins can read audit_logs"
on public.audit_logs
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can insert audit_logs" on public.audit_logs;
create policy "Admins can insert audit_logs"
on public.audit_logs
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));