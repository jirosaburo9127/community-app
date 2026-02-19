import { createClient } from "@/lib/supabase/server";

export async function getStartups() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("startups")
    .select("*, profiles(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch startups:", error.message);
    return [];
  }
  return data;
}

export async function getStartup(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("startups")
    .select("*, profiles(*)")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function getStartupMembers(startupId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("startup_members")
    .select("*, profiles(*)")
    .eq("startup_id", startupId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data;
}
