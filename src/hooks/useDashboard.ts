import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UpcomingGig {
  id: string;
  title: string;
  venue: string;
  city: string;
  date: string;
  start_time: string | null;
  status: string;
  confirmed_members: number;
  total_members: number;
}

export interface PendingPayout {
  id: string;
  gig_id: string;
  gig_title: string;
  amount: number;
  status: string;
}

export interface DashboardStats {
  totalEarnings: number;
  gigsCompleted: number;
  totalGigs: number;
  pendingPayoutsTotal: number;
  pendingPayoutsCount: number;
}

export function useUpcomingGigs(limit = 3) {
  return useQuery({
    queryKey: ['dashboard-upcoming-gigs', limit],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: gigs, error } = await supabase
        .from('gigs')
        .select('id, title, venue, city, date, start_time, status')
        .gte('date', today)
        .in('status', ['confirmed', 'quoted', 'lead'])
        .order('date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      
      // Get availability counts for each gig
      const gigsWithAvailability = await Promise.all(
        (gigs || []).map(async (gig) => {
          const { data: availability } = await supabase
            .from('gig_availability')
            .select('status')
            .eq('gig_id', gig.id);
          
          const confirmed = availability?.filter(a => a.status === 'yes').length || 0;
          const total = availability?.length || 7; // Default to 7 if no availability data
          
          return {
            ...gig,
            confirmed_members: confirmed,
            total_members: Math.max(total, 7),
          } as UpcomingGig;
        })
      );

      return gigsWithAvailability;
    },
  });
}

export function usePendingPayouts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-pending-payouts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: payouts, error } = await supabase
        .from('payouts')
        .select('id, gig_id, amount, status')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;

      // Get gig titles for each payout
      const payoutsWithGigs = await Promise.all(
        (payouts || []).map(async (payout) => {
          const { data: gig } = await supabase
            .from('gigs')
            .select('title')
            .eq('id', payout.gig_id)
            .single();

          return {
            ...payout,
            gig_title: gig?.title || 'Unknown Gig',
          } as PendingPayout;
        })
      );

      return payoutsWithGigs;
    },
    enabled: !!user?.id,
  });
}

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      // Get completed gigs count and total gigs
      const { data: gigs } = await supabase
        .from('gigs')
        .select('id, status, confirmed_amount, quoted_amount');

      const completedGigs = gigs?.filter(g => ['completed', 'paid'].includes(g.status)).length || 0;
      const totalGigs = gigs?.length || 0;
      
      // Calculate total earnings from completed/paid gigs
      const totalEarnings = gigs
        ?.filter(g => ['completed', 'paid'].includes(g.status))
        .reduce((sum, g) => sum + (g.confirmed_amount || g.quoted_amount || 0), 0) || 0;

      // Get pending payouts for current user
      let pendingPayoutsTotal = 0;
      let pendingPayoutsCount = 0;

      if (user?.id) {
        const { data: payouts } = await supabase
          .from('payouts')
          .select('amount')
          .eq('user_id', user.id)
          .eq('status', 'pending');

        pendingPayoutsCount = payouts?.length || 0;
        pendingPayoutsTotal = payouts?.reduce((sum, p) => sum + p.amount, 0) || 0;
      }

      return {
        totalEarnings,
        gigsCompleted: completedGigs,
        totalGigs,
        pendingPayoutsTotal,
        pendingPayoutsCount,
      } as DashboardStats;
    },
  });
}
