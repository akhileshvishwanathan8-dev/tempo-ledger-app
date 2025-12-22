import { format, parseISO } from 'date-fns';
import { MapPin, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Gig, GigStatus } from '@/hooks/useGigs';

const statusConfig: Record<GigStatus, { bg: string; text: string; label: string }> = {
  lead: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Lead' },
  quoted: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Quoted' },
  confirmed: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Confirmed' },
  completed: { bg: 'bg-teal-500/20', text: 'text-teal-400', label: 'Completed' },
  paid: { bg: 'bg-primary/20', text: 'text-primary', label: 'Paid' },
  cancelled: { bg: 'bg-destructive/20', text: 'text-destructive', label: 'Cancelled' },
};

interface GigCardProps {
  gig: Gig;
  index: number;
  onClick?: () => void;
}

export function GigCard({ gig, index, onClick }: GigCardProps) {
  const status = statusConfig[gig.status];
  const amount = gig.confirmed_amount || gig.quoted_amount;

  const formatTime = (time: string | null) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, 'h:mm a');
  };

  return (
    <button
      onClick={onClick}
      className="w-full glass-card p-4 text-left group hover:bg-card/80 transition-all duration-300 opacity-0 animate-slide-up"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {gig.title}
          </h4>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{gig.venue}, {gig.city}</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">
            {format(parseISO(gig.date), 'MMM d, yyyy')}
          </span>
          {gig.start_time && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatTime(gig.start_time)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {amount && (
            <span className="text-sm font-semibold gradient-text-purple">
              ₹{amount.toLocaleString('en-IN')}
            </span>
          )}
          <span className={cn(
            'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase',
            status.bg,
            status.text
          )}>
            {status.label}
          </span>
        </div>
      </div>
    </button>
  );
}
