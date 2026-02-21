import { createClient } from "@/lib/supabase/server";

function getWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return { start: monday.toISOString(), end: now.toISOString() };
}

export async function getWeeklyStats() {
  const supabase = await createClient();
  const { start } = getWeekRange();

  const [{ count: postCount }, { count: commentCount }, { count: newMemberCount }] =
    await Promise.all([
      supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .gte("created_at", start)
        .is("group_id", null),
      supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .gte("created_at", start),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", start),
    ]);

  return {
    posts: postCount ?? 0,
    comments: commentCount ?? 0,
    newMembers: newMemberCount ?? 0,
  };
}

export async function getTopPosts(limit = 5) {
  const supabase = await createClient();
  const { start } = getWeekRange();

  const { data } = await supabase
    .from("posts")
    .select("*, profiles(*), categories(*)")
    .gte("created_at", start)
    .is("group_id", null)
    .order("comment_count", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getNewMembers(limit = 10) {
  const supabase = await createClient();
  const { start } = getWeekRange();

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, role, company")
    .gte("created_at", start)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getDigestUpcomingEvents(limit = 5) {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data } = await supabase
    .from("events")
    .select("*, profiles(*)")
    .gte("event_date", now)
    .order("event_date", { ascending: true })
    .limit(limit);

  return data ?? [];
}
