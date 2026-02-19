"use client";

import { addComment } from "@/lib/actions/comments";
import { Send } from "lucide-react";
import { useRef, useTransition } from "react";

export function CommentForm({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await addComment(postId, formData);
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex gap-2">
      <input
        name="body"
        type="text"
        required
        placeholder="コメントを入力..."
        className="flex-1 rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={isPending}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
      >
        <Send size={15} />
      </button>
    </form>
  );
}
