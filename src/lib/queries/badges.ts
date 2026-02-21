import { createClient } from "@/lib/supabase/server";

export async function getUserBadges(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_badges")
    .select("*, badge_definitions(*)")
    .eq("user_id", userId)
    .order("earned_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch user badges:", error.message);
    return [];
  }
  return data;
}
