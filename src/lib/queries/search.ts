import { createClient } from "@/lib/supabase/server";

export async function searchPosts(q: string) {
  const supabase = await createClient();
  const pattern = `%${q}%`;

  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles(*), categories(*)")
    .is("group_id", null)
    .or(`title.ilike.${pattern},body.ilike.${pattern}`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Failed to search posts:", error.message);
    return [];
  }
  return data;
}

export async function searchMembers(q: string) {
  const supabase = await createClient();
  const pattern = `%${q}%`;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .or(`display_name.ilike.${pattern},company.ilike.${pattern},bio.ilike.${pattern}`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Failed to search members:", error.message);
    return [];
  }
  return data;
}
