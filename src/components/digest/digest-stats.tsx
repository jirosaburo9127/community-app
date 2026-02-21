import { FileText, MessageCircle, UserPlus } from "lucide-react";

export function DigestStats({
  stats,
}: {
  stats: { posts: number; comments: number; newMembers: number };
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="flex flex-col items-center rounded-xl border border-border bg-white p-4">
        <FileText size={20} className="text-primary" />
        <span className="mt-1.5 text-2xl font-bold text-gray-900">
          {stats.posts}
        </span>
        <span className="text-xs text-muted">新規投稿</span>
      </div>
      <div className="flex flex-col items-center rounded-xl border border-border bg-white p-4">
        <MessageCircle size={20} className="text-accent" />
        <span className="mt-1.5 text-2xl font-bold text-gray-900">
          {stats.comments}
        </span>
        <span className="text-xs text-muted">コメント</span>
      </div>
      <div className="flex flex-col items-center rounded-xl border border-border bg-white p-4">
        <UserPlus size={20} className="text-emerald-600" />
        <span className="mt-1.5 text-2xl font-bold text-gray-900">
          {stats.newMembers}
        </span>
        <span className="text-xs text-muted">新メンバー</span>
      </div>
    </div>
  );
}
