-- Create table to store Google Calendar connection
CREATE TABLE public.google_calendar_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  token_expires_at timestamp with time zone NOT NULL,
  calendar_id text DEFAULT 'primary',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(created_by)
);

-- Enable RLS
ALTER TABLE public.google_calendar_connections ENABLE ROW LEVEL SECURITY;

-- Only app_admins can manage calendar connections
CREATE POLICY "App admins can manage calendar connections" 
ON public.google_calendar_connections 
FOR ALL 
USING (has_role(auth.uid(), 'app_admin'));

-- Add calendar_event_id to gigs table to track synced events
ALTER TABLE public.gigs ADD COLUMN google_calendar_event_id text;

-- Create trigger for updated_at
CREATE TRIGGER update_google_calendar_connections_updated_at
BEFORE UPDATE ON public.google_calendar_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();