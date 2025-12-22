import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useCreateSong, useUpdateSong, Song } from '@/hooks/useSongs';
import { Loader2, Music, Clock, Disc } from 'lucide-react';
import { useEffect } from 'react';

const songSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  raga: z.string().max(100).optional(),
  tala: z.string().max(100).optional(),
  tempo: z.coerce.number().min(20).max(300).optional().or(z.literal('')),
  key_signature: z.string().max(50).optional(),
  duration_minutes: z.coerce.number().min(1).max(120).optional().or(z.literal('')),
  structure: z.string().max(2000).optional(),
  lyrics: z.string().max(10000).optional(),
  chords: z.string().max(5000).optional(),
  performance_notes: z.string().max(5000).optional(),
  audio_url: z.string().url().optional().or(z.literal('')),
  sheet_music_url: z.string().url().optional().or(z.literal('')),
  is_original: z.boolean(),
  composer: z.string().max(200).optional(),
  arranger: z.string().max(200).optional(),
});

type SongFormData = z.infer<typeof songSchema>;

interface SongDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song?: Song | null;
}

export function SongDialog({ open, onOpenChange, song }: SongDialogProps) {
  const createSong = useCreateSong();
  const updateSong = useUpdateSong();
  const isEditing = !!song;
  
  const form = useForm<SongFormData>({
    resolver: zodResolver(songSchema),
    defaultValues: {
      title: '',
      raga: '',
      tala: '',
      tempo: '',
      key_signature: '',
      duration_minutes: '',
      structure: '',
      lyrics: '',
      chords: '',
      performance_notes: '',
      audio_url: '',
      sheet_music_url: '',
      is_original: false,
      composer: '',
      arranger: '',
    },
  });

  useEffect(() => {
    if (song) {
      form.reset({
        title: song.title,
        raga: song.raga || '',
        tala: song.tala || '',
        tempo: song.tempo || '',
        key_signature: song.key_signature || '',
        duration_minutes: song.duration_minutes || '',
        structure: song.structure || '',
        lyrics: song.lyrics || '',
        chords: song.chords || '',
        performance_notes: song.performance_notes || '',
        audio_url: song.audio_url || '',
        sheet_music_url: song.sheet_music_url || '',
        is_original: song.is_original,
        composer: song.composer || '',
        arranger: song.arranger || '',
      });
    } else {
      form.reset({
        title: '',
        raga: '',
        tala: '',
        tempo: '',
        key_signature: '',
        duration_minutes: '',
        structure: '',
        lyrics: '',
        chords: '',
        performance_notes: '',
        audio_url: '',
        sheet_music_url: '',
        is_original: false,
        composer: '',
        arranger: '',
      });
    }
  }, [song, form]);

  const onSubmit = async (data: SongFormData) => {
    const payload = {
      title: data.title,
      raga: data.raga || undefined,
      tala: data.tala || undefined,
      tempo: data.tempo ? Number(data.tempo) : undefined,
      key_signature: data.key_signature || undefined,
      duration_minutes: data.duration_minutes ? Number(data.duration_minutes) : undefined,
      structure: data.structure || undefined,
      lyrics: data.lyrics || undefined,
      chords: data.chords || undefined,
      performance_notes: data.performance_notes || undefined,
      audio_url: data.audio_url || undefined,
      sheet_music_url: data.sheet_music_url || undefined,
      is_original: data.is_original,
      composer: data.composer || undefined,
      arranger: data.arranger || undefined,
    };

    if (isEditing && song) {
      await updateSong.mutateAsync({ id: song.id, ...payload });
    } else {
      await createSong.mutateAsync(payload);
    }
    form.reset();
    onOpenChange(false);
  };

  const isPending = createSong.isPending || updateSong.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card-elevated border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold gradient-text-purple flex items-center gap-2">
            <Music className="w-5 h-5" />
            {isEditing ? 'Edit Song' : 'Add New Song'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title & Original */}
            <div className="flex gap-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-muted-foreground">Song Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Thillana in Dhanashri" 
                        className="bg-muted/50 border-border" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_original"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center justify-end pb-2">
                    <FormLabel className="text-xs text-muted-foreground">Original</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Composer & Arranger */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="composer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Composer</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Muthuswami Dikshitar" 
                        className="bg-muted/50 border-border" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="arranger"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Arranger</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Band name" 
                        className="bg-muted/50 border-border" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Musical Details */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Musical Details
              </p>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="raga"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Raga</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Dhanashri" 
                          className="bg-muted/50 border-border" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tala"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Tala</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Adi" 
                          className="bg-muted/50 border-border" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-3 mt-3">
                <FormField
                  control={form.control}
                  name="tempo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground flex items-center gap-1">
                        <Disc className="w-3 h-3" /> BPM
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="120" 
                          className="bg-muted/50 border-border" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="key_signature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Key</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="C Major" 
                          className="bg-muted/50 border-border" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Min
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="8" 
                          className="bg-muted/50 border-border" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Structure & Content */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Structure & Content
              </p>
              <FormField
                control={form.control}
                name="structure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Song Structure</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Pallavi → Anupallavi → Charanam → Thillana section..." 
                        className="bg-muted/50 border-border resize-none h-16" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chords"
                render={({ field }) => (
                  <FormItem className="mt-3">
                    <FormLabel className="text-muted-foreground">Chord Progression</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Cm - Fm - G7 - Cm..." 
                        className="bg-muted/50 border-border resize-none h-16" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="performance_notes"
                render={({ field }) => (
                  <FormItem className="mt-3">
                    <FormLabel className="text-muted-foreground">Performance Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Key transitions, dynamics, improvisation sections..." 
                        className="bg-muted/50 border-border resize-none h-16" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Links */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Attachments (URLs)
              </p>
              <div className="grid grid-cols-1 gap-3">
                <FormField
                  control={form.control}
                  name="audio_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Audio Reference</FormLabel>
                      <FormControl>
                        <Input 
                          type="url"
                          placeholder="https://drive.google.com/..." 
                          className="bg-muted/50 border-border" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sheet_music_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Sheet Music PDF</FormLabel>
                      <FormControl>
                        <Input 
                          type="url"
                          placeholder="https://drive.google.com/..." 
                          className="bg-muted/50 border-border" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="neon" 
                className="flex-1"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isEditing ? (
                  'Save Changes'
                ) : (
                  'Add Song'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
