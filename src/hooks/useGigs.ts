import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type GigStatus = 'lead' | 'quoted' | 'confirmed' | 'completed' | 'paid' | 'cancelled';

export interface Gig {
  id: string;
  title: string;
  venue: string;
  city: string;
  address: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  organizer_name: string | null;
  organizer_phone: string | null;
  organizer_email: string | null;
  status: GigStatus;
  quoted_amount: number | null;
  confirmed_amount: number | null;
  tds_percentage: number | null;
  notes: string | null;
  contract_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGigInput {
  title: string;
  venue: string;
  city: string;
  address?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  organizer_name?: string;
  organizer_phone?: string;
  organizer_email?: string;
  status?: GigStatus;
  quoted_amount?: number;
  confirmed_amount?: number;
  tds_percentage?: number;
  notes?: string;
}

export function useGigs(statusFilter?: GigStatus | 'all', sortOrder: 'asc' | 'desc' = 'asc') {
  return useQuery({
    queryKey: ['gigs', statusFilter, sortOrder],
    queryFn: async () => {
      let query = supabase
        .from('gigs')
        .select('*')
        .order('date', { ascending: sortOrder === 'asc' });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Gig[];
    },
  });
}

export function useCreateGig() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateGigInput) => {
      const { data, error } = await supabase
        .from('gigs')
        .insert({
          ...input,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
      toast.success('Gig created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create gig: ' + error.message);
    },
  });
}

export function useUpdateGig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Gig> & { id: string }) => {
      const { data, error } = await supabase
        .from('gigs')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
      toast.success('Gig updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update gig: ' + error.message);
    },
  });
}

export function useDeleteGig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('gigs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gigs'] });
      toast.success('Gig deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete gig: ' + error.message);
    },
  });
}
