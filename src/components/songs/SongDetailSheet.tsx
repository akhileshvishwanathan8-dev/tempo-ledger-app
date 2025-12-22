import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Song } from '@/hooks/useSongs';
import { 
  Music, 
  Clock, 
  Disc, 
  User, 
  FileText, 
  ExternalLink,
  Edit,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SongDetailSheetProps {
  song: Song | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function SongDetailSheet({ song, open, onOpenChange, onEdit, onDelete }: SongDetailSheetProps) {
  if (!song) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="glass-card-elevated border-l-border w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Music className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl font-bold text-foreground text-left">
                {song.title}
              </SheetTitle>
              {song.composer && (
                <p className="text-sm text-muted-foreground">
                  {song.composer}
                  {song.arranger && song.arranger !== song.composer && (
                    <span> · Arr: {song.arranger}</span>
                  )}
                </p>
              )}
              {song.is_original && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                  Original Composition
                </span>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {song.raga && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary">
                {song.raga}
              </span>
            )}
            {song.tala && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-secondary">
                {song.tala}
              </span>
            )}
            {song.key_signature && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                {song.key_signature}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {song.tempo && (
              <div className="glass-card p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Disc className="w-4 h-4" />
                  <span className="text-xs">Tempo</span>
                </div>
                <p className="text-lg font-semibold text-foreground">{song.tempo} BPM</p>
              </div>
            )}
            {song.duration_minutes && (
              <div className="glass-card p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Duration</span>
                </div>
                <p className="text-lg font-semibold text-foreground">{song.duration_minutes} min</p>
              </div>
            )}
          </div>

          {/* Structure */}
          {song.structure && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Structure
              </h4>
              <div className="glass-card p-3">
                <p className="text-sm text-foreground whitespace-pre-wrap">{song.structure}</p>
              </div>
            </div>
          )}

          {/* Chords */}
          {song.chords && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Chord Progression
              </h4>
              <div className="glass-card p-3 font-mono">
                <p className="text-sm text-foreground whitespace-pre-wrap">{song.chords}</p>
              </div>
            </div>
          )}

          {/* Performance Notes */}
          {song.performance_notes && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Performance Notes
              </h4>
              <div className="glass-card p-3">
                <p className="text-sm text-foreground whitespace-pre-wrap">{song.performance_notes}</p>
              </div>
            </div>
          )}

          {/* Links */}
          {(song.audio_url || song.sheet_music_url) && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Attachments
              </h4>
              <div className="space-y-2">
                {song.audio_url && (
                  <a
                    href={song.audio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 glass-card p-3 hover:bg-muted/50 transition-colors"
                  >
                    <Music className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground flex-1">Audio Reference</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                )}
                {song.sheet_music_url && (
                  <a
                    href={song.sheet_music_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 glass-card p-3 hover:bg-muted/50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground flex-1">Sheet Music</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-border flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
