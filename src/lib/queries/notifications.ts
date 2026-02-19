import { createClient } from "@/lib/supabase/server";

export async function getNotifications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*, profiles:actor_id(*), posts:post_id(id, title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to fetch notifications:", error.message);
    return [];
  }
  return data;
}

export async function getUnreadNotificationCount() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_unread_notification_count");

  if (error) {
    console.error("Failed to fetch unread count:", error.message);
    return 0;
  }
  return data ?? 0;
}
