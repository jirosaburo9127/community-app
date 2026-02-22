import type { Post } from "@/lib/types";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export function PostCard({
  post,
}: {
  post: Post;
}) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ja,
  });

  return (
    <Link
      href={`/posts/${post.id}`}
      className="mb-3 block break-inside-avoid overflow-hidden rounded-lg bg-white border border-border transition-all hover:shadow-md hover:shadow-gray-200/50"
    >
      {post.image_urls?.[0] && (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={post.image_urls[0]}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-2.5">
        <h3 className="text-[13px] font-bold leading-snug text-gray-900 line-clamp-2">
          {post.title}
        </h3>
        <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{post.body}</p>
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-gray-400">
          <span className="max-w-[72px] truncate font-medium text-gray-500">
            {post.profiles?.display_name}
          </span>
          <span>·</span>
          <span>{timeAgo}</span>
          {(post.comment_count ?? 0) > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <MessageCircle size={10} /> {post.comment_count}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
