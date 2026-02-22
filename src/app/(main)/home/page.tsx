import { AnnouncementBanner } from "@/components/posts/announcement-banner";
import { CategorySection, HorizontalCard } from "@/components/posts/category-section";
import { EventBanner } from "@/components/posts/event-banner";
import { PostGrid } from "@/components/posts/post-grid";
import { getCategories } from "@/lib/queries/categories";
import {
  getFeaturedPosts,
  getPinnedAnnouncements,
  getPosts,
  getRecentPostsByCategory,
} from "@/lib/queries/posts";
import { getUpcomingEvents } from "@/lib/queries/events";
import type { Post } from "@/lib/types";
import { BarChart3, ChevronRight, PenSquare } from "lucide-react";
import Link from "next/link";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  // カテゴリ指定時は従来のグリッド表示
  if (category) {
    const [posts, upcomingEvents, announcements] = await Promise.all([
      getPosts({ categorySlug: category }),
      getUpcomingEvents(),
      getPinnedAnnouncements(),
    ]);

    return (
      <>
        <MobilePostButton />
        <DigestBanner />
        <AnnouncementBanner announcements={announcements} />
        <EventBanner events={upcomingEvents} />
        <PostGrid posts={posts} />
      </>
    );
  }

  // カテゴリ未指定: セクション分割表示
  const [categories, posts, featuredPosts, upcomingEvents, announcements] = await Promise.all([
    getCategories(),
    getRecentPostsByCategory(),
    getFeaturedPosts(),
    getUpcomingEvents(),
    getPinnedAnnouncements(),
  ]);

  // カテゴリ別にグルーピング
  const postsByCategory = new Map<number, typeof posts>();
  for (const post of posts) {
    if (!post.category_id) continue;
    const arr = postsByCategory.get(post.category_id) ?? [];
    arr.push(post);
    postsByCategory.set(post.category_id, arr);
  }

  return (
    <>
      <MobilePostButton />
      <DigestBanner />
      <AnnouncementBanner announcements={announcements} />
      <EventBanner events={upcomingEvents} />

      <div className="space-y-8">
        {/* 今日の注目投稿 */}
        {featuredPosts.length > 0 && (
          <FeaturedSection posts={featuredPosts} />
        )}

        {[...categories]
          .sort((a, b) => {
            // スタートアップニュースを最後に
            if (a.slug === "startup-news") return 1;
            if (b.slug === "startup-news") return -1;
            return 0;
          })
          .filter((cat) => postsByCategory.has(cat.id))
          .map((cat) => (
            <CategorySection
              key={cat.id}
              category={cat}
              posts={postsByCategory.get(cat.id)!}
            />
          ))}
      </div>
    </>
  );
}

function MobilePostButton() {
  return (
    <div className="mb-4 flex items-center justify-end lg:hidden">
      <Link
        href="/posts/new"
        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
      >
        <PenSquare size={16} />
        投稿する
      </Link>
    </div>
  );
}

function FeaturedSection({ posts }: { posts: Post[] }) {
  return (
    <section>
      <div className="mb-3 inline-flex items-center gap-1">
        <h2 className="text-lg font-bold text-gray-900">
          今日の注目投稿
        </h2>
        <ChevronRight size={20} className="text-gray-400" />
      </div>
      <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
        {posts.map((post) => (
          <HorizontalCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}

function DigestBanner() {
  return (
    <Link
      href="/digest"
      className="mb-4 flex items-center gap-2.5 rounded-xl border border-border bg-gray-50 px-4 py-3 transition-all hover:bg-gray-100"
    >
      <BarChart3 size={18} className="text-gray-500" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900">
          ウィークリーダイジェスト
        </p>
        <p className="text-xs text-muted">今週のコミュニティ活動まとめ</p>
      </div>
      <span className="text-xs font-medium text-gray-500">見る &rarr;</span>
    </Link>
  );
}
