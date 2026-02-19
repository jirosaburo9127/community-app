import { cn } from "@/lib/utils";
import { getCategoryColor } from "@/lib/constants";
import type { Category, Post } from "@/lib/types";
import type { ReactionCount } from "@/lib/queries/reactions";
import { PostCard } from "./post-card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

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
    <section className="mb-6">
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
          <h2 className="text-base font-bold text-gray-900">
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

      {/* 横スクロールカード */}
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {posts.map((post) => (
          <div
            key={post.id}
            className="w-[260px] flex-shrink-0 snap-start sm:w-[280px]"
          >
            <PostCard post={post} reactions={reactionsMap.get(post.id)} />
          </div>
        ))}
      </div>
    </section>
  );
}
