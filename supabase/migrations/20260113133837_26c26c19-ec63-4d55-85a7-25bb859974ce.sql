-- Step 1: Drop all dependent policies first
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin and musicians can insert gigs" ON public.gigs;
DROP POLICY IF EXISTS "Admin and musicians can update gigs" ON public.gigs;
DROP POLICY IF EXISTS "Only admin can delete gigs" ON public.gigs;
DROP POLICY IF EXISTS "Admin can manage all availability" ON public.gig_availability;
DROP POLICY IF EXISTS "Admin and musicians can insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Admin can manage expenses" ON public.expenses;
DROP POLICY IF EXISTS "Admin can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Admin can view all payouts" ON public.payouts;
DROP POLICY IF EXISTS "Admin can manage payouts" ON public.payouts;
DROP POLICY IF EXISTS "Musicians and admin can view songs" ON public.songs;
DROP POLICY IF EXISTS "Musicians and admin can manage songs" ON public.songs;
DROP POLICY IF EXISTS "Musicians and admin can view song versions" ON public.song_versions;
DROP POLICY IF EXISTS "Musicians and admin can manage song versions" ON public.song_versions;
DROP POLICY IF EXISTS "Admin and musicians can manage setlists" ON public.gig_setlists;
DROP POLICY IF EXISTS "Admin and musicians can view gigs" ON public.gigs;
DROP POLICY IF EXISTS "Admin and musicians can view expenses" ON public.expenses;
DROP POLICY IF EXISTS "Admin and musicians can view setlists" ON public.gig_setlists;
DROP POLICY IF EXISTS "Admin and musicians can view availability" ON public.gig_availability;

-- Step 2: Drop dependent functions
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

-- Step 3: Create new enum type
CREATE TYPE public.app_role_new AS ENUM ('app_admin', 'general_admin', 'musician', 'external_viewer');

-- Step 4: Update the user_roles table to use new enum
ALTER TABLE public.user_roles 
  ALTER COLUMN role DROP DEFAULT,
  ALTER COLUMN role TYPE app_role_new USING (
    CASE role::text
      WHEN 'admin' THEN 'general_admin'::app_role_new
      ELSE role::text::app_role_new
    END
  ),
  ALTER COLUMN role SET DEFAULT 'musician'::app_role_new;

-- Step 5: Drop old enum and rename new one
DROP TYPE public.app_role;
ALTER TYPE public.app_role_new RENAME TO app_role;

-- Step 6: Recreate has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 7: Create is_admin helper function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('app_admin', 'general_admin')
  )
$$;

-- Step 8: Recreate get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Step 9: Recreate all RLS policies using is_admin()
-- Profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (is_admin(auth.uid()));

-- User roles
CREATE POLICY "App admins can manage roles" ON public.user_roles
  FOR ALL USING (has_role(auth.uid(), 'app_admin'));

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (is_admin(auth.uid()));

-- Gigs
CREATE POLICY "Admins and musicians can insert gigs" ON public.gigs
  FOR INSERT WITH CHECK (is_admin(auth.uid()) OR has_role(auth.uid(), 'musician'));

CREATE POLICY "Admins and musicians can update gigs" ON public.gigs
  FOR UPDATE USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'musician'));

CREATE POLICY "Admins and musicians can view gigs" ON public.gigs
  FOR SELECT USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'musician'));

CREATE POLICY "Only admins can delete gigs" ON public.gigs
  FOR DELETE USING (is_admin(auth.uid()));

-- Gig availability
CREATE POLICY "Admins and musicians can view availability" ON public.gig_availability
  FOR SELECT USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'musician'));

CREATE POLICY "Admins can manage all availability" ON public.gig_availability
  FOR ALL USING (is_admin(auth.uid()));

-- Expenses
CREATE POLICY "Admins and musicians can insert expenses" ON public.expenses
  FOR INSERT WITH CHECK (is_admin(auth.uid()) OR has_role(auth.uid(), 'musician'));

CREATE POLICY "Admins and musicians can view expenses" ON public.expenses
  FOR SELECT USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'musician'));

CREATE POLICY "Admins can manage expenses" ON public.expenses
  FOR ALL USING (is_admin(auth.uid()));

-- Payments
CREATE POLICY "Admins can manage payments" ON public.payments
  FOR ALL USING (is_admin(auth.uid()));

-- Payouts
CREATE POLICY "Admins can manage payouts" ON public.payouts
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all payouts" ON public.payouts
  FOR SELECT USING (is_admin(auth.uid()));

-- Songs
CREATE POLICY "Musicians and admins can manage songs" ON public.songs
  FOR ALL USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'musician'));

CREATE POLICY "Musicians and admins can view songs" ON public.songs
  FOR SELECT USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'musician'));

-- Song versions
CREATE POLICY "Musicians and admins can manage song versions" ON public.song_versions
  FOR ALL USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'musician'));

CREATE POLICY "Musicians and admins can view song versions" ON public.song_versions
  FOR SELECT USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'musician'));

-- Gig setlists
CREATE POLICY "Admins and musicians can manage setlists" ON public.gig_setlists
  FOR ALL USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'musician'));

CREATE POLICY "Admins and musicians can view setlists" ON public.gig_setlists
  FOR SELECT USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'musician'));