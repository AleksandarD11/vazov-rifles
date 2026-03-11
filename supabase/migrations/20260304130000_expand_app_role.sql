-- 20260304130000_expand_app_role.sql
-- Adds extra roles for multi-role user_roles.

DO $$
BEGIN
  BEGIN
    ALTER TYPE public.app_role ADD VALUE 'manager';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER TYPE public.app_role ADD VALUE 'editor';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER TYPE public.app_role ADD VALUE 'staff';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
