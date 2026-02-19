import { PostGrid } from "@/components/posts/post-grid";
import { getBookmarkedPosts } from "@/lib/queries/bookmarks";
import { Bookmark } from "lucide-react";

export default async function BookmarksPage() {
  const posts = await getBookmarkedPosts();

  return (
    <>
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <Bookmark size={20} className="text-primary" />
          <h1 className="text-xl font-bold text-gray-900">ブックマーク</h1>
        </div>
        <p className="text-sm text-muted mt-0.5">保存した投稿を確認</p>
      </div>
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
            <Bookmark size={28} className="text-gray-400" />
          </div>
          <p className="text-base font-medium text-gray-700">ブックマークした投稿はありません</p>
          <p className="mt-1 text-sm text-muted">投稿詳細ページからブックマークできます</p>
        </div>
      ) : (
        <PostGrid posts={posts as any} />
      )}
    </>
  );
}
