import { createClient } from "@/lib/supabase/server";

// カテゴリデータのインメモリキャッシュ（プロセス単位、60秒）
let cachedCategories: { data: Awaited<ReturnType<typeof fetchCategories>>; expiry: number } | null = null;

async function fetchCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  if (error) {
    console.error("Failed to fetch categories:", error.message);
    return [];
  }
  return data;
}

export async function getCategories() {
  const now = Date.now();
  if (cachedCategories && cachedCategories.expiry > now) {
    return cachedCategories.data;
  }
  const data = await fetchCategories();
  cachedCategories = { data, expiry: now + 60_000 };
  return data;
}
