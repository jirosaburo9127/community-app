import type { Profile } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export function ConversationItem({
  conversationId,
  otherUser,
  lastMessage,
  lastMessageAt,
  unreadCount,
}: {
  conversationId: string;
  otherUser: Profile;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}) {
  const timeAgo = formatDistanceToNow(new Date(lastMessageAt), {
    addSuffix: true,
    locale: ja,
  });

  return (
    <Link
      href={`/messages/${conversationId}`}
      className={`flex items-center gap-3 rounded-xl border border-border p-3.5 transition-all hover:shadow-md ${
        unreadCount > 0 ? "bg-primary/3 border-primary/20" : "bg-white"
      }`}
    >
      {otherUser.avatar_url ? (
        <Image
          src={otherUser.avatar_url}
          alt={otherUser.display_name}
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
          {otherUser.display_name.charAt(0)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {otherUser.display_name}
          </span>
          <span className="shrink-0 text-[11px] text-gray-400">{timeAgo}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-muted truncate">{lastMessage}</p>
          {unreadCount > 0 && (
            <span className="ml-2 flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
