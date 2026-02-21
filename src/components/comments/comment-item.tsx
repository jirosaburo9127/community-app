"use client";

import { deleteComment } from "@/lib/actions/comments";
import type { Comment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { useTransition } from "react";

export function CommentItem({
  comment,
  currentUserId,
}: {
  comment: Comment;
  currentUserId?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const isOwn = currentUserId === comment.author_id;

  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: ja,
  });

  function handleDelete() {
    startTransition(async () => {
      await deleteComment(comment.id, comment.post_id);
    });
  }

  return (
    <div className={cn("flex gap-2.5 py-3", isPending && "opacity-50")}>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
        {comment.profiles?.display_name?.charAt(0) ?? "?"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {comment.profiles?.display_name}
          </span>
          <span className="text-xs text-gray-400">{timeAgo}</span>
          {isOwn && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="ml-auto rounded-md p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              title="削除"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        <p className="mt-0.5 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{comment.body}</p>
      </div>
    </div>
  );
}
