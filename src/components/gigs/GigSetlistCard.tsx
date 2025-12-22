import { useState, useRef } from 'react';
import { Music, Plus, Trash2, Clock, GripVertical, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useGigSetlist, useAddToSetlist, useRemoveFromSetlist, useUpdateSetlistOrder, useCopySetlist, SetlistItem } from '@/hooks/useGigSetlist';
import { useSongs } from '@/hooks/useSongs';
import { useGigs } from '@/hooks/useGigs';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface GigSetlistCardProps {
  gigId: string;
}

export function GigSetlistCard({ gigId }: GigSetlistCardProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gigSearchQuery, setGigSearchQuery] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const { data: setlist = [], isLoading } = useGigSetlist(gigId);
  const { data: allSongs = [], isLoading: songsLoading } = useSongs();
  const { data: allGigs = [], isLoading: gigsLoading } = useGigs();
  const addToSetlist = useAddToSetlist();
  const removeFromSetlist = useRemoveFromSetlist();
  const updateOrder = useUpdateSetlistOrder();
  const copySetlist = useCopySetlist();

  // Filter gigs that have setlists (exclude current gig)
  const availableGigs = allGigs.filter(gig => 
    gig.id !== gigId &&
    (gig.title.toLowerCase().includes(gigSearchQuery.toLowerCase()) ||
     gig.venue.toLowerCase().includes(gigSearchQuery.toLowerCase()))
  );

  // Filter songs not already in setlist
  const setlistSongIds = new Set(setlist.map(s => s.song_id));
  const availableSongs = allSongs.filter(song => 
    !setlistSongIds.has(song.id) &&
    song.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDuration = setlist.reduce((sum, item) => sum + (item.song?.duration_minutes || 0), 0);

  const handleAddSong = async (songId: string) => {
    await addToSetlist.mutateAsync({
      gigId,
      songId,
      position: setlist.length,
    });
    setAddDialogOpen(false);
    setSearchQuery('');
  };

  const handleRemoveSong = async (id: string) => {
    await removeFromSetlist.mutateAsync({ id, gigId });
  };

  const handleCopyFromGig = async (sourceGigId: string) => {
    await copySetlist.mutateAsync({ sourceGigId, targetGigId: gigId });
    setCopyDialogOpen(false);
    setGigSearchQuery('');
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...setlist];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    setDraggedIndex(null);
    setDragOverIndex(null);

    await updateOrder.mutateAsync({
      gigId,
      items: newItems.map((item, i) => ({ id: item.id, position: i })),
    });
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Setlist</CardTitle>
            {setlist.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {setlist.length} songs
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="gap-1">
                  <Copy className="w-4 h-4" />
                  Copy from Gig
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader>
                  <DialogTitle>Copy Setlist from Another Gig</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Search gigs..."
                    value={gigSearchQuery}
                    onChange={(e) => setGigSearchQuery(e.target.value)}
                  />
                  <ScrollArea className="h-[300px]">
                    {gigsLoading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                          <Skeleton key={i} className="h-14 w-full" />
                        ))}
                      </div>
                    ) : availableGigs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {gigSearchQuery ? 'No matching gigs found' : 'No other gigs available'}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {availableGigs.map(gig => (
                          <button
                            key={gig.id}
                            onClick={() => handleCopyFromGig(gig.id)}
                            disabled={copySetlist.isPending}
                            className="w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left flex items-center justify-between group"
                          >
                            <div>
                              <p className="font-medium text-foreground">{gig.title}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <span>{format(new Date(gig.date), 'MMM d, yyyy')}</span>
                                <span>•</span>
                                <span>{gig.venue}</span>
                              </div>
                            </div>
                            <Copy className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  <p className="text-xs text-muted-foreground">
                    This will add songs from the selected gig to this setlist.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1">
                  <Plus className="w-4 h-4" />
                  Add Song
                </Button>
              </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-md">
              <DialogHeader>
                <DialogTitle>Add Song to Setlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Search songs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <ScrollArea className="h-[300px]">
                  {songsLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-14 w-full" />
                      ))}
                    </div>
                  ) : availableSongs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? 'No matching songs found' : 'All songs are already in the setlist'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {availableSongs.map(song => (
                        <button
                          key={song.id}
                          onClick={() => handleAddSong(song.id)}
                          disabled={addToSetlist.isPending}
                          className="w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left flex items-center justify-between group"
                        >
                          <div>
                            <p className="font-medium text-foreground">{song.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              {song.composer && <span>{song.composer}</span>}
                              {song.key_signature && (
                                <>
                                  <span>•</span>
                                  <span>{song.key_signature}</span>
                                </>
                              )}
                              {song.duration_minutes && (
                                <>
                                  <span>•</span>
                                  <span>{song.duration_minutes} min</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Plus className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : setlist.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No songs in setlist</p>
            <p className="text-xs mt-1">Add songs to plan your performance</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {setlist.map((item, index) => (
                <SetlistItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  onRemove={() => handleRemoveSong(item.id)}
                  isDragging={draggedIndex === index}
                  isDragOver={dragOverIndex === index}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  isReordering={updateOrder.isPending}
                />
              ))}
            </div>

            {/* Total duration */}
            {totalDuration > 0 && (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Total: ~{totalDuration} min</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface SetlistItemRowProps {
  item: SetlistItem;
  index: number;
  onRemove: () => void;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isReordering: boolean;
}

function SetlistItemRow({ 
  item, 
  index, 
  onRemove, 
  isDragging, 
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  isReordering 
}: SetlistItemRowProps) {
  return (
    <div 
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/30 group transition-all cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 scale-95",
        isDragOver && "border-primary border-2 bg-primary/10",
        isReordering && "pointer-events-none opacity-70"
      )}
    >
      <div className="text-muted-foreground hover:text-foreground transition-colors">
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary shrink-0">
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{item.song?.title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {item.song?.key_signature && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {item.song.key_signature}
            </Badge>
          )}
          {item.song?.raga && <span>{item.song.raga}</span>}
          {item.song?.tempo && <span>{item.song.tempo} BPM</span>}
          {item.song?.duration_minutes && (
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {item.song.duration_minutes}m
            </span>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
