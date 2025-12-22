import { Calendar, MapPin, ChevronRight, Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const upcomingGigs = [
  {
    id: "1",
    title: "NH7 Weekender Pune",
    venue: "Mahalaxmi Lawns",
    city: "Pune",
    date: "Dec 21",
    time: "8:30 PM",
    status: "confirmed",
    amount: "₹2,50,000",
  },
  {
    id: "2",
    title: "Jazz Yatra Festival",
    venue: "NCPA Tata Theatre",
    city: "Mumbai",
    date: "Dec 28",
    time: "7:00 PM",
    status: "pending",
    amount: "₹1,80,000",
  },
  {
    id: "3",
    title: "New Year's Eve Special",
    venue: "Taj Lands End",
    city: "Mumbai",
    date: "Dec 31",
    time: "10:00 PM",
    status: "confirmed",
    amount: "₹3,50,000",
  },
  {
    id: "4",
    title: "Republic Day Concert",
    venue: "Shanmukhananda Hall",
    city: "Mumbai",
    date: "Jan 26",
    time: "6:00 PM",
    status: "lead",
    amount: "₹2,00,000",
  },
];

const statusColors = {
  confirmed: "bg-green-500/20 text-green-400",
  pending: "bg-yellow-500/20 text-yellow-400",
  lead: "bg-blue-500/20 text-blue-400",
  completed: "bg-muted text-muted-foreground",
};

export default function Gigs() {
  return (
    <AppLayout>
      <div className="px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gigs</h1>
            <p className="text-sm text-muted-foreground">Manage your performances</p>
          </div>
          <Button size="icon" className="rounded-full">
            <Plus className="w-5 h-5" />
          </Button>
        </header>

        {/* Calendar Preview */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">December 2025</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
              <div key={day} className="text-xs text-muted-foreground py-2">{day}</div>
            ))}
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const hasGig = [21, 28, 31].includes(day);
              const isToday = day === 14;
              return (
                <div
                  key={day}
                  className={cn(
                    "py-2 text-sm rounded-lg transition-colors",
                    hasGig && "bg-primary/20 text-primary font-semibold",
                    isToday && !hasGig && "ring-1 ring-primary text-primary",
                    !hasGig && !isToday && "text-muted-foreground"
                  )}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Gig List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Upcoming Gigs
          </h3>
          {upcomingGigs.map((gig, index) => (
            <button
              key={gig.id}
              className="w-full glass-card p-4 text-left group hover:bg-card/80 transition-all duration-300 opacity-0 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {gig.title}
                  </h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{gig.venue}, {gig.city}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">{gig.date}</span>
                  <span className="text-sm text-muted-foreground">{gig.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold gradient-text-purple">{gig.amount}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase",
                    statusColors[gig.status as keyof typeof statusColors]
                  )}>
                    {gig.status}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
