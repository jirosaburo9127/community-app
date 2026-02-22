import { cn } from "@/lib/utils";
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
      <div className="space-y-3">
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
      className="block rounded-xl border border-border bg-white p-3.5 transition-all hover:shadow-md"
    >
      {/* ヘッダー: アバター + 名前 + 時刻 */}
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
          {post.profiles?.display_name?.charAt(0) ?? "?"}
        </div>
        <span className="text-sm font-semibold text-gray-800">
          {post.profiles?.display_name}
        </span>
        <span className="text-xs text-gray-400">{timeAgo}</span>
      </div>

      {/* タイトル + 本文 */}
      <h3 className="text-sm font-bold leading-snug text-gray-900 line-clamp-2">
        {post.title}
      </h3>
      <p className="mt-0.5 text-xs leading-relaxed text-gray-500 line-clamp-2">
        {post.body}
      </p>

      {/* 画像 */}
      {hasImage && (
        <div className="relative mt-2.5 aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={post.image_urls[0]}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 480px"
          />
        </div>
      )}

      {/* フッター: リアクション + コメント数 + 続きを読む */}
      <div className="mt-2.5 flex items-center gap-3 text-xs text-gray-400">
        {reactions && reactions.length > 0 && (
          <div className="flex items-center gap-1">
            {reactions.map((r) => (
              <span
                key={r.emoji}
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px]",
                  r.reacted
                    ? "bg-primary/8 text-primary"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {r.emoji} {r.count}
              </span>
            ))}
          </div>
        )}
        {(post.comment_count ?? 0) > 0 && (
          <span className="flex items-center gap-0.5">
            <MessageCircle size={12} /> {post.comment_count}
          </span>
        )}
        <span className="ml-auto flex items-center gap-0.5 font-medium text-primary">
          続きを読む <ChevronRight size={14} />
        </span>
      </div>
    </Link>
  );
}
