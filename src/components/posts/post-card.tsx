import { cn } from "@/lib/utils";
import { getCategoryColor } from "@/lib/constants";
import type { Post } from "@/lib/types";
import type { ReactionCount } from "@/lib/queries/reactions";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export function PostCard({
  post,
  reactions,
}: {
  post: Post;
  reactions?: ReactionCount[];
}) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ja,
  });

  const catColor = getCategoryColor(post.categories?.slug);

  return (
    <Link
      href={`/posts/${post.id}`}
      className="mb-4 block break-inside-avoid overflow-hidden rounded-xl bg-white border border-border transition-all hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-0.5"
    >
      {post.image_urls?.[0] ? (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={post.image_urls[0]}
            alt={post.title}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className={cn("h-1.5 bg-gradient-to-r", catColor.gradient)} />
      )}
      <div className="p-3.5">
        {post.categories && (
          <span className={cn("mb-1.5 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium", catColor.bg, catColor.text)}>
            <span>{post.categories.icon_emoji}</span>
            {post.categories.name}
          </span>
        )}
        <h3 className="mb-1 text-sm font-bold leading-snug text-gray-900 line-clamp-2">
          {post.title}
        </h3>
        <p className="mb-2.5 text-xs leading-relaxed text-gray-500 line-clamp-2">{post.body}</p>

        {reactions && reactions.length > 0 && (
          <div className="mb-2.5 flex flex-wrap gap-1">
            {reactions.map((r) => (
              <span
                key={r.emoji}
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px]",
                  r.reacted
                    ? "border-primary/30 bg-primary/8 text-primary"
                    : "border-gray-100 bg-gray-50 text-gray-500"
                )}
              >
                {r.emoji} {r.count}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-[10px] font-bold text-white">
              {post.profiles?.display_name?.charAt(0) ?? "?"}
            </div>
            <span className="max-w-[80px] truncate font-medium">
              {post.profiles?.display_name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="flex items-center gap-0.5">
              <MessageCircle size={11} /> {post.comment_count}
            </span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
