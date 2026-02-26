import { createClient } from "@/lib/supabase/server";
import { createTTLCache } from "@/lib/cache";
import { POSTS_PER_PAGE } from "@/lib/constants";
import { getCategories } from "./categories";

const POST_LIST_SELECT = "*, profiles(*), categories(*)";

// カテゴリslug→idのマッピング（キャッシュ済みカテゴリを利用）
async function getCategoryIdBySlug(slug: string): Promise<number | null> {
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === slug);
  return cat?.id ?? null;
}

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
    .select(POST_LIST_SELECT)
    .is("group_id", null)
    .order("created_at", { ascending: false })
    .limit(POSTS_PER_PAGE);

  if (categorySlug) {
    const categoryId = await getCategoryIdBySlug(categorySlug);
    if (categoryId) {
      query = query.eq("category_id", categoryId);
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
  const categoryId = await getCategoryIdBySlug("events");
  if (!categoryId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_LIST_SELECT)
    .eq("category_id", categoryId)
    .is("group_id", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data;
}

async function fetchPinnedAnnouncements() {
  const categoryId = await getCategoryIdBySlug("management");
  if (!categoryId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, title")
    .eq("category_id", categoryId)
    .eq("is_pinned", true)
    .is("group_id", null)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) return [];
  return data;
}

export const getPinnedAnnouncements = createTTLCache(fetchPinnedAnnouncements, 60_000);

async function fetchRecentPostsByCategory() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(POST_LIST_SELECT)
    .is("group_id", null)
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) {
    console.error("Failed to fetch recent posts:", error.message);
    return [];
  }
  return data;
}

export const getRecentPostsByCategory = createTTLCache(fetchRecentPostsByCategory, 30_000);

async function fetchFeaturedPosts() {
  const supabase = await createClient();

  // 直近7日間でいいね+コメントが多い投稿
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { data, error } = await supabase
    .from("posts")
    .select(POST_LIST_SELECT)
    .is("group_id", null)
    .gte("created_at", since.toISOString())
    .order("like_count", { ascending: false })
    .order("comment_count", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Failed to fetch featured posts:", error.message);
    return [];
  }
  return data;
}

export const getFeaturedPosts = createTTLCache(fetchFeaturedPosts, 60_000);

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
