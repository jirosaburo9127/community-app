"use client";

import { toggleBookmark } from "@/lib/actions/bookmarks";
import { cn } from "@/lib/utils";
import { Bookmark } from "lucide-react";
import { useTransition } from "react";

export function BookmarkButton({
  postId,
  bookmarked,
}: {
  postId: string;
  bookmarked: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await toggleBookmark(postId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
        bookmarked
          ? "border-primary/30 bg-primary/8 text-primary"
          : "border-border text-muted hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50"
      )}
    >
      <Bookmark size={15} fill={bookmarked ? "currentColor" : "none"} />
      {bookmarked ? "保存済み" : "保存"}
    </button>
  );
}
