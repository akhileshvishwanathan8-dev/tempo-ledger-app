import { Sparkles, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AIAssistantCardProps {
  className?: string;
}

export function AIAssistantCard({ className }: AIAssistantCardProps) {
  return (
    <Link 
      to="/ai"
      className={cn(
        "block glass-card p-5 relative overflow-hidden group opacity-0 animate-slide-up",
        className
      )}
      style={{ animationDelay: "400ms", animationFillMode: "forwards" }}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Floating orb */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl animate-float" />

      <div className="relative z-10 flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center neon-glow-purple">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-2xl bg-primary/50 animate-pulse-ring" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-base font-bold text-foreground">Ask Musifi AI</h3>
          <p className="text-sm text-muted-foreground">
            "How much did we earn last month?"
          </p>
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </Link>
  );
}
