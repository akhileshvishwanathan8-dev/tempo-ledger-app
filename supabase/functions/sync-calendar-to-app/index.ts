import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify user is authenticated and is app_admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    // Check if user is app_admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (roleData?.role !== "app_admin") {
      return new Response(JSON.stringify({ error: "Only app admins can sync from calendar" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      return new Response(JSON.stringify({ error: "Google Calendar not connected" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let accessToken = connection.access_token;

    // Refresh token if expired
    if (new Date(connection.token_expires_at) <= new Date()) {
      const refreshed = await refreshAccessToken(connection.refresh_token);
      if (!refreshed) {
        return new Response(JSON.stringify({ error: "Failed to refresh access token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      accessToken = refreshed.access_token;
      const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

      await supabaseAdmin
        .from("google_calendar_connections")
        .update({ access_token: accessToken, token_expires_at: newExpiry })
        .eq("id", connection.id);
    }

    // Fetch events from the next 90 days and past 30 days
    const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const timeMax = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    
    const eventsUrl = `https://www.googleapis.com/calendar/v3/calendars/${connection.calendar_id}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

    const eventsResponse = await fetch(eventsUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const eventsData = await eventsResponse.json();

    if (eventsData.error) {
      console.error("Calendar API error:", eventsData.error);
      return new Response(JSON.stringify({ error: eventsData.error.message || "Failed to fetch calendar" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const events = eventsData.items || [];
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const event of events) {
      // Skip cancelled events or events without required data
      if (event.status === "cancelled" || !event.summary || !event.start) {
        skipped++;
        continue;
      }

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
        // Update existing gig if calendar event is newer
        const eventUpdated = new Date(event.updated);
        const gigUpdated = new Date(existingGig.updated_at);
        
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
              status: parsedDesc.status || undefined,
            })
            .eq("id", existingGig.id);
          
          updated++;
        } else {
          skipped++;
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
          skipped++;
        } else {
          created++;
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      total: events.length,
      created,
      updated,
      skipped,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in sync-calendar-to-app:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
