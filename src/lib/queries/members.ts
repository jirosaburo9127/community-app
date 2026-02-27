import { createClient } from "@/lib/supabase/server";
import type { ProfileRole } from "@/lib/types";

function escapeIlike(input: string): string {
  return input.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

export async function getMembers({
  role,
  search,
}: {
  role?: ProfileRole;
  search?: string;
} = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (role) {
    query = query.eq("role", role);
  }

  if (search) {
    const escaped = escapeIlike(search);
    query = query.or(
      `display_name.ilike.%${escaped}%,company.ilike.%${escaped}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch members:", error.message);
    return [];
  }
  return data;
}

export async function getMember(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}
