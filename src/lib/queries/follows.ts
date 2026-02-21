import { createClient } from "@/lib/supabase/server";

export async function isFollowing(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .maybeSingle();

  return !!data;
}

export async function getFollowCounts(userId: string) {
  const supabase = await createClient();

  const [{ count: followerCount }, { count: followingCount }] = await Promise.all([
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId),
  ]);

  return {
    followers: followerCount ?? 0,
    following: followingCount ?? 0,
  };
}

export async function getFollowingIds() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  return (data ?? []).map((f) => f.following_id);
}
