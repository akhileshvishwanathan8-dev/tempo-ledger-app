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
      return new Response(JSON.stringify({ error: "Only app admins can sync to calendar" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { gig_id } = await req.json();

    if (!gig_id) {
      return new Response(JSON.stringify({ error: "Missing gig_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the gig details
    const { data: gig, error: gigError } = await supabaseAdmin
      .from("gigs")
      .select("*")
      .eq("id", gig_id)
      .single();

    if (gigError || !gig) {
      return new Response(JSON.stringify({ error: "Gig not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get calendar connection (any app_admin's connection)
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

    // Check if token needs refresh
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

    // Build calendar event
    const startDateTime = gig.start_time 
      ? `${gig.date}T${gig.start_time}` 
      : `${gig.date}T09:00:00`;
    const endDateTime = gig.end_time 
      ? `${gig.date}T${gig.end_time}` 
      : `${gig.date}T23:00:00`;

    const event = {
      summary: gig.title,
      location: `${gig.venue}, ${gig.city}${gig.address ? `, ${gig.address}` : ""}`,
      description: [
        gig.organizer_name ? `Organizer: ${gig.organizer_name}` : "",
        gig.organizer_phone ? `Phone: ${gig.organizer_phone}` : "",
        gig.organizer_email ? `Email: ${gig.organizer_email}` : "",
        gig.confirmed_amount ? `Amount: ₹${gig.confirmed_amount.toLocaleString()}` : (gig.quoted_amount ? `Quoted: ₹${gig.quoted_amount.toLocaleString()}` : ""),
        gig.notes ? `Notes: ${gig.notes}` : "",
        "",
        `Status: ${gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}`,
      ].filter(Boolean).join("\n"),
      start: {
        dateTime: startDateTime,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endDateTime,
        timeZone: "Asia/Kolkata",
      },
      colorId: gig.status === "confirmed" ? "10" : gig.status === "lead" ? "5" : "8",
    };

    let calendarResponse;

    if (gig.google_calendar_event_id) {
      // Update existing event
      calendarResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${connection.calendar_id}/events/${gig.google_calendar_event_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );
    } else {
      // Create new event
      calendarResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${connection.calendar_id}/events`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );
    }

    const calendarData = await calendarResponse.json();

    if (calendarData.error) {
      console.error("Calendar API error:", calendarData.error);
      return new Response(JSON.stringify({ error: calendarData.error.message || "Failed to sync to calendar" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update gig with calendar event ID
    if (!gig.google_calendar_event_id) {
      await supabaseAdmin
        .from("gigs")
        .update({ google_calendar_event_id: calendarData.id })
        .eq("id", gig_id);
    }

    return new Response(JSON.stringify({ success: true, eventId: calendarData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in sync-gig-to-calendar:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
