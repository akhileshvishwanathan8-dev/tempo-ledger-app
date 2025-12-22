-- Create gig_setlists table to link songs to gigs with ordering
CREATE TABLE public.gig_setlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gig_id UUID NOT NULL REFERENCES public.gigs(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(gig_id, song_id)
);

-- Enable RLS
ALTER TABLE public.gig_setlists ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view setlists"
ON public.gig_setlists
FOR SELECT
USING (true);

CREATE POLICY "Admin and musicians can manage setlists"
ON public.gig_setlists
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'musician'::app_role));

-- Add index for faster lookups
CREATE INDEX idx_gig_setlists_gig_id ON public.gig_setlists(gig_id);
CREATE INDEX idx_gig_setlists_song_id ON public.gig_setlists(song_id);