import type { Post } from "@/lib/types";
import { PostCard } from "./post-card";
import { FileText } from "lucide-react";

export function PostGrid({
  posts,
}: {
  posts: Post[];
}) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
          <FileText size={28} className="text-gray-400" />
        </div>
        <p className="text-base font-medium text-gray-700">まだ投稿がありません</p>
        <p className="mt-1 text-sm text-muted">最初の投稿を作成してみましょう！</p>
      </div>
    );
  }

  return (
    <div className="columns-2 gap-3 sm:columns-3">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
        />
      ))}
    </div>
  );
}
