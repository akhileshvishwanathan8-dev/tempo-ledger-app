import { AlertCircle, FileText, Receipt, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PendingItem {
  id: string;
  type: "payment" | "document" | "availability";
  title: string;
  subtitle: string;
  urgent?: boolean;
}

interface PendingActionsCardProps {
  items: PendingItem[];
  className?: string;
}

const iconMap = {
  payment: Receipt,
  document: FileText,
  availability: CheckCircle,
};

export function PendingActionsCard({ items, className }: PendingActionsCardProps) {
  if (items.length === 0) return null;

  return (
    <div 
      className={cn(
        "glass-card p-5 opacity-0 animate-slide-up",
        className
      )}
      style={{ animationDelay: "300ms", animationFillMode: "forwards" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-4 h-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-foreground">Pending Actions</h3>
        <span className="ml-auto px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 text-xs font-semibold">
          {items.length}
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const Icon = iconMap[item.type];
          return (
            <button
              key={item.id}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-300 text-left group",
                item.urgent && "ring-1 ring-yellow-400/50"
              )}
              style={{ 
                animationDelay: `${400 + index * 100}ms`,
              }}
            >
              <div className={cn(
                "p-2 rounded-lg",
                item.type === "payment" && "bg-primary/20 text-primary",
                item.type === "document" && "bg-secondary/20 text-secondary",
                item.type === "availability" && "bg-green-500/20 text-green-400"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
              </div>
              {item.urgent && (
                <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 text-[10px] font-semibold uppercase">
                  Urgent
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
