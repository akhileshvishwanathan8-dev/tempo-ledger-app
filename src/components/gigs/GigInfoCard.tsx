import { format, parseISO } from 'date-fns';
import { MapPin, Calendar, Clock, User, Phone, Mail, FileText, IndianRupee } from 'lucide-react';
import { Gig, GigStatus } from '@/hooks/useGigs';
import { cn } from '@/lib/utils';

const statusConfig: Record<GigStatus, { bg: string; text: string; label: string }> = {
  lead: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Lead' },
  quoted: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Quoted' },
  confirmed: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Confirmed' },
  completed: { bg: 'bg-teal-500/20', text: 'text-teal-400', label: 'Completed' },
  paid: { bg: 'bg-primary/20', text: 'text-primary', label: 'Paid' },
  cancelled: { bg: 'bg-destructive/20', text: 'text-destructive', label: 'Cancelled' },
};

interface GigInfoCardProps {
  gig: Gig;
}

export function GigInfoCard({ gig }: GigInfoCardProps) {
  const status = statusConfig[gig.status];

  const formatTime = (time: string | null) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, 'h:mm a');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{gig.title}</h2>
          <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
            <MapPin className="w-4 h-4" />
            <span>{gig.venue}, {gig.city}</span>
          </div>
          {gig.address && (
            <p className="text-sm text-muted-foreground ml-5.5 mt-0.5">{gig.address}</p>
          )}
        </div>
        <span className={cn(
          'px-3 py-1 rounded-full text-xs font-semibold uppercase',
          status.bg, status.text
        )}>
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-foreground">{format(parseISO(gig.date), 'EEEE, MMM d, yyyy')}</span>
        </div>
        {gig.start_time && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-foreground">
              {formatTime(gig.start_time)}
              {gig.end_time && ` - ${formatTime(gig.end_time)}`}
            </span>
          </div>
        )}
      </div>

      {(gig.organizer_name || gig.organizer_phone || gig.organizer_email) && (
        <div className="pt-3 border-t border-border/50 space-y-2">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Organizer</h4>
          <div className="grid gap-2">
            {gig.organizer_name && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{gig.organizer_name}</span>
              </div>
            )}
            {gig.organizer_phone && (
              <a href={`tel:${gig.organizer_phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Phone className="w-4 h-4" />
                <span>{gig.organizer_phone}</span>
              </a>
            )}
            {gig.organizer_email && (
              <a href={`mailto:${gig.organizer_email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Mail className="w-4 h-4" />
                <span>{gig.organizer_email}</span>
              </a>
            )}
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-border/50 grid grid-cols-2 gap-4">
        {gig.quoted_amount && (
          <div>
            <span className="text-xs text-muted-foreground">Quoted</span>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(gig.quoted_amount)}</p>
          </div>
        )}
        {gig.confirmed_amount && (
          <div>
            <span className="text-xs text-muted-foreground">Confirmed</span>
            <p className="text-lg font-semibold gradient-text-purple">{formatCurrency(gig.confirmed_amount)}</p>
          </div>
        )}
        {gig.tds_percentage && (
          <div>
            <span className="text-xs text-muted-foreground">TDS</span>
            <p className="text-foreground">{gig.tds_percentage}%</p>
          </div>
        )}
      </div>

      {gig.notes && (
        <div className="pt-3 border-t border-border/50">
          <div className="flex items-start gap-2">
            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground">{gig.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
