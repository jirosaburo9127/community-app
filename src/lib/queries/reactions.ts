import { createClient } from "@/lib/supabase/server";

export type ReactionCount = {
  emoji: string;
  count: number;
  reacted: boolean;
};

export async function getReactionsForPost(postId: string): Promise<ReactionCount[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: reactions } = await supabase
    .from("reactions")
    .select("emoji, user_id")
    .eq("post_id", postId);

  if (!reactions) return [];

  // Group by emoji
  const emojiMap = new Map<string, { count: number; reacted: boolean }>();
  for (const r of reactions) {
    const existing = emojiMap.get(r.emoji) ?? { count: 0, reacted: false };
    existing.count++;
    if (user && r.user_id === user.id) existing.reacted = true;
    emojiMap.set(r.emoji, existing);
  }

  return Array.from(emojiMap.entries()).map(([emoji, { count, reacted }]) => ({
    emoji,
    count,
    reacted,
  }));
}

export async function getReactionsForPosts(postIds: string[]): Promise<Map<string, ReactionCount[]>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: reactions } = await supabase
    .from("reactions")
    .select("emoji, user_id, post_id")
    .in("post_id", postIds);

  const result = new Map<string, ReactionCount[]>();
  if (!reactions) return result;

  // Group by post_id, then by emoji
  const postEmojiMap = new Map<string, Map<string, { count: number; reacted: boolean }>>();
  for (const r of reactions) {
    if (!postEmojiMap.has(r.post_id)) postEmojiMap.set(r.post_id, new Map());
    const emojiMap = postEmojiMap.get(r.post_id)!;
    const existing = emojiMap.get(r.emoji) ?? { count: 0, reacted: false };
    existing.count++;
    if (user && r.user_id === user.id) existing.reacted = true;
    emojiMap.set(r.emoji, existing);
  }

  for (const [postId, emojiMap] of postEmojiMap) {
    result.set(
      postId,
      Array.from(emojiMap.entries()).map(([emoji, { count, reacted }]) => ({
        emoji,
        count,
        reacted,
      }))
    );
  }

  return result;
}
