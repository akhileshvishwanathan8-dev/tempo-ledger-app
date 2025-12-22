import { useState, useMemo } from 'react';
import { Calendar, Plus, Loader2, Music } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGigs, GigStatus } from '@/hooks/useGigs';
import { GigCard } from '@/components/gigs/GigCard';
import { GigFilters } from '@/components/gigs/GigFilters';
import { AddGigDialog } from '@/components/gigs/AddGigDialog';

export default function Gigs() {
  const [statusFilter, setStatusFilter] = useState<GigStatus | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [currentMonth] = useState(new Date());

  const { data: gigs, isLoading, error } = useGigs(statusFilter, sortOrder);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const startPadding = getDay(start);
    return { days, startPadding };
  }, [currentMonth]);

  // Get dates with gigs
  const gigDates = useMemo(() => {
    if (!gigs) return new Set<string>();
    return new Set(gigs.map(g => g.date));
  }, [gigs]);

  // Stats
  const stats = useMemo(() => {
    if (!gigs) return { total: 0, confirmed: 0, pending: 0 };
    return {
      total: gigs.length,
      confirmed: gigs.filter(g => g.status === 'confirmed' || g.status === 'completed' || g.status === 'paid').length,
      pending: gigs.filter(g => g.status === 'lead' || g.status === 'quoted').length,
    };
  }, [gigs]);

  return (
    <AppLayout title="Gigs">
      <div className="px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gigs</h1>
            <p className="text-sm text-muted-foreground">
              {stats.total} gigs · {stats.confirmed} confirmed · {stats.pending} pending
            </p>
          </div>
          <Button 
            size="icon" 
            variant="neon"
            className="rounded-full"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </header>

        {/* Calendar Preview */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-xs text-muted-foreground py-2">{day}</div>
            ))}
            {/* Empty cells for padding */}
            {Array.from({ length: calendarDays.startPadding }).map((_, i) => (
              <div key={`pad-${i}`} className="py-2" />
            ))}
            {calendarDays.days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const hasGig = gigDates.has(dateStr);
              const today = isToday(day);
              return (
                <div
                  key={dateStr}
                  className={cn(
                    'py-2 text-sm rounded-lg transition-colors relative',
                    hasGig && 'bg-primary/20 text-primary font-semibold',
                    today && !hasGig && 'ring-1 ring-primary text-primary',
                    !hasGig && !today && 'text-muted-foreground'
                  )}
                >
                  {format(day, 'd')}
                  {hasGig && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {statusFilter === 'all' ? 'All Gigs' : statusFilter}
          </h3>
          <GigFilters
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
          />
        </div>

        {/* Gig List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="glass-card p-8 text-center">
            <p className="text-destructive">Failed to load gigs</p>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
          </div>
        ) : gigs && gigs.length > 0 ? (
          <div className="space-y-3">
            {gigs.map((gig, index) => (
              <GigCard key={gig.id} gig={gig} index={index} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No gigs yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first gig to get started
            </p>
            <Button variant="neon" onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Gig
            </Button>
          </div>
        )}
      </div>

      <AddGigDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </AppLayout>
  );
}
