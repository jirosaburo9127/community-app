import { createClient } from "@/lib/supabase/server";

export async function getEvents({
  year,
  month,
}: {
  year?: number;
  month?: number;
} = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("events")
    .select("*, profiles(*)")
    .order("event_date", { ascending: true });

  if (year && month) {
    const start = new Date(year, month - 1, 1).toISOString();
    const end = new Date(year, month, 1).toISOString();
    query = query.gte("event_date", start).lt("event_date", end);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch events:", error.message);
    return [];
  }
  return data;
}

export async function getUpcomingEvents(limit = 5) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("events")
    .select("*, profiles(*)")
    .gte("event_date", now)
    .order("event_date", { ascending: true })
    .limit(limit);

  if (error) return [];
  return data;
}

export async function getEvent(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, profiles(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function getEventRegistrations(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_registrations")
    .select("*, profiles(*)")
    .eq("event_id", eventId)
    .eq("status", "registered")
    .order("created_at", { ascending: true });

  if (error) return [];
  return data;
}
