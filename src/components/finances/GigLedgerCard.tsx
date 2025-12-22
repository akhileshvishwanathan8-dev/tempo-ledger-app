import { format, parseISO } from 'date-fns';
import { ChevronRight, IndianRupee, Users, Minus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GigFinancials } from '@/hooks/useFinances';

const statusConfig: Record<string, { bg: string; text: string }> = {
  confirmed: { bg: 'bg-green-500/20', text: 'text-green-400' },
  completed: { bg: 'bg-teal-500/20', text: 'text-teal-400' },
  paid: { bg: 'bg-primary/20', text: 'text-primary' },
};

interface GigLedgerCardProps {
  gig: GigFinancials;
  index: number;
}

export function GigLedgerCard({ gig, index }: GigLedgerCardProps) {
  const status = statusConfig[gig.gigStatus] || statusConfig.confirmed;

  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

  return (
    <div 
      className="glass-card p-4 opacity-0 animate-slide-up"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-foreground">{gig.gigTitle}</h4>
          <p className="text-xs text-muted-foreground">
            {format(parseISO(gig.gigDate), 'MMM d, yyyy')}
          </p>
        </div>
        <span className={cn(
          'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase',
          status.bg,
          status.text
        )}>
          {gig.gigStatus}
        </span>
      </div>

      {/* Breakdown */}
      <div className="space-y-2 text-sm mb-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Gross Amount</span>
          <span className="font-medium text-foreground">{formatCurrency(gig.grossAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-destructive/80">
          <span className="flex items-center gap-1">
            <Minus className="w-3 h-3" />
            Expenses
          </span>
          <span>{formatCurrency(gig.totalExpenses)}</span>
        </div>
        <div className="flex items-center justify-between text-orange-400/80">
          <span className="flex items-center gap-1">
            <Minus className="w-3 h-3" />
            TDS
          </span>
          <span>{formatCurrency(gig.totalTds)}</span>
        </div>
        <div className="h-px bg-border my-2" />
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Net Amount</span>
          <span className="font-semibold gradient-text-purple">{formatCurrency(gig.netAmount)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3 h-3" />
          <span>{gig.memberCount} members</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span className="text-muted-foreground">Per member:</span>
          <span className="font-semibold text-secondary">{formatCurrency(gig.perMemberShare)}</span>
        </div>
      </div>

      {/* Payment status */}
      {gig.balanceDue > 0 && (
        <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-xs">
          <span className="text-yellow-400">Balance due</span>
          <span className="font-medium text-yellow-400">{formatCurrency(gig.balanceDue)}</span>
        </div>
      )}
    </div>
  );
}
