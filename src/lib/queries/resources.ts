import { createClient } from "@/lib/supabase/server";

export async function getResources(category?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("resources")
    .select("*, profiles(*)")
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch resources:", error.message);
    return [];
  }
  return data;
}

export async function getResource(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*, profiles(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}
