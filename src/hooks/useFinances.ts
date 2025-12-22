import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  totalTds: number;
  netEarnings: number;
  pendingPayments: number;
  memberCount: number;
  perMemberShare: number;
}

export interface GigFinancials {
  gigId: string;
  gigTitle: string;
  gigDate: string;
  gigStatus: string;
  grossAmount: number;
  totalExpenses: number;
  totalTds: number;
  netAmount: number;
  totalPayments: number;
  balanceDue: number;
  perMemberShare: number;
  memberCount: number;
}

export interface ExpenseByCategory {
  category: string;
  amount: number;
  count: number;
}

export interface PaymentRecord {
  id: string;
  gig_id: string;
  gig_title: string;
  amount: number;
  payment_mode: string | null;
  payment_date: string;
  tds_deducted: number | null;
}

export interface ExpenseRecord {
  id: string;
  gig_id: string | null;
  gig_title: string | null;
  category: string;
  description: string;
  amount: number;
  date: string;
}

export function useFinancialSummary() {
  return useQuery({
    queryKey: ['financial-summary'],
    queryFn: async () => {
      // Get all completed/paid gigs
      const { data: gigs, error: gigsError } = await supabase
        .from('gigs')
        .select('id, confirmed_amount, quoted_amount, tds_percentage, status')
        .in('status', ['confirmed', 'completed', 'paid']);

      if (gigsError) throw gigsError;

      // Get all expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount');

      if (expensesError) throw expensesError;

      // Get all payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, tds_deducted');

      if (paymentsError) throw paymentsError;

      const totalIncome = gigs?.reduce((sum, g) => sum + (g.confirmed_amount || g.quoted_amount || 0), 0) || 0;
      const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const totalTds = gigs?.reduce((sum, g) => {
        const amount = g.confirmed_amount || g.quoted_amount || 0;
        const tdsPercent = g.tds_percentage || 10;
        return sum + (amount * tdsPercent / 100);
      }, 0) || 0;
      const totalPayments = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      const netEarnings = totalIncome - totalExpenses - totalTds;
      const memberCount = 7; // Default band size
      const perMemberShare = netEarnings / memberCount;
      const pendingPayments = totalIncome - totalPayments;

      return {
        totalIncome,
        totalExpenses,
        totalTds,
        netEarnings,
        pendingPayments,
        memberCount,
        perMemberShare,
      } as FinancialSummary;
    },
  });
}

export function useExpensesByCategory() {
  return useQuery({
    queryKey: ['expenses-by-category'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('category, amount');

      if (error) throw error;

      const grouped = (data || []).reduce((acc, exp) => {
        const existing = acc.find(e => e.category === exp.category);
        if (existing) {
          existing.amount += exp.amount || 0;
          existing.count += 1;
        } else {
          acc.push({ category: exp.category, amount: exp.amount || 0, count: 1 });
        }
        return acc;
      }, [] as ExpenseByCategory[]);

      return grouped.sort((a, b) => b.amount - a.amount);
    },
  });
}

export function useGigLedger() {
  return useQuery({
    queryKey: ['gig-ledger'],
    queryFn: async () => {
      const { data: gigs, error: gigsError } = await supabase
        .from('gigs')
        .select('id, title, date, status, confirmed_amount, quoted_amount, tds_percentage')
        .in('status', ['confirmed', 'completed', 'paid'])
        .order('date', { ascending: false });

      if (gigsError) throw gigsError;

      const ledger: GigFinancials[] = [];

      for (const gig of gigs || []) {
        // Get expenses for this gig
        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount')
          .eq('gig_id', gig.id);

        // Get payments for this gig
        const { data: payments } = await supabase
          .from('payments')
          .select('amount')
          .eq('gig_id', gig.id);

        // Get confirmed members
        const { data: availability } = await supabase
          .from('gig_availability')
          .select('user_id')
          .eq('gig_id', gig.id)
          .eq('status', 'yes');

        const grossAmount = gig.confirmed_amount || gig.quoted_amount || 0;
        const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
        const tdsPercent = gig.tds_percentage || 10;
        const totalTds = grossAmount * (tdsPercent / 100);
        const totalPayments = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
        const memberCount = availability?.length || 7;
        const netAmount = grossAmount - totalExpenses - totalTds;
        const perMemberShare = netAmount / memberCount;

        ledger.push({
          gigId: gig.id,
          gigTitle: gig.title,
          gigDate: gig.date,
          gigStatus: gig.status,
          grossAmount,
          totalExpenses,
          totalTds,
          netAmount,
          totalPayments,
          balanceDue: grossAmount - totalPayments,
          perMemberShare,
          memberCount,
        });
      }

      return ledger;
    },
  });
}

export function useRecentTransactions(limit = 10) {
  return useQuery({
    queryKey: ['recent-transactions', limit],
    queryFn: async () => {
      // Get recent payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          payment_mode,
          payment_date,
          tds_deducted,
          gigs (title)
        `)
        .order('payment_date', { ascending: false })
        .limit(limit);

      if (paymentsError) throw paymentsError;

      // Get recent expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          id,
          category,
          description,
          amount,
          date,
          gigs (title)
        `)
        .order('date', { ascending: false })
        .limit(limit);

      if (expensesError) throw expensesError;

      const paymentRecords: PaymentRecord[] = (payments || []).map(p => ({
        id: p.id,
        gig_id: '',
        gig_title: (p.gigs as any)?.title || 'Unknown Gig',
        amount: p.amount,
        payment_mode: p.payment_mode,
        payment_date: p.payment_date,
        tds_deducted: p.tds_deducted,
      }));

      const expenseRecords: ExpenseRecord[] = (expenses || []).map(e => ({
        id: e.id,
        gig_id: null,
        gig_title: (e.gigs as any)?.title || null,
        category: e.category,
        description: e.description,
        amount: e.amount,
        date: e.date,
      }));

      // Combine and sort by date
      const combined = [
        ...paymentRecords.map(p => ({ ...p, type: 'income' as const, date: p.payment_date })),
        ...expenseRecords.map(e => ({ ...e, type: 'expense' as const, date: e.date })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return combined.slice(0, limit);
    },
  });
}
