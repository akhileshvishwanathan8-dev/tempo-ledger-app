import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function useGoogleCalendarConnection() {
  const { user, role } = useAuth();
  const isAppAdmin = role === 'app_admin';

  return useQuery({
    queryKey: ['google-calendar-connection'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('google_calendar_connections')
        .select('id, calendar_id, created_at, updated_at')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: isAppAdmin,
  });
}

export function useConnectGoogleCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const redirectUri = `${window.location.origin}/admin?google_callback=true`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-auth`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ redirect_uri: redirectUri }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate Google auth');
      }

      return data.authUrl;
    },
    onSuccess: (authUrl) => {
      // Redirect to Google OAuth
      window.location.href = authUrl;
    },
    onError: (error) => {
      console.error('Error connecting Google Calendar:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect Google Calendar');
    },
  });
}

export function useHandleGoogleCallback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ code, state }: { code: string; state: string }) => {
      const redirectUri = `${window.location.origin}/admin?google_callback=true`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-callback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state, redirect_uri: redirectUri }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete Google auth');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-connection'] });
      toast.success('Google Calendar connected successfully!');
    },
    onError: (error) => {
      console.error('Error completing Google auth:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect Google Calendar');
    },
  });
}

export function useDisconnectGoogleCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('google_calendar_connections')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-connection'] });
      toast.success('Google Calendar disconnected');
    },
    onError: (error) => {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect Google Calendar');
    },
  });
}

export function useSyncGigToCalendar() {
  return useMutation({
    mutationFn: async (gigId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-gig-to-calendar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ gig_id: gigId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync to calendar');
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Gig synced to Google Calendar');
    },
    onError: (error) => {
      console.error('Error syncing gig:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sync gig');
    },
  });
}
