import { getConversations } from "@/lib/queries/messages";
import { ConversationItem } from "@/components/messages/conversation-item";
import { MessageCircle } from "lucide-react";

export default async function MessagesPage() {
  const conversations = await getConversations();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center gap-2">
        <MessageCircle size={20} className="text-primary" />
        <h1 className="text-xl font-bold text-gray-900">メッセージ</h1>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <MessageCircle size={48} className="mb-3 text-gray-300" />
          <p className="text-sm text-muted">
            まだメッセージはありません
          </p>
          <p className="mt-1 text-xs text-gray-400">
            メンバーのプロフィールからメッセージを送れます
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv: any) => (
            <ConversationItem
              key={conv.id}
              conversationId={conv.id}
              otherUser={conv.other_user}
              lastMessage={conv.last_message}
              lastMessageAt={conv.last_message_at}
              unreadCount={conv.unread_count}
            />
          ))}
        </div>
      )}
    </div>
  );
}
