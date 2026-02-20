import { createClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";

export const getCategories = unstable_cache(
  async () => {
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
  },
  ["categories"],
  { revalidate: 3600 }
);
