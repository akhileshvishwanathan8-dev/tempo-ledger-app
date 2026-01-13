import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-goog-channel-id, x-goog-resource-id, x-goog-resource-state, x-goog-message-number",
};

async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
  const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
  const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();
  if (data.error) {
    console.error("Token refresh error:", data);
    return null;
  }

  return { access_token: data.access_token, expires_in: data.expires_in };
}

function parseEventDescription(description: string | undefined): { 
  organizerName?: string; 
  organizerPhone?: string; 
  organizerEmail?: string;
  amount?: number;
  notes?: string;
  status?: string;
} {
  if (!description) return {};
  
  const result: Record<string, string | number | undefined> = {};
  const lines = description.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('Organizer:')) result.organizerName = line.replace('Organizer:', '').trim();
    else if (line.startsWith('Phone:')) result.organizerPhone = line.replace('Phone:', '').trim();
    else if (line.startsWith('Email:')) result.organizerEmail = line.replace('Email:', '').trim();
    else if (line.startsWith('Amount:')) {
      const amountStr = line.replace('Amount:', '').replace('₹', '').replace(/,/g, '').trim();
      result.amount = parseFloat(amountStr) || undefined;
    }
    else if (line.startsWith('Notes:')) result.notes = line.replace('Notes:', '').trim();
    else if (line.startsWith('Status:')) {
      const status = line.replace('Status:', '').trim().toLowerCase();
      if (['lead', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        result.status = status;
      }
    }
  }
  
  return result;
}

function parseLocation(location: string | undefined): { venue: string; city: string; address?: string } {
  if (!location) return { venue: 'TBD', city: 'TBD' };
  
  const parts = location.split(',').map(p => p.trim());
  
  if (parts.length >= 2) {
    return {
      venue: parts[0],
      city: parts[1],
      address: parts.length > 2 ? parts.slice(2).join(', ') : undefined,
    };
  }
  
  return { venue: location, city: 'TBD' };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Google sends resource state in header
    const resourceState = req.headers.get("x-goog-resource-state");
    const channelId = req.headers.get("x-goog-channel-id");
    
    console.log("Webhook received:", { resourceState, channelId });

    // Sync request - Google is validating the webhook
    if (resourceState === "sync") {
      console.log("Webhook sync validation received");
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    // Only process actual changes
    if (resourceState !== "exists" && resourceState !== "update") {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get calendar connection
    const { data: connection, error: connectionError } = await supabaseAdmin
      .from("google_calendar_connections")
      .select("*")
      .limit(1)
      .single();

    if (connectionError || !connection) {
      console.error("No calendar connection found");
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    let accessToken = connection.access_token;

    // Refresh token if expired
    if (new Date(connection.token_expires_at) <= new Date()) {
      const refreshed = await refreshAccessToken(connection.refresh_token);
      if (!refreshed) {
        console.error("Failed to refresh token");
        return new Response(null, { status: 200, headers: corsHeaders });
      }

      accessToken = refreshed.access_token;
      const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

      await supabaseAdmin
        .from("google_calendar_connections")
        .update({ access_token: accessToken, token_expires_at: newExpiry })
        .eq("id", connection.id);
    }

    // Fetch recent events from Google Calendar (last 24 hours of updates)
    const syncToken = connection.sync_token;
    let eventsUrl = `https://www.googleapis.com/calendar/v3/calendars/${connection.calendar_id}/events`;
    
    if (syncToken) {
      eventsUrl += `?syncToken=${syncToken}`;
    } else {
      // First sync - get events from last 30 days
      const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      eventsUrl += `?timeMin=${timeMin}&singleEvents=true`;
    }

    const eventsResponse = await fetch(eventsUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const eventsData = await eventsResponse.json();

    if (eventsData.error) {
      // If sync token is invalid, clear it and return
      if (eventsData.error.code === 410) {
        await supabaseAdmin
          .from("google_calendar_connections")
          .update({ sync_token: null })
          .eq("id", connection.id);
        console.log("Sync token expired, cleared for next sync");
      }
      console.error("Calendar API error:", eventsData.error);
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    // Save new sync token
    if (eventsData.nextSyncToken) {
      await supabaseAdmin
        .from("google_calendar_connections")
        .update({ sync_token: eventsData.nextSyncToken })
        .eq("id", connection.id);
    }

    const events = eventsData.items || [];
    console.log(`Processing ${events.length} calendar events`);

    for (const event of events) {
      // Skip cancelled events or events without required data
      if (event.status === "cancelled") {
        // Find and potentially mark gig as cancelled
        const { data: existingGig } = await supabaseAdmin
          .from("gigs")
          .select("id")
          .eq("google_calendar_event_id", event.id)
          .single();

        if (existingGig) {
          await supabaseAdmin
            .from("gigs")
            .update({ status: "cancelled" })
            .eq("id", existingGig.id);
          console.log(`Marked gig ${existingGig.id} as cancelled`);
        }
        continue;
      }

      if (!event.summary || !event.start) continue;

      // Parse event data
      const parsedDesc = parseEventDescription(event.description);
      const parsedLocation = parseLocation(event.location);
      
      // Get date and time
      const startDate = event.start.dateTime 
        ? event.start.dateTime.split('T')[0]
        : event.start.date;
      const startTime = event.start.dateTime 
        ? event.start.dateTime.split('T')[1]?.substring(0, 8)
        : null;
      const endTime = event.end?.dateTime 
        ? event.end.dateTime.split('T')[1]?.substring(0, 8)
        : null;

      // Check if this event is already linked to a gig
      const { data: existingGig } = await supabaseAdmin
        .from("gigs")
        .select("id, updated_at")
        .eq("google_calendar_event_id", event.id)
        .single();

      if (existingGig) {
        // Update existing gig (only if calendar event is newer)
        const eventUpdated = new Date(event.updated);
        const gigUpdated = new Date(existingGig.updated_at);
        
        // Add 5 second buffer to avoid sync loops
        if (eventUpdated > new Date(gigUpdated.getTime() + 5000)) {
          await supabaseAdmin
            .from("gigs")
            .update({
              title: event.summary,
              date: startDate,
              start_time: startTime,
              end_time: endTime,
              venue: parsedLocation.venue,
              city: parsedLocation.city,
              address: parsedLocation.address,
              organizer_name: parsedDesc.organizerName,
              organizer_phone: parsedDesc.organizerPhone,
              organizer_email: parsedDesc.organizerEmail,
              confirmed_amount: parsedDesc.amount,
              notes: parsedDesc.notes,
              status: parsedDesc.status || 'lead',
            })
            .eq("id", existingGig.id);
          
          console.log(`Updated gig ${existingGig.id} from calendar`);
        }
      } else {
        // Create new gig from calendar event
        const { error: insertError } = await supabaseAdmin
          .from("gigs")
          .insert({
            title: event.summary,
            date: startDate,
            start_time: startTime,
            end_time: endTime,
            venue: parsedLocation.venue,
            city: parsedLocation.city,
            address: parsedLocation.address,
            organizer_name: parsedDesc.organizerName,
            organizer_phone: parsedDesc.organizerPhone,
            organizer_email: parsedDesc.organizerEmail,
            confirmed_amount: parsedDesc.amount,
            notes: parsedDesc.notes,
            status: parsedDesc.status || 'lead',
            google_calendar_event_id: event.id,
            created_by: connection.created_by,
          });

        if (insertError) {
          console.error("Failed to create gig:", insertError);
        } else {
          console.log(`Created new gig from calendar event: ${event.summary}`);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, processed: events.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in google-calendar-webhook:", error);
    return new Response(null, { status: 200, headers: corsHeaders });
  }
});
