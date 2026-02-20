import { cn } from "@/lib/utils";
import { getCategoryColor } from "@/lib/constants";
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
  const color = getCategoryColor(category.slug);

  return (
    <section className={cn("rounded-2xl p-4", color.bg)}>
      {/* カテゴリ見出し */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-8 w-1.5 rounded-full bg-gradient-to-b",
              color.gradient
            )}
          />
          <span className="text-lg">{category.icon_emoji}</span>
          <h2 className={cn("text-base font-bold", color.text)}>
            {category.name}
          </h2>
          <span className="text-xs text-muted">({posts.length})</span>
        </div>
        <Link
          href={`/home?category=${category.slug}`}
          className={cn(
            "flex items-center gap-0.5 text-xs font-medium transition-colors hover:opacity-80",
            color.text
          )}
        >
          もっと見る
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* 投稿リスト */}
      <div className="divide-y divide-black/5">
        {posts.map((post) => {
          const reactions = reactionsMap.get(post.id);
          return (
            <FeedItem
              key={post.id}
              post={post}
              reactions={reactions}
              accentColor={color.text}
            />
          );
        })}
      </div>
    </section>
  );
}

function FeedItem({
  post,
  reactions,
  accentColor,
}: {
  post: Post;
  reactions?: ReactionCount[];
  accentColor: string;
}) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ja,
  });

  const hasImage = !!post.image_urls?.[0];

  return (
    <Link
      href={`/posts/${post.id}`}
      className="flex gap-3 py-3 transition-colors first:pt-0 last:pb-0 hover:opacity-80"
    >
      {/* テキスト部分 */}
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold leading-snug text-gray-900 line-clamp-2">
          {post.title}
        </h3>
        <p className="mt-0.5 text-xs leading-relaxed text-gray-500 line-clamp-1">
          {post.body}
        </p>

        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted">
          <div className="flex items-center gap-1">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-[8px] font-bold text-white">
              {post.profiles?.display_name?.charAt(0) ?? "?"}
            </div>
            <span className="max-w-[72px] truncate font-medium">
              {post.profiles?.display_name}
            </span>
          </div>
          <span className="text-gray-400">{timeAgo}</span>
          {(post.comment_count ?? 0) > 0 && (
            <span className="flex items-center gap-0.5 text-gray-400">
              <MessageCircle size={10} /> {post.comment_count}
            </span>
          )}
          {reactions && reactions.length > 0 && (
            <span className="text-gray-400">
              {reactions.map((r) => r.emoji).join("")}
            </span>
          )}
        </div>
      </div>

      {/* サムネイル */}
      {hasImage && (
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src={post.image_urls[0]}
            alt={post.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      )}
    </Link>
  );
}
