import { Home, Calendar, Wallet, Music2, Sparkles } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Calendar, label: "Gigs", path: "/gigs" },
  { icon: Wallet, label: "Finances", path: "/finances" },
  { icon: Music2, label: "Songs", path: "/songs" },
  { icon: Sparkles, label: "AI", path: "/ai" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border/50 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "nav-item flex-1 max-w-[80px]",
                isActive && "active"
              )}
            >
              <div className={cn(
                "relative p-2 rounded-xl transition-all duration-300",
                isActive && "bg-primary/20"
              )}>
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} 
                />
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-primary/10 animate-pulse-glow" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors duration-300",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
