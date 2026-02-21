import type { Notification } from "@/lib/types";
import { MessageCircle, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

const typeConfig = {
  comment: {
    icon: MessageCircle,
    label: "がコメントしました",
    color: "text-teal-500",
  },
  reaction: {
    icon: Heart,
    label: "がリアクションしました",
    color: "text-orange-400",
  },
} as const;

export function NotificationItem({
  notification,
}: {
  notification: Notification;
}) {
  const config = typeConfig[notification.type] ?? typeConfig.comment;
  const Icon = config.icon;
  const actor = notification.profiles;
  const post = notification.posts;

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: ja,
  });

  const href = post ? `/posts/${post.id}` : "#";

  return (
    <Link
      href={href}
      className={`flex items-start gap-3 rounded-xl border border-border p-3.5 transition-all hover:shadow-md ${
        notification.is_read ? "bg-white" : "bg-primary/3 border-primary/20"
      }`}
    >
      {/* Unread dot */}
      <div className="mt-1.5 shrink-0">
        {!notification.is_read ? (
          <div className="h-2 w-2 rounded-full bg-primary" />
        ) : (
          <div className="h-2 w-2" />
        )}
      </div>

      {/* Actor avatar */}
      {actor?.avatar_url ? (
        <Image
          src={actor.avatar_url}
          alt={actor.display_name}
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {actor?.display_name?.charAt(0) ?? "?"}
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-900">
          <span className="font-semibold">{actor?.display_name}</span>
          <span className="text-muted">{config.label}</span>
        </p>
        {post && (
          <p className="mt-0.5 text-xs text-muted truncate">
            {post.title}
          </p>
        )}
        <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
          <Icon size={12} className={config.color} />
          <span>{timeAgo}</span>
        </div>
      </div>
    </Link>
  );
}
