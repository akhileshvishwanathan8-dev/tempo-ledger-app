import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateGig, GigStatus } from '@/hooks/useGigs';
import { Loader2, Calendar, MapPin, User, Phone, Mail, IndianRupee } from 'lucide-react';

const gigSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  venue: z.string().min(1, 'Venue is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  address: z.string().max(500).optional(),
  date: z.string().min(1, 'Date is required'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  organizer_name: z.string().max(200).optional(),
  organizer_phone: z.string().max(20).optional(),
  organizer_email: z.string().email().optional().or(z.literal('')),
  status: z.enum(['lead', 'quoted', 'confirmed', 'completed', 'paid', 'cancelled']),
  quoted_amount: z.coerce.number().min(0).optional(),
  tds_percentage: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().max(2000).optional(),
});

type GigFormData = z.infer<typeof gigSchema>;

interface AddGigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddGigDialog({ open, onOpenChange }: AddGigDialogProps) {
  const createGig = useCreateGig();
  
  const form = useForm<GigFormData>({
    resolver: zodResolver(gigSchema),
    defaultValues: {
      title: '',
      venue: '',
      city: '',
      address: '',
      date: '',
      start_time: '',
      end_time: '',
      organizer_name: '',
      organizer_phone: '',
      organizer_email: '',
      status: 'lead',
      quoted_amount: undefined,
      tds_percentage: 10,
      notes: '',
    },
  });

  const onSubmit = async (data: GigFormData) => {
    await createGig.mutateAsync({
      title: data.title,
      venue: data.venue,
      city: data.city,
      date: data.date,
      address: data.address,
      start_time: data.start_time,
      end_time: data.end_time,
      organizer_name: data.organizer_name,
      organizer_phone: data.organizer_phone,
      organizer_email: data.organizer_email || undefined,
      status: data.status,
      quoted_amount: data.quoted_amount,
      tds_percentage: data.tds_percentage,
      notes: data.notes,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card-elevated border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold gradient-text-purple">Add New Gig</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Info */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Event Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="NH7 Weekender Pune" 
                      className="bg-muted/50 border-border" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Venue</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Mahalaxmi Lawns" 
                          className="pl-10 bg-muted/50 border-border" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">City</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Pune" 
                        className="bg-muted/50 border-border" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Full Address (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Near Hadapsar, Pune 411028" 
                      className="bg-muted/50 border-border" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date & Time */}
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="date" 
                          className="pl-10 bg-muted/50 border-border" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">Start</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
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
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground">End</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        className="bg-muted/50 border-border" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Organizer Info */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Organizer Details
              </p>
              <div className="grid grid-cols-1 gap-3">
                <FormField
                  control={form.control}
                  name="organizer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Organizer name" 
                            className="pl-10 bg-muted/50 border-border" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="organizer_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="Phone" 
                              className="pl-10 bg-muted/50 border-border" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="organizer_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="Email" 
                              type="email"
                              className="pl-10 bg-muted/50 border-border" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Financial Info */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Financial Details
              </p>
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/50 border-border">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-border">
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="quoted">Quoted</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quoted_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Amount (₹)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            placeholder="250000" 
                            className="pl-10 bg-muted/50 border-border" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tds_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">TDS %</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="10" 
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

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional details..." 
                      className="bg-muted/50 border-border resize-none h-20" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                disabled={createGig.isPending}
              >
                {createGig.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Create Gig'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
