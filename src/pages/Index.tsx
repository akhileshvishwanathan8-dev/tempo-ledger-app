import { IndianRupee, TrendingUp, Calendar, FileCheck, Receipt, CheckCircle, Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { UpcomingGigCard } from "@/components/dashboard/UpcomingGigCard";
import { QuickAction } from "@/components/dashboard/QuickAction";
import { AIAssistantCard } from "@/components/dashboard/AIAssistantCard";
import { PendingActionsCard } from "@/components/dashboard/PendingActionsCard";

const pendingItems = [
  {
    id: "1",
    type: "payment" as const,
    title: "Payment pending from Shanmukhananda Hall",
    subtitle: "₹85,000 due in 3 days",
    urgent: true,
  },
  {
    id: "2",
    type: "document" as const,
    title: "Contract pending signature",
    subtitle: "Jazz Yatra Festival - Dec 28",
  },
  {
    id: "3",
    type: "availability" as const,
    title: "Confirm availability",
    subtitle: "New Year's Eve gig at Taj Lands End",
  },
];

export default function Index() {
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
            value="₹12.4L"
            subValue="this year"
            trend={{ value: "+23% from last year", positive: true }}
            variant="purple"
            delay={100}
          />
          <StatCard
            icon={TrendingUp}
            label="Gigs Completed"
            value="28"
            subValue="of 32"
            variant="teal"
            delay={150}
          />
        </div>

        {/* Upcoming Gig */}
        <UpcomingGigCard
          title="NH7 Weekender Pune"
          venue="Mahalaxmi Lawns"
          city="Pune"
          date="Dec 21, 2025"
          time="8:30 PM"
          daysUntil={7}
          confirmedMembers={5}
          totalMembers={7}
          className="mb-5"
        />

        {/* Pending Actions */}
        <PendingActionsCard items={pendingItems} className="mb-5" />

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
            <QuickAction icon={Plus} label="Add Gig" variant="primary" />
            <QuickAction icon={Receipt} label="Log Expense" />
            <QuickAction icon={FileCheck} label="Contracts" badge="2" />
            <QuickAction icon={CheckCircle} label="Availability" />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
