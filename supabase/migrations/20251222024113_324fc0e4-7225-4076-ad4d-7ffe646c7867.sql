-- Drop existing overly permissive SELECT policies
DROP POLICY IF EXISTS "Authenticated users can view gigs" ON public.gigs;
DROP POLICY IF EXISTS "Authenticated users can view expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users can view setlists" ON public.gig_setlists;
DROP POLICY IF EXISTS "Authenticated users can view availability" ON public.gig_availability;

-- Create role-based SELECT policies for gigs
CREATE POLICY "Admin and musicians can view gigs" ON public.gigs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'musician'::app_role));

-- Create role-based SELECT policies for expenses
CREATE POLICY "Admin and musicians can view expenses" ON public.expenses
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'musician'::app_role));

-- Create role-based SELECT policies for gig_setlists
CREATE POLICY "Admin and musicians can view setlists" ON public.gig_setlists
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'musician'::app_role));

-- Create role-based SELECT policies for gig_availability
CREATE POLICY "Admin and musicians can view availability" ON public.gig_availability
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'musician'::app_role));

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the handle_new_user function to create both profile and role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Create default role (musician)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'musician');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();