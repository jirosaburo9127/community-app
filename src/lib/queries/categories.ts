import { createClient } from "@/lib/supabase/server";
import { createTTLCache } from "@/lib/cache";

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

export const getCategories = createTTLCache(fetchCategories, 60_000);
