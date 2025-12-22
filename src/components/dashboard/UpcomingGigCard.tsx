import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpcomingGigCardProps {
  title: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  daysUntil: number;
  confirmedMembers: number;
  totalMembers: number;
  className?: string;
}

export function UpcomingGigCard({
  title,
  venue,
  city,
  date,
  time,
  daysUntil,
  confirmedMembers,
  totalMembers,
  className
}: UpcomingGigCardProps) {
  return (
    <div className={cn(
      "glass-card-elevated p-5 relative overflow-hidden opacity-0 animate-slide-up",
      className
    )}
    style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
    >
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
      
      {/* Waveform decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10">
        <div className="waveform w-full h-full" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Next Gig
            </span>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
          </div>
          
          {/* Countdown */}
          <div className="text-right">
            <div className="text-3xl font-bold gradient-text-purple">{daysUntil}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">days</div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-secondary" />
            <span>{venue}, {city}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>{time}</span>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Availability</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {Array.from({ length: confirmedMembers }).map((_, i) => (
                <div 
                  key={i}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-card"
                />
              ))}
              {confirmedMembers < totalMembers && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                  +{totalMembers - confirmedMembers}
                </div>
              )}
            </div>
            <span className={cn(
              "text-sm font-semibold",
              confirmedMembers === totalMembers ? "text-green-400" : "text-yellow-400"
            )}>
              {confirmedMembers}/{totalMembers}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
