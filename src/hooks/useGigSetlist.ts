import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SetlistItem {
  id: string;
  gig_id: string;
  song_id: string;
  position: number;
  notes: string | null;
  created_at: string;
  song?: {
    id: string;
    title: string;
    composer: string | null;
    key_signature: string | null;
    tempo: number | null;
    duration_minutes: number | null;
    raga: string | null;
  };
}

export function useGigSetlist(gigId: string) {
  return useQuery({
    queryKey: ['gig-setlist', gigId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gig_setlists')
        .select('*')
        .eq('gig_id', gigId)
        .order('position', { ascending: true });

      if (error) throw error;

      // Fetch songs separately
      const songIds = data.map(s => s.song_id);
      if (songIds.length === 0) return [] as SetlistItem[];

      const { data: songs, error: songsError } = await supabase
        .from('songs')
        .select('id, title, composer, key_signature, tempo, duration_minutes, raga')
        .in('id', songIds);

      if (songsError) throw songsError;

      const songMap = new Map(songs?.map(s => [s.id, s]) || []);

      return data.map(item => ({
        ...item,
        song: songMap.get(item.song_id),
      })) as SetlistItem[];
    },
    enabled: !!gigId,
  });
}

export function useAddToSetlist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ gigId, songId, position }: { gigId: string; songId: string; position: number }) => {
      const { data, error } = await supabase
        .from('gig_setlists')
        .insert({ gig_id: gigId, song_id: songId, position, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gig-setlist', variables.gigId] });
      toast.success('Song added to setlist');
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate')) {
        toast.error('Song is already in the setlist');
      } else {
        toast.error('Failed to add song: ' + error.message);
      }
    },
  });
}

export function useRemoveFromSetlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, gigId }: { id: string; gigId: string }) => {
      const { error } = await supabase
        .from('gig_setlists')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { gigId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['gig-setlist', result.gigId] });
      toast.success('Song removed from setlist');
    },
    onError: (error: Error) => {
      toast.error('Failed to remove song: ' + error.message);
    },
  });
}

export function useUpdateSetlistOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gigId, items }: { gigId: string; items: { id: string; position: number }[] }) => {
      // Update positions in parallel
      const updates = items.map(item =>
        supabase
          .from('gig_setlists')
          .update({ position: item.position })
          .eq('id', item.id)
      );
      
      const results = await Promise.all(updates);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) throw errors[0].error;
      
      return { gigId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['gig-setlist', result.gigId] });
    },
    onError: (error: Error) => {
      toast.error('Failed to reorder: ' + error.message);
    },
  });
}

export function useUpdateSetlistNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, gigId, notes }: { id: string; gigId: string; notes: string }) => {
      const { data, error } = await supabase
        .from('gig_setlists')
        .update({ notes })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { data, gigId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['gig-setlist', result.gigId] });
      toast.success('Note updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update note: ' + error.message);
    },
  });
}

export function useCopySetlist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ sourceGigId, targetGigId }: { sourceGigId: string; targetGigId: string }) => {
      // Fetch source setlist
      const { data: sourceSetlist, error: fetchError } = await supabase
        .from('gig_setlists')
        .select('song_id, position, notes')
        .eq('gig_id', sourceGigId)
        .order('position', { ascending: true });

      if (fetchError) throw fetchError;
      if (!sourceSetlist || sourceSetlist.length === 0) {
        throw new Error('Source gig has no setlist');
      }

      // Insert copies for target gig
      const newItems = sourceSetlist.map(item => ({
        gig_id: targetGigId,
        song_id: item.song_id,
        position: item.position,
        notes: item.notes,
        created_by: user?.id,
      }));

      const { error: insertError } = await supabase
        .from('gig_setlists')
        .insert(newItems);

      if (insertError) throw insertError;
      return { targetGigId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['gig-setlist', result.targetGigId] });
      toast.success('Setlist copied successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to copy setlist: ' + error.message);
    },
  });
}
