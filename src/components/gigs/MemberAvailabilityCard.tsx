import { Check, X, HelpCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GigAvailability, useUpdateAvailability } from '@/hooks/useGigDetails';
import { useAuth } from '@/contexts/AuthContext';

const statusOptions = [
  { value: 'yes', icon: Check, label: 'Yes', color: 'text-green-400 bg-green-500/20 hover:bg-green-500/30' },
  { value: 'no', icon: X, label: 'No', color: 'text-destructive bg-destructive/20 hover:bg-destructive/30' },
  { value: 'maybe', icon: HelpCircle, label: 'Maybe', color: 'text-orange-400 bg-orange-500/20 hover:bg-orange-500/30' },
];

interface MemberAvailabilityCardProps {
  gigId: string;
  availability: GigAvailability[];
  isLoading: boolean;
}

export function MemberAvailabilityCard({ gigId, availability, isLoading }: MemberAvailabilityCardProps) {
  const { user } = useAuth();
  const updateAvailability = useUpdateAvailability();

  const myAvailability = availability.find(a => a.user_id === user?.id);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'yes': return <Check className="w-4 h-4 text-green-400" />;
      case 'no': return <X className="w-4 h-4 text-destructive" />;
      case 'maybe': return <HelpCircle className="w-4 h-4 text-orange-400" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'yes': return 'bg-green-500/20';
      case 'no': return 'bg-destructive/20';
      case 'maybe': return 'bg-orange-500/20';
      default: return 'bg-muted/50';
    }
  };

  const confirmedCount = availability.filter(a => a.status === 'yes').length;

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Member Availability</h3>
        <span className="text-sm text-muted-foreground">{confirmedCount} confirmed</span>
      </div>

      {/* Your Availability Toggle */}
      <div className="p-3 rounded-lg bg-card/50 border border-border/50">
        <p className="text-xs text-muted-foreground mb-2">Your Availability</p>
        <div className="flex gap-2">
          {statusOptions.map(option => {
            const Icon = option.icon;
            const isActive = myAvailability?.status === option.value;
            return (
              <Button
                key={option.value}
                variant="ghost"
                size="sm"
                disabled={updateAvailability.isPending}
                onClick={() => updateAvailability.mutate({ gigId, status: option.value })}
                className={cn(
                  'flex-1 gap-1.5 transition-all',
                  isActive ? option.color : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-sm text-muted-foreground text-center py-4">Loading...</div>
        ) : availability.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">No responses yet</div>
        ) : (
          availability.map(member => (
            <div
              key={member.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg',
                getStatusColor(member.status)
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">
                    {(member.profile?.full_name || 'User').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {member.profile?.full_name || 'Unknown Member'}
                    {member.user_id === user?.id && ' (You)'}
                  </p>
                  {member.notes && (
                    <p className="text-xs text-muted-foreground">{member.notes}</p>
                  )}
                </div>
              </div>
              {getStatusIcon(member.status)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
