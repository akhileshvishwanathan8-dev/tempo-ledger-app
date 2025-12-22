import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subValue?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  variant?: "purple" | "teal" | "default";
  className?: string;
  delay?: number;
}

export function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  trend,
  variant = "default",
  className,
  delay = 0
}: StatCardProps) {
  const glowColor = variant === "purple" 
    ? "hsl(var(--neon-purple) / 0.15)" 
    : variant === "teal" 
      ? "hsl(var(--neon-teal) / 0.15)" 
      : "hsl(var(--neon-purple) / 0.1)";

  return (
    <div 
      className={cn(
        "stat-card opacity-0 animate-slide-up",
        className
      )}
      style={{ 
        animationDelay: `${delay}ms`,
        animationFillMode: "forwards"
      }}
    >
      {/* Glow effect */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${glowColor} 0%, transparent 70%)`
        }}
      />
      
      {/* Icon */}
      <div className={cn(
        "inline-flex p-2.5 rounded-xl mb-3",
        variant === "purple" && "bg-primary/20 text-primary",
        variant === "teal" && "bg-secondary/20 text-secondary",
        variant === "default" && "bg-muted text-muted-foreground"
      )}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Label */}
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <h3 className={cn(
          "text-2xl font-bold tracking-tight",
          variant === "purple" && "gradient-text-purple",
          variant === "teal" && "gradient-text-teal"
        )}>
          {value}
        </h3>
        {subValue && (
          <span className="text-sm text-muted-foreground">{subValue}</span>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <div className={cn(
          "flex items-center gap-1 mt-2 text-xs font-medium",
          trend.positive ? "text-green-400" : "text-red-400"
        )}>
          <span>{trend.positive ? "↑" : "↓"}</span>
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
}
