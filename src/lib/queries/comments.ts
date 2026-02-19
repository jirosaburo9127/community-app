import { createClient } from "@/lib/supabase/server";

export async function getComments(postId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles(*)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}
