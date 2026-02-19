import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getRanking(limit = 10): Promise<Profile[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("total_points", { ascending: false })
    .limit(limit);

  return data ?? [];
}
