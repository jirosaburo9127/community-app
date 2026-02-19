import { createClient } from "@/lib/supabase/server";
import { POSTS_PER_PAGE } from "@/lib/constants";

export async function getGroups() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("groups")
    .select("*, profiles(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch groups:", error.message);
    return [];
  }

  // Get member counts
  const groupIds = data.map((g) => g.id);
  if (groupIds.length === 0) return data;

  const { data: counts } = await supabase
    .from("group_members")
    .select("group_id")
    .in("group_id", groupIds);

  const countMap = new Map<string, number>();
  counts?.forEach((c) => {
    countMap.set(c.group_id, (countMap.get(c.group_id) ?? 0) + 1);
  });

  return data.map((g) => ({ ...g, member_count: countMap.get(g.id) ?? 0 }));
}

export async function getGroup(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("groups")
    .select("*, profiles(*)")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function getGroupMembers(groupId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_members")
    .select("*, profiles(*)")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data;
}

export async function getGroupPosts(groupId: string, cursor?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select("*, profiles(*), categories(*)")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(POSTS_PER_PAGE);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch group posts:", error.message);
    return [];
  }
  return data;
}

export async function getGroupByStartupId(startupId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("startup_id", startupId)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function getUserGroups(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_members")
    .select("group_id, groups(*, profiles(*))")
    .eq("user_id", userId);

  if (error) return [];
  return data.map((d) => d.groups).filter(Boolean);
}
