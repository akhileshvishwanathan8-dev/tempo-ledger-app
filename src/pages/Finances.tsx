import { IndianRupee, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Filter, Download } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const transactions = [
  {
    id: "1",
    type: "income",
    title: "NH7 Weekender - Advance",
    amount: "₹1,25,000",
    date: "Dec 15",
    status: "received",
  },
  {
    id: "2",
    type: "expense",
    title: "Travel - Pune (7 members)",
    amount: "₹28,000",
    date: "Dec 14",
    status: "paid",
  },
  {
    id: "3",
    type: "income",
    title: "Corporate Gig - Wipro",
    amount: "₹1,80,000",
    date: "Dec 10",
    status: "received",
  },
  {
    id: "4",
    type: "expense",
    title: "Equipment Rental",
    amount: "₹15,000",
    date: "Dec 8",
    status: "paid",
  },
  {
    id: "5",
    type: "income",
    title: "Wedding Performance",
    amount: "₹2,50,000",
    date: "Dec 5",
    status: "pending",
  },
];

const memberPayouts = [
  { name: "Arun", amount: "₹1,42,857", avatar: "A" },
  { name: "Priya", amount: "₹1,42,857", avatar: "P" },
  { name: "Karthik", amount: "₹1,42,857", avatar: "K" },
  { name: "Meera", amount: "₹1,42,857", avatar: "M" },
  { name: "Rahul", amount: "₹1,42,857", avatar: "R" },
  { name: "Sneha", amount: "₹1,42,857", avatar: "S" },
  { name: "Vikram", amount: "₹1,42,857", avatar: "V" },
];

export default function Finances() {
  return (
    <AppLayout>
      <div className="px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Finances</h1>
            <p className="text-sm text-muted-foreground">Track earnings & expenses</p>
          </div>
          <div className="flex gap-2">
            <Button variant="glass" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="glass" size="icon">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="stat-card opacity-0 animate-slide-up" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Income</span>
            </div>
            <p className="text-xl font-bold text-green-400">₹12.4L</p>
            <p className="text-xs text-muted-foreground mt-1">This year</p>
          </div>
          <div className="stat-card opacity-0 animate-slide-up" style={{ animationDelay: "150ms", animationFillMode: "forwards" }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Expenses</span>
            </div>
            <p className="text-xl font-bold text-red-400">₹2.1L</p>
            <p className="text-xs text-muted-foreground mt-1">This year</p>
          </div>
        </div>

        {/* Net Earnings */}
        <div 
          className="glass-card-elevated p-5 mb-6 relative overflow-hidden opacity-0 animate-slide-up"
          style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Net Earnings (After TDS)</p>
              <p className="text-3xl font-bold gradient-text-purple">₹10.3L</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Per Member</p>
              <p className="text-lg font-semibold text-secondary">₹1.47L</p>
            </div>
          </div>
        </div>

        {/* Member Payouts */}
        <div className="mb-6 opacity-0 animate-slide-up" style={{ animationDelay: "250ms", animationFillMode: "forwards" }}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Member Payouts (This Month)
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {memberPayouts.map((member) => (
              <div key={member.name} className="flex-shrink-0 text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center text-sm font-bold text-foreground mb-1">
                  {member.avatar}
                </div>
                <p className="text-xs font-medium text-foreground">{member.name}</p>
                <p className="text-[10px] text-muted-foreground">{member.amount}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Recent Transactions
          </h3>
          <div className="space-y-2">
            {transactions.map((tx, index) => (
              <div 
                key={tx.id}
                className="glass-card p-4 flex items-center justify-between opacity-0 animate-slide-up"
                style={{ animationDelay: `${350 + index * 50}ms`, animationFillMode: "forwards" }}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    tx.type === "income" ? "bg-green-500/20" : "bg-red-500/20"
                  )}>
                    {tx.type === "income" ? (
                      <ArrowUpRight className="w-5 h-5 text-green-400" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.title}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-semibold",
                    tx.type === "income" ? "text-green-400" : "text-red-400"
                  )}>
                    {tx.type === "income" ? "+" : "-"}{tx.amount}
                  </p>
                  <p className={cn(
                    "text-[10px] uppercase",
                    tx.status === "pending" ? "text-yellow-400" : "text-muted-foreground"
                  )}>
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
