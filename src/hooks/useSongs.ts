import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Song {
  id: string;
  title: string;
  raga: string | null;
  tala: string | null;
  tempo: number | null;
  key_signature: string | null;
  duration_minutes: number | null;
  structure: string | null;
  lyrics: string | null;
  chords: string | null;
  performance_notes: string | null;
  audio_url: string | null;
  sheet_music_url: string | null;
  is_original: boolean;
  composer: string | null;
  arranger: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSongInput {
  title: string;
  raga?: string;
  tala?: string;
  tempo?: number;
  key_signature?: string;
  duration_minutes?: number;
  structure?: string;
  lyrics?: string;
  chords?: string;
  performance_notes?: string;
  audio_url?: string;
  sheet_music_url?: string;
  is_original?: boolean;
  composer?: string;
  arranger?: string;
}

export interface SongFilters {
  search?: string;
  raga?: string;
  tala?: string;
}

export function useSongs(filters?: SongFilters) {
  return useQuery({
    queryKey: ['songs', filters],
    queryFn: async () => {
      let query = supabase
        .from('songs')
        .select('*')
        .order('title', { ascending: true });

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,composer.ilike.%${filters.search}%`);
      }

      if (filters?.raga && filters.raga !== 'all') {
        query = query.eq('raga', filters.raga);
      }

      if (filters?.tala && filters.tala !== 'all') {
        query = query.eq('tala', filters.tala);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Song[];
    },
  });
}

export function useSong(id: string | undefined) {
  return useQuery({
    queryKey: ['song', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Song | null;
    },
    enabled: !!id,
  });
}

export function useRagasAndTalas() {
  return useQuery({
    queryKey: ['ragas-talas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('raga, tala');
      
      if (error) throw error;
      
      const ragas = [...new Set(data?.map(s => s.raga).filter(Boolean) as string[])].sort();
      const talas = [...new Set(data?.map(s => s.tala).filter(Boolean) as string[])].sort();
      
      return { ragas, talas };
    },
  });
}

export function useCreateSong() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateSongInput) => {
      const { data, error } = await supabase
        .from('songs')
        .insert({
          ...input,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.invalidateQueries({ queryKey: ['ragas-talas'] });
      toast.success('Song added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add song: ' + error.message);
    },
  });
}

export function useUpdateSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Song> & { id: string }) => {
      const { data, error } = await supabase
        .from('songs')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.invalidateQueries({ queryKey: ['song', data.id] });
      queryClient.invalidateQueries({ queryKey: ['ragas-talas'] });
      toast.success('Song updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update song: ' + error.message);
    },
  });
}

export function useDeleteSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] });
      queryClient.invalidateQueries({ queryKey: ['ragas-talas'] });
      toast.success('Song deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete song: ' + error.message);
    },
  });
}
