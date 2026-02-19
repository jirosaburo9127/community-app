import { createClient } from "@/lib/supabase/server";

export type ActivityItem = {
  type: "post" | "comment" | "event_registration";
  id: string;
  title: string;
  link: string;
  created_at: string;
};

export async function getActivity(userId: string): Promise<ActivityItem[]> {
  const supabase = await createClient();

  const [postsRes, commentsRes, registrationsRes] = await Promise.all([
    supabase
      .from("posts")
      .select("id, title, created_at")
      .eq("author_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("comments")
      .select("id, body, created_at, post_id, posts(title)")
      .eq("author_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("event_registrations")
      .select("id, created_at, event_id, events(title)")
      .eq("user_id", userId)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const items: ActivityItem[] = [];

  for (const post of postsRes.data ?? []) {
    items.push({
      type: "post",
      id: post.id,
      title: post.title,
      link: `/posts/${post.id}`,
      created_at: post.created_at,
    });
  }

  for (const comment of commentsRes.data ?? []) {
    const postTitle = (comment.posts as any)?.title ?? "投稿";
    items.push({
      type: "comment",
      id: comment.id,
      title: postTitle,
      link: `/posts/${comment.post_id}`,
      created_at: comment.created_at,
    });
  }

  for (const reg of registrationsRes.data ?? []) {
    const eventTitle = (reg.events as any)?.title ?? "イベント";
    items.push({
      type: "event_registration",
      id: reg.id,
      title: eventTitle,
      link: `/events/${reg.event_id}`,
      created_at: reg.created_at,
    });
  }

  items.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return items.slice(0, 30);
}
