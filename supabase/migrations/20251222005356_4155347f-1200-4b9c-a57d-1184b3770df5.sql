-- Gigs table
CREATE TABLE public.gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  venue TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  organizer_name TEXT,
  organizer_phone TEXT,
  organizer_email TEXT,
  status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'quoted', 'confirmed', 'completed', 'paid', 'cancelled')),
  quoted_amount DECIMAL(12,2),
  confirmed_amount DECIMAL(12,2),
  tds_percentage DECIMAL(5,2) DEFAULT 10.00,
  notes TEXT,
  contract_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Member availability for gigs
CREATE TABLE public.gig_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES public.gigs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'yes', 'no', 'maybe')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(gig_id, user_id)
);

-- Expenses for gigs
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID REFERENCES public.gigs(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('travel', 'equipment', 'rehearsal', 'accommodation', 'food', 'other')),
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  receipt_url TEXT,
  paid_by UUID REFERENCES auth.users(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payments received for gigs
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES public.gigs(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_mode TEXT CHECK (payment_mode IN ('bank_transfer', 'upi', 'cash', 'cheque', 'other')),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_number TEXT,
  tds_deducted DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Member payouts (calculated distributions)
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID NOT NULL REFERENCES public.gigs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(gig_id, user_id)
);

-- Songs library
CREATE TABLE public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  raga TEXT,
  tala TEXT,
  tempo INTEGER,
  key_signature TEXT,
  duration_minutes INTEGER,
  structure TEXT,
  lyrics TEXT,
  chords TEXT,
  performance_notes TEXT,
  audio_url TEXT,
  sheet_music_url TEXT,
  is_original BOOLEAN DEFAULT false,
  composer TEXT,
  arranger TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Song versions/arrangements
CREATE TABLE public.song_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  version_name TEXT NOT NULL,
  notes TEXT,
  audio_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gig_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_versions ENABLE ROW LEVEL SECURITY;

-- Gigs policies (all authenticated users can view, admin/musician can manage)
CREATE POLICY "Authenticated users can view gigs" ON public.gigs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin and musicians can insert gigs" ON public.gigs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'musician'));

CREATE POLICY "Admin and musicians can update gigs" ON public.gigs
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'musician'));

CREATE POLICY "Only admin can delete gigs" ON public.gigs
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Gig availability policies
CREATE POLICY "Authenticated users can view availability" ON public.gig_availability
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their own availability" ON public.gig_availability
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all availability" ON public.gig_availability
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Expenses policies
CREATE POLICY "Authenticated users can view expenses" ON public.expenses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin and musicians can insert expenses" ON public.expenses
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'musician'));

CREATE POLICY "Admin can manage expenses" ON public.expenses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Payments policies
CREATE POLICY "Authenticated users can view payments" ON public.payments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can manage payments" ON public.payments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Payouts policies
CREATE POLICY "Users can view their own payouts" ON public.payouts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all payouts" ON public.payouts
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can manage payouts" ON public.payouts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Songs policies (musicians and admin only)
CREATE POLICY "Musicians and admin can view songs" ON public.songs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'musician'));

CREATE POLICY "Musicians and admin can manage songs" ON public.songs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'musician'));

-- Song versions policies
CREATE POLICY "Musicians and admin can view song versions" ON public.song_versions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'musician'));

CREATE POLICY "Musicians and admin can manage song versions" ON public.song_versions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'musician'));

-- Function to calculate gig financials
CREATE OR REPLACE FUNCTION public.calculate_gig_financials(gig_uuid UUID)
RETURNS TABLE (
  gross_amount DECIMAL(12,2),
  total_expenses DECIMAL(12,2),
  total_tds DECIMAL(12,2),
  net_amount DECIMAL(12,2),
  total_payments DECIMAL(12,2),
  balance_due DECIMAL(12,2),
  per_member_share DECIMAL(12,2),
  member_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_gross DECIMAL(12,2);
  v_expenses DECIMAL(12,2);
  v_tds DECIMAL(12,2);
  v_tds_pct DECIMAL(5,2);
  v_payments DECIMAL(12,2);
  v_members INTEGER;
BEGIN
  -- Get confirmed amount and TDS percentage
  SELECT COALESCE(g.confirmed_amount, g.quoted_amount, 0), COALESCE(g.tds_percentage, 10)
  INTO v_gross, v_tds_pct
  FROM gigs g WHERE g.id = gig_uuid;

  -- Calculate total expenses
  SELECT COALESCE(SUM(e.amount), 0) INTO v_expenses
  FROM expenses e WHERE e.gig_id = gig_uuid;

  -- Calculate TDS
  v_tds := v_gross * (v_tds_pct / 100);

  -- Calculate total payments received
  SELECT COALESCE(SUM(p.amount), 0) INTO v_payments
  FROM payments p WHERE p.gig_id = gig_uuid;

  -- Count confirmed members
  SELECT COUNT(*) INTO v_members
  FROM gig_availability ga
  WHERE ga.gig_id = gig_uuid AND ga.status = 'yes';
  
  -- Default to 7 members if none confirmed
  IF v_members = 0 THEN v_members := 7; END IF;

  RETURN QUERY SELECT
    v_gross,
    v_expenses,
    v_tds,
    v_gross - v_expenses - v_tds,
    v_payments,
    v_gross - v_payments,
    (v_gross - v_expenses - v_tds) / v_members,
    v_members;
END;
$$;

-- Function to auto-generate payouts for a gig
CREATE OR REPLACE FUNCTION public.generate_gig_payouts(gig_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  financials RECORD;
  member_id UUID;
BEGIN
  -- Get financials
  SELECT * INTO financials FROM calculate_gig_financials(gig_uuid);

  -- Delete existing pending payouts
  DELETE FROM payouts WHERE gig_id = gig_uuid AND status = 'pending';

  -- Create payouts for confirmed members
  FOR member_id IN
    SELECT user_id FROM gig_availability
    WHERE gig_id = gig_uuid AND status = 'yes'
  LOOP
    INSERT INTO payouts (gig_id, user_id, amount, status)
    VALUES (gig_uuid, member_id, financials.per_member_share, 'pending')
    ON CONFLICT (gig_id, user_id) DO UPDATE SET amount = financials.per_member_share;
  END LOOP;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_gigs_updated_at
  BEFORE UPDATE ON public.gigs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gig_availability_updated_at
  BEFORE UPDATE ON public.gig_availability
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at
  BEFORE UPDATE ON public.payouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_songs_updated_at
  BEFORE UPDATE ON public.songs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();