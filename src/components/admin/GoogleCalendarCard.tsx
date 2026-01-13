import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Link2, Unlink, Loader2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  useGoogleCalendarConnection,
  useConnectGoogleCalendar,
  useHandleGoogleCallback,
  useDisconnectGoogleCalendar,
} from '@/hooks/useGoogleCalendar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function GoogleCalendarCard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: connection, isLoading } = useGoogleCalendarConnection();
  const connectMutation = useConnectGoogleCalendar();
  const callbackMutation = useHandleGoogleCallback();
  const disconnectMutation = useDisconnectGoogleCalendar();

  // Handle OAuth callback
  useEffect(() => {
    const isCallback = searchParams.get('google_callback') === 'true';
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (isCallback && code && state) {
      // Clear URL params
      setSearchParams({});
      
      // Process callback
      callbackMutation.mutate({ code, state });
    }
  }, [searchParams, setSearchParams, callbackMutation]);

  const isConnected = !!connection;
  const isPending = connectMutation.isPending || callbackMutation.isPending || disconnectMutation.isPending;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Google Calendar Sync
        </CardTitle>
        <CardDescription>
          Automatically sync gigs to Google Calendar when created or updated
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isConnected ? (
          <>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium text-foreground">Connected</p>
                <p className="text-sm text-muted-foreground">
                  Calendar: {connection.calendar_id === 'primary' ? 'Primary Calendar' : connection.calendar_id}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Connected {format(new Date(connection.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              <Badge variant="outline" className="border-green-500/30 text-green-500">
                Active
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Gigs will sync when you click "Sync to Calendar" on gig details</p>
              <p>• Event updates in the app will update Google Calendar</p>
              <p>• Only App Admins can trigger calendar sync</p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full" disabled={isPending}>
                  <Unlink className="h-4 w-4 mr-2" />
                  Disconnect Calendar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-card">
                <AlertDialogHeader>
                  <AlertDialogTitle>Disconnect Google Calendar?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will stop syncing gigs to Google Calendar. Existing events in the calendar will not be removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => disconnectMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Disconnect
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium text-foreground">Not Connected</p>
                <p className="text-sm text-muted-foreground">
                  Connect to sync gigs with your Google Calendar
                </p>
              </div>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Connect the band's Google Calendar account</p>
              <p>• Gigs will appear as calendar events with all details</p>
              <p>• Events update automatically when gig details change</p>
            </div>

            <Button
              onClick={() => connectMutation.mutate()}
              disabled={isPending}
              className="w-full"
              variant="neon"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4 mr-2" />
              )}
              Connect Google Calendar
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
