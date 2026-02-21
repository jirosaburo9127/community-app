import { createClient } from "@/lib/supabase/server";
import { createTTLCache } from "@/lib/cache";
import type { Profile } from "@/lib/types";

async function fetchRanking(): Promise<Profile[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("total_points", { ascending: false })
    .limit(10);

  return data ?? [];
}

export const getRanking = createTTLCache(fetchRanking, 60_000);
