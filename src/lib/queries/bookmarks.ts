import { createClient } from "@/lib/supabase/server";

export async function isBookmarked(postId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .single();

  return !!data;
}

export async function getBookmarkedPosts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("bookmarks")
    .select("post_id, posts(*, profiles(*), categories(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data?.map((b) => b.posts).filter(Boolean) ?? [];
}
