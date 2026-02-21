import { AnnouncementBanner } from "@/components/posts/announcement-banner";
import { CategorySection } from "@/components/posts/category-section";
import { EventBanner } from "@/components/posts/event-banner";
import { PostGrid } from "@/components/posts/post-grid";
import { getCategories } from "@/lib/queries/categories";
import {
  getPinnedAnnouncements,
  getPosts,
  getRecentPostsByCategory,
} from "@/lib/queries/posts";
import { getUpcomingEvents } from "@/lib/queries/events";
import { getReactionsForPosts } from "@/lib/queries/reactions";
import { PenSquare } from "lucide-react";
import Link from "next/link";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  // カテゴリ指定時は従来のグリッド表示
  if (category) {
    const [categories, posts, upcomingEvents, announcements] =
      await Promise.all([
        getCategories(),
        getPosts({ categorySlug: category }),
        getUpcomingEvents(),
        getPinnedAnnouncements(),
      ]);

    const postIds = posts.map((p) => p.id);
    const reactionsMap =
      postIds.length > 0
        ? await getReactionsForPosts(postIds)
        : new Map();

    return (
      <>
        <MobilePostButton />
        <AnnouncementBanner announcements={announcements} />
        <EventBanner events={upcomingEvents} />
        <PostGrid posts={posts} reactionsMap={reactionsMap} />
      </>
    );
  }

  // カテゴリ未指定: セクション分割表示
  const [categories, posts, upcomingEvents, announcements] =
    await Promise.all([
      getCategories(),
      getRecentPostsByCategory(),
      getUpcomingEvents(),
      getPinnedAnnouncements(),
    ]);

  const postIds = posts.map((p) => p.id);
  const reactionsMap =
    postIds.length > 0
      ? await getReactionsForPosts(postIds)
      : new Map();

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
      <AnnouncementBanner announcements={announcements} />
      <EventBanner events={upcomingEvents} />

      <div className="space-y-2">
        {categories
          .filter((cat) => postsByCategory.has(cat.id))
          .map((cat) => (
            <CategorySection
              key={cat.id}
              category={cat}
              posts={postsByCategory.get(cat.id)!}
              reactionsMap={reactionsMap}
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
        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
      >
        <PenSquare size={16} />
        投稿する
      </Link>
    </div>
  );
}
