import { IndianRupee, TrendingUp, Calendar, FileCheck, Receipt, CheckCircle, Plus, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, differenceInDays } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { UpcomingGigCard } from "@/components/dashboard/UpcomingGigCard";
import { QuickAction } from "@/components/dashboard/QuickAction";
import { AIAssistantCard } from "@/components/dashboard/AIAssistantCard";
import { PendingActionsCard } from "@/components/dashboard/PendingActionsCard";
import { useUpcomingGigs, usePendingPayouts, useDashboardStats } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";

export default function Index() {
  const navigate = useNavigate();
  const { data: upcomingGigs = [], isLoading: gigsLoading } = useUpcomingGigs(1);
  const { data: pendingPayouts = [], isLoading: payoutsLoading } = usePendingPayouts();
  const { data: stats } = useDashboardStats();

  const nextGig = upcomingGigs[0];
  const daysUntilNextGig = nextGig 
    ? differenceInDays(parseISO(nextGig.date), new Date()) 
    : 0;

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  // Build pending items from real data
  const pendingItems = pendingPayouts.map(payout => ({
    id: payout.id,
    type: 'payment' as const,
    title: `Payout pending: ${payout.gig_title}`,
    subtitle: formatCurrency(payout.amount),
    urgent: false,
  }));

  return (
    <AppLayout>
      <div className="px-4 py-6">
        {/* Header */}
        <header className="mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "50ms", animationFillMode: "forwards" }}>
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold text-foreground">
              Good evening<span className="text-primary">.</span>
            </h1>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-primary-foreground">
              M
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Here's what's happening with your band
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatCard
            icon={IndianRupee}
            label="Total Earnings"
            value={formatCurrency(stats?.totalEarnings || 0)}
            subValue="this year"
            trend={{ value: "+23% from last year", positive: true }}
            variant="purple"
            delay={100}
          />
          <StatCard
            icon={TrendingUp}
            label="Gigs Completed"
            value={String(stats?.gigsCompleted || 0)}
            subValue={`of ${stats?.totalGigs || 0}`}
            variant="teal"
            delay={150}
          />
        </div>

        {/* Pending Payouts Summary */}
        {(stats?.pendingPayoutsCount || 0) > 0 && (
          <div 
            className="glass-card p-4 mb-5 flex items-center justify-between opacity-0 animate-slide-up cursor-pointer hover:bg-card/80 transition-colors"
            style={{ animationDelay: "175ms", animationFillMode: "forwards" }}
            onClick={() => navigate('/finances')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Wallet className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Pending Payouts</p>
                <p className="text-xs text-muted-foreground">{stats?.pendingPayoutsCount} payouts waiting</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-orange-400">{formatCurrency(stats?.pendingPayoutsTotal || 0)}</p>
            </div>
          </div>
        )}

        {/* Upcoming Gig */}
        {gigsLoading ? (
          <div className="glass-card p-5 mb-5 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-3" />
            <div className="h-6 bg-muted rounded w-2/3 mb-4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        ) : nextGig ? (
          <div onClick={() => navigate(`/gigs/${nextGig.id}`)} className="cursor-pointer">
            <UpcomingGigCard
              title={nextGig.title}
              venue={nextGig.venue}
              city={nextGig.city}
              date={format(parseISO(nextGig.date), 'MMM d, yyyy')}
              time={nextGig.start_time || 'TBD'}
              daysUntil={Math.max(0, daysUntilNextGig)}
              confirmedMembers={nextGig.confirmed_members}
              totalMembers={nextGig.total_members}
              className="mb-5"
            />
          </div>
        ) : (
          <div 
            className="glass-card p-5 mb-5 text-center opacity-0 animate-slide-up"
            style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
          >
            <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming gigs</p>
            <button 
              className="mt-2 text-sm text-primary hover:underline"
              onClick={() => navigate('/gigs')}
            >
              Add a gig
            </button>
          </div>
        )}

        {/* Pending Actions */}
        {pendingItems.length > 0 && (
          <PendingActionsCard items={pendingItems} className="mb-5" />
        )}

        {/* AI Assistant */}
        <AIAssistantCard className="mb-5" />

        {/* Quick Actions */}
        <div 
          className="opacity-0 animate-slide-up"
          style={{ animationDelay: "500ms", animationFillMode: "forwards" }}
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="grid grid-cols-4 gap-2">
            <QuickAction icon={Plus} label="Add Gig" variant="primary" onClick={() => navigate('/gigs')} />
            <QuickAction icon={Receipt} label="Finances" onClick={() => navigate('/finances')} />
            <QuickAction icon={FileCheck} label="Songs" onClick={() => navigate('/songs')} />
            <QuickAction icon={CheckCircle} label="Gigs" onClick={() => navigate('/gigs')} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
