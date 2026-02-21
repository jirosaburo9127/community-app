"use client";

import { toggleReaction } from "@/lib/actions/reactions";
import type { ReactionCount } from "@/lib/queries/reactions";
import { cn } from "@/lib/utils";
import { SmilePlus } from "lucide-react";
import { useState, useTransition } from "react";

const EMOJI_LIST = ["👍", "❤️", "💡", "🚀", "🔥", "👏", "🎯", "✨"];

export function ReactionBar({
  postId,
  reactions: initialReactions,
}: {
  postId: string;
  reactions: ReactionCount[];
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleReaction(emoji: string) {
    setShowPicker(false);
    startTransition(async () => {
      await toggleReaction(postId, emoji);
    });
  }

  return (
    <div className="relative flex flex-wrap items-center gap-1.5">
      {initialReactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => handleReaction(r.emoji)}
          disabled={isPending}
          className={cn(
            "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all",
            r.reacted
              ? "border-primary/30 bg-primary/8 text-primary shadow-sm"
              : "border-border bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
          )}
        >
          <span>{r.emoji}</span>
          <span>{r.count}</span>
        </button>
      ))}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-lg border transition-all",
            showPicker
              ? "border-primary/30 bg-primary/8 text-primary"
              : "border-border bg-white text-gray-400 hover:border-gray-300 hover:text-gray-600"
          )}
        >
          <SmilePlus size={14} />
        </button>
        {showPicker && (
          <div className="absolute bottom-9 left-0 z-10 flex gap-0.5 rounded-xl border border-border bg-white p-1.5 shadow-xl shadow-gray-200/50">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="rounded-lg p-1.5 text-lg transition-colors hover:bg-gray-100"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
