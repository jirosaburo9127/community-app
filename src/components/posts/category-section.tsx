import type { Category, Post } from "@/lib/types";
import type { ReactionCount } from "@/lib/queries/reactions";
import { ChevronRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export function CategorySection({
  category,
  posts,
  reactionsMap,
}: {
  category: Category;
  posts: Post[];
  reactionsMap: Map<string, ReactionCount[]>;
}) {
  return (
    <section className="p-4">
      {/* カテゴリ見出し */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{category.icon_emoji}</span>
          <h2 className="text-xl font-bold text-gray-900">
            {category.name}
          </h2>
          <span className="text-xs text-muted">({posts.length})</span>
        </div>
        <Link
          href={`/home?category=${category.slug}`}
          className="flex items-center gap-0.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          もっと見る
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* SNSタイムライン風 */}
      <div className="space-y-2">
        {posts.map((post) => (
          <FeedItem
            key={post.id}
            post={post}
            reactions={reactionsMap.get(post.id)}
          />
        ))}
      </div>
    </section>
  );
}

function FeedItem({
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

  const hasImage = !!post.image_urls?.[0];

  return (
    <Link
      href={`/posts/${post.id}`}
      className="flex gap-3 rounded-lg border border-border bg-white p-2.5 transition-all hover:shadow-md"
    >
      {/* 画像サムネイル */}
      {hasImage && (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
          <Image
            src={post.image_urls[0]}
            alt={post.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h3 className="text-[13px] font-bold leading-snug text-gray-900 line-clamp-2">
          {post.title}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-400">
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
