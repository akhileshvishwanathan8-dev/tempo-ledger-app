import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface GigAvailability {
  id: string;
  gig_id: string;
  user_id: string;
  status: 'yes' | 'no' | 'maybe' | 'pending';
  notes: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
  };
}

export interface GigExpense {
  id: string;
  gig_id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  paid_by: string | null;
  receipt_url: string | null;
}

export interface GigPayment {
  id: string;
  gig_id: string;
  amount: number;
  payment_date: string;
  payment_mode: string | null;
  reference_number: string | null;
  tds_deducted: number | null;
  notes: string | null;
}

export interface GigPayout {
  id: string;
  gig_id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'paid';
  paid_date: string | null;
  notes: string | null;
  profile?: {
    full_name: string | null;
  };
}

export interface GigFinancials {
  gross_amount: number;
  total_expenses: number;
  total_tds: number;
  net_amount: number;
  total_payments: number;
  balance_due: number;
  per_member_share: number;
  member_count: number;
}

export function useGigAvailability(gigId: string) {
  return useQuery({
    queryKey: ['gig-availability', gigId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gig_availability')
        .select('*')
        .eq('gig_id', gigId);

      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = data.map(a => a.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      return data.map(a => ({
        ...a,
        profile: profileMap.get(a.user_id) || { full_name: null }
      })) as GigAvailability[];
    },
    enabled: !!gigId,
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ gigId, status, notes }: { gigId: string; status: string; notes?: string }) => {
      const { data: existing } = await supabase
        .from('gig_availability')
        .select('id')
        .eq('gig_id', gigId)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('gig_availability')
          .update({ status, notes, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('gig_availability')
          .insert({ gig_id: gigId, user_id: user?.id, status, notes })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gig-availability', variables.gigId] });
      toast.success('Availability updated');
    },
    onError: (error) => {
      toast.error('Failed to update availability: ' + error.message);
    },
  });
}

export function useGigExpenses(gigId: string) {
  return useQuery({
    queryKey: ['gig-expenses', gigId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('gig_id', gigId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as GigExpense[];
    },
    enabled: !!gigId,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: Omit<GigExpense, 'id'>) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert({ ...input, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gig-expenses', variables.gig_id] });
      queryClient.invalidateQueries({ queryKey: ['gig-financials'] });
      toast.success('Expense added');
    },
    onError: (error) => {
      toast.error('Failed to add expense: ' + error.message);
    },
  });
}

export function useGigPayments(gigId: string) {
  return useQuery({
    queryKey: ['gig-payments', gigId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('gig_id', gigId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data as GigPayment[];
    },
    enabled: !!gigId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: Omit<GigPayment, 'id'>) => {
      const { data, error } = await supabase
        .from('payments')
        .insert({ ...input, recorded_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gig-payments', variables.gig_id] });
      queryClient.invalidateQueries({ queryKey: ['gig-financials'] });
      toast.success('Payment recorded');
    },
    onError: (error) => {
      toast.error('Failed to record payment: ' + error.message);
    },
  });
}

export function useGigPayouts(gigId: string) {
  return useQuery({
    queryKey: ['gig-payouts', gigId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('gig_id', gigId);

      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = data.map(p => p.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      return data.map(p => ({
        ...p,
        profile: profileMap.get(p.user_id) || { full_name: null }
      })) as GigPayout[];
    },
    enabled: !!gigId,
  });
}

export function useGigFinancials(gigId: string) {
  return useQuery({
    queryKey: ['gig-financials', gigId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('calculate_gig_financials', { gig_uuid: gigId });

      if (error) throw error;
      return data?.[0] as GigFinancials | null;
    },
    enabled: !!gigId,
  });
}

export function useGeneratePayouts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gigId: string) => {
      const { error } = await supabase
        .rpc('generate_gig_payouts', { gig_uuid: gigId });
      if (error) throw error;
    },
    onSuccess: (_, gigId) => {
      queryClient.invalidateQueries({ queryKey: ['gig-payouts', gigId] });
      toast.success('Payouts generated');
    },
    onError: (error) => {
      toast.error('Failed to generate payouts: ' + error.message);
    },
  });
}

export function useUpdatePayoutStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      payoutId, 
      status, 
      paidDate,
      gigId 
    }: { 
      payoutId: string; 
      status: 'pending' | 'paid'; 
      paidDate?: string;
      gigId: string;
    }) => {
      const { data, error } = await supabase
        .from('payouts')
        .update({ 
          status, 
          paid_date: status === 'paid' ? (paidDate || new Date().toISOString().split('T')[0]) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', payoutId)
        .select()
        .single();

      if (error) throw error;
      return { data, gigId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['gig-payouts', result.gigId] });
      toast.success(result.data.status === 'paid' ? 'Marked as paid' : 'Marked as pending');
    },
    onError: (error) => {
      toast.error('Failed to update payout: ' + error.message);
    },
  });
}
