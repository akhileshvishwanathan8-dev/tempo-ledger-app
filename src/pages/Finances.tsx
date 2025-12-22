import { useState } from 'react';
import { 
  IndianRupee, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Download, 
  Loader2,
  Receipt,
  Wallet,
  PieChart as PieChartIcon,
  List
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  useFinancialSummary, 
  useExpensesByCategory, 
  useGigLedger, 
  useRecentTransactions 
} from '@/hooks/useFinances';
import { ExpenseChart } from '@/components/finances/ExpenseChart';
import { GigLedgerCard } from '@/components/finances/GigLedgerCard';

export default function Finances() {
  const { data: summary, isLoading: summaryLoading } = useFinancialSummary();
  const { data: expensesByCategory, isLoading: expensesLoading } = useExpensesByCategory();
  const { data: gigLedger, isLoading: ledgerLoading } = useGigLedger();
  const { data: transactions, isLoading: txLoading } = useRecentTransactions();

  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const isLoading = summaryLoading || expensesLoading || ledgerLoading;

  return (
    <AppLayout title="Finances">
      <div className="px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Finances</h1>
            <p className="text-sm text-muted-foreground">Track earnings & expenses</p>
          </div>
          <div className="flex gap-2">
            <Button variant="glass" size="icon">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="stat-card opacity-0 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Income</span>
                </div>
                <p className="text-xl font-bold text-green-400">
                  {formatCurrency(summary?.totalIncome || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Total booked</p>
              </div>
              <div className="stat-card opacity-0 animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Expenses</span>
                </div>
                <p className="text-xl font-bold text-red-400">
                  {formatCurrency(summary?.totalExpenses || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">All categories</p>
              </div>
            </div>

            {/* Net Earnings Card */}
            <div 
              className="glass-card-elevated p-5 mb-6 relative overflow-hidden opacity-0 animate-slide-up"
              style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Net Earnings</p>
                  <p className="text-3xl font-bold gradient-text-purple">
                    {formatCurrency(summary?.netEarnings || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Per Member</p>
                  <p className="text-lg font-semibold text-secondary">
                    {formatCurrency(summary?.perMemberShare || 0)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">TDS Deducted</p>
                  <p className="text-sm font-medium text-orange-400">
                    {formatCurrency(summary?.totalTds || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-sm font-medium text-yellow-400">
                    {formatCurrency(summary?.pendingPayments || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="ledger" className="opacity-0 animate-slide-up" style={{ animationDelay: '250ms', animationFillMode: 'forwards' }}>
              <TabsList className="w-full bg-muted/50 mb-4">
                <TabsTrigger value="ledger" className="flex-1 gap-1.5">
                  <List className="w-3.5 h-3.5" />
                  Ledger
                </TabsTrigger>
                <TabsTrigger value="expenses" className="flex-1 gap-1.5">
                  <PieChartIcon className="w-3.5 h-3.5" />
                  Expenses
                </TabsTrigger>
                <TabsTrigger value="transactions" className="flex-1 gap-1.5">
                  <Receipt className="w-3.5 h-3.5" />
                  Recent
                </TabsTrigger>
              </TabsList>

              {/* Gig Ledger Tab */}
              <TabsContent value="ledger" className="mt-0">
                {gigLedger && gigLedger.length > 0 ? (
                  <div className="space-y-3">
                    {gigLedger.map((gig, index) => (
                      <GigLedgerCard key={gig.gigId} gig={gig} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-8 text-center">
                    <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">No gigs yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Confirmed gigs will appear here with financial breakdowns
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Expenses Tab */}
              <TabsContent value="expenses" className="mt-0">
                <div className="glass-card p-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Expense Breakdown
                  </h3>
                  <ExpenseChart data={expensesByCategory || []} />
                  
                  {expensesByCategory && expensesByCategory.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border space-y-2">
                      {expensesByCategory.map((cat) => (
                        <div key={cat.category} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{cat.category}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">{cat.count} items</span>
                            <span className="font-medium text-foreground">{formatCurrency(cat.amount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Transactions Tab */}
              <TabsContent value="transactions" className="mt-0">
                {txLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                ) : transactions && transactions.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.map((tx, index) => (
                      <div 
                        key={tx.id}
                        className="glass-card p-4 flex items-center justify-between opacity-0 animate-slide-up"
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center',
                            tx.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                          )}>
                            {tx.type === 'income' ? (
                              <ArrowUpRight className="w-5 h-5 text-green-400" />
                            ) : (
                              <ArrowDownRight className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {tx.type === 'income' 
                                ? (tx as any).gig_title 
                                : (tx as any).description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(tx.date), 'MMM d, yyyy')}
                              {tx.type === 'expense' && (
                                <span className="ml-2 capitalize">• {(tx as any).category}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            'text-sm font-semibold',
                            tx.type === 'income' ? 'text-green-400' : 'text-red-400'
                          )}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency((tx as any).amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-8 text-center">
                    <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">No transactions</h3>
                    <p className="text-sm text-muted-foreground">
                      Payments and expenses will appear here
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  );
}
