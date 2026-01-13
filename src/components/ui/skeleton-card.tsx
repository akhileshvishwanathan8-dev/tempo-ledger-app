import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  className?: string;
  lines?: number;
  showIcon?: boolean;
}

export function SkeletonCard({ className, lines = 3, showIcon = true }: SkeletonCardProps) {
  return (
    <div className={cn("glass-card p-5", className)}>
      <div className="flex items-start gap-3">
        {showIcon && (
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        )}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          {Array.from({ length: lines - 1 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div className={cn("stat-card", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="w-4 h-4 rounded" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-7 w-24 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-border bg-muted/30">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-border/50 last:border-b-0">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export function FinanceSkeletonLoader() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>
      
      {/* Net Earnings Card */}
      <div className="glass-card-elevated p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-3 w-16 ml-auto" />
            <Skeleton className="h-5 w-20 ml-auto" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
          <div className="space-y-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-3 w-16 ml-auto" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        </div>
      </div>
      
      {/* Tabs Skeleton */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
        <Skeleton className="h-8 flex-1 rounded-md" />
        <Skeleton className="h-8 flex-1 rounded-md" />
        <Skeleton className="h-8 flex-1 rounded-md" />
      </div>
      
      {/* Content Skeleton */}
      <div className="space-y-3">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={4} />
      </div>
    </div>
  );
}