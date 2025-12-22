import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calculator, CheckCircle, Clock, Users, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { GigPayout, GigFinancials, useGeneratePayouts, useUpdatePayoutStatus } from '@/hooks/useGigDetails';

interface GigPayoutsCardProps {
  gigId: string;
  payouts: GigPayout[];
  financials: GigFinancials | null;
  isLoading: boolean;
}

export function GigPayoutsCard({ gigId, payouts, financials, isLoading }: GigPayoutsCardProps) {
  const generatePayouts = useGeneratePayouts();
  const updatePayoutStatus = useUpdatePayoutStatus();
  const [selectedPayout, setSelectedPayout] = useState<GigPayout | null>(null);
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const paidCount = payouts.filter(p => p.status === 'paid').length;

  const handleMarkAsPaid = async () => {
    if (!selectedPayout) return;
    await updatePayoutStatus.mutateAsync({
      payoutId: selectedPayout.id,
      status: 'paid',
      paidDate,
      gigId
    });
    setSelectedPayout(null);
  };

  const handleMarkAsPending = async (payout: GigPayout) => {
    await updatePayoutStatus.mutateAsync({
      payoutId: payout.id,
      status: 'pending',
      gigId
    });
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Member Payouts</h3>
          <p className="text-sm text-muted-foreground">
            {paidCount}/{payouts.length} paid
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => generatePayouts.mutate(gigId)}
          disabled={generatePayouts.isPending}
        >
          <Calculator className="w-4 h-4" />
          {generatePayouts.isPending ? 'Calculating...' : 'Calculate'}
        </Button>
      </div>

      {/* Financial Summary */}
      {financials && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-card/50 border border-border/50">
            <span className="text-xs text-muted-foreground">Gross Amount</span>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(financials.gross_amount)}</p>
          </div>
          <div className="p-3 rounded-lg bg-card/50 border border-border/50">
            <span className="text-xs text-muted-foreground">Net Amount</span>
            <p className="text-lg font-semibold gradient-text-purple">{formatCurrency(financials.net_amount)}</p>
          </div>
          <div className="p-3 rounded-lg bg-card/50 border border-border/50">
            <span className="text-xs text-muted-foreground">Per Member</span>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-foreground">{formatCurrency(financials.per_member_share)}</p>
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                {financials.member_count}
              </span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-card/50 border border-border/50">
            <span className="text-xs text-muted-foreground">Balance Due</span>
            <p className={cn(
              'text-lg font-semibold',
              financials.balance_due > 0 ? 'text-orange-400' : 'text-green-400'
            )}>
              {formatCurrency(financials.balance_due)}
            </p>
          </div>
        </div>
      )}

      {/* Payouts List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="text-sm text-muted-foreground text-center py-4">Loading...</div>
        ) : payouts.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            Click "Calculate" to generate payouts
          </div>
        ) : (
          payouts.map(payout => (
            <div
              key={payout.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border transition-all',
                payout.status === 'paid' 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-card/50 border-border/50 hover:bg-card/70'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  payout.status === 'paid' ? 'bg-green-500/20' : 'bg-primary/20'
                )}>
                  <span className={cn(
                    'text-xs font-semibold',
                    payout.status === 'paid' ? 'text-green-400' : 'text-primary'
                  )}>
                    {(payout.profile?.full_name || 'User').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {payout.profile?.full_name || 'Unknown Member'}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {payout.status === 'paid' ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400">
                          Paid {payout.paid_date && format(parseISO(payout.paid_date), 'MMM d')}
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-orange-400" />
                        <span className="text-xs text-orange-400">Pending</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-sm font-semibold',
                  payout.status === 'paid' ? 'text-green-400' : 'text-foreground'
                )}>
                  {formatCurrency(payout.amount)}
                </span>
                {payout.status === 'pending' ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    onClick={() => {
                      setSelectedPayout(payout);
                      setPaidDate(new Date().toISOString().split('T')[0]);
                    }}
                  >
                    Mark Paid
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => handleMarkAsPending(payout)}
                    disabled={updatePayoutStatus.isPending}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Mark as Paid Dialog */}
      <Dialog open={!!selectedPayout} onOpenChange={(open) => !open && setSelectedPayout(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Mark Payout as Paid</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Member</p>
              <p className="font-medium text-foreground">
                {selectedPayout?.profile?.full_name || 'Unknown Member'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-lg font-semibold gradient-text-purple">
                {selectedPayout && formatCurrency(selectedPayout.amount)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paidDate">Payment Date</Label>
              <Input
                id="paidDate"
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedPayout(null)}>
              Cancel
            </Button>
            <Button 
              variant="neon" 
              onClick={handleMarkAsPaid}
              disabled={updatePayoutStatus.isPending}
            >
              {updatePayoutStatus.isPending ? 'Saving...' : 'Confirm Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
