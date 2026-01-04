-- Lock down role management so only super_admin can grant/revoke roles

-- Remove unsafe helper functions that allowed any authenticated user to elevate privileges
REVOKE ALL ON FUNCTION public.assign_admin_role(TEXT) FROM authenticated;
DROP FUNCTION IF EXISTS public.assign_admin_role(TEXT);

REVOKE ALL ON FUNCTION public.check_orders_data() FROM authenticated;
DROP FUNCTION IF EXISTS public.check_orders_data();

-- Ensure enum contains required roles (safe if already added)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'moderator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Super-admin-only role assignment function
CREATE OR REPLACE FUNCTION public.set_user_role_by_email(user_email TEXT, new_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID;
  target_user_id UUID;
BEGIN
  caller_id := auth.uid();

  IF caller_id IS NULL OR NOT public.has_role(caller_id, 'super_admin'::public.app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'user_not_found';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = target_user_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_user_role_by_email(TEXT, TEXT) TO authenticated;

-- Update RLS policies for user_roles: only super_admin can manage roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view and manage roles" ON public.user_roles;

CREATE POLICY "Super admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

-- Keep users able to view their own roles
CREATE POLICY IF NOT EXISTS "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);
