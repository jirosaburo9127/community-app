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

  // Fetch other user profiles and last message for each conversation
  const enriched = await Promise.all(
    data.map(async (conv) => {
      const otherUserId =
        conv.participant1 === user.id ? conv.participant2 : conv.participant1;

      const [profileResult, messageResult, unreadResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", otherUserId)
          .single(),
        supabase
          .from("direct_messages")
          .select("body")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("direct_messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .eq("is_read", false)
          .neq("sender_id", user.id),
      ]);

      return {
        ...conv,
        other_user: profileResult.data,
        last_message: messageResult.data?.body ?? "",
        unread_count: unreadResult.count ?? 0,
      };
    })
  );

  return enriched;
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
