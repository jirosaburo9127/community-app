import { getConversation, getMessages } from "@/lib/queries/messages";
import { MessageThread } from "@/components/messages/message-thread";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const conversation = await getConversation(conversationId);
  if (!conversation) notFound();

  // Verify the current user is a participant
  if (
    conversation.participant1 !== user.id &&
    conversation.participant2 !== user.id
  ) {
    notFound();
  }

  // Get the other user's profile
  const otherUserId =
    conversation.participant1 === user.id
      ? conversation.participant2
      : conversation.participant1;

  const { data: otherUser } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", otherUserId)
    .single();

  const messages = await getMessages(conversationId);

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col rounded-xl border border-border bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link
          href="/messages"
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
        >
          <ArrowLeft size={18} className="text-muted" />
        </Link>
        {otherUser?.avatar_url ? (
          <Image
            src={otherUser.avatar_url}
            alt={otherUser.display_name}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
            {otherUser?.display_name?.charAt(0) ?? "?"}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {otherUser?.display_name}
          </p>
        </div>
      </div>

      {/* Thread */}
      <MessageThread
        conversationId={conversationId}
        currentUserId={user.id}
        initialMessages={messages as any}
      />
    </div>
  );
}
