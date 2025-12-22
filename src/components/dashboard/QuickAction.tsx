import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  variant?: "default" | "primary" | "secondary";
  badge?: string;
}

export function QuickAction({ 
  icon: Icon, 
  label, 
  onClick,
  variant = "default",
  badge
}: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300 active:scale-95 relative",
        variant === "default" && "bg-muted/50 hover:bg-muted",
        variant === "primary" && "bg-primary/20 hover:bg-primary/30 text-primary",
        variant === "secondary" && "bg-secondary/20 hover:bg-secondary/30 text-secondary"
      )}
    >
      {badge && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
      <div className={cn(
        "p-3 rounded-xl",
        variant === "default" && "bg-card",
        variant === "primary" && "bg-primary/20",
        variant === "secondary" && "bg-secondary/20"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </button>
  );
}
