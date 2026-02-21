import { createClient } from "@/lib/supabase/server";

export async function getPollByPostId(postId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("polls")
    .select("*, poll_options(*)")
    .eq("post_id", postId)
    .single();

  if (error) return null;
  return data;
}

export async function getUserVote(pollId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("poll_votes")
    .select("*, poll_options!inner(poll_id)")
    .eq("poll_options.poll_id", pollId)
    .eq("user_id", user.id)
    .maybeSingle();

  return data;
}

export async function getPollsForPosts(postIds: string[]) {
  if (postIds.length === 0) return new Set<string>();

  const supabase = await createClient();
  const { data } = await supabase
    .from("polls")
    .select("post_id")
    .in("post_id", postIds);

  return new Set((data ?? []).map((p) => p.post_id));
}
