import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';
import { GigInfoCard } from '@/components/gigs/GigInfoCard';
import { MemberAvailabilityCard } from '@/components/gigs/MemberAvailabilityCard';
import { GigExpensesCard } from '@/components/gigs/GigExpensesCard';
import { GigPaymentsCard } from '@/components/gigs/GigPaymentsCard';
import { GigPayoutsCard } from '@/components/gigs/GigPayoutsCard';
import { GigSetlistCard } from '@/components/gigs/GigSetlistCard';
import { EditGigDialog } from '@/components/gigs/EditGigDialog';
import { useGigs, useDeleteGig } from '@/hooks/useGigs';
import { 
  useGigAvailability, 
  useGigExpenses, 
  useGigPayments, 
  useGigPayouts,
  useGigFinancials 
} from '@/hooks/useGigDetails';
import { useSyncGigToCalendar, useGoogleCalendarConnection } from '@/hooks/useGoogleCalendar';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function GigDetail() {
  const { gigId } = useParams<{ gigId: string }>();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { role } = useAuth();
  const isAppAdmin = role === 'app_admin';
  
  const { data: gigs, isLoading: gigsLoading } = useGigs();
  const { data: availability = [], isLoading: availabilityLoading } = useGigAvailability(gigId || '');
  const { data: expenses = [], isLoading: expensesLoading } = useGigExpenses(gigId || '');
  const { data: payments = [], isLoading: paymentsLoading } = useGigPayments(gigId || '');
  const { data: payouts = [], isLoading: payoutsLoading } = useGigPayouts(gigId || '');
  const { data: financials, isLoading: financialsLoading } = useGigFinancials(gigId || '');
  const { data: calendarConnection } = useGoogleCalendarConnection();
  
  const deleteGig = useDeleteGig();
  const syncToCalendar = useSyncGigToCalendar();

  const gig = gigs?.find(g => g.id === gigId);

  const handleDelete = async () => {
    if (gigId) {
      await deleteGig.mutateAsync(gigId);
      navigate('/gigs');
    }
  };

  if (gigsLoading) {
    return (
      <AppLayout showBackButton title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading gig details...</div>
        </div>
      </AppLayout>
    );
  }

  if (!gig) {
    return (
      <AppLayout showBackButton title="Not Found">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-muted-foreground">Gig not found</div>
          <Button variant="outline" onClick={() => navigate('/gigs')}>
            Back to Gigs
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      showBackButton
      title={gig.title}
      action={
        <div className="flex items-center gap-2">
          {/* Sync to Calendar button - only for app_admins with connected calendar */}
          {isAppAdmin && calendarConnection && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => syncToCalendar.mutate(gigId!)}
                  disabled={syncToCalendar.isPending}
                  className="text-green-500 hover:bg-green-500/20"
                >
                  {syncToCalendar.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Calendar className="w-5 h-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sync to Google Calendar</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setEditDialogOpen(true)}
            className="text-primary hover:bg-primary/20"
          >
            <Edit className="w-5 h-5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20">
                <Trash2 className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Gig</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{gig.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      }
    >
      <div className="px-4 space-y-6 pb-24">
        {/* Gig Info */}
        <GigInfoCard gig={gig} />

        {/* Setlist */}
        <GigSetlistCard gigId={gigId || ''} />

        {/* Member Availability */}
        <MemberAvailabilityCard
          gigId={gigId || ''}
          availability={availability}
          isLoading={availabilityLoading}
        />

        {/* Financials Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Expenses */}
          <GigExpensesCard
            gigId={gigId || ''}
            expenses={expenses}
            isLoading={expensesLoading}
          />

          {/* Payments */}
          <GigPaymentsCard
            gigId={gigId || ''}
            payments={payments}
            isLoading={paymentsLoading}
          />
        </div>

        {/* Payouts */}
        <GigPayoutsCard
          gigId={gigId || ''}
          payouts={payouts}
          financials={financials || null}
          isLoading={payoutsLoading || financialsLoading}
        />
      </div>

      <EditGigDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} gig={gig} />
    </AppLayout>
  );
}
