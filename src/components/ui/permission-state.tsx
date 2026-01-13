import { Lock, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PermissionStateProps {
  type: 'locked' | 'read-only' | 'hidden' | 'restricted';
  title?: string;
  description?: string;
  className?: string;
  showIcon?: boolean;
}

const stateConfig = {
  locked: {
    icon: Lock,
    defaultTitle: "Access Restricted",
    defaultDescription: "You don't have permission to access this feature.",
    iconColor: "text-muted-foreground"
  },
  'read-only': {
    icon: Eye,
    defaultTitle: "View Only",
    defaultDescription: "You can view this information but cannot make changes.",
    iconColor: "text-status-info"
  },
  hidden: {
    icon: EyeOff,
    defaultTitle: "Not Available",
    defaultDescription: "This feature is not available for your account.",
    iconColor: "text-muted-foreground"
  },
  restricted: {
    icon: ShieldAlert,
    defaultTitle: "Admin Only",
    defaultDescription: "This feature is available to administrators only.",
    iconColor: "text-status-warning"
  }
};

export function PermissionState({ 
  type, 
  title, 
  description, 
  className,
  showIcon = true 
}: PermissionStateProps) {
  const config = stateConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "glass-card p-8 text-center",
      className
    )}>
      {showIcon && (
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
          <Icon className={cn("w-8 h-8", config.iconColor)} />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {description || config.defaultDescription}
      </p>
    </div>
  );
}

interface AdminBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function AdminBadge({ className, size = 'sm' }: AdminBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium",
      size === 'sm' ? "text-[10px]" : "text-xs",
      className
    )}>
      <ShieldAlert className={cn(size === 'sm' ? "w-2.5 h-2.5" : "w-3 h-3")} />
      Admin
    </span>
  );
}

interface ReadOnlyBannerProps {
  message?: string;
  className?: string;
}

export function ReadOnlyBanner({ message, className }: ReadOnlyBannerProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 bg-status-info/10 border border-status-info/20 rounded-xl text-sm",
      className
    )}>
      <Eye className="w-4 h-4 text-status-info shrink-0" />
      <span className="text-status-info">
        {message || "You're viewing this in read-only mode."}
      </span>
    </div>
  );
}