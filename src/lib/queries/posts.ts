import { createClient } from "@/lib/supabase/server";
import { POSTS_PER_PAGE } from "@/lib/constants";

export async function getPosts({
  categorySlug,
  cursor,
}: {
  categorySlug?: string;
  cursor?: string;
} = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select("*, profiles(*), categories(*)")
    .is("group_id", null)
    .order("created_at", { ascending: false })
    .limit(POSTS_PER_PAGE);

  if (categorySlug) {
    // First get the category id from slug
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (category) {
      query = query.eq("category_id", category.id);
    }
  }

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch posts:", error.message);
    return [];
  }
  return data;
}

export async function getEventPosts(limit = 5) {
  const supabase = await createClient();

  const { data: category, error: catError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "events")
    .maybeSingle();

  if (catError || !category) return [];

  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles(*), categories(*)")
    .eq("category_id", category.id)
    .is("group_id", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data;
}

export async function getPinnedAnnouncements() {
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "management")
    .maybeSingle();

  if (!category) return [];

  const { data, error } = await supabase
    .from("posts")
    .select("id, title")
    .eq("category_id", category.id)
    .eq("is_pinned", true)
    .is("group_id", null)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) return [];
  return data;
}

export async function getPost(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles(*), categories(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
