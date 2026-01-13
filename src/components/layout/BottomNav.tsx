import { Home, Calendar, Wallet, Music2, Sparkles, Lock } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  requiresAdmin?: boolean;
  allowedRoles?: ('app_admin' | 'general_admin' | 'musician' | 'external_viewer')[];
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Calendar, label: "Gigs", path: "/gigs" },
  { 
    icon: Wallet, 
    label: "Finances", 
    path: "/finances",
    allowedRoles: ['app_admin', 'general_admin'] // Only admins see full access
  },
  { 
    icon: Music2, 
    label: "Songs", 
    path: "/songs",
    allowedRoles: ['app_admin', 'general_admin', 'musician']
  },
  { icon: Sparkles, label: "AI", path: "/ai" },
];

export function BottomNav() {
  const location = useLocation();
  const { role } = useAuth();

  // Filter nav items based on role
  const visibleNavItems = navItems.filter(item => {
    // If no role restrictions, show to everyone
    if (!item.allowedRoles) return true;
    // If user has a role and it's in the allowed list
    if (role && item.allowedRoles.includes(role)) return true;
    // Musicians can see Finances but with limited access (we'll handle the view differently)
    if (item.path === '/finances' && role === 'musician') return true;
    return false;
  });

  const isAdminRole = role === 'app_admin' || role === 'general_admin';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border/50 pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const isRestricted = item.allowedRoles && role && !item.allowedRoles.includes(role);
          
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
                    isActive ? "text-primary" : "text-muted-foreground",
                    isRestricted && "opacity-50"
                  )} 
                />
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-primary/10 animate-pulse-glow" />
                )}
                {isRestricted && (
                  <Lock className="absolute -top-1 -right-1 w-3 h-3 text-muted-foreground" />
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