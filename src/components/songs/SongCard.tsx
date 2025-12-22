import { Music, Clock, Disc, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Song } from '@/hooks/useSongs';

interface SongCardProps {
  song: Song;
  index: number;
  onClick?: () => void;
}

export function SongCard({ song, index, onClick }: SongCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full glass-card p-4 text-left group hover:bg-card/80 transition-all duration-300 opacity-0 animate-slide-up"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Music className="w-6 h-6 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {song.title}
              </h4>
              {song.composer && (
                <p className="text-xs text-muted-foreground truncate">
                  {song.composer}
                  {song.arranger && song.arranger !== song.composer && ` · Arr: ${song.arranger}`}
                </p>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {song.raga && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/20 text-primary">
                {song.raga}
              </span>
            )}
            {song.tala && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary/20 text-secondary">
                {song.tala}
              </span>
            )}
            {song.tempo && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Disc className="w-3 h-3" />
                {song.tempo} BPM
              </span>
            )}
            {song.duration_minutes && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                {song.duration_minutes} min
              </span>
            )}
            {song.is_original && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/20 text-green-400">
                Original
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
