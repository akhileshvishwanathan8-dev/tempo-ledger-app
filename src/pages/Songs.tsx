import { useState } from 'react';
import { Plus, Loader2, Music, Library } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useSongs, useRagasAndTalas, useDeleteSong, Song, SongFilters } from '@/hooks/useSongs';
import { SongCard } from '@/components/songs/SongCard';
import { SongFiltersBar } from '@/components/songs/SongFiltersBar';
import { SongDialog } from '@/components/songs/SongDialog';
import { SongDetailSheet } from '@/components/songs/SongDetailSheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Songs() {
  const [filters, setFilters] = useState<SongFilters>({ search: '', raga: 'all', tala: 'all' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: songs, isLoading, error } = useSongs(filters);
  const { data: ragasTalas } = useRagasAndTalas();
  const deleteSong = useDeleteSong();

  const handleSongClick = (song: Song) => {
    setSelectedSong(song);
    setDetailOpen(true);
  };

  const handleEdit = () => {
    setEditingSong(selectedSong);
    setDetailOpen(false);
    setDialogOpen(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedSong) {
      await deleteSong.mutateAsync(selectedSong.id);
      setDeleteDialogOpen(false);
      setDetailOpen(false);
      setSelectedSong(null);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingSong(null);
    }
  };

  const handleAddNew = () => {
    setEditingSong(null);
    setDialogOpen(true);
  };

  // Stats
  const stats = {
    total: songs?.length || 0,
    originals: songs?.filter(s => s.is_original).length || 0,
  };

  return (
    <AppLayout title="Songs">
      <div className="px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Songs</h1>
            <p className="text-sm text-muted-foreground">
              {stats.total} songs · {stats.originals} originals
            </p>
          </div>
          <Button 
            size="icon" 
            variant="neon"
            className="rounded-full"
            onClick={handleAddNew}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </header>

        {/* Filters */}
        <div className="mb-6">
          <SongFiltersBar
            filters={filters}
            onFiltersChange={setFilters}
            ragas={ragasTalas?.ragas || []}
            talas={ragasTalas?.talas || []}
          />
        </div>

        {/* Song List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="glass-card p-8 text-center">
            <p className="text-destructive">Failed to load songs</p>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
          </div>
        ) : songs && songs.length > 0 ? (
          <div className="space-y-3">
            {songs.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                index={index}
                onClick={() => handleSongClick(song)}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center">
            <Library className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {filters.search || filters.raga !== 'all' || filters.tala !== 'all'
                ? 'No songs match your filters'
                : 'No songs yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {filters.search || filters.raga !== 'all' || filters.tala !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Build your repertoire by adding songs'}
            </p>
            {!filters.search && filters.raga === 'all' && filters.tala === 'all' && (
              <Button variant="neon" onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Add Song
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <SongDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        song={editingSong}
      />

      {/* Detail Sheet */}
      <SongDetailSheet
        song={selectedSong}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Song</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedSong?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
