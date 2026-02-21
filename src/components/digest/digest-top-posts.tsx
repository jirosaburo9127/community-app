import type { Post } from "@/lib/types";
import { MessageCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

export function DigestTopPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 text-center">
        <p className="text-sm text-muted">今週の投稿はまだありません</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
        <TrendingUp size={16} className="text-primary" />
        <h3 className="text-sm font-semibold text-gray-900">注目の投稿 TOP5</h3>
      </div>
      <div className="divide-y divide-border">
        {posts.map((post, i) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-gray-50"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                {post.title}
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                <span>{post.profiles?.display_name}</span>
                <span className="flex items-center gap-0.5">
                  <MessageCircle size={11} />
                  {post.comment_count}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
