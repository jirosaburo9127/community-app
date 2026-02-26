import { createStaticClient } from "@/lib/supabase/static";
import { createTTLCache } from "@/lib/cache";

async function fetchCategories() {
  const supabase = createStaticClient();
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

export const getCategories = createTTLCache(fetchCategories, 60_000);
