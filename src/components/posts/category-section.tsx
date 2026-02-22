import type { Category, Post } from "@/lib/types";
import { ChevronRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export function CategorySection({
  category,
  posts,
}: {
  category: Category;
  posts: Post[];
}) {
  return (
    <section>
      {/* カテゴリ見出し */}
      <Link
        href={`/home?category=${category.slug}`}
        className="mb-3 inline-flex items-center gap-1 hover:opacity-70 transition-opacity"
      >
        <h2 className="text-lg font-bold text-gray-900">
          {category.icon_emoji} {category.name}
        </h2>
        <ChevronRight size={20} className="text-gray-400" />
      </Link>

      {/* 横スクロールカード行 */}
      <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
        {posts.map((post) => (
          <HorizontalCard key={post.id} post={post} />
        ))}
        {/* もっと見るカード */}
        <Link
          href={`/home?category=${category.slug}`}
          className="flex w-36 shrink-0 items-center justify-center rounded-lg border border-border bg-white text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          もっとみる
        </Link>
      </div>
    </section>
  );
}

function HorizontalCard({ post }: { post: Post }) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: ja,
  });

  return (
    <Link
      href={`/posts/${post.id}`}
      className="w-44 shrink-0 overflow-hidden rounded-lg border border-border bg-white transition-all hover:shadow-md sm:w-48"
    >
      {/* 画像 */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {post.image_urls?.[0] ? (
          <Image
            src={post.image_urls[0]}
            alt={post.title}
            fill
            className="object-cover"
            sizes="200px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl text-gray-300">
            {post.categories?.icon_emoji ?? "📝"}
          </div>
        )}
      </div>

      {/* テキスト */}
      <div className="p-2.5">
        <h3 className="text-[13px] font-bold leading-snug text-gray-900 line-clamp-2">
          {post.title}
        </h3>
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400">
          <span className="max-w-[64px] truncate font-medium text-gray-500">
            {post.profiles?.display_name}
          </span>
          <span>{timeAgo}</span>
        </div>
        {(post.comment_count ?? 0) > 0 && (
          <div className="mt-1 flex items-center gap-0.5 text-[11px] text-gray-400">
            <MessageCircle size={10} />
            <span>{post.comment_count}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
