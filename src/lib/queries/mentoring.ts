import { createClient } from "@/lib/supabase/server";

export async function getMentors(expertise?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("mentor_profiles")
    .select("*, profiles(*)")
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  if (expertise) {
    query = query.contains("expertise_areas", [expertise]);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch mentors:", error.message);
    return [];
  }

  // 各メンターの受入済み数を取得
  const mentorIds = data.map((m) => m.id);
  if (mentorIds.length === 0) return [];

  const { data: counts } = await supabase
    .from("mentoring_requests")
    .select("mentor_id")
    .in("mentor_id", mentorIds)
    .eq("status", "accepted");

  const countMap = new Map<string, number>();
  counts?.forEach((r) => {
    countMap.set(r.mentor_id, (countMap.get(r.mentor_id) || 0) + 1);
  });

  return data.map((m) => ({ ...m, accepted_count: countMap.get(m.id) || 0 }));
}

export async function getMentor(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mentor_profiles")
    .select("*, profiles(*)")
    .eq("id", id)
    .single();

  if (error) return null;

  const { count } = await supabase
    .from("mentoring_requests")
    .select("*", { count: "exact", head: true })
    .eq("mentor_id", id)
    .eq("status", "accepted");

  return { ...data, accepted_count: count || 0 };
}

export async function getMyMentorProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("mentor_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return data;
}

export async function getMyMentoringRequests() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // 自分がメンターとして受けたリクエスト
  const { data: mentorProfile } = await supabase
    .from("mentor_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!mentorProfile) return [];

  const { data, error } = await supabase
    .from("mentoring_requests")
    .select("*, profiles(*)")
    .eq("mentor_id", mentorProfile.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}

export async function getMySentRequests() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("mentoring_requests")
    .select("*, mentor_profiles(*, profiles(*))")
    .eq("mentee_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}
