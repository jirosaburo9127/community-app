import type { Comment } from "@/lib/types";
import { CommentItem } from "./comment-item";

export function CommentList({
  comments,
  currentUserId,
}: {
  comments: Comment[];
  currentUserId?: string;
}) {
  if (comments.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted">
        まだコメントはありません
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
