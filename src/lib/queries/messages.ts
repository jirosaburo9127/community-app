import { createClient } from "@/lib/supabase/server";

export async function getConversations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .or(`participant1.eq.${user.id},participant2.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch conversations:", error.message);
    return [];
  }

  if (data.length === 0) return [];

  // Batch fetch: other user profiles, last messages, and unread counts
  const otherUserIds = data.map((conv) =>
    conv.participant1 === user.id ? conv.participant2 : conv.participant1
  );
  const convIds = data.map((c) => c.id);

  const [profilesResult, messagesResult, unreadResult] = await Promise.all([
    supabase.from("profiles").select("*").in("id", otherUserIds),
    supabase
      .from("direct_messages")
      .select("conversation_id, body, created_at")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("direct_messages")
      .select("conversation_id")
      .in("conversation_id", convIds)
      .eq("is_read", false)
      .neq("sender_id", user.id),
  ]);

  const profileMap = new Map(
    (profilesResult.data ?? []).map((p) => [p.id, p])
  );

  // Get only the latest message per conversation
  const lastMessageMap = new Map<string, string>();
  for (const msg of messagesResult.data ?? []) {
    if (!lastMessageMap.has(msg.conversation_id)) {
      lastMessageMap.set(msg.conversation_id, msg.body);
    }
  }

  // Count unread per conversation
  const unreadCountMap = new Map<string, number>();
  for (const msg of unreadResult.data ?? []) {
    unreadCountMap.set(
      msg.conversation_id,
      (unreadCountMap.get(msg.conversation_id) ?? 0) + 1
    );
  }

  return data.map((conv) => {
    const otherUserId =
      conv.participant1 === user.id ? conv.participant2 : conv.participant1;
    return {
      ...conv,
      other_user: profileMap.get(otherUserId),
      last_message: lastMessageMap.get(conv.id) ?? "",
      unread_count: unreadCountMap.get(conv.id) ?? 0,
    };
  });
}

export async function getMessages(conversationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("direct_messages")
    .select("*, profiles:sender_id(*)")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch messages:", error.message);
    return [];
  }
  return data;
}

export async function getConversation(conversationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();

  if (error) return null;
  return data;
}

export async function findConversation(userId1: string, userId2: string) {
  const supabase = await createClient();
  const [p1, p2] = userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

  const { data } = await supabase
    .from("conversations")
    .select("id")
    .eq("participant1", p1)
    .eq("participant2", p2)
    .maybeSingle();

  return data?.id ?? null;
}

export async function getUnreadMessageCount() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_unread_message_count");

  if (error) {
    console.error("Failed to fetch unread message count:", error.message);
    return 0;
  }
  return data ?? 0;
}
